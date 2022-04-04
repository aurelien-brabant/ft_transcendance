import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { User } from "transcendance-types";
import { UserStatusItem } from "../UserStatus";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

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
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-gray-900/90 border-gray-800 border-b-4">
				<input
						ref={searchInputRef}
						type="text"
						className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[50%]"
						placeholder="Search in friend list"
						onChange={(e) => {
							handleSearch(e.target.value);
						}}
				/>
			</div>
			<div className="flex px-5 py-3 text-xs text-neutral-200 uppercase">
				Select the friend to chat with
			</div>
			<div className="overflow-x-auto">
				{filteredFriends.map((friend) => (
					<div
						key={friend.username}
						className="flex items-center px-4 py-3 hover:bg-gray-800/90 transition gap-x-4"
						onClick={() => {
							handleSelect(friend)
						}}
					>
					<div
						className="relative z-20 items-center justify-center w-12 h-12 rounded-full"
					>
						<img
							src={`/api/users/${friend.id}/photo`}
							className="object-fill w-full h-full rounded-full"
						/>
						<UserStatusItem withText={false} status={Math.random() > 0.3 ? 'offline' : 'online'} className="absolute bottom-0 right-0 z-50" />
					</div>
				{friend.username}
				</div>
				))}
			</div>
		</Fragment>
	);
};

export default DirectMessageNew;
