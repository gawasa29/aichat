import { mentionRegexGlobal } from "@shared/context-mentions"
import React, { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"

interface ChatTextAreaProps {
	inputValue: string
	setInputValue: (value: string) => void
	textAreaDisabled: boolean
	placeholderText: string
	onSend: () => void
	onHeightChange?: (height: number) => void
}

const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(
	({ inputValue, setInputValue, textAreaDisabled, placeholderText, onSend, onHeightChange }, ref) => {
		const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
		const highlightLayerRef = useRef<HTMLDivElement>(null)
		const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
		const [textAreaBaseHeight, setTextAreaBaseHeight] = useState<number | undefined>(undefined)

		const handleBlur = useCallback(() => {
			setIsTextAreaFocused(false)
		}, [])

		const onDragOver = (e: React.DragEvent) => {
			e.preventDefault()
		}

		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
				const isComposing = event.nativeEvent?.isComposing ?? false
				if (event.key === "Enter" && !event.shiftKey && !isComposing) {
					event.preventDefault()
					setIsTextAreaFocused(false)
					onSend()
				}
			},
			[onSend]
		)

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value
				setInputValue(newValue)
			},
			[setInputValue]
		)

		const updateHighlights = useCallback(() => {
			if (!textAreaRef.current || !highlightLayerRef.current) return

			const text = textAreaRef.current.value

			highlightLayerRef.current.innerHTML = text
				.replace(/\n$/, "\n\n")
				.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] || c))
				.replace(mentionRegexGlobal, '<mark class="mention-context-textarea-highlight">$&</mark>')

			highlightLayerRef.current.scrollTop = textAreaRef.current.scrollTop
			highlightLayerRef.current.scrollLeft = textAreaRef.current.scrollLeft
		}, [])

		useLayoutEffect(() => {
			updateHighlights()
		}, [inputValue, updateHighlights])

		return (
			<div>
				<div
					style={{
						padding: "10px 15px",
						opacity: textAreaDisabled ? 0.5 : 1,
						position: "relative",
						display: "flex",
					}}
					onDragOver={onDragOver}>
					{!isTextAreaFocused && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								border: "1px solid var(--vscode-input-border)",
								borderRadius: 2,
								pointerEvents: "none",
								zIndex: 5,
							}}
						/>
					)}
					<div
						ref={highlightLayerRef}
						style={{
							position: "absolute",
							top: 10,
							left: 15,
							right: 15,
							bottom: 10,
							pointerEvents: "none",
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
							color: "transparent",
							overflow: "hidden",
							backgroundColor: "var(--vscode-input-background)",
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							borderRadius: 2,
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderColor: "transparent",
							padding: "9px 28px 3px 9px",
						}}
					/>
					<DynamicTextArea
						data-testid="chat-input"
						ref={(el) => {
							if (typeof ref === "function") {
								ref(el)
							} else if (ref) {
								ref.current = el
							}
							textAreaRef.current = el
						}}
						value={inputValue}
						disabled={textAreaDisabled}
						onChange={(e) => {
							handleInputChange(e)
							updateHighlights()
						}}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsTextAreaFocused(true)}
						onBlur={handleBlur}
						onHeightChange={(height) => {
							if (textAreaBaseHeight === undefined || height < textAreaBaseHeight) {
								setTextAreaBaseHeight(height)
							}
							onHeightChange?.(height)
						}}
						placeholder={placeholderText}
						maxRows={10}
						autoFocus={true}
						style={{
							width: "100%",
							boxSizing: "border-box",
							backgroundColor: "transparent",
							color: "var(--vscode-input-foreground)",
							borderRadius: 2,
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							resize: "none",
							overflowX: "hidden",
							overflowY: "scroll",
							scrollbarWidth: "none",
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderColor: "transparent",
							padding: "9px 28px 3px 9px",
							cursor: textAreaDisabled ? "not-allowed" : undefined,
							flex: 1,
							zIndex: 1,
						}}
					/>
					<div
						style={{
							position: "absolute",
							right: 23,
							display: "flex",
							alignItems: "flex-center",
							height: textAreaBaseHeight || 31,
							bottom: 9.5, // should be 10 but doesnt look good on mac
							zIndex: 2,
						}}>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
							}}>
							<div
								data-testid="send-button"
								className={`input-icon-button ${textAreaDisabled ? "disabled" : ""} codicon codicon-send`}
								onClick={() => {
									if (!textAreaDisabled) {
										setIsTextAreaFocused(false)
										onSend()
									}
								}}
								style={{ fontSize: 15 }}></div>
						</div>
					</div>
				</div>
			</div>
		)
	}
)

export default ChatTextArea
