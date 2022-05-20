import { Fragment, useContext, useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { Channel } from "transcendance-types";
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";

type UpdateGroupData = {
	groupName?: string;
	groupPrivacy?: ChatGroupPrivacy;
	password?: string;
	password2?: string;
	restrictionDuration?: string;
};

const privacyTips = {
	private:
		"Only you and people you explicitly invite will be able to see and communicate in this group",
	protected:
		"This group will be visible by anyone, but the password you define will be needed to see chat history and communicate",
	public: "The group is publicly visible and anyone can join and communicate. You can still ban people that you find toxic though.",
};

const ErrorProvider: React.FC<{ error?: string }> = ({ children, error }) => (
	<div className="flex items-center justify-between min-h-[2em]">
		{children}
		<small className="text-red-500">{error}</small>
	</div>
);

/* Header */
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
	const channelId: string = viewParams.channelId;
	const { user } = useSession();
	const { socket, setChatView, closeRightmostView } = useContext(chatContext) as ChatContextType;
	const [pendingChanges, setPendingChanges] = useState(false);
	const [ownerView, setOwnerView] = useState(false);
	const [userInChan, setUserInChan] = useState(false);
	const [channelName, setChannelName] = useState(viewParams.channelName);
	const [privacy, setChannelPrivacy] = useState<string>(viewParams.privacy);
	const inputGroupClassName = "flex flex-col gap-y-2";
	const inputClassName = "px-2 py-1 border border-pink-600 bg-transparent outline-none";
	const labelClassName = "text-xs text-neutral-200 uppercase";

	/* OWNER */

	/* Form */
	const [formData, setFormData] = useState<UpdateGroupData>({});
	const [fieldErrors, setFieldErrors] = useState<Partial<UpdateGroupData>>({});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFieldErrors({
			...fieldErrors,
			[e.target.name]: undefined
		});
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const isGroupNameValid = (groupName: string) => {
		return /^[a-zA-Z0-9_ ]+$/.test(groupName);
	}

	const isGroupPasswordValid = (password: string) => {
		return /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%#?&])[A-Za-z0-9@$!%#?&]{8,30}$/.test(password);
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const errors: Partial<UpdateGroupData> = {};

		if (!pendingChanges) return ;

		if (formData.groupName) {
			const nameLen = formData.groupName.trim().length;

			if (nameLen < 3 || nameLen > 20) {
				errors['groupName'] = 'Name must be 3 to 20 characters long';
			} else if (formData.groupName === channelName) {
				errors['groupName'] = 'This is the current group name';
			} else if (!isGroupNameValid(formData.groupName)) {
				errors['groupName'] = 'Name must contain alphanumeric characters, underscores and spaces only';
			}
		}

		if (formData.groupPrivacy === 'protected') {
			if (formData.password) {
				if (formData.password.length == 0) {
					errors['password'] = 'Password can\'t be empty';
				} else if (formData.password.length < 8 || formData.password.length > 30) {
					errors['password'] = 'Password must be 8 to 30 characters long.';
				} else if (!isGroupPasswordValid(formData.password)) {
					errors['password'] = 'Password must contain at least one letter, one number, one special character.';
				}
			}
			if (formData.password2 && (formData.password !== formData.password2)) {
				errors['password2'] = 'Passwords do not match';
			}
		}

		if (Object.keys(errors).length === 0) {
			updateGroup(formData);
		}
		setFieldErrors(errors);
	};

	/* Update the group name, visibility and password */
	const updateGroup = (formData: UpdateGroupData) => {
		socket.emit("updateChannel", {
			id: channelId,
			name: formData.groupName,
			privacy: formData.groupPrivacy,
			password: (formData.password && formData.password.length !== 0) ? formData.password : undefined,
			restrictionDuration: formData.restrictionDuration
		});
		closeRightmostView();
	}

	useEffect(() => {
		/* Remove empty strings or undefined fields */
		Object.keys(formData).forEach((key) =>
			(formData[key as keyof UpdateGroupData] === undefined || formData[key as keyof UpdateGroupData] === "")
			&& delete formData[key as keyof UpdateGroupData]
		);

		setPendingChanges(!(!formData.groupName && !formData.groupPrivacy && !formData.password && !formData.password2 && !formData.restrictionDuration));
	}, [formData]);


	/* If the owner leaves the group, it is deleted */
	const disbandGroup = async () => {
		socket.emit("deleteChannel", {
			channelId
		});
		closeRightmostView();
	};

	/* USER
	 * User quits group
	 */
	const handleUserLeaveGroup = () => {
		socket.emit("leaveChannel", {
			channelId,
			userId: user.id
		});
		if (privacy === 'protected') {
			closeRightmostView(3);
		} else {
			closeRightmostView(2);
		}
	};

	/* Listeners */
	const updateChannelData = (channel: Channel) => {
		setChannelName(channel.name);
		setChannelPrivacy(channel.privacy);
	};

	const defineChannelSettings = (channel: Channel) => {
		setOwnerView(channel.owner.id === user.id);
		setUserInChan(!!channel.users.find(
			(chanUser) => { return chanUser.id === user.id; }
		));
	};

	const userPunishedListener = (message: string) => {
		setChatView("groups", "Group chats", {});
	}

	useEffect(() => {
		socket.emit("getChannelData", { channelId });

		/* Listeners */
		socket.on("channelData", defineChannelSettings);
		socket.on("channelUpdated", updateChannelData);
		socket.on("punishedInChannel", userPunishedListener);
		socket.on("kickedFromChannel", userPunishedListener);

		return () => {
			socket.off("channelData", defineChannelSettings);
			socket.off("channelUpdated", updateChannelData);
			socket.off("punishedInChannel", userPunishedListener);
			socket.off("kickedFromChannel", userPunishedListener);
		};
	}, []);

	if (ownerView) {
		return (
			<div className="flex flex-col h-full px-5 py-5 overflow-y-auto gap-y-4">
				<h6 className="text-xl">Update group</h6>
				<form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
					<div className={inputGroupClassName}>
						<ErrorProvider error={fieldErrors['groupName']}>
						<label htmlFor="groupName" className={labelClassName}>
							group name
						</label>
						</ErrorProvider>
						<input
							className={inputClassName}
							type="text"
							name="groupName"
							autoComplete="off"
							placeholder={"new name"}
							value={formData.groupName}
							onChange={handleChange}
						/>
					</div>
					<div className={inputGroupClassName}>
						<label htmlFor="privacy" className={labelClassName}>
							group visiblity
						</label>
						<select
							className="drag-cancellable px-2 py-2 bg-dark border-b border-pink-600 outline-none"
							name="groupPrivacy"
							value={formData.groupPrivacy}
							onChange={handleChange}
						>
							<option value=""></option>
							<option value="private">private</option>
							<option value="protected">password protected</option>
							<option value="public">public</option>
						</select>
						{formData.groupPrivacy && <small>{privacyTips[formData.groupPrivacy]}</small>}
					</div>
					{formData.groupPrivacy === "protected" && (
						<Fragment>
							<div className={inputGroupClassName}>
								<ErrorProvider error={fieldErrors['password']}>
								<label
									htmlFor="password"
									className={labelClassName}
								>
									{viewParams.privacy === "protected" ? "new password": "password"}
								</label>
								</ErrorProvider>
								<small>A 8 to 30 characters password that contains at least one letter, one number, and one special character (@$!%#?&).</small>
								<input
									className={inputClassName}
									type="password"
									name="password"
									placeholder="password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>
							<div className={inputGroupClassName}>
								<ErrorProvider error={fieldErrors['password2']}>
								<label
									htmlFor="password2"
									className={labelClassName}
								>
									confirm password
								</label>
								</ErrorProvider>
								<input
									className={inputClassName}
									type="password"
									name="password2"
									placeholder="confirm password"
									value={formData.password2}
									onChange={handleChange}
								/>
							</div>
						</Fragment>
					)}
					<h6 className="text-xl">Moderation</h6>
					<small>Set the duration of mutation and banishment:</small>
					<div className={inputGroupClassName}>
						<select
							className="drag-cancellable px-2 py-2 bg-dark border-b border-pink-600 outline-none"
							name="restrictionDuration"
							value={formData.restrictionDuration}
							onChange={handleChange}
						>
							<option value=""></option>
							<option value="1">1 minute</option>
							<option value="5">5 minutes</option>
							<option value="15">15 minutes</option>
						</select>
					</div>
					<button className={`px-2 py-1 bg-pink-600 ${
									pendingChanges ? "hover:bg-pink-500" : "opacity-70"
								}`}>Update group</button>
				</form>
				<h6 className="text-xl">Leave group</h6>
				<div className="flex flex-col gap-y-4">
					<small>Since you are the owner of this group, it will be disband.</small>
					<button onClick={() => { disbandGroup() }} className="px-3 py-2 uppercase bg-red-600 hover:bg-red-500">
						Disband group
					</button>
				</div>
			</div>
		);
	} else {
		return (
			<div className="flex flex-col justify-between h-full px-4 py-4 overflow-auto gap-y-4">
				<div className="">
					<div className="flex justify-between">
						<span>Name</span>
						<span>{channelName}</span>
					</div>
					<div className="flex justify-between">
						<span>Privacy level</span>
						<span>{privacy}</span>
					</div>
				</div>
				{userInChan &&
					<div className="flex flex-col gap-y-4">
					<h6 className="text-xl">Leave group</h6>
					<button
						onClick={() => { handleUserLeaveGroup() }}
						className="px-3 py-2 uppercase bg-red-600 hover:bg-red-500">
							Leave group
					</button>
					</div>
				}
			</div>
		);
	}
};

export default GroupSettings;
