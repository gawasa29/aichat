import { useCallback, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/ExtensionMessage"
import ChatView from "./components/chat/ChatView"
import SettingsView from "./components/settings/SettingsView"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"

const AppContent = () => {
	const [showSettings, setShowSettings] = useState(false)

	const handleMessage = useCallback((e: MessageEvent) => {
		const message: ExtensionMessage = e.data
		switch (message.type) {
			case "action":
				switch (message.action!) {
					case "settingsButtonClicked":
						setShowSettings(true)
						break
					case "chatButtonClicked":
						setShowSettings(false)
						break
				}
				break
		}
	}, [])

	useEvent("message", handleMessage)

	return (
		<>
			{showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
			<ChatView isHidden={showSettings ? true : false} />
		</>
	)
}

const App = () => {
	return (
		<ExtensionStateContextProvider>
			<AppContent />
		</ExtensionStateContextProvider>
	)
}

export default App
