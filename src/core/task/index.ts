import Anthropic from "@anthropic-ai/sdk"
import * as os from "os"
import * as path from "path"
import * as vscode from "vscode"
import { ApiHandler, buildApiHandler } from "../../api"
import { ApiStream } from "../../api/stream"
import { ApiConfiguration } from "../../shared/api"
import { findLastIndex } from "../../shared/array"
import { ChatSettings } from "../../shared/ChatSettings"
import { ClineMessage, ClineSay } from "../../shared/ExtensionMessage"
import { SYSTEM_PROMPT } from ".././prompts/system"
import { ContextManager } from "../context-management/ContextManager"
import { Controller } from "../controller"

const cwd = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).at(0) ?? path.join(os.homedir(), "Desktop") // may or may not exist but fs checking existence would immediately ask for permission which would be bad UX, need to come up with a better solution

type UserContent = Array<Anthropic.ContentBlockParam>

export class Task {
	readonly taskId: string
	api: ApiHandler
	contextManager: ContextManager
	private abort: boolean = false
	private consecutiveMistakeCount: number = 0
	apiConversationHistory: Anthropic.MessageParam[] = []
	clineMessages: ClineMessage[] = []
	conversationHistoryDeletedRange?: [number, number]
	isStreaming = false
	private controllerRef: WeakRef<Controller>
	private lastMessageTs?: number

	constructor(
		controller: Controller,
		apiConfiguration: ApiConfiguration,
		chatSettings: ChatSettings,
		customInstructions?: string,
		task?: string
	) {
		this.controllerRef = new WeakRef(controller)
		this.contextManager = new ContextManager()
		this.taskId = Date.now().toString()
		// Now that taskId is initialized, we can build the API handler
		this.api = buildApiHandler({
			...apiConfiguration,
			taskId: this.taskId,
		})
		console.log("Task initialized with taskId:", this.taskId)
		console.log("Task initialized with apiConfiguration:", apiConfiguration)
		this.startTask(task)
		console.log("Task initialized にはいった")
	}

	private async startTask(task?: string, images?: string[]): Promise<void> {
		await this.initiateTaskLoop([
			{
				type: "text",
				text: `<task>\n${task}\n</task>`,
			},
		])
	}
	private async initiateTaskLoop(userContent: UserContent): Promise<void> {
		let nextUserContent = userContent
		let includeFileDetails = true
		while (!this.abort) {
			console.log("Task loop started")
			const didEndLoop = await this.recursivelyMakeClineRequests(nextUserContent)
			includeFileDetails = false // we only need file details the first time
			this.abortTask()
			//  The way this agentic loop works is that cline will be given a task that he then calls tools to complete. unless there's an attempt_completion call, we keep responding back to him with his tool's responses until he either attempt_completion or does not use anymore tools. If he does not use anymore tools, we ask him to consider if he's completed the task and then call attempt_completion, otherwise proceed with completing the task.
			// There is a MAX_REQUESTS_PER_TASK limit to prevent infinite requests, but Cline is prompted to finish the task as efficiently as he can.

			//const totalCost = this.calculateApiCost(totalInputTokens, totalOutputTokens)
			if (didEndLoop) {
				// For now a task never 'completes'. This will only happen if the user hits max requests and denies resetting the count.
				//this.say("task_completed", `Task completed. Total API usage cost: ${totalCost}`)
				break
			} else {
				// this.say(
				// 	"tool",
				// 	"Cline responded with only text blocks but has not called attempt_completion yet. Forcing him to continue with task..."
				// )
				nextUserContent = [
					{
						type: "text",
						text: "",
					},
				]
				this.consecutiveMistakeCount++
			}
		}
	}

