import { Fragment, useContext, useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { useSession } from "../../hooks/use-session";
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
	const { socket, channelCreatedListener } = useContext(chatContext) as ChatContextType;
	const [pendingChanges, setPendingChanges] = useState(false);
	const inputGroupClassName = "flex flex-col gap-y-2";
	const inputClassName = "px-2 py-1 border border-pink-600 bg-transparent outline-none";
	const labelClassName = "text-xs text-neutral-200 uppercase";

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

	const isGroupNameValid = (groupName: string) => {
		return /^[a-zA-Z0-9_ ]+$/.test(groupName);
	}

	const isGroupPasswordValid = (password: string) => {
		return /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%#?&])[A-Za-z0-9@$!%#?&]{8,30}$/.test(password);
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const errors: Partial<NewGroupData> = {};

		if (!pendingChanges) return ;

		const nameLen = formData.groupName.trim().length;

		if (nameLen < 3 || nameLen > 20) {
			errors["groupName"] = "Name must be 3 to 20 characters long";
		} else if (!isGroupNameValid(formData.groupName)) {
			errors['groupName'] = 'Name must contain alphanumeric characters, underscores and spaces only';
		}

		if (formData.groupPrivacy === "protected") {
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

	useEffect(() => {
		if (formData.groupPrivacy === "protected") {
			setPendingChanges(formData.groupName !== "" && formData.password !== "" && formData.password2 !== "");
		} else {
			setPendingChanges(formData.groupName !== "");
		}
	}, [formData]);

	useEffect(() => {
		/* Listeners */
		socket.on("channelCreated", channelCreatedListener);

		return () => {
			socket.off("channelCreated", channelCreatedListener);
		};
	}, []);

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
						name="groupPrivacy"
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
				<button className={`px-2 py-1 bg-pink-600 ${
									pendingChanges ? "hover:bg-pink-500" : "opacity-70"
								}`}>Create group</button>
			</form>
		</div>
	);
};

export default GroupNew;
