import React, { Fragment, useContext, useEffect } from "react";
import Draggable, { DraggableEvent } from 'react-draggable';
import { useMediaQuery } from "react-responsive";
import { AiOutlineClose } from "react-icons/ai";
import { FaUserFriends, FaUser } from "react-icons/fa";
import Tooltip from "./Tooltip";
import { ChatViewItem } from "../context/chat/ChatProvider";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import authContext, { AuthContextType } from "../context/auth/authContext";

type ChatProps = {
	onClose: () => void;
	viewStack: ChatViewItem[];
};

const Chat: React.FC<ChatProps> = ({ viewStack, onClose }) => {
	const {
		setChatView,
		closeRightmostView,
		chatSocket,
		loadChannelsOnMount,
		lastX,
		lastY,
		setLastX,
		setLastY
	} = useContext(chatContext) as ChatContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const userId = getUserData().id;
	const currentView = viewStack[viewStack.length - 1];
	const buttonTooltipClassName = "p-3 font-bold bg-gray-900";
	const buttonClassName = "hover:scale-105 transition text-2xl";
	const nodeRef = React.useRef(null);

	if (!currentView) {
		throw Error(
			"No chat view to show. You need to call setChatView or openChatView before calling the openChat function."
		);
	}

	/* Client is connected to chat */
	const handleClientConnection = () => {
		chatSocket.on('connect', () => {
			console.log('[Chat] Client connected');

			chatSocket.emit('newUser', {
				id: getUserData().id,
				username: getUserData().username
			});
		})
	}

	useEffect(() => {
		const fetchUserChannels = async () => {
			const res = await fetch(`/api/users/${userId}/channels`);
			const data = await res.json();

			loadChannelsOnMount(JSON.parse(JSON.stringify(data)), userId);
		}
		handleClientConnection();
		fetchUserChannels().catch(console.error);
	}, [])

	return (

	<Draggable
		nodeRef={nodeRef}
		position={{x: lastX, y: lastY}}
		onStop={(e: DraggableEvent, data) => {
			if (data.y > 0)
				setLastY(0)
			else if (-data.y > window.innerHeight - 670)
				setLastY(-window.innerHeight + 670)
			else
				setLastY(data.y);

			if (data.x > 0)
				setLastX(0)
			else if (-data.x > window.innerWidth - 550)
				setLastX(-window.innerWidth + 550)
			else
				setLastX(data.x);
			}}
		disabled={useMediaQuery({ query: "(max-width: 800px)" })}
	>
		<div
			ref={nodeRef}
			className="fixed z-50 top-0 bottom-0 left-0 right-0 md:top-auto md:left-auto md:bottom-10 md:right-10
			drop-shadow-lg flex flex-col overflow-hidden md:w-[25rem] md:h-[35em] text-white rounded border-gray-800 border-2"
		>
			{/* <ResponsiveSlide
				triggerOnce
				duration={1500}
				direction='down'
				useMediaQueryArg={{ query: "(min-width: 1280px)" }}
			> */}
				<header className="flex flex-col justify-end py-2 border-b-2 border-gray-800 cursor-move bg-gray-900/90 gap-y-4 drop-shadow-md text-neutral-200">

				{/* Provide a default header, or use the custom one instead if any */}

				{!currentView.CustomHeaderComponent ? (
					<Fragment>
						<div className="flex items-center justify-between pt-3 px-5">
							<Tooltip content="Dismiss chat" className={buttonTooltipClassName}>
								<button
									onClick={() => { onClose(); }}
									className={buttonClassName}
								>
									<AiOutlineClose />
								</button>
							</Tooltip>
							<Tooltip content="Groups" className={buttonTooltipClassName}>
								<button
									onClick={() => { setChatView("groups", "Group chats", {}); }}
									className={buttonClassName}
								>
									{currentView.label === "Group chats"
										? <FaUserFriends />
										: <FaUserFriends className="opacity-50" />
									}
								</button>
							</Tooltip>
							<Tooltip
								content="DMs"
								className={buttonTooltipClassName}
							>
								<button
									onClick={() => { setChatView("dms", "Direct messages", {}); }}
									className={buttonClassName}
								>
									{currentView.label === "Direct messages"
										? <FaUser className="text-lg" />
										: <FaUser className="text-lg opacity-50" />
									}
								</button>
							</Tooltip>
						</div>
						<div className="flex flex-col items-center justify-center">
							<h6 className="text-lg font-bold text-pink-600 uppercase">
								{viewStack.length > 0 &&
									viewStack[viewStack.length - 1].label}
							</h6>
							<div className="flex">
								{viewStack.length > 1 &&
									viewStack.map((item, index, arr) => (
										<Fragment key={item.label}>
											{index != arr.length - 1 ? (
												<button
													onClick={() => {
														closeRightmostView(
															viewStack.length - index - 1
														);
													}}
													className="hover:opacity-75 transition"
												>
													{item.label}
												</button>
											) : (
												<span>{item.label}</span>
											)}
											{index != arr.length - 1 && (
												<span className="mx-2 font-bold">
													/
												</span>
											)}
										</Fragment>
									))}
							</div>
						</div>
					</Fragment>
				) : (
					<currentView.CustomHeaderComponent viewParams={currentView.params} />
				)}

				</header>

				{/* active chat view */}
				<div className="h-full overflow-hidden bg-gray-900/90">
					{viewStack.length > 0 && (
						<currentView.Component
							viewParams={currentView.params}
						/>
					)}
				</div>
			{/* </ResponsiveSlide> */}

		</div>
	</Draggable>
	);
};

export default Chat;