	async recursivelyMakeClineRequests(userContent: UserContent): Promise<boolean> {
		const previousApiReqIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")

		const stream = this.attemptApiRequest(previousApiReqIndex) // yields only if the first chunk is successful, otherwise will allow the user to retry the request (most likely due to rate limit error, which gets thrown on the first chunk)
		let assistantMessage = ""
		let reasoningMessage = ""
		this.isStreaming = true
		let didReceiveUsageChunk = false
		try {
			for await (const chunk of stream) {
				if (!chunk) {
					continue
				}
				switch (chunk.type) {
					case "usage":
						break
					case "reasoning":
						// reasoning will always come before assistant message
						reasoningMessage += chunk.reasoning
						await this.say("reasoning", reasoningMessage, undefined, true)
						break
					case "text":
						if (reasoningMessage && assistantMessage.length === 0) {
							// complete reasoning message
							await this.say("reasoning", reasoningMessage, undefined, false)
						}
						assistantMessage += chunk.text
						break
				}

				if (this.abort) {
					console.log("aborting stream...")

					break // aborts the stream
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "user_cancelled") {
					// user cancelled the request, so we don't need to do anything
					return false
				} else if (error.message === "rate_limit") {
					// rate limit error, so we need to retry the request
					await this.say("api_req_retried", "Rate limit error. Retrying request...")
					this.abort = false // reset abort flag so we can retry the request
					return true
				} else {
					console.error("Error in task loop:", error)
					await this.say("error", `Error in task loop: ${error.message}`)
				}
			} else {
				console.error("Unknown error in task loop:", error)
				await this.say("error", `Unknown error in task loop: ${String(error)}`)
			}
		} finally {
			this.isStreaming = false
		}
		return false // For now, we always return false to keep the loop going
	}

	async *attemptApiRequest(previousApiReqIndex: number): ApiStream {
		console.log("attemptApiRequestに入った")
		let systemPrompt = await SYSTEM_PROMPT(cwd, true)

		const contextManagementMetadata = this.contextManager.getNewContextMessagesAndMetadata(
			this.apiConversationHistory,
			this.clineMessages,
			this.api,
			this.conversationHistoryDeletedRange,
			previousApiReqIndex
		)

		let stream = this.api.createMessage(systemPrompt, contextManagementMetadata.truncatedConversationHistory)
		const iterator = stream[Symbol.asyncIterator]()
	}

	async abortTask() {
		this.abort = true // will stop any autonomously running promises
	}

	async say(type: ClineSay, text?: string, images?: string[], partial?: boolean): Promise<undefined> {
		if (this.abort) {
			throw new Error("Cline instance aborted")
		}

		if (partial !== undefined) {
			const lastMessage = this.clineMessages.at(-1)
			const isUpdatingPreviousPartial =
				lastMessage && lastMessage.partial && lastMessage.type === "say" && lastMessage.say === type
			if (partial) {
				if (isUpdatingPreviousPartial) {
					// existing partial message, so update it
					lastMessage.text = text
					lastMessage.images = images
					lastMessage.partial = partial
					await this.controllerRef.deref()?.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					})
				} else {
					// this is a new partial message, so add it with partial state
					const sayTs = Date.now()
					this.lastMessageTs = sayTs
					await this.addToClineMessages({
						ts: sayTs,
						type: "say",
						say: type,
						text,
						images,
						partial,
					})
					await this.controllerRef.deref()?.postStateToWebview()
				}
			} else {
				// partial=false means its a complete version of a previously partial message
				if (isUpdatingPreviousPartial) {
					// this is the complete version of a previously partial message, so replace the partial with the complete version
					this.lastMessageTs = lastMessage.ts
					// lastMessage.ts = sayTs
					lastMessage.text = text
					lastMessage.images = images
					lastMessage.partial = false

					// await this.controllerRef.deref()?.postStateToWebview()
					await this.controllerRef.deref()?.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					}) // more performant than an entire postStateToWebview
				} else {
					// this is a new partial=false message, so add it like normal
					const sayTs = Date.now()
					this.lastMessageTs = sayTs
					await this.addToClineMessages({
						ts: sayTs,
						type: "say",
						say: type,
						text,
						images,
					})
					await this.controllerRef.deref()?.postStateToWebview()
				}
			}
		} else {
			// this is a new non-partial message, so add it like normal
			const sayTs = Date.now()
			this.lastMessageTs = sayTs
			await this.addToClineMessages({
				ts: sayTs,
				type: "say",
				say: type,
				text,
				images,
			})
			await this.controllerRef.deref()?.postStateToWebview()
		}
	}
	private async addToClineMessages(message: ClineMessage) {
		// these values allow us to reconstruct the conversation history at the time this cline message was created
		// it's important that apiConversationHistory is initialized before we add cline messages
		message.conversationHistoryIndex = this.apiConversationHistory.length - 1 // NOTE: this is the index of the last added message which is the user message, and once the clinemessages have been presented we update the apiconversationhistory with the completed assistant message. This means when resetting to a message, we need to +1 this index to get the correct assistant message that this tool use corresponds to
		message.conversationHistoryDeletedRange = this.conversationHistoryDeletedRange
		this.clineMessages.push(message)
	}
}
