import {
	Fragment,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { AiFillLock, AiFillUnlock, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import chatContext, { ChatContextType, ChatGroup, ChatGroupPrivacy } from "../../context/chat/chatContext";

/* All group conversations tab */
const Groups: React.FC<{viewParams: Object;}> = ({ viewParams }) => {
	const {
		openChatView,
		chatGroups,
		fetchChannelData,
		getLastMessage,
		updateChatGroups
	} = useContext(chatContext) as ChatContextType;

	const baseChatGroups = useMemo(() =>
		chatGroups
			.filter(
				(group) =>
					group.privacy !== "private" ||
					(group.privacy === "private" && group.in)
			)
			.sort(
				(a: ChatGroup, b: ChatGroup) =>
				(b.updatedAt.valueOf() - a.updatedAt.valueOf()
			)
	), []);

	const [filteredGroups, setFilteredGroups] = useState(baseChatGroups);
	const [visiblityFilter, setVisiblityFilter] = useState<ChatGroupPrivacy | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	/* Select all | private | public | protected */
	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setVisiblityFilter(
			e.target.value !== "all"
				? (e.target.value as ChatGroupPrivacy)
				: null
		);
	};

	/* Search a group */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();
		setFilteredGroups(
			baseChatGroups.filter(
				(grp) =>
					grp.label.toLowerCase().includes(searchTerm) &&
					(visiblityFilter ? grp.privacy === visiblityFilter : true)
			)
		);
	};

	useEffect(() => {
		handleSearch((searchInputRef.current as HTMLInputElement).value);
	}, [visiblityFilter]);

	/* Update last message for all conversations */
	const updateLastMessage = async (channel: ChatGroup) => {
		const data = await fetchChannelData(channel.id).catch(console.error);
		const gm = await JSON.parse(JSON.stringify(data));

		const message = getLastMessage(gm);
		channel.lastMessage = message.content;
		channel.updatedAt = message.createdAt;
		updateChatGroups();
	}

	useEffect(() => {
		const updatePreviews = async () => {
			await Promise.all(chatGroups.map((gm) => updateLastMessage(gm)));
		};
		updatePreviews();
	}, []);

	return (
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-dark/90 border-04dp border-b-4 justify-between">
				<input
					ref={searchInputRef}
					type="text"
					className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[45%]"
					placeholder="search for a group"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => { // BUG: this event is sometimes confused with the DraggableEvent in components/Chat.tsx l.53
						handleSearch(e.target.value);
					}}
				/>
				<select
					className="drag-cancellable px-2 py-1 text-sm bg-dark outline-none"
					onChange={handleSelect}
				>
					<option value="all">all</option>
					<option value="public">public</option>
					<option value="private">private</option>
					<option value="protected">protected</option>
				</select>
				<button className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded" onClick={() => {
					openChatView('group_new', 'Create a new group', {});
				}}>
					+Group
				</button>
			</div>
			<div className="h-[85%] overflow-x-auto">
				{filteredGroups.map((gm) => (
					<div
						key={gm.label}
						className="relative items-center px-10 py-5 grid grid-cols-3 border-b border-04dp bg-dark/90 hover:bg-04dp/90 transition"
						onClick={() => {
							openChatView(gm.privacy === 'protected' ? 'password_protection' : 'group', gm.label, {
									groupName: gm.label,
									groupId: gm.id,
									groupOwnerId: gm.ownerId,
									peopleCount: gm.peopleCount,
									groupPrivacy: gm.privacy
								}
							);
						}}
					>
						<div className="absolute bottom-0 left-0 flex items-center px-3 py-1 text-sm text-white bg-04dp drop-shadow-md gap-x-1">
							<div className="flex items-center gap-x-1">
								<FaUserFriends />
								{gm.peopleCount}
							</div>
							{gm.privacy === "private" && (
								<AiOutlineEyeInvisible />
							)}
						</div>
						<div>
							<div
								style={
									{
										backgroundColor: gm.privacy === 'public' ? "#48bb78"
										: gm.privacy === 'private' ? "#3182ce" : "#805ad5"
									}
								}
								className="flex items-center justify-center w-16 h-16 text-4xl rounded-full"
							>
								{gm.label[0].toUpperCase()}
							</div>
						</div>
						<div className="col-span-2">
							<div className="flex items-center justify-between">
								<h6 className="text-lg font-bold">
									{gm.label}
								</h6>
								{gm.privacy === "protected" &&
									(gm.in ? (
										<AiFillUnlock className="opacity-50" />
									) : (
										<AiFillLock />
									))}
							</div>
							<p>
								{gm.lastMessage === "Blocked message"
									? <span className="opacity-30">{gm.lastMessage}</span>
									: gm.lastMessage
								}
							</p>
						</div>
					</div>
				))}
			</div>
		</Fragment>
	);
};

export default Groups;
