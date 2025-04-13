import { useCallback, useState } from "react"
import { useEvent } from "react-use"
import { ExtensionMessage } from "../../src/shared/ExtensionMessage"
import "./App.css"
import ChatView from "./components/chat/ChatView"
import SettingsView from "./components/settings/SettingsView"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"

function App() {
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
		<ExtensionStateContextProvider>
			{showSettings && <SettingsView onDone={() => setShowSettings(false)} />}
			<ChatView isHidden={showSettings ? true : false} />
		</ExtensionStateContextProvider>
	)
}

export default App
