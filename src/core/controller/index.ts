import * as vscode from "vscode"
import { ExtensionMessage } from "../../shared/ExtensionMessage"
import { WebviewMessage } from "../../shared/WebviewMessage"
import { getAllExtensionState, updateApiConfiguration } from "../storage/state"
import { Task } from "../task"
import { WebviewProvider } from "../webview"

export class Controller {
	private webviewProviderRef: WeakRef<WebviewProvider>
	private task?: Task

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
		const { apiConfiguration, customInstructions, autoApprovalSettings, browserSettings, chatSettings } =
			await getAllExtensionState(this.context)

		this.task = new Task(this, apiConfiguration, chatSettings, customInstructions, task)
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
					this.outputChannel.appendLine(`apiローカル保存`)
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
				this.outputChannel.appendLine(`Received newTask message: ${message.text}`)
				await this.initClineWithTask(message.text, message.images)
				break
			default:
				this.outputChannel.appendLine(`Unknown message type: ${message.type}`)
		}
	}
}
