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
	const createSuggestedFriends = (users: User[], friends: User[], blocked: User[]) => {
		const suggestedUsers: User[] = [];
		const userId: string = currentUser.id;

		for (var user of users) {
			if (user.id !== userId && user.accountDeactivated) {
				const isNotFriend = !!friends.find((friend) => friend.id === userId);
				const isNotBlocked = !!blocked.find((blockedUser) => blockedUser.id === userId);

				if (isNotFriend && isNotBlocked) {
					suggestedUsers.push(user);
				}
			}
		}
		return suggestedUsers;
	}

	const getRelationships = async (users: User[], id: string) => {
		const res = await backend.request(`/api/users/${id}`);
		const data = await res.json();
		const duoquadraFriends: User[] = [];

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
		createSuggestedFriends(users, data.friends, data.blockedUsers);
	}

	const getRelationshipsData = async () => {
		const res = await backend.request('/api/users/');
		const data = await res.json();

		setUsers(data);
		getRelationships(data, currentUser.id);
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
				createSuggestedFriends,
				getRelationships,
				getRelationshipsData,
			}}
		>
			{children}
		</relationshipContext.Provider>
	);
};

export default RelationshipProvider;
