import { Fragment, useContext, useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { FaCrown, FaUserFriends, FaUserLock, FaUserMinus } from "react-icons/fa";
import { BsShieldFillCheck, BsShieldFillPlus, BsShieldFillX } from "react-icons/bs";
import { GiThorHammer } from "react-icons/gi";
import { MdVoiceOverOff } from "react-icons/md";
import { RiPingPongLine } from 'react-icons/ri';
import Link from "next/link";
import { BaseUserData, Channel } from "transcendance-types";
import { useSession } from "../../hooks/use-session";
import Tooltip from "../../components/Tooltip";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

type UserSummary = {
	id: string;
	username: string;
	pic: string;
	isMe: boolean;
	isOwner: boolean;
	isAdmin: boolean;
	isMuted: boolean;
	isBanned: boolean;
	isBlocked: boolean;
};

/* Header */
export const GroupUsersHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { closeChat, closeRightmostView, socket } = useContext(chatContext) as ChatContextType;
	const [peopleCount, setPeopleCount] = useState(0);

	const updatePeopleCount = (channel: Channel) => {
		setPeopleCount(channel.users.length);
	};

	useEffect(() => {
		socket.emit("getChannelData", { channelId: viewParams.channelId });

		/* Listeners */
		socket.on("updateChannel", updatePeopleCount);

		return () => {
			socket.off("updateChannel", updatePeopleCount);
		};
	}, []);

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
					{peopleCount}
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
	const channelId: string = viewParams.channelId;
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { fetchChannelData, socket } = useContext(chatContext) as ChatContextType; /* NOTE: fetch will be removed */
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [users, setUsers] = useState<UserSummary[]>([]);
	const [ownerView, setOwnerView] = useState(false);
	const actionTooltipStyles = "font-bold bg-gray-900 text-neutral-200";

	/* Make user administrator */
	const addAdmin = async (id: string) => {
		const groupData = await fetchChannelData(channelId).catch(console.error); /* NOTE: fetch will be removed */
		const admins = JSON.parse(JSON.stringify(groupData)).admins;

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
		const groupData = await fetchChannelData(channelId).catch(console.error); /* NOTE: fetch will be removed */
		const currentAdmins = JSON.parse(JSON.stringify(groupData)).admins;
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

	/* Ban user from group */
	const banUser = async (id: string, username: string) => {
		const groupData = await fetchChannelData(channelId).catch(console.error); /* NOTE: fetch will be removed */
		const users = JSON.parse(JSON.stringify(groupData)).bannedUsers;

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
			setAlert({
				type: "info",
				content: `${username} is banned`
			});
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to ban user"
			});
		}
	};

	/* Mute user in group */
	const muteUser = async (id: string, username: string) => {
		const groupData = await fetchChannelData(channelId).catch(console.error); /* NOTE: fetch will be removed */
		const users = JSON.parse(JSON.stringify(groupData)).mutedUsers;

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
			setAlert({
				type: "info",
				content: `${username} is muted`
			});
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to mute user"
			});
		}
	};

	/* Kick user from group */
	const kickUser = async (id: string, username: string) => {
		const groupData = await fetchChannelData(channelId).catch(console.error); /* NOTE: fetch will be removed */
		const currentUsers = JSON.parse(JSON.stringify(groupData)).users;
		const users = currentUsers.filter((user: BaseUserData) => {
			return user.id !=  id
		})

		const res = await fetch(`/api/channels/${channelId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				users: [ ...users ]
			}),
		});

		if (res.status === 200) {
			setAlert({
				type: "info",
				content: `${username} was kicked`
			});
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to mute user"
			});
		}
	};

	/* Update user list on mount */
	const defineUserList = async (channel: Channel) => {
		const users: UserSummary[] = [];

		setOwnerView(channel.owner.id === user.id);

		for (var chanUser of channel.users) {
			users.push({
				id: chanUser.id,
				username: chanUser.username,
				pic: `/api/users/${chanUser.id}/photo`,
				isMe: (chanUser.id === user.id),
				isOwner: (chanUser.id === channel.owner.id),
				isAdmin: (chanUser.id === channel.owner.id) || !!channel.admins.find((admin: BaseUserData) => {
					return admin.id === chanUser.id;
				}),
				isMuted: !!channel.mutedUsers.find((user: BaseUserData) => {
					return user.id === chanUser.id;
				}),
				isBanned: !!channel.bannedUsers.find((user: BaseUserData) => {
					return user.id === chanUser.id;
				}),
				isBlocked: !!blocked.find(user => user.id === chanUser.id)
			});
		}
		users.sort(
				(a, b) => (a.isBlocked ? 1 : -1)
			).sort(
				(a, b) => (a.isAdmin ? -1 : 1)
			).sort(
				(a, b) => (a.isOwner ? -1 : 1));
		setUsers(users);
	}

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("updateChannel", defineUserList);

		return () => {
			socket.off("updateChannel", defineUserList);
		};
	}, [users]);

	if (ownerView) { // NEED FIX: also admin
		return (
			<div className="flex flex-col h-full py-4 overflow-auto ">
				{users.map((user) => (
					<div key={user.username} className="flex items-center justify-between px-4 py-3 hover:bg-04dp/90 transition">
						<div className="flex items-center gap-x-2 w-12 h-12">
							<img
								src={user.pic}
								className={`border-4 ${
									user.isOwner
										? "border-pink-600"
										: user.isAdmin
											? "border-blue-500"
											: "border-04dp"
								} object-fill w-full h-full rounded-full`}
							/>
							<Link href={`/users/${user.username}`}>
								<a className="flex items-center gap-x-2">
									{user.username}
									{user.isOwner && <FaCrown className="text-yellow-500" />}
									{!user.isOwner && user.isAdmin && <BsShieldFillCheck className="text-blue-500"/>}
									{!user.isOwner && user.isMuted && <MdVoiceOverOff color="grey"/>}
									{!user.isOwner && user.isBanned && <GiThorHammer color="grey"/>}
									{user.isBlocked && <FaUserLock className="text-red-600" />}
								</a>
							</Link>
						</div>
						<div className="flex text-xl gap-x-2">
							{!user.isAdmin && !user.isMuted &&
							<Tooltip className={actionTooltipStyles} content="mute">
								<button
								onClick={() => muteUser(String(user.id), user.username)}
								className="transition hover:scale-110">
									<MdVoiceOverOff color="grey"/>
								</button>
							</Tooltip>}
							{!user.isAdmin && !user.isBanned &&
							<Tooltip className={actionTooltipStyles} content="ban">
								<button onClick={() => banUser(String(user.id), user.username)} className="transition hover:scale-110">
									<GiThorHammer color="grey"/>
								</button>
							</Tooltip>}
							{!user.isAdmin &&
							<Tooltip className={actionTooltipStyles} content="kick">
								<button onClick={() => kickUser(String(user.id), user.username)} className="transition hover:scale-110">
									<FaUserMinus className="text-lg" color="grey"/>
								</button>
							</Tooltip>}
							{!user.isOwner && user.isAdmin &&
							<button onClick={() => removeAdmin(String(user.id))} className="text-red-600 transition hover:scale-110"><BsShieldFillX /></button>}
							{!user.isOwner && !user.isAdmin && !user.isMuted && !user.isBanned &&
							<Tooltip className={actionTooltipStyles} content="+admin">
								<button onClick={() => addAdmin(String(user.id))} className="text-blue-500 transition hover:scale-110">
									<BsShieldFillPlus />
								</button>
							</Tooltip>}
							{!user.isMe && !user.isBlocked &&
							<Tooltip className={actionTooltipStyles} content="play">
								<button
									className="p-1 text-gray-900 bg-white rounded-full transition hover:scale-110  hover:text-pink-600"
								>
									<RiPingPongLine />
								</button>
							</Tooltip>}
						</div>
					</div>
				))}
			</div>
		);
	} else {
		return (
			<div className="flex flex-col h-full py-4 overflow-auto ">
				{users.map((user) => (
					<div key={user.username} className="flex items-center justify-between px-4 py-3 gap-x-2 hover:bg-04dp/90 transition">
						<div className="flex items-center gap-x-2 w-12 h-12">
							<img
								src={user.pic}
								className={`border-4 ${
									user.isOwner
										? "border-pink-600"
										: user.isAdmin
											? "border-blue-500"
											: "border-04dp"
								} object-fill w-full h-full rounded-full`}
							/>
							<Link href={`/users/${user.username}`}>
								<a className="flex items-center gap-x-2 ">
									{user.username}
									{user.isOwner && <FaCrown className="text-yellow-500" />}
									{!user.isOwner && user.isAdmin && <BsShieldFillCheck className="text-blue-500"/>}
									{user.isBlocked && <FaUserLock className="text-red-600" />}
								</a>
							</Link>
						</div>
						<div className="flex text-xl gap-x-2">
							{!user.isMe && !user.isBlocked &&
							<Tooltip className={actionTooltipStyles} content="play">
								<button
									className="p-1 text-gray-900 bg-white rounded-full transition hover:scale-110  hover:text-pink-600"
								>
									<RiPingPongLine />
								</button>
							</Tooltip>}
						</div>
					</div>
				))}
			</div>
		);
	}
};

export default GroupUsers;
