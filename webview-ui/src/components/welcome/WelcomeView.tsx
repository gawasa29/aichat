import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"

const WelcomeView = () => {
	const [showApiOptions, setShowApiOptions] = useState(false)

	function handleHowdyClick() {}

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>Hi, I'm Cline</h2>
				<div className="flex justify-center my-5"></div>
				<p>
					I can do all kinds of tasks thanks to breakthroughs in{" "}
					<VSCodeLink href="https://www.anthropic.com/claude/sonnet" className="inline">
						Claude 3.7 Sonnet's
					</VSCodeLink>
					agentic coding capabilities and access to tools that let me create & edit files, explore complex projects, use
					a browser, and execute terminal commands <i>(with your permission, of course)</i>. I can even use MCP to
					create new tools and extend my own capabilities.
				</p>

				<p className="text-[var(--vscode-descriptionForeground)]">
					Sign up for an account to get started for free, or use an API key that provides access to models like Claude
					3.7 Sonnet.
				</p>

				<VSCodeButton appearance="primary" onClick={handleHowdyClick} className="w-full mt-1">
					Get Started for Free
				</VSCodeButton>

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						Use your own API key
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<VSCodeButton onClick={handleHowdyClick} className="mt-0.75">
								Let's go!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default WelcomeView
