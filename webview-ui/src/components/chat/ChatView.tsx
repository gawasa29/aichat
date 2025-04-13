interface ChatViewProps {
	isHidden: boolean
}

const ChatView = ({ isHidden }: ChatViewProps) => {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: isHidden ? "none" : "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			<p>Main Chat Area</p>
		</div>
	)
}

export default ChatView
