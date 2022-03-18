import {
	Fragment,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";
import { UserStatusItem } from "../UserStatus";

/* All DM conversations tab */
const DirectMessages: React.FC<{ viewParams: Object; }> = ({ viewParams }) => {
	const { openChatView, directMessages } = useContext(chatContext) as ChatContextType;
	const [filteredDms, setFilteredDms] = useState(directMessages);
	const [visiblityFilter, setVisiblityFilter] = useState<ChatGroupPrivacy | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();
		setFilteredDms(
			directMessages.filter(
				(dm) =>
					dm.username.toLowerCase().includes(searchTerm)
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
					placeholder="search for a user"
					onChange={(e) => {
						handleSearch(e.target.value);
					}}
				/>
				<select
					className="px-2 py-1 text-sm bg-gray-900 outline-none"
					onChange={handleSelect}
				>
					<option value="all">all</option>
					<option value="private">friends</option>
					<option value="public">blocked</option>
				</select>
				<button
					className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 rounded"
					onClick={() => {
						openChatView("group_new", "Create a new group", {});
					}}
				>
					+group
				</button>
			</div>
			<div className="h-[85%] overflow-x-auto">
				{filteredDms.map((dm) => (
					<div
						key={dm.username}
						className="relative items-center px-10 py-5 border-b-2 border-gray-800 grid grid-cols-3 bg-gray-900/90 hover:bg-gray-800/90 transition"
						onClick={() => {
							openChatView(
								'dm', 'dm', {
									targetUsername: dm.username,
									targetId: dm.id
								}
							)
						}}
					>
						<div>
							<div
								className="relative z-20 flex items-center justify-center w-16 h-16 text-4xl rounded-full"
							>
								<img src={dm.avatar} className="object-fill w-full h-full rounded-full" />
								<UserStatusItem withText={false} status={Math.random() > 0.3 ? 'offline' : 'online'} className="absolute bottom-0 right-0 z-50"  />
							</div>
						</div>
						<div className="col-span-2">
							<div className="flex items-center justify-between">
								<h6 className="text-lg font-bold">
									{dm.username}
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
