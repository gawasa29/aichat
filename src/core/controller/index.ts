import * as vscode from "vscode"
import { ExtensionMessage } from "../../shared/ExtensionMessage"
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
}
