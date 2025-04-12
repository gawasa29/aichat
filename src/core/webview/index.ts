import * as vscode from "vscode"
import { getNonce } from "./getNonce"

export class WebviewProvider implements vscode.WebviewViewProvider {
	public static readonly sideBarId = "aichat-dev.SidebarProvider"
	private static activeInstances: Set<WebviewProvider> = new Set()
	public view?: vscode.WebviewView | vscode.WebviewPanel

	constructor(
		readonly context: vscode.ExtensionContext,

		private readonly outputChannel: vscode.OutputChannel
	) {
		WebviewProvider.activeInstances.add(this)
	}

	async resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		token: vscode.CancellationToken
	) {
		this.view = webviewView

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		}

		// Set the HTML content for the webview panel
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js"))

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css"))
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css"))
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css"))

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce()

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
				<ul class="color-list">
				</ul>

				<button class="add-color-button">Add Color</button>
				<h1>こんにちは</h>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`
	}
}
