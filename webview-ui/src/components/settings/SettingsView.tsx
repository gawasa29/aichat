import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import ApiOptions from "./ApiOptions"

type SettingsViewProps = {
	onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
	console.log("SettingsView rendered")
	const { apiConfiguration } = useExtensionState()

	const handleSubmit = (withoutDone: boolean = false) => {
		let apiConfigurationToSubmit = apiConfiguration

		vscode.postMessage({
			type: "updateSettings",

			apiConfiguration: apiConfigurationToSubmit,
		})

		if (!withoutDone) {
			onDone()
		}
	}
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				padding: "10px 0px 0px 20px",
				display: "flex",
				flexDirection: "column",
				overflow: "auto",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "13px",
					paddingRight: 17,
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>Settings</h3>
				<VSCodeButton onClick={() => handleSubmit(false)}>Done</VSCodeButton>
			</div>
			<ApiOptions />
			<p>{apiConfiguration?.apiKey}</p>
		</div>
	)
}

export default SettingsView
