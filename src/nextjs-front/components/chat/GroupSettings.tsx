import { Fragment, useContext } from "react";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import { BaseUserData } from "transcendance-types";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

export const GroupSettingsHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
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
			</div>
			<div className="flex flex-col items-center justify-center">
			<h6 className="text-lg font-bold text-pink-600">
				Group settings
				</h6>
			</div>
		</Fragment>
	);
};

const GroupSettings: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { closeRightmostView, removeChatGroup, fetchChannelData } = useContext(chatContext) as ChatContextType;
	const channelId = viewParams.groupId;
	const userId = getUserData().id;

	/* User quits group */
	const handleLeaveGroup = async () => {
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
			removeChatGroup(channelId);
			closeRightmostView(2);
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
					<span>{viewParams.peopleCount}</span>
				</div>
			</div>
			<div className="flex flex-col gap-y-4">
			<button
				onClick={() => { handleLeaveGroup() }}
				className="px-3 py-2 uppercase bg-red-600">
					Leave group
			</button>
			</div>
		</div>
	);
};

export default GroupSettings;
