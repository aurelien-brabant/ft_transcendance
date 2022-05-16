import { useState } from "react";
import { User } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import relationshipContext from "./relationshipContext";

const RelationshipProvider: React.FC = ({ children }) => {
	const { user, backend } = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [friends, setFriends] = useState<User[]>([]);
	const [friends42, setFriends42] = useState<User[]>([]);
	const [blocked, setBlocked] = useState<User[]>([]);
	const [pendingFriendsReceived, setPendingFriendsReceived] = useState<User[]>([]);
	const [pendingFriendsSent, setPendingFriendsSent] = useState<User[]>([]);
	const [suggested, setSuggested] = useState<User[]>([]);

	const createSuggested = (
		users: User[], friends: User[], blocked: User[]
		) => {
		const checkSuggested = (list: User[], id: String) => {
			for (var i in list) {
				if (list[i].id === id) {
					return false;
				}
			}
			return true;
		}

		let suggestedList: User[] = [];
		for (var i in users) {
			if (users[i].id !== user.id
				&& checkSuggested(blocked, users[i].id)
				&& checkSuggested(friends, users[i].id)
				&& !users[i].accountDeactivated)
					suggestedList = [...suggestedList, users[i]]
		}

		setSuggested(suggestedList.filter(function(ele , pos){
			return suggestedList.indexOf(ele) == pos;
		}));
	}

	const getRelationships = async (usersList: User[], id: string) => {

		const req = await backend.request(`/api/users/${id}`);
		const data = await req.json();

		setFriends(data.friends);
		setBlocked(data.blockedUsers);
		setPendingFriendsReceived(data.pendingFriendsReceived);
		setPendingFriendsSent(data.pendingFriendsSent);

		let friendsList: User[] = [];
		for (var i in data.friends) {
			if (data.friends[i].duoquadra_login)
				friendsList = [...friendsList, data.friends[i]];
		}
		setFriends42(friendsList);
		createSuggested(usersList, friendsList, data.blockedUsers);
	}

	const getRelationshipsData = async () => {
		const req = await backend.request('/api/users/');
		const data = await req.json()
		setUsers(data);
		getRelationships(data, user.id);
	}

	return (
		<relationshipContext.Provider
			value={{
				getRelationshipsData,
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
				getRelationships,
				createSuggested,
				suggested,
				setSuggested
			}}
		>
			{children}
		</relationshipContext.Provider>
	);
};

export default RelationshipProvider;
