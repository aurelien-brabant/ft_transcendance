import faker from "@faker-js/faker";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { GiThorHammer } from "react-icons/gi";
import { BsArrowLeftShort, BsShieldFillPlus } from "react-icons/bs";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";

type UserSummary = {
	avatar: string;
	username: string;
	isAdmin: boolean;
};

export const GroupUsersHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
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
			<h6>Group members</h6>
		</div>
	);
};

const GroupUsers: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const [users, setUsers] = useState<UserSummary[]>([]);

	useEffect(() => {
		const users: UserSummary[] = [];

		for (let i = 0; i != 20; ++i) {
			users.push({
				avatar: faker.internet.avatar(),
				username: faker.internet.userName(),
				isAdmin: Math.random() < 0.1,
			});
		}

		setUsers(users);
	}, []);

	return (
		<div className="flex flex-col h-full py-4 overflow-auto ">
			{users.map((user) => (
				<div key={user.username} className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-800 gap-x-2">
					<div className="flex items-center gap-x-4">
						<img
							src={user.avatar}
							height="50px"
							width="50px"
							className={`border-4 ${
								user.isAdmin
									? "border-red-400"
									: "border-gray-800"
							} rounded-full `}
						/>
						<Link href={`/users/${user.username}`}>
							<a>{user.username}</a>
						</Link>
					</div>
					<div className="flex text-3xl gap-x-4">
						{!user.isAdmin && <GiThorHammer />}
						{!user.isAdmin && <BsShieldFillPlus />}
					</div>
				</div>
			))}
		</div>
	);
};

export default GroupUsers;
