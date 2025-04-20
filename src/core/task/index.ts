import { ApiConfiguration } from "../../shared/api"
import { ChatSettings } from "../../shared/ChatSettings"
import { Controller } from "../controller"

export class Task {
	readonly taskId: string
	constructor(
		controller: Controller,
		apiConfiguration: ApiConfiguration,
		chatSettings: ChatSettings,
		customInstructions?: string,
		task?: string
	) {
		this.taskId = Date.now().toString()
	}
}
