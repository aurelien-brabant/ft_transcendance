import { Fragment, useContext, useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { Channel } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";

type NewGroupData = {
	groupName: string;
	groupPrivacy: ChatGroupPrivacy;
	password: string;
	password2: string;
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
export const GroupNewHeader: React.FC = () => {
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
					Create a new group
				</h6>
			</div>
		</Fragment>
	);
};

/* Form area */
const GroupNew: React.FC = () => {
	const { user } = useSession();
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { openChatView, socket } = useContext(chatContext) as ChatContextType;

	/* Form */
	const [formData, setFormData] = useState<NewGroupData>({
		groupName: "",
		groupPrivacy: "private",
		password: "",
		password2: "",
	});
	const [fieldErrors, setFieldErrors] = useState<Partial<NewGroupData>>({});

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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const errors: Partial<NewGroupData> = {};

		formData.groupName = formData.groupName.trim();

		if (formData.groupName.length < 3 || formData.groupName.length > 20) {
			errors["groupName"] = "Group name should be between 3 and 20 characters long";
		}

		if (formData.groupPrivacy === "protected") {
			if (formData.password) {
				if (formData.password.length == 0) {
					errors["password"] = "Password can\"t be empty";
				}
				if (formData.password.length < 8) {
					errors["password"] = "Password must contain at least 8 characters";
				}
			} else if (formData.password !== formData.password2) {
				errors["password2"] = "Passwords do not match";
			}
		}

		if (Object.keys(errors).length === 0) {
			await createGroup(formData);
		}
		setFieldErrors(errors);
	};

	/* Channel creation */
	const createGroup = async (formData: NewGroupData) => {
		const data = {
			name: formData.groupName,
			owner: { id: user.id },
			privacy: formData.groupPrivacy,
			password: (formData.password.length !== 0) ? formData.password : undefined,
			users: [ { id: user.id } ],
		};

		socket.emit("createChannel", data);
	}

	const handleChannelCreation = (newChannel: Channel) => {
		openChatView(
			newChannel.privacy === "protected" ? "password_protection" : "group",
			newChannel.name, {
				channelId: newChannel.id,
				groupName: newChannel.name,
				ownerId: newChannel.owner.id,
				peopleCount: newChannel.users.length,
				privacy: newChannel.privacy
			}
		);
	};

	const handleChannelCreationError = (errMessage: string) => {
		setAlert({
			type: "warning",
			content: errMessage
		});
	};

	useEffect(() => {
		/* Listeners */
		socket.on("channelCreated", handleChannelCreation);
		socket.on("createChannelError", handleChannelCreationError);

		return () => {
			socket.off("channelCreated", handleChannelCreation);
			socket.off("createChannelError", handleChannelCreationError);
		};
	}, []);

	const inputGroupClassName = "flex flex-col gap-y-2";
	const inputClassName = "px-2 py-1 border border-pink-600 bg-transparent outline-none";
	const labelClassName = "text-xs text-neutral-200 uppercase";

	return (
		<div className="flex flex-col h-full px-5 py-5 overflow-y-auto gap-y-4">
			<h6 className="text-xl">New group settings</h6>
			<form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
				<div className={inputGroupClassName}>
					<ErrorProvider error={fieldErrors["groupName"]}>
					<label htmlFor="groupName" className={labelClassName}>
						group name
					</label>
					</ErrorProvider>
					<input
						className={inputClassName}
						type="text"
						name="groupName"
						autoComplete="off"
						placeholder="The Dream Team"
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
						name="privacy"
						value={formData.groupPrivacy}
						onChange={handleChange}
					>
						<option value="private">private</option>
						<option value="protected">password protected</option>
						<option value="public">public</option>
					</select>
					<small>{privacyTips[formData.groupPrivacy]}</small>
				</div>
				{formData.groupPrivacy === "protected" && (
					<Fragment>
						<div className={inputGroupClassName}>
							<ErrorProvider error={fieldErrors["password"]}>
							<label
								htmlFor="password"
								className={labelClassName}
							>
								password
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
							<ErrorProvider error={fieldErrors["password2"]}>
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
				<button className="px-2 py-1 bg-pink-600">Create group</button>
			</form>
		</div>
	);
};

export default GroupNew;
