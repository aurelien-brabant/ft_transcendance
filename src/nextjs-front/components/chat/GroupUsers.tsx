import { useContext, useEffect, useState } from "react";
import { GiThorHammer } from "react-icons/gi";
import { FaCrown } from "react-icons/fa";
import { BsArrowLeftShort, BsShieldFillCheck, BsShieldFillPlus, BsShieldFillX } from "react-icons/bs";
import Link from "next/link";
import { BaseUserData } from "transcendance-types";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import Tooltip from "../../components/Tooltip";

type UserSummary = {
	id: string;
	avatar: string;
	username: string;
	isOwner: boolean;
	isAdmin: boolean; /* Moderator */
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
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const [users, setUsers] = useState<UserSummary[]>([]);
	const { fetchChannelData } = useContext(chatContext) as ChatContextType;
	const channelId = viewParams.groupId;
	const actionTooltipStyles = "font-bold bg-gray-900 text-neutral-200";

	/* Make user administrator */
	const addAdmin = async (id: string) => {
		const channelData = await fetchChannelData(channelId).catch(console.error);
		const admins = JSON.parse(JSON.stringify(channelData)).admins;

		const res = await fetch(`/api/channels/${channelId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				admins: [ ...admins, {"id": id} ]
			}),
		});

		if (res.status === 200) {
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to give administrator role"
			});
		}
	};

	/* Remove administrator rights */
	const removeAdmin = async (id: string) => {
		const channelData = await fetchChannelData(channelId).catch(console.error);
		const currentAdmins = JSON.parse(JSON.stringify(channelData)).admins;
		const admins = currentAdmins.filter((admin: BaseUserData) => { 
			return admin.id != id
		})

		const res = await fetch(`/api/channels/${channelId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				admins: [ ...admins ]
			}),
		});

		if (res.status === 200) {
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to remove administrator role"
			});
		}
	};

	const updateUsers = async () => {
		const data = await fetchChannelData(channelId).catch(console.error);
		const chanOwner = await JSON.parse(JSON.stringify(data)).owner;
		const chanAdmins = await JSON.parse(JSON.stringify(data)).admins;
		const chanUsers = await JSON.parse(JSON.stringify(data)).users;
		const users: UserSummary[] = [];

		for (var i in chanUsers) {
			users.push({
				id: chanUsers[i].id,
				avatar: `/api/users/${chanUsers[i].id}/photo`,
				username: chanUsers[i].username,
				isOwner: (chanUsers[i].id === chanOwner.id),
				isAdmin: !!chanAdmins.find((admin: BaseUserData) => {
						return admin.id === chanUsers[i].id;
					})
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
							src={user.avatar}
							height="50px"
							width="50px"
							className={`border-4 ${
								user.isOwner
									? "border-pink-600"
									: user.isAdmin
										? "border-green-600"
										: "border-gray-800"
							} rounded-full `}
						/>
						<Link href={`/users/${user.username}`}>
							<a>{user.username}</a>
						</Link>
						{user.isOwner && <FaCrown color="#ffa500" />}
						{user.isAdmin && <BsShieldFillCheck color="#43A047"/>}
					</div>
					<div className="flex text-2xl gap-x-4">
						{!user.isOwner && user.isAdmin &&
						<Tooltip className={actionTooltipStyles} content="-admin">
							<button onClick={() => removeAdmin(String(user.id))}
								className="text-red-600 hover:scale-110"><BsShieldFillX /></button>
						</Tooltip>}
						{!user.isOwner && !user.isAdmin &&
						<Tooltip className={actionTooltipStyles} content="+admin">
							<button onClick={() => addAdmin(String(user.id))}
								className="text-green-600 hover:scale-110">
								<BsShieldFillPlus />
							</button>
						</Tooltip>}
						{!user.isOwner && 
							<Tooltip className={actionTooltipStyles} content="ban">
							<button className="hover:scale-110">
								<GiThorHammer color="grey"/>
							</button>
						</Tooltip>}
					</div>
				</div>
			))}
		</div>
	);
};

export default GroupUsers;
