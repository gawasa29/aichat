import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

const ApiOptions = ({}) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: -10 }}>
			<label htmlFor="api-provider">
				<span style={{ fontWeight: 500 }}>API Provider</span>
			</label>
			<VSCodeDropdown
				id="api-provider"
				style={{
					minWidth: 130,
					position: "relative",
				}}>
				<VSCodeOption value="anthropic">Anthropic</VSCodeOption>
			</VSCodeDropdown>
			<div>
				<VSCodeTextField style={{ width: "100%" }} type="password" placeholder="Enter API Key...">
					<span style={{ fontWeight: 500 }}>Anthropic API Key</span>
				</VSCodeTextField>

				<p
					style={{
						fontSize: "12px",
						marginTop: 3,
						color: "var(--vscode-descriptionForeground)",
					}}>
					This key is stored locally and only used to make API requests from this extension.
				</p>
			</div>
		</div>
	)
}

export default ApiOptions
