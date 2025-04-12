import * as vscode from "vscode"
import { WebviewProvider } from "./core/webview"
import { Logger } from "./services/logging/Logger"

/*
Built using by
https://github.com/microsoft/vscode-webview-ui-toolkit
https://github.com/cline/cline

Inspired by
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra

*/

let outputChannel: vscode.OutputChannel

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("AIChat")

	context.subscriptions.push(outputChannel)

	Logger.initialize(outputChannel)
	Logger.log("AICHAT extension activated")
	outputChannel.show()

	const sidebarWebview = new WebviewProvider(context, outputChannel)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebviewProvider.sideBarId, sidebarWebview, {
			webviewOptions: { retainContextWhenHidden: true },
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("aichat.plusButtonClicked", (webview: any) => {
			Logger.log("History button clicked")
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("aichat.settingsButtonClicked", (webview: any) => {
			Logger.log("Settings button clicked")
		})
	)
}

// This method is called when your extension is deactivated
export function deactivate() {}
