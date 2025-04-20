import Anthropic from "@anthropic-ai/sdk"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { AnthropicHandler } from "./providers/anthropic"
import { ApiStream, ApiStreamUsageChunk } from "./stream"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): { id: string; info: ModelInfo }
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

export function buildApiHandler(configuration: ApiConfiguration): ApiHandler {
	const { apiProvider, ...options } = configuration
	switch (apiProvider) {
		case "anthropic":
			return new AnthropicHandler(options)

		default:
			return new AnthropicHandler(options)
	}
}
