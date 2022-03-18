import {
	Fragment,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";
import {
	AiFillLock,
	AiFillUnlock,
	AiOutlineEyeInvisible,
} from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";

/* All group conversations tab */
const Groups: React.FC<{viewParams: Object;}> = ({ viewParams }) => {
	const { openChatView, chatGroups } = useContext(chatContext) as ChatContextType;

	const baseChatGroups = useMemo(() =>
		chatGroups
			.filter(
				(group) =>
					group.privacy !== "private" ||
					(group.privacy === "private" && group.in)
			)
			.sort((a, b) => (a.privacy !== "private" ? 1 : -1)
	), []);

	const [filteredGroups, setFilteredGroups] = useState(baseChatGroups);
	const [visiblityFilter, setVisiblityFilter] = useState<ChatGroupPrivacy | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

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

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setVisiblityFilter(
			e.target.value !== "all"
				? (e.target.value as ChatGroupPrivacy)
				: null
		);
	};

	useEffect(() => {
		handleSearch((searchInputRef.current as HTMLInputElement).value);
	}, [visiblityFilter]);

	return (
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-gray-900/90 border-gray-800 border-b-4 justify-between">
				<input
					ref={searchInputRef}
					type="text"
					className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[50%]"
					placeholder="search for a group"
					onChange={(e) => {
						handleSearch(e.target.value);
					}}
				/>
				<select
					className="px-2 py-1 text-sm bg-gray-900 outline-none"
					onChange={handleSelect}
				>
					<option value="all">all</option>
					<option value="private">private</option>
					<option value="public">public</option>
					<option value="protected">protected</option>
				</select>
				<button className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded" onClick={() => {
					openChatView('group_new', 'Create a new group', {});
				}}>
					New
				</button>
			</div>
			<div className="h-[85%] overflow-x-auto">
				{filteredGroups.map((gm) => (
					<div
						key={gm.label}
						className="relative items-center px-10 py-5 border-b-2 border-gray-800 grid grid-cols-3 bg-gray-900/90 hover:bg-gray-800/90 transition"
						onClick={() => {
							openChatView(gm.privacy === 'protected' ? 'password_protection' : 'group', gm.label, {
									groupName: gm.label,
									groupId: gm.id
								}
							);
						}}
					>
						<div className="absolute bottom-0 left-0 flex items-center px-3 py-1 text-sm text-white bg-gray-800 drop-shadow-md gap-x-1">
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
								style={{ backgroundColor: "green" }}
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
							<p>{gm.lastMessage}</p>
						</div>
					</div>
				))}
			</div>
		</Fragment>
	);
};

export default Groups;
