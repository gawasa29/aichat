const ChatView = () => {
	return (
		<div>
			<div className="flex flex-col h-full">
				<div className="flex flex-row flex-1">
					<div className="flex-none w-1/4 bg-gray-200 p-4">
						<p>Sidebar</p>
					</div>
					<div className="flex-1 bg-white p-4">
						<p>Main Chat Area</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ChatView
