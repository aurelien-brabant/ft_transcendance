import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import { BaseUserData, User } from "transcendance-types";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";
import { UserStatusItem } from "../UserStatus";

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
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { closeRightmostView, fetchChannelData } = useContext(chatContext) as ChatContextType;
	const { getData, friends } = useContext(relationshipContext) as RelationshipContextType;
	const groupId = viewParams.groupId;
	const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const addUserToGroup = async (id: string) => {
		const channelData = await fetchChannelData(groupId).catch(console.error);
		const users = JSON.parse(JSON.stringify(channelData)).users;

		const res = await fetch(`/api/channels/${groupId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				users: [ ...users, { "id": id } ]
			}),
		});

		if (res.status === 200) {
			closeRightmostView();
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to add user to group"
			});
		}
	};

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

	useEffect(() => {
		getData();
		/* Select friends that didn't already join the group */
		const selectFriends = async () => {
			const channelData = await fetchChannelData(groupId).catch(console.error);
			const users = await JSON.parse(JSON.stringify(channelData)).users;
			const selectedFriends: User[] = [];

			for (var i in friends) {
				const isInChan = !!users.find((user: BaseUserData) => {
					return user.id === friends[i].id;
				})
				if (!isInChan) {
					selectedFriends.push(friends[i]);
				}
			}
			setFilteredFriends(selectedFriends);
		};
		selectFriends();
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
			<div className="overflow-x-auto">
				<div className="flex px-5 py-3 text-xs text-neutral-200 uppercase">
					Select the friend to add
				</div>
				{filteredFriends.map((friend) => (
					<div
						key={friend.username}
						className="flex items-center px-4 py-3 hover:bg-gray-800/90 transition gap-x-4"
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
						<UserStatusItem withText={false} status={Math.random() > 0.3 ? 'offline' : 'online'} className="absolute bottom-0 right-0 z-50" />
					</div>
					{friend.username}
				</div>
				))}
			</div>
		</Fragment>
	);
};

export default GroupAdd;
