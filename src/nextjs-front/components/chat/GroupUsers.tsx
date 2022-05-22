import { Fragment, useContext, useEffect, useState } from "react";
import { FaCrown } from "react-icons/fa";
import { RiPingPongLine } from 'react-icons/ri';
import { ArrowSmLeftIcon, BanIcon, LockClosedIcon, ShieldExclamationIcon, UserRemoveIcon, UsersIcon, VolumeOffIcon, XIcon } from "@heroicons/react/outline";
import { ShieldCheckIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { Channel } from "transcendance-types";
import { useSession } from "../../hooks/use-session";
import Tooltip from "../../components/Tooltip";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

type UserSummary = {
	id: string;
	username: string;
	pic: string;
	isMe: boolean;
	isBlocked: boolean;
	isAdmin: boolean;
	isMuted?: boolean;
	isBanned?: boolean;
};

/* Header */
export const GroupUsersHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { socket, closeChat, closeRightmostView } = useContext(chatContext) as ChatContextType;
	const [peopleCount, setPeopleCount] = useState(0);

	const updatePeopleCount = (channel: Channel) => {
		if (channel.users) {
			setPeopleCount(channel.users.length);
		}
	};

	useEffect(() => {
		/* Listeners */
		socket.on("channelUserList", updatePeopleCount);
		socket.on("joinedChannel", updatePeopleCount);
		socket.on("leftChannel", updatePeopleCount);

		return () => {
			socket.off("channelUserList", updatePeopleCount);
			socket.off("joinedChannel", updatePeopleCount);
			socket.off("leftChannel", updatePeopleCount);
		};
	}, []);

	return (
		<Fragment>
			<div className="flex items-start justify-between pt-3 px-5">
				<div className="flex gap-x-2 text-2xl">
					<button onClick={() => { closeChat(); }}>
						<XIcon className="h-6 w-6" />
					</button>
					<button onClick={() => { closeRightmostView(); }}>
						<ArrowSmLeftIcon className="h-6 w-6" />
					</button>
				</div>
				<div className="flex items-center gap-x-1 px-2">
					<UsersIcon className="h-5 w-5" />
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

/* User list */
const GroupUsers: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const channelId: string = viewParams.channelId;
	const { user: currentUser } = useSession();
	const { asPath } = useRouter();
	const router = useRouter();
	const { socket, closeChat, setChatView } = useContext(chatContext) as ChatContextType;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [users, setUsers] = useState<UserSummary[]>([]);
	const [owner, setOwner] = useState<UserSummary>();
	const [ownerView, setOwnerView] = useState(false);
	const [adminView, setAdminView] = useState(false);
	const actionTooltipStyles = "font-bold bg-dark text-neutral-200";
	const pongIconStyle = "p-1 text-pink-700 bg-pink-200 rounded-full transition hover:scale-110	hover:text-pink-600";

	/* Make user administrator */
	const addAdmin = (id: string) => {
		socket.emit("makeAdmin", {
			channelId: parseInt(channelId),
			ownerId: currentUser.id,
			userId: parseInt(id)
		});
	};

	/* Remove administrator rights */
	const removeAdmin = (id: string) => {
		socket.emit("removeAdmin", {
			channelId: parseInt(channelId),
			ownerId: currentUser.id,
			userId: parseInt(id)
		});
	};

	/* Ban user from group */
	const banUser = (id: string) => {
		socket.emit("punishUser", {
			channelId: parseInt(channelId),
			adminId: currentUser.id,
			userId: parseInt(id),
			type: "ban"
		});
	};

	/* Mute user in group */
	const muteUser = (id: string) => {
		socket.emit("punishUser", {
			channelId: parseInt(channelId),
			adminId: currentUser.id,
			userId: parseInt(id),
			type: "mute"
		});
	};

	/* Kick user from group */
	const kickUser = (id: string) => {
		socket.emit("kickUser", {
			channelId: parseInt(channelId),
			adminId: currentUser.id,
			userId: parseInt(id)
		});
	};

	/* Invite for a Pong game */
	const sendPongInvite = async (userId: string) => {
		socket.emit("sendPongInvite", {
			senderId: currentUser.id,
			receiverId: parseInt(userId),
		});
	};

	/* Listeners */
	const userChangedListener = () => {
		socket.emit("getChannelUserList", { channelId });
	}

	const userPunishedListener = (message: string) => {
		setChatView("groups", "Group chats", {});
	}

	const goToHub = async () => {
		closeChat();
		if (asPath === "/hub") {
			router.reload();
		} else {
			await router.push("/hub");
		}
	};

	/**
	 * If true, display administration tools
	 * ban, mute, kick, make admin
	 */
	const setViewMode = (channel: Channel) => {
		setOwnerView(channel.owner.id === currentUser.id);
		setAdminView(!!channel.admins.find((admin) => {
			return admin.id === currentUser.id; }
		));
	}

	/* Update user list on mount */
	const defineUserList = (channel: Channel) => {
		setViewMode(channel);

		const owner: UserSummary = {
			id: channel.owner.id,
			username: channel.owner.username,
			pic: `/api/users/${channel.owner.id}/photo`,
			isMe: (channel.owner.id === currentUser.id),
			isBlocked: !!blocked.find((blocked) => blocked.id === channel.owner.id),
			isAdmin: false
		};
		setOwner(owner);

		const users: UserSummary[] = [];
		for (const chanUser of channel.users) {
			if (chanUser.id !== owner.id) {
				users.push({
					id: chanUser.id,
					username: chanUser.username,
					pic: `/api/users/${chanUser.id}/photo`,
					isMe: (chanUser.id === currentUser.id),
					isBlocked: !!blocked.find((blocked) => blocked.id === chanUser.id),
					isAdmin: !!channel.admins.find((admin) => { return admin.id === chanUser.id; }),
					isMuted: !!channel.punishments.find((punishment) =>
						(punishment.punishedUser.id === chanUser.id) && (punishment.type === 'mute')
					),
					isBanned: !!channel.punishments.find((punishment) =>
						(punishment.punishedUser.id === chanUser.id) && (punishment.type === 'ban')
					),
				});
			}
		}
		users.sort((a, b) => (a.isBlocked ? 1 : -1)).sort((a, b) => (a.isAdmin ? -1 : 1));
		setUsers(users);
	}

	useEffect(() => {
		socket.emit("getChannelUserList", { channelId });

		/* Listeners */
		socket.on("channelUserList", defineUserList);
		socket.on("joinedChannel", userChangedListener);
		socket.on("leftChannel", userChangedListener);
		socket.on("adminAdded", userChangedListener);
		socket.on("adminRemoved", userChangedListener);
		socket.on("userPunished", userChangedListener);
		socket.on("userKicked", userChangedListener);
		socket.on("punishedInChannel", userPunishedListener);
		socket.on("kickedFromChannel", userPunishedListener);
		socket.on("launchInviteGame", goToHub);

		return () => {
			socket.off("channelUserList", defineUserList);
			socket.off("joinedChannel", userChangedListener);
			socket.off("leftChannel", userChangedListener);
			socket.off("adminAdded", userChangedListener);
			socket.off("adminRemoved", userChangedListener);
			socket.off("userPunished", userChangedListener);
			socket.off("punishedInChannel", userPunishedListener);
			socket.off("kickedFromChannel", userPunishedListener);
			socket.off("launchInviteGame", goToHub);
		};
	}, []);

	/* The color of the user picture and any required icon next to the username */
	 const getUserLine = (user: UserSummary) => {
		return (
			<div className="flex items-center gap-x-2">
				<div className="relative w-12 h-12">
					<img
						src={user.pic}
						className={`border-4 ${
							user.isAdmin
								? "border-blue-500"
								: "border-04dp"
						} ${
							(user.isBlocked || user.isMuted || user.isBanned) && "filter brightness-50"
						} object-center w-full h-full rounded-full` }
					/>
				</div>
				<Link href={`/users/${user.username}`}>
					<a className="flex items-center gap-x-2">
						{user.username}
						{user.isAdmin && <ShieldCheckIcon className="h-5 w-5 text-blue-500"/>}
						{user.isBlocked && <LockClosedIcon className="h-5 w-5" color="grey" />}
						{user.isMuted && <VolumeOffIcon className="h-5 w-5" color="grey"/>}
						{user.isBanned && <BanIcon className="h-5 w-5" color="grey"/>}
					</a>
				</Link>
			</div>
		);
	}

	/* Ban, mute, kick */
	const getAdminTools = (user: UserSummary) => {
		if (!user.isMe) {
			return (
				<>
					{!user.isMuted && <Tooltip className={actionTooltipStyles} content="mute">
						<button
						onClick={() => muteUser(user.id)}
						className="transition hover:scale-110">
							<VolumeOffIcon className="h-5 w-5" color="grey"/>
						</button>
					</Tooltip>}
					{!user.isBanned && <Tooltip className={actionTooltipStyles} content="ban">
						<button onClick={() => banUser(user.id)} className="transition hover:scale-110">
							<BanIcon className="h-5 w-5" color="grey"/>
						</button>
					</Tooltip>}
					<Tooltip className={actionTooltipStyles} content="kick">
						<button onClick={() => kickUser(user.id)} className="transition hover:scale-110">
							<UserRemoveIcon className="h-5 w-5" color="grey"/>
						</button>
					</Tooltip>
				</>
			);
		}
	}

	/* Only the owner can set other users as administrators */
	const getOwnerTools = (user: UserSummary) => {
		if (user.isAdmin) {
			return (
				<button onClick={() => removeAdmin(user.id)} className="text-red-600 transition hover:scale-110">
					<ShieldExclamationIcon className="h-5 w-5" />
				</button>
			);
		}
		return (
			<Tooltip className={actionTooltipStyles} content="+admin">
				<button onClick={() => addAdmin(user.id)} className="text-blue-500 transition hover:scale-110">
					<ShieldExclamationIcon className="h-5 w-5" />
				</button>
			</Tooltip>
		);
	}

	/**
	 * TMP need refacto
	 */
	return (
		<div className="flex flex-col h-full py-4 overflow-auto ">

			{owner && <div className="flex items-center justify-between px-4 py-3 hover:bg-04dp/90 transition">
				<div className="flex items-center gap-x-2">
					<div className="relative w-12 h-12">
						<img
							src={owner.pic}
							className="border-4 border-pink-600 object-center w-full h-full rounded-full"
						/>
					</div>
					<Link href={`/users/${owner.username}`}>
						<a className="flex items-center gap-x-2">
							{owner.username}
							<FaCrown className="text-yellow-500" />
							{owner.isBlocked && <LockClosedIcon className="h-5 w-5" color="grey" />}
						</a>
					</Link>
				</div>
				<div className="flex text-xl gap-x-2">
					{!owner.isMe && !owner.isBlocked && <Tooltip className={actionTooltipStyles} content="play">
						<button
							className={pongIconStyle}
							onClick={() => sendPongInvite(owner.id)}
						>
							<RiPingPongLine />
						</button>
					</Tooltip>}
				</div>
			</div>}

			{users.map((user) => (
				<div key={user.username} className="flex items-center justify-between px-4 py-3 hover:bg-04dp/90 transition">
					{getUserLine(user)}
					<div className="flex text-xl gap-x-2">
						{(ownerView || adminView) && getAdminTools(user)}
						{ownerView && getOwnerTools(user)}
						{!user.isMe && !user.isBlocked && <Tooltip className={actionTooltipStyles} content="play">
							<button
								className={pongIconStyle}
								onClick={() => sendPongInvite(user.id)}
							>
								<RiPingPongLine />
							</button>
						</Tooltip>}
					</div>
				</div>
			))}
		</div>
	);
};

export default GroupUsers;
