import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { UserStatusItem } from "../UserStatus";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";

/* All DM conversations tab */
const DirectMessages: React.FC<{ viewParams: Object; }> = ({ viewParams }) => {
	const { user } = useSession();
	const { openChatView, directMessages } = useContext(chatContext) as ChatContextType;
	const [filteredDms, setFilteredDms] = useState(directMessages);
	const [visiblityFilter, setVisiblityFilter] = useState<ChatGroupPrivacy | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	/* Search a user */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();
		setFilteredDms(
			directMessages.filter(
				(dm) =>
					dm.friendUsername.toLowerCase().includes(searchTerm)
			)
		);
	};

	useEffect(() => {
		handleSearch((searchInputRef.current as HTMLInputElement).value);
	}, [visiblityFilter]);

	/* Update filtered direct messages */
	useEffect(() => {
		setFilteredDms(directMessages);
	}, [directMessages]);

	return (
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-dark/90 border-b-4 border-04dp justify-between">
				<input
					ref={searchInputRef}
					type="text"
					className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[45%]"
					placeholder="search for a user"
					onChange={(e) => {
						handleSearch(e.target.value);
					}}
				/>
				<button
					className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded"
					onClick={() => {
						openChatView("dm_new", "Chat with a friend", {});
					}}
				>
					+DM
				</button>
			</div>
			<div className="h-[85%] overflow-x-auto">
				{filteredDms.map((dm) => (
					<div
						key={dm.friendUsername}
						className="relative items-center px-10 py-5 grid grid-cols-3 border-b border-04dp hover:bg-04dp/90 transition"
						onClick={() => {
							openChatView(
								'dm', 'dm', {
									channelId: dm.id,
									friendId: dm.friendId,
									friendUsername: dm.friendUsername
								}
							)
						}}
					>
					<div>
						<div
							className="relative z-20 flex items-center justify-center w-16 h-16 text-4xl rounded-full"
						>
							<img src={dm.friendPic} className="object-fill w-full h-full rounded-full" />
							<UserStatusItem withText={false} status={Math.random() > 0.3 ? 'offline' : 'online'} className="absolute bottom-0 right-0 z-50" id={user.id} />
						</div>
					</div>
					<div className="col-span-2">
						<div className="flex items-center justify-between">
							<h6 className="text-lg font-bold">
								{dm.friendUsername}
							</h6>
						</div>
						<p className="text-sm text-neutral-200">{dm.lastMessage.substr(0, 60) + (dm.lastMessage.length > 60 ? '...' : '')}</p>
					</div>
				</div>
				))}
			</div>
		</Fragment>
	);
};

export default DirectMessages;
