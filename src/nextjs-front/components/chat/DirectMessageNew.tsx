import { useEffect, useRef, useState, useContext } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import alertContext, { AlertContextType } from "../../context/alert/alertContext";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import chatContext, { ChatContextType, DirectMessage } from "../../context/chat/chatContext";
import { User } from "../../context/relationship/relationshipContext";

type NewDmData = {
	targetUsername: string;
};

const ErrorProvider: React.FC<{ error?: string }> = ({ children, error }) => (
	<div className="flex items-center justify-between min-h-[2em]">
		{children}
		<small className="text-red-500">{error}</small>
	</div>
);

export const DirectMessageNewHeader: React.FC = () => {
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
			<h6>Chat with a friend</h6>
		</div>
	);
}

const DirectMessageNew: React.FC = () => {
	const { getUserData } = useContext(authContext) as AuthContextType;
	const { setAlert } = useContext(alertContext) as AlertContextType;
	const {
		openChatView,
		directMessages,
		updateDirectMessages,
		setDirectMessageData
	} = useContext(chatContext) as ChatContextType;
	const userId = getUserData().id;
	const [friends, setFriends] = useState<User[]>([]);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState<NewDmData>({
		targetUsername: "",
	});
	const [fieldErrors, setFieldErrors] = useState<Partial<NewDmData>>({});

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
		const errors: Partial<NewDmData> = {};

		// if (formData.targetUsername.length < 1) {
		// 	errors['targetUsername'] = 'Group name should be between 3 and 20 characters long';
		// }

		// if (Object.keys(errors).length === 0) {
		// 	const res = await fetch(`/api/users/${userId}`);
		// 	const data = await res.json();

		// 	await createDirectMessage(formData);
		// }
		// setFieldErrors(errors);
	};

	/* Search a friend */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();
		setFriends(
			friends.filter(
				(friend) =>
					friend.username.toLowerCase().includes(searchTerm)
			)
		);
	};

	const createDirectMessage = async (formData: any) => {
		const res = await fetch("/api/channels", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: formData.targetUsername,
				owner: getUserData(),
				privacy: "private",
				users: [ getUserData() ]
			}),
		});

		if (res.status === 201) {
			// const data = await res.json();
			// const dm = setDirectMessageData(JSON.parse(JSON.stringify(data)), targetId);
			// console.log(dm);
			// updateDirectMessages(dm);
			// 	openChatView(dm.privacy === 'protected' ? 'password_protection' : 'group', dm.label, {
			// 		targetUsername: dm.label,
			// 		groupId: dm.id
			// 	}
			// );
		} else if (res.status === 401) {
			setAlert({
				type: "warning",
				content: `Group '${formData.targetUsername}' already exists`
			});
		} else {
			setAlert({
				type: "error",
				content: "Failed to create group"
			});
		}
	}

	const createFriendList = async () => {
		const res = await fetch(`/api/users/${userId}`);
		const data = await res.json();

		for (var i in data.friends) {
			friends.push(data.friends[i]);
		}
	}

	useEffect(() => {
		createFriendList();
	}, []);

	const inputGroupClassName = "flex flex-col gap-y-2";
	const inputClassName =
		"px-2 py-1 border border-pink-600 bg-transparent outline-none";
	const labelClassName = "text-xs text-neutral-200 uppercase";

	return (
		<div className="flex flex-col h-full px-5 py-5 overflow-y-auto gap-y-4">
			<h6 className="text-xl">Start a new private conversation</h6>
			<form className="flex flex-col gap-y-4" onSubmit={handleSubmit}>
				<div className={inputGroupClassName}>
					<ErrorProvider error={fieldErrors['targetUsername']}>
					<label htmlFor="targetUsername" className={labelClassName}>
					</label>
					</ErrorProvider>
					<input
						ref={searchInputRef}
						type="text"
						className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[50%]"
						placeholder="search for a friend"
						onChange={(e) => {
							handleSearch(e.target.value);
						}}
					/>
				</div>
			</form>
		</div>
	);
};

export default DirectMessageNew;
