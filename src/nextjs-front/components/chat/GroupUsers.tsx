import { useContext, useEffect, useState } from "react";
import { GiThorHammer } from "react-icons/gi";
import { BsArrowLeftShort, BsShieldFillPlus } from "react-icons/bs";
import Link from "next/link";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

type UserSummary = {
	username: string;
	pic: string;
	isAdmin: boolean;
};

export const GroupUsersHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { closeRightmostView } = useContext(chatContext) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
				<button
					className="text-4xl"
					onClick={() => {
						closeRightmostView();
					}}
				>
					<BsArrowLeftShort />
				</button>
			</div>
			<h6>Group members</h6>
		</div>
	);
};

const GroupUsers: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { fetchChannelData } = useContext(chatContext) as ChatContextType;
	const [users, setUsers] = useState<UserSummary[]>([]);
	const channelId = viewParams.groupId;

	const updateUsers = async () => {
		const data = await fetchChannelData(channelId).catch(console.error);
		const chanUsers = await JSON.parse(JSON.stringify(data)).users;
		const chanOwner = await JSON.parse(JSON.stringify(data)).owner;
		const users: UserSummary[] = [];

		for (var i in chanUsers) {
			users.push({
				username: chanUsers[i].username,
				pic: `/api/users/${chanUsers[i].id}/photo`,
				isAdmin: (chanUsers[i].id === chanOwner.id)
			});
		}
		setUsers(users);
	}

	useEffect(() => {
		updateUsers();
	}, []);

	return (
		<div className="flex flex-col h-full py-4 overflow-auto ">
			{users.map((user) => (
				<div key={user.username} className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-800 gap-x-2">
					<div className="flex items-center gap-x-4">
						<img
							src={user.pic}
							height="50px"
							width="50px"
							className={`border-4 ${
								user.isAdmin
									? "border-red-400"
									: "border-gray-800"
							} rounded-full `}
						/>
						<Link href={`/users/${user.username}`}>
							<a>{user.username}</a>
						</Link>
					</div>
					<div className="flex text-3xl gap-x-4">
						{!user.isAdmin && <GiThorHammer />}
						{!user.isAdmin && <BsShieldFillPlus />}
					</div>
				</div>
			))}
		</div>
	);
};

export default GroupUsers;
