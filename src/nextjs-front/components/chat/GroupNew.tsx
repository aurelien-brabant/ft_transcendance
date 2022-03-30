import { Fragment, useContext, useState } from "react";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType, ChatGroupPrivacy } from "../../context/chat/chatContext";

type NewGroupData = {
	groupName: string;
	privacy: ChatGroupPrivacy;
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
					New group settings
				</h6>
			</div>
		</Fragment>
	);
};

const GroupNew: React.FC = () => {
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const { getUserData } = useContext(authContext) as AuthContextType;
	const {
		openChatView,
		updateChatGroups,
		setChatGroupData
	} = useContext(chatContext) as ChatContextType;

	const [formData, setFormData] = useState<NewGroupData>({
		groupName: "",
		privacy: "private",
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

		if (formData.groupName.length < 3 || formData.groupName.length > 20) {
			errors['groupName'] = 'Group name should be between 3 and 20 characters long';
		}

		if (formData.privacy === 'protected') {
			if (formData.password) {
				if (formData.password.length == 0) {
					errors['password'] = 'Password can\'t be empty';
				}
				if (formData.password.length < 8) {
					errors['password'] = 'Password must contain at least 8 characters';
				}
			} else if (formData.password !== formData.password2) {
				errors['password2'] = 'Passwords do not match';
			}
		}

		if (Object.keys(errors).length === 0) {
			await createGroup(formData);
		}
		setFieldErrors(errors);
	};

	const createGroup = async (formData: NewGroupData) => {
		const res = await fetch("/api/channels", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: formData.groupName,
				owner: getUserData(),
				privacy: formData.privacy,
				password: (formData.password.length !== 0) ? formData.password : undefined,
				users: [ getUserData() ]
			}),
		});

		if (res.status === 201) {
			const data = await res.json();
			const gm = setChatGroupData(JSON.parse(JSON.stringify(data)));

			updateChatGroups();
			openChatView(gm.privacy === 'protected' ? 'password_protection' : 'group', gm.label, {
				groupName: gm.label,
				groupId: gm.id
			}
			);
		} else if (res.status === 401) {
			setAlert({
				type: "warning",
				content: `Group '${formData.groupName}' already exists. Choose another name.`
			});
		} else {
			setAlert({
				type: "error",
				content: "Failed to create group"
			});
		}
	}

	const inputGroupClassName = "flex flex-col gap-y-2";
	const inputClassName =
		"px-2 py-1 border border-pink-600 bg-transparent outline-none";
	const labelClassName = "text-xs text-neutral-200 uppercase";

	return (
		<div className="flex flex-col h-full px-5 py-5 overflow-y-auto gap-y-4">
			<h6 className="text-xl">Create a new group</h6>
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
						className="px-2 py-2 bg-gray-900 border-b border-pink-600 outline-none"
						name="privacy"
						value={formData.privacy}
						onChange={handleChange}
					>
						<option value="private">private</option>
						<option value="protected">password protected</option>
						<option value="public">public</option>
					</select>
					<small>{privacyTips[formData.privacy]}</small>
				</div>
				{formData.privacy === "protected" && (
					<Fragment>
						<div className={inputGroupClassName}>
							<ErrorProvider error={fieldErrors['password']}>
							<label
								htmlFor="password"
								className={labelClassName}
							>
								password
							</label>
							</ErrorProvider>
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
				<button className="px-2 py-1 bg-pink-600">Create group</button>
			</form>
		</div>
	);
};

export default GroupNew;
