import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { BsShieldFillCheck, BsShieldFillPlus, BsShieldFillX } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { GiThorHammer } from "react-icons/gi";
import { MdVoiceOverOff } from "react-icons/md";
import { RiPingPongLine } from 'react-icons/ri';
import Link from "next/link";
import { BaseUserData } from "transcendance-types";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import Tooltip from "../../components/Tooltip";

type UserSummary = {
	id: string;
	username: string;
	pic: string;
	isOwner: boolean;
	isAdmin: boolean;
	isMuted: boolean;
	isBanned: boolean;
};

/* Header */
export const GroupUsersHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
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
				<div className="flex items-center gap-x-1 px-2">
					<FaUserFriends />
					{viewParams.peopleCount}
				</div>
			</div>
			<div className="flex flex-col items-center justify-center">
				<h6 className="text-lg font-bold text-pink-600">
					Group members
				</h6>
			</div>
		</Fragment>
	);
};

const GroupUsers: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { fetchChannelData } = useContext(chatContext) as ChatContextType;
	const [users, setUsers] = useState<UserSummary[]>([]);
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
				admins: [ ...admins, { "id": id } ]
			}),
		});

		if (res.status === 200) {
			updateUsers();
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
			updateUsers();
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to remove administrator role"
			});
		}
	};

	/* Ban user from channel */
	const banUser = async (id: string, username: string) => {
		const channelData = await fetchChannelData(channelId).catch(console.error);
		const users = JSON.parse(JSON.stringify(channelData)).bannedUsers;

		const res = await fetch(`/api/channels/${channelId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				bannedUsers: [ ...users, { "id": id } ]
			}),
		});

		if (res.status === 200) {
			updateUsers();
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to ban user"
			});
		}
	};

	/* Mute user in channel */
	const muteUser = async (id: string, username: string) => {
		const channelData = await fetchChannelData(channelId).catch(console.error);
		const users = JSON.parse(JSON.stringify(channelData)).mutedUsers;

		const res = await fetch(`/api/channels/${channelId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				mutedUsers: [ ...users, { "id": id } ]
			}),
		});

		if (res.status === 200) {
			updateUsers();
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to mute user"
			});
		}
	};

	/* Update user list on mount */
	const updateUsers = async () => {
		const data = await fetchChannelData(channelId).catch(console.error);
		const chanOwner = await JSON.parse(JSON.stringify(data)).owner;
		const chanAdmins = await JSON.parse(JSON.stringify(data)).admins;
		const chanUsers = await JSON.parse(JSON.stringify(data)).users;
		const mutedUsers = await JSON.parse(JSON.stringify(data)).mutedUsers;
		const bannedUsers = await JSON.parse(JSON.stringify(data)).bannedUsers;
		const users: UserSummary[] = [];

		for (var i in chanUsers) {
			users.push({
				id: chanUsers[i].id,
				username: chanUsers[i].username,
				pic: `/api/users/${chanUsers[i].id}/photo`,
				isOwner: (chanUsers[i].id === chanOwner.id),
				isAdmin: (chanUsers[i].id === chanOwner.id) || !!chanAdmins.find((admin: BaseUserData) => {
					return admin.id === chanUsers[i].id;
				}),
				isMuted: !!mutedUsers.find((user: BaseUserData) => {
					return user.id === chanUsers[i].id;
				}),
				isBanned: !!bannedUsers.find((user: BaseUserData) => {
					return user.id === chanUsers[i].id;
				})
			});
		}
		setUsers(users);
	}

	useEffect(() => {
		updateUsers();
	}, []);

	// TODO: don't display Pong icon if user is blocked

	if (viewParams.ownerView) { // also admin
		return (
			<div className="flex flex-col h-full px-4 py-4 overflow-auto ">
				{users.map((user) => (
					<div key={user.username} className="flex items-center justify-between py-3 gap-x-2 hover:bg-gray-800/90 transition">
						<div className="flex items-center gap-x-2 w-12 h-12">
							<img
								src={user.pic}
								className={`border-4 ${
									user.isOwner
										? "border-pink-600"
										: user.isAdmin
											? "border-blue-500"
											: "border-gray-800"
								} object-fill w-full h-full rounded-full`}
							/>
							<Link href={`/users/${user.username}`}>
								<a className="flex items-center gap-x-2">
									{user.username}
									{user.isOwner && <FaCrown className="text-yellow-500" />}
									{!user.isOwner && user.isAdmin && <BsShieldFillCheck className="text-blue-500"/>}
								</a>
							</Link>
						</div>
						<div className="flex text-xl gap-x-2">
							{!user.isAdmin &&
							<Tooltip className={actionTooltipStyles} content="mute">
								<button
								onClick={() => muteUser(String(user.id), user.username)}
								className="transition hover:scale-110">
									<MdVoiceOverOff color="grey"/>
								</button>
							</Tooltip>}
							{!user.isAdmin &&
							<Tooltip className={actionTooltipStyles} content="ban">
								<button onClick={() => banUser(String(user.id), user.username)} className="transition hover:scale-110">
									<GiThorHammer color="grey"/>
								</button>
							</Tooltip>}
							{!user.isOwner && user.isAdmin &&
							<button onClick={() => removeAdmin(String(user.id))} className="text-red-600 transition hover:scale-110"><BsShieldFillX /></button>}
							{!user.isOwner && !user.isAdmin &&
							<Tooltip className={actionTooltipStyles} content="+admin">
								<button onClick={() => addAdmin(String(user.id))} className="text-blue-500 transition hover:scale-110">
									<BsShieldFillPlus />
								</button>
							</Tooltip>}
							<Tooltip className={actionTooltipStyles} content="play">
								<button
									className="p-1 text-gray-900 bg-white rounded-full transition hover:scale-110  hover:text-pink-600"
								>
									<RiPingPongLine />
								</button>
							</Tooltip>
						</div>
					</div>
				))}
			</div>
		);
	} else {
		return (
			<div className="flex flex-col h-full py-4 overflow-auto ">
				{users.map((user) => (
					<div key={user.username} className="flex items-center justify-between px-4 py-3 gap-x-2 hover:bg-gray-800/90 transition">
						<div className="flex items-center gap-x-2 w-12 h-12">
							<img
								src={user.pic}
								className={`border-4 ${
									user.isOwner
										? "border-pink-600"
										: user.isAdmin
											? "border-blue-500"
											: "border-gray-800"
								} object-fill w-full h-full rounded-full`}
							/>
							<Link href={`/users/${user.username}`}>
								<a className="flex items-center gap-x-2 ">
									{user.username}
									{user.isOwner && <FaCrown className="text-yellow-500" />}
									{!user.isOwner && user.isAdmin && <BsShieldFillCheck className="text-blue-500"/>}
								</a>
							</Link>
						</div>
						<div className="flex text-xl gap-x-2">
							<Tooltip className={actionTooltipStyles} content="play">
								<button
									className="p-1 text-gray-900 bg-white rounded-full transition hover:scale-110  hover:text-pink-600"
								>
									<RiPingPongLine />
								</button>
							</Tooltip>
						</div>
					</div>
				))}
			</div>
		);
	}
};

export default GroupUsers;
