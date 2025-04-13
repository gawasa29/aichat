import React, { forwardRef, useCallback, useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"
import styled from "styled-components"
import Thumbnails from "../common/Thumbnails"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface ChatTextAreaProps {
	inputValue: string
	setInputValue: (value: string) => void
	textAreaDisabled: boolean
	placeholderText: string
	selectedImages: string[]
	setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
	onSend: () => void

	onHeightChange?: (height: number) => void
}

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 1;
	min-width: 0;
`

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 3px;
	font-size: 10px;
	white-space: nowrap;
	min-width: 0;
	width: 100%;
`

const ControlsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: -5px;
	padding: 0px 15px 5px 15px;
`

const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(
	(
		{
			inputValue,
			setInputValue,
			textAreaDisabled,
			placeholderText,
			selectedImages,
			setSelectedImages,
			onSend,

			onHeightChange,
		},
		ref
	) => {
		const [thumbnailsHeight, setThumbnailsHeight] = useState(0)
		const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
		const highlightLayerRef = useRef<HTMLDivElement>(null)
		const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
		const [textAreaBaseHeight, setTextAreaBaseHeight] = useState<number | undefined>(undefined)

		/**
		 * Handles the drag over event to allow dropping.
		 * Prevents the default behavior to enable drop.
		 *
		 * @param {React.DragEvent} e - The drag event.
		 */
		const onDragOver = (e: React.DragEvent) => {
			e.preventDefault()
			setInputValue(inputValue)
		}
		const handleThumbnailsHeightChange = useCallback((height: number) => {
			setThumbnailsHeight(height)
		}, [])
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
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
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
							e
						}}
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
							//border: "1px solid var(--vscode-input-border)",
							borderRadius: 2,
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							resize: "none",
							overflowX: "hidden",
							overflowY: "scroll",
							scrollbarWidth: "none",
							// Since we have maxRows, when text is long enough it starts to overflow the bottom padding, appearing behind the thumbnails. To fix this, we use a transparent border to push the text up instead. (https://stackoverflow.com/questions/42631947/maintaining-a-padding-inside-of-text-area/52538410#52538410)
							// borderTop: "9px solid transparent",
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
							borderColor: "transparent",
							// borderRight: "54px solid transparent",
							// borderLeft: "9px solid transparent", // NOTE: react-textarea-autosize doesn't calculate correct height when using borderLeft/borderRight so we need to use horizontal padding instead
							// Instead of using boxShadow, we use a div with a border to better replicate the behavior when the textarea is focused
							// boxShadow: "0px 0px 0px 1px var(--vscode-input-border)",
							padding: "9px 28px 3px 9px",
							cursor: textAreaDisabled ? "not-allowed" : undefined,
							flex: 1,
							zIndex: 1,
						}}
					/>
					{selectedImages.length > 0 && (
						<Thumbnails
							images={selectedImages}
							setImages={setSelectedImages}
							onHeightChange={handleThumbnailsHeightChange}
							style={{
								position: "absolute",
								paddingTop: 4,
								bottom: 14,
								left: 22,
								right: 47, // (54 + 9) + 4 extra padding
								zIndex: 2,
							}}
						/>
					)}
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
							{/* <div
								className={`input-icon-button ${shouldDisableImages ? "disabled" : ""} codicon codicon-device-camera`}
								onClick={() => {
									if (!shouldDisableImages) {
										onSelectImages()
									}
								}}
								style={{
									marginRight: 5.5,
									fontSize: 16.5,
								}}
							/> */}
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

				<ControlsContainer>
					<ButtonGroup>
						<VSCodeButton
							data-testid="context-button"
							appearance="icon"
							aria-label="Add Context"
							disabled={textAreaDisabled}
							style={{ padding: "0px 0px", height: "20px" }}>
							<ButtonContainer>
								<span style={{ fontSize: "13px", marginBottom: 1 }}>@</span>
								{/* {showButtonText && <span style={{ fontSize: "10px" }}>Context</span>} */}
							</ButtonContainer>
						</VSCodeButton>

						<VSCodeButton
							data-testid="images-button"
							appearance="icon"
							aria-label="Add Images"
							onClick={() => {}}
							style={{ padding: "0px 0px", height: "20px" }}>
							<ButtonContainer>
								<span className="codicon codicon-device-camera" style={{ fontSize: "14px", marginBottom: -3 }} />
								{/* {showButtonText && <span style={{ fontSize: "10px" }}>Images</span>} */}
							</ButtonContainer>
						</VSCodeButton>
					</ButtonGroup>
				</ControlsContainer>
			</div>
		)
	}
)

export default ChatTextArea
