import { useContext, useEffect } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { BaseUserData } from "transcendance-types";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

/* Header */
export const GroupSettingsHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
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
			<h6>Group settings</h6>
		</div>
	);
};

const GroupSettings: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { fetchChannelData, setChatView } = useContext(chatContext) as ChatContextType;
	const channelId = viewParams.groupId;
	const ownerView = viewParams.ownerView;
	const isProtected = (viewParams.groupPrivacy === "protected");
	const userId = getUserData().id;

	const labelClassName = "text-xs text-neutral-200 uppercase";
	const inputClassName = "px-2 py-1 border border-pink-600 bg-transparent outline-none";

	const leaveGroup = async () => {
		const channelData = await fetchChannelData(channelId).catch(console.error);
		const currentUsers = JSON.parse(JSON.stringify(channelData)).users;
		const users = currentUsers.filter((user: BaseUserData) => {
			return user.id != userId
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
			// chatGroups.filter((group: ChatGroup) => {
			// 	return group.id != channelId
			// })
			// TODO
			setChatView("groups", "group chats", {});
			return;
		} else {
			setAlert({
				type: "error",
				content: "Failed to leave group"
			});
		}
	};

	return (
		<div className="flex flex-col justify-between h-full px-4 py-4 overflow-auto gap-y-4">
			<div className="">
				<div className="flex justify-between">
					<span>Name</span>
					<span>{viewParams.groupName}</span>
				</div>
				<div className="flex justify-between">
					<span>Visibility</span>
					<span>{viewParams.groupPrivacy}</span>
				</div>
				<div className="flex justify-between">
					<span>Members</span>
					<span>{viewParams.groupMembers}</span>
				</div>
			</div>
			{ownerView && isProtected &&
				<div className="flex flex-col gap-y-4">
				<label
					htmlFor="password"
					className={labelClassName}
				>
					Change password
				</label>
				<input
					className={inputClassName}
					type="password"
					name="password"
					placeholder="new password"
				/>
				<label
					htmlFor="password"
					className={labelClassName}
				>
					Confirm password
				</label>
				<input
					className={inputClassName}
					type="password"
					name="password"
					placeholder="confirm new password"
				/>
			</div>}
			<div className="flex flex-col gap-y-4">
			{ownerView && <small>Since you are the owner of this group, it will be disband.</small>}
			<button onClick={() => { leaveGroup() }} className="px-3 py-2 uppercase bg-red-600">
				Leave group
			</button>
			</div>
		</div>
	);
};

export default GroupSettings;
