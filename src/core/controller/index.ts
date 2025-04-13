import * as vscode from "vscode"
import { ExtensionMessage } from "../../shared/ExtensionMessage"
import { WebviewMessage } from "../../shared/WebviewMessage"
import { updateApiConfiguration } from "../storage/state"
import { WebviewProvider } from "../webview"

export class Controller {
	private webviewProviderRef: WeakRef<WebviewProvider>

	constructor(
		readonly context: vscode.ExtensionContext,
		private readonly outputChannel: vscode.OutputChannel,
		webviewProvider: WebviewProvider
	) {
		this.outputChannel.appendLine("AIChatProvider instantiated")
		this.webviewProviderRef = new WeakRef(webviewProvider)
	}

	// Send any JSON serializable data to the react app
	async postMessageToWebview(message: ExtensionMessage) {
		await this.webviewProviderRef.deref()?.view?.webview.postMessage(message)
	}

	async initClineWithTask(task?: string, images?: string[]) {
		// TODO
		// await this.clearTask() // ensures that an existing task doesn't exist before starting a new one, although this shouldn't be possible since user must clear task before starting a new one
		// const { apiConfiguration, customInstructions, autoApprovalSettings, browserSettings, chatSettings } =
		// 	await getAllExtensionState(this.context)
		// this.task = new Task(
		// 	this,
		// 	apiConfiguration,
		// 	autoApprovalSettings,
		// 	browserSettings,
		// 	chatSettings,
		// 	customInstructions,
		// 	task,
		// 	images
		// )
	}

	/**
	 * Sets up an event listener to listen for messages passed from the webview context and
	 * executes code based on the message that is received.
	 *
	 * @param webview A reference to the extension webview
	 */
	async handleWebviewMessage(message: WebviewMessage) {
		switch (message.type) {
			case "updateSettings": {
				this.outputChannel.appendLine(`Received updateSettings message: ${JSON.stringify(message)}`)

				// api config
				if (message.apiConfiguration) {
					this.outputChannel.appendLine(`api設定`)
					await updateApiConfiguration(this.context, message.apiConfiguration)
				}

				await this.postMessageToWebview({ type: "didUpdateSettings" })
				break
			}
			case "newTask":
				// Code that should run in response to the hello message command
				//vscode.window.showInformationMessage(message.text!)

				// Send a message to our webview.
				// You can send any JSON serializable data.
				// Could also do this in extension .ts
				//this.postMessageToWebview({ type: "text", text: `Extension: ${Date.now()}` })
				// initializing new instance of Cline will make sure that any agentically running promises in old instance don't affect our new task. this essentially creates a fresh slate for the new task
				await this.initClineWithTask(message.text, message.images)
				break
			default:
				this.outputChannel.appendLine(`Unknown message type: ${message.type}`)
		}
	}
}
