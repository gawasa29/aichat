type ChatViewProps = {
	onDone: () => void
}

const ChatView = ({ onDone }: ChatViewProps) => {
	const handleSubmit = (withoutDone: boolean = false) => {
		if (!withoutDone) {
			onDone()
		}
	}
	console.log(handleSubmit)

	return (
		<div>
			<div className="flex flex-col h-full">
				<div className="flex flex-row flex-1">
					<div className="flex-1 bg-white p-4">
						<p>Main Chat Area</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ChatView
