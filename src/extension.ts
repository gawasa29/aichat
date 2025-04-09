import * as vscode from "vscode"
import { Logger } from "./services/logging/Logger"

let outputChannel: vscode.OutputChannel

export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("Cline")
	context.subscriptions.push(outputChannel)

	Logger.initialize(outputChannel)
	Logger.log("AICHAT extension activated")
	outputChannel.show()
}

// This method is called when your extension is deactivated
export function deactivate() {}
