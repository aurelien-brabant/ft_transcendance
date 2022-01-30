import { useContext, Fragment, useState } from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiBell } from "react-icons/bi";
import Link from 'next/link';
import { genUser } from "../seed/user";
import notificationsContext from "../context/notifications/notificationsContext";
import { faker } from '@faker-js/faker';

type DashboardTopNavProps = {
	onHamburgerClick: () => void;
};

const user = genUser();

const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
	onHamburgerClick,
}) => {
	const [hasNotificationsOpened, setHasNotificationsOpened] = useState(false);
	const [isUserMenuOpened, setIsUserMenuOpened] = useState(false);
	const { notifications, notify, markAllAsRead } = useContext(notificationsContext);

	return (
		<div className="sticky top-0 z-20 z-30 flex items-center justify-between bg-neutral-100 h-14 drop-shadow-lg">
			<div className="flex items-center justify-center h-full gap-x-4 md:gap-x-8">
				<div className="flex items-center justify-center w-24 h-full bg-gray-900">
					<Image
						src="/logo.svg"
						width={50}
						height={50}
						alt="ft_transcendance's logo"
					/>
				</div>
				<GiHamburgerMenu
					className="block text-3xl md:hidden"
					onClick={onHamburgerClick}
				/>
				<div className="items-center hidden text-gray-900 md:flex">
					<FiSearch className="text-3xl" />
					<input
						type="text"
						name="search"
						placeholder="Search for a player"
						className="px-6 py-2 border-0 text-md outline-0 bg-inherit"
					/>
				</div>
			</div>

			<div className="flex items-center justify-center pr-4 md:pr-8 lg:pr-16 xl:pr-32 gap-x-8">
				<div
					className="relative justify-end hidden hover:cursor-pointer md:flex"
					onClick={() => {
						// mark all as read on CLOSE
						if (hasNotificationsOpened) {
							markAllAsRead();
						}
						setHasNotificationsOpened(!hasNotificationsOpened);
					}}
				>
					<BiBell className="text-3xl" />
					{(() => {
						let c = 0;
						for (const n of notifications) c += +!n.isRead;
						return (
							<div
								className={`absolute flex items-center justify-center px-2 text-sm ${
									c !== 0 ? "bg-red-500" : "bg-gray-300"
								} rounded-full -right-2 -top-4"`}
							>
								{c}
							</div>
						);
					})()}
					{hasNotificationsOpened && (
						<div className="absolute left-0 w-64 py-4 -translate-x-56 translate-y-10 bg-neutral-100 max-h-[500px] overflow-y-scroll">
							<h6 className="text-xs text-center uppercase">
								Recent notifications
							</h6>
							<hr />
							{notifications.map((notif, index, arr) => (
								<Fragment>
									<article
										key={notif.issuedAt.toString()}
										className={`px-2 py-3 ${
											notif.isRead && "opacity-70"
										} hover:opacity-80`}
									>
										<h6 className="font-bold text-pink-600">
											{notif.category}
										</h6>
										<p className="text-sm">{notif.content}</p>
									</article>
									{index !== arr.length - 1 && <hr />}
								</Fragment>
							))}
						</div>
					)}
				</div>
				<div className="flex gap-x-4 md:gap-x-8">
					<div className="relative flex items-center gap-x-6 hover:cursor-pointer" onClick={() => { setIsUserMenuOpened(!isUserMenuOpened); }}>
							<span className="w-[7em] text-sm text-center font-bold">
								{user.username.length > 12
									? user.username.substring(0, 12) + "..."
									: user.username}
							</span>
							<img
								className="hidden rounded-full sm:block"
								height="45px"
								width="45px"
								src={user.avatar}
								alt="user's avatar"
							/>

						{ isUserMenuOpened && (
						<nav className="absolute left-0 right-0 pt-1 translate-y-20 bg-neutral-100">
							<Link href="/welcome"><a className="block p-2 text-sm font-bold hover:bg-neutral-200">Edit profile</a></Link>
							<Link href={`/users/${user.username}`}><a className="block p-2 text-sm font-bold transition hover:bg-neutral-200">See profile</a></Link>
							<Link href="#"><a className="block p-2 text-sm text-pink-600 transition hover:bg-neutral-200">Logout</a></Link>
						</nav>
						)}
					</div>
					<button
						className="self-center hidden px-6 py-2 text-sm font-bold text-white uppercase bg-pink-600 rounded md:block"
						onClick={() => {
							notify({
								category: faker.lorem.sentence(),
								content: faker.lorem.lines(3),
								isRead: false,
								issuedAt: new Date(Date.now()),
							});
						}}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
};

export default DashboardTopNav;
