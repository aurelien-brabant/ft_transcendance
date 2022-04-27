import React, { Fragment, useContext, useEffect } from "react";
import Draggable from 'react-draggable';
import { useMediaQuery } from "react-responsive";
import { AiOutlineClose } from "react-icons/ai";
import { FaUserFriends, FaUser } from "react-icons/fa";
import Tooltip from "./Tooltip";
import { useSession } from "../hooks/use-session";
import { ChatViewItem } from "../context/chat/ChatProvider";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../context/relationship/relationshipContext";
import socketContext, { SocketContextType } from "../context/socket/socketContext";

type ChatProps = {
	onClose: () => void;
	viewStack: ChatViewItem[];
};

const Chat: React.FC<ChatProps> = ({ viewStack, onClose }) => {
	const {
		setChatView,
		closeRightmostView,
		loadUserChannels,
		lastX,
		lastY,
		setLastX,
		setLastY
	} = useContext(chatContext) as ChatContextType;
	const { getData } = useContext(relationshipContext) as RelationshipContextType;
	const { socket } = useContext(socketContext) as SocketContextType;
	const { user } = useSession();
	const currentView = viewStack[viewStack.length - 1];
	const buttonTooltipClassName = "p-3 font-bold bg-dark";
	const buttonClassName = "hover:scale-105 transition text-2xl";
	const nodeRef = React.useRef(null);

	if (!currentView) {
		throw Error(
			"No chat view to show. You need to call setChatView or openChatView before calling the openChat function."
		);
	}

	useEffect(() => {
		const updateUserChannels = (channels: any) => {
			console.log(`[Chat] Update user channels`);
			console.log(channels);

			loadUserChannels(channels, user.id);
		};

		getData();
		socket.emit("getUserChannels", { userId: user.id });
		socket.on("updateUserChannels", updateUserChannels);

		return () => {
			socket.off("updateUserChannels", updateUserChannels);
		};
	}, [])

	return (

	<Draggable
		enableUserSelectHack={true}
		cancel={".drag-cancellable"}
		nodeRef={nodeRef}
		position={{x: lastX, y: lastY}}
		onStop={(e, data) => {
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
			drop-shadow-lg flex flex-col overflow-hidden md:w-[25rem] md:h-[35em] text-white rounded border-04dp border-2"
		>
				<header className="flex flex-col justify-end py-2 border-b-2 border-04dp cursor-move bg-dark/90 gap-y-4 drop-shadow-md text-neutral-200">

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
			<div className="h-full overflow-hidden bg-dark/90">
				{viewStack.length > 0 && (
					<currentView.Component
						viewParams={currentView.params}
					/>
				)}
			</div>
		</div>
	</Draggable>
	);
};

export default Chat;
