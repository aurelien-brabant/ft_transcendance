import { useState, Fragment, useContext } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
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
			<h6>Create a new group</h6>
		</div>
	);
}

const GroupNew: React.FC = () => {
	const { closeRightmostView } = useContext(chatContext) as ChatContextType;
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

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const errors: Partial<NewGroupData> = {};

		if (formData.groupName.length < 3 || formData.groupName.length > 20) {
			errors['groupName'] = 'Group name should be between 3 and 20 characters long';
		}

		if (formData.privacy === 'protected') {
			if (formData.password.length == 0) {
				errors['password'] = 'Password can\'t be empty';
			} else if (formData.password !== formData.password2) {
				errors['password2'] = 'Passwords do not match';
			}
		}

		if (Object.keys(errors).length === 0) {
			//TODO: create the actual group. Currently creating view is simply discarded.
			
			closeRightmostView();
		}

		setFieldErrors(errors);
	};

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
