import { useState } from "react";
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

		for (const user of users) {
			if (user.id !== userId && !user.accountDeactivated) {
				const isNotFriend = !friends.find((friend) => friend.id === user.id);
				const isNotBlocked = !blocked.find((blockedUser) => blockedUser.id === user.id);
				const notRequested = !requests.find((receiver) => receiver.id === user.id);

				if (isNotFriend && isNotBlocked && notRequested) {
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
		const filteredFriends = data.friends.filter((friend: User) =>
			(!!!data.blockedUsers.find((blocked: User) => {
				return blocked.id === friend.id;
			}))
		);
		const allRequests = [...data.pendingFriendsSent, ...data.pendingFriendsReceived];

		setFriends(filteredFriends);
		setBlocked(data.blockedUsers);
		setPendingFriendsReceived(data.pendingFriendsReceived);
		setPendingFriendsSent(data.pendingFriendsSent);

		for (const friend of filteredFriends) {
			if (friend.duoquadra_login) {
				duoquadraFriends.push(friend);
			}
		}

		setFriends42(duoquadraFriends);
		createSuggestedFriends(filteredUsers, data.friends, data.blockedUsers, allRequests);
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
