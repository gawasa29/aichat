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
			default:
				this.outputChannel.appendLine(`Unknown message type: ${message.type}`)
		}
	}
}
