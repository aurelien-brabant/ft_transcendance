import { useEffect, useState } from "react";
import { User } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import relationshipContext from "./relationshipContext";

const RelationshipProvider: React.FC = ({ children }) => {
	const { user: currentUser, backend } = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);
	const [friends42, setFriends42] = useState<User[]>([]);
	const [blocked, setBlocked] = useState<User[]>([]);
	const [pendingFriendsReceived, setPendingFriendsReceived] = useState<User[]>([]);
	const [pendingFriendsSent, setPendingFriendsSent] = useState<User[]>([]);
	const [suggested, setSuggested] = useState<User[]>([]);

	/* Set a list of suggested new friends */
	const createSuggestedFriends = (users: User[], friends: User[], blocked: User[], requests: User[]) => {
		const suggestedUsers: User[] = [];
		const userId: string = currentUser.id;

		for (var user of users) {
			if (user.id !== userId && !user.accountDeactivated) {
				const isNotFriend = !(!!friends.find((friend) => friend.id === user.id));
				const isNotBlocked = !(!!blocked.find((blockedUser) => blockedUser.id === user.id));
				const noRequest = !(!!requests.find((receiver) => receiver.id === user.id));

				if (isNotFriend && isNotBlocked && noRequest) {
					suggestedUsers.push(user);
				}
			}
		}
		setSuggested(suggestedUsers);
	}

	/* Get relationships specific to the current user */
	const setUserRelationships = async (users: User[], id: string) => {
		const res = await backend.request(`/api/users/${id}`);
		const data = await res.json();
		const duoquadraFriends: User[] = [];
		const userId: String = currentUser.id;

		/* Remove current User from list */
		const filteredUsers = users.filter(user => {
			return user.id !== userId;
		});

		setFriends(data.friends);
		setBlocked(data.blockedUsers);
		setPendingFriendsReceived(data.pendingFriendsReceived);
		setPendingFriendsSent(data.pendingFriendsSent);

		for (var friend of data.friends) {
			if (friend.duoquadra_login) {
				duoquadraFriends.push(friend);
			}
		}
		setFriends42(duoquadraFriends);
		createSuggestedFriends(filteredUsers, data.friends, data.blockedUsers, data.pendingFriendsSent);
	}

	/* Fetch all users and set current user relationships */
	const getRelationshipsData = async () => {
		const res = await backend.request('/api/users/');
		const allUsers: User[] = await res.json();

		setUsers(allUsers);
		await setUserRelationships(allUsers, currentUser.id);
	}

	return (
		<relationshipContext.Provider
			value={{
				users,
				setUsers,
				friends,
				setFriends,
				friends42,
				setFriends42,
				blocked,
				setBlocked,
				pendingFriendsReceived,
				setPendingFriendsReceived,
				pendingFriendsSent,
				setPendingFriendsSent,
				suggested,
				setSuggested,
				getRelationshipsData,
			}}
		>
			{children}
		</relationshipContext.Provider>
	);
};

export default RelationshipProvider;
