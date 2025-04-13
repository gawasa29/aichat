import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

type SettingsViewProps = {
	onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
	return (
		<div>
			<VSCodeButton onClick={onDone}>Done</VSCodeButton>
		</div>
	)
}

export default SettingsView
