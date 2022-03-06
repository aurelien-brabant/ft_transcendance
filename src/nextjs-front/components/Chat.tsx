import Draggable from "react-draggable";
import {
	Fragment,
	useContext,
} from "react";

import { AiOutlineClose, AiOutlineUser } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { ChatViewItem } from "../context/chat/ChatProvider";
import chatContext, { ChatContextType } from "../context/chat/chatContext";
import Tooltip from "./Tooltip";

type ChatProps = {
	onClose: () => void;
	viewStack: ChatViewItem[];
};

const Chat: React.FC<ChatProps> = ({ viewStack, onClose }) => {
	const { closeRightmostView, setChatView } = useContext(
		chatContext
	) as ChatContextType;

	const currentView = viewStack[viewStack.length - 1];
	const buttonTooltipClassName = "p-3 font-bold bg-gray-900";
	const buttonClassName = "hover:scale-105 transition";

	if (!currentView) {
		throw Error(
			"No chat view to show. You need to call setChatView or openChatView before calling the openChat function."
		);
	}

	return (
		<div
			className="fixed z-50 top-0 bottom-0 left-0 right-0 md:top-auto md:left-auto md:bottom-10 md:right-10
				drop-shadow-lg flex flex-col overflow-hidden md:w-[25rem] md:h-[35em] text-white rounded border-gray-800 border-2"
		>
			<header className="flex flex-col justify-end py-2 border-b-2 border-gray-800 cursor-move bg-gray-900/90 gap-y-4 drop-shadow-md text-neutral-200">

				{/* Provide a default header, or use the custom one instead if any */}

				{!currentView.CustomHeaderComponent ? (
					<Fragment>
					<nav className="flex justify-between px-5 text-3xl">
						<Tooltip
							content="Dismiss chat"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									onClose();
								}}
								className={buttonClassName}
							>
								<AiOutlineClose />
							</button>
						</Tooltip>
						<Tooltip
							content="Groups"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									setChatView("groups", "group chats", {});
								}}
								className={buttonClassName}
							>
								<FaUserFriends />
							</button>
						</Tooltip>
						<Tooltip
							content="DMs"
							className={buttonTooltipClassName}
						>
							<button
								onClick={() => {
									setChatView("dms", "direct messages", {});
								}}
								className={buttonClassName}
							>
								<AiOutlineUser />
							</button>
						</Tooltip>
					</nav>
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

		</div>
	);
};

export default Chat;
