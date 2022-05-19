import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { BaseUserData, Channel, User } from "transcendance-types";
import { UserStatusItem } from "../UserStatus";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

/* Header */
export const GroupAddHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
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
					Add a user to group
				</h6>
			</div>
		</Fragment>
	);
};

const GroupAdd: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const channelId: string = viewParams.channelId;
	const { user } = useSession();
	const { socket, closeRightmostView, setChatView } = useContext(chatContext) as ChatContextType;
	const { friends } = useContext(relationshipContext) as RelationshipContextType;
	const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	/* Search a friend */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();

		setFilteredFriends(
			filteredFriends.filter(
				(friend) =>
					friend.username.toLowerCase().includes(searchTerm)
			)
		);
	};

	/* Find existing DM or create a new one */
	const handleSelect = async (friend: User) => {
		await addUserToGroup(friend.id);
	}

	/* Select friends that didn't already join the group */
	const selectFriends = async (channel: Channel) => {
		const selectedFriends: User[] = [];

		for (const friend of friends) {
			const isInChan = !!channel.users.find((user: BaseUserData) => {
				return user.id === friend.id;
			})
			if (!isInChan && (friend.id !== user.id)) {
				selectedFriends.push(friend);
			}
		}
		setFilteredFriends(selectedFriends);
	};

	/* Add a friend to group */
	const addUserToGroup = async (id: string) => {
		socket.emit("joinChannel", { userId: id, channelId });
		closeRightmostView();
	};

	const userPunishedListener = (message: string) => {
		setChatView("groups", "Group chats", {});
	}

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("channelData", selectFriends);

		return () => {
			socket.off("channelData", selectFriends);
		};
	}, [friends]);

	useEffect(() => {
		/* Listeners */
		socket.on("punishedInChannel", userPunishedListener);
		socket.on("kickedFromChannel", userPunishedListener);

		return () => {
			socket.off("punishedInChannel", userPunishedListener);
			socket.off("kickedFromChannel", userPunishedListener);
		};
	}, []);

	return (
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-dark/90 border-04dp border-b-4 justify-between">
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
			<div className="overflow-x-auto">
				<div className="flex px-5 pt-3 text-xs text-neutral-200 uppercase">
					Select the friend to add
				</div>
				<small className="flex px-5 py-3">
					{filteredFriends.length === 0 && "No more friends to add to group"}
				</small>
				{filteredFriends.map((friend) => (
					<div
						key={friend.username}
						className="flex items-center px-4 py-3 hover:bg-04dp/90 transition gap-x-4"
						onClick={() => {
							handleSelect(friend)
						}}
					>
					<div
						className="relative z-20 items-center w-12 h-12 rounded-full"
					>
						<img
							src={`/api/users/${friend.id}/photo`}
							className="object-fill w-full h-full rounded-full"
						/>
						<UserStatusItem withText={false} className="absolute bottom-0 right-0 z-50" id={friend.id} />
					</div>
					{friend.username}
				</div>
				))}
			</div>
		</Fragment>
	);
};

export default GroupAdd;
