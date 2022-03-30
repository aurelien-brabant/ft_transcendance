import { Fragment, useEffect, useRef, useState, useContext } from "react";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import { User } from "transcendance-types";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";
import { UserStatusItem } from "../UserStatus";

/* Header */
export const DirectMessageNewHeader: React.FC = () => {
	const { closeChat, closeRightmostView } = useContext(chatContext) as ChatContextType;

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5">
				<div className="flex gap-x-2 text-2xl">
					<button onClick={() => { closeChat(); }}>
						<AiOutlineClose />
					</button>
					<button onClick={() => { closeRightmostView(); }}>
						<AiOutlineArrowLeft />
					</button>
				</div>
			</div>
			<div className="flex flex-col items-center justify-center">
				<h6 className="text-lg font-bold text-pink-600">
				Chat with a friend
				</h6>
			</div>
		</Fragment>
	);
}

/* Search bar and friend list */
const DirectMessageNew: React.FC = () => {
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { openDirectMessage } = useContext(chatContext) as ChatContextType;
	const { getData, friends } = useContext(relationshipContext) as RelationshipContextType;
	const userId = getUserData().id;
	const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	/* Search a friend */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();
		setFilteredFriends(
			friends.filter(
				(friend) =>
					friend.username.toLowerCase().includes(searchTerm)
			)
		);
	};

	/* Find existing DM or create a new one */
	const handleSelect = async (friend: User) => {
		await openDirectMessage(userId, friend);
	}

	useEffect(() => {
		getData();
		setFilteredFriends(friends);
	}, []);

	return (
		<div className="flex flex-col h-full px-5 py-5 overflow-y-auto gap-y-4">
			<h6 className="text-xl">Start a new private conversation</h6>
			<input
					ref={searchInputRef}
					type="text"
					className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[50%]"
					placeholder="search in friend list"
					onChange={(e) => {
						handleSearch(e.target.value);
					}}
			/>
			<div className="h-[85%] overflow-x-auto">
				{filteredFriends.map((friend) => (
					<div
						key={friend.username}
						className="relative items-center px-10 py-5 border-b-2 border-gray-800 grid grid-cols-3 bg-transparent hover:bg-gray-800/90 transition"
						onClick={() => {
							handleSelect(friend)
						}}
					>
						<div>
							<div
								className="relative z-20 flex items-center justify-center w-16 h-16 text-4xl rounded-full"
							>
								<img src={`/api/users/${friend.id}/photo`} className="object-fill w-full h-full rounded-full" />
								<UserStatusItem withText={false} status={Math.random() > 0.3 ? 'offline' : 'online'} className="absolute bottom-0 right-0 z-50"	/>
							</div>
						</div>
						<div className="col-span-2">
							<div className="flex items-center justify-between">
								<h6 className="text-lg font-bold">
									{friend.username}
								</h6>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DirectMessageNew;
