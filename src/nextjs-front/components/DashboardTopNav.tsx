import { useState } from "react";
import { GetServerSideProps } from 'next/types';
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { faker } from "@faker-js/faker";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiBell } from "react-icons/bi";
import PreventSSR from './PreventSSR';
import {genUser, SeedUser} from "../seed/user";

type DashboardTopNavProps = {
	onHamburgerClick: () => void;
	user: SeedUser
};

const user = genUser();


const DashboardTopNav: React.FC<DashboardTopNavProps> = ({ onHamburgerClick }) => {
	const [hasNotificationsOpened, setHasNotificationsOpened] = useState(false);

	return (
		<div className="sticky top-0 z-20 flex items-center justify-between bg-neutral-100 h-14 drop-shadow-lg">
			<div className="flex items-center justify-center h-full gap-x-4 md:gap-x-8">
				<div className="flex items-center justify-center w-24 h-full bg-gray-900">
					<Image
						src="/logo.svg"
						width={50}
						height={50}
						alt="ft_transcendance's logo"
					/>
				</div>
				<GiHamburgerMenu className="block text-3xl md:hidden" onClick={onHamburgerClick} />
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

			<div className="flex items-center justify-center md:pr-8 lg:pr-16 xl:pr-32 gap-x-8">
				<div className="relative justify-end hidden md:flex">
					<BiBell
						className="text-3xl"
						onClick={() => {
							setHasNotificationsOpened(!hasNotificationsOpened);
						}}
					/>
					<div className="absolute flex items-center justify-center px-2 text-sm bg-gray-300 rounded-full -right-1 -top-2">
						0
					</div>
					{hasNotificationsOpened && (
						<div className="absolute left-0 w-64 py-4 -translate-x-56 translate-y-10 bg-neutral-100 ">
							<h6 className="text-xs text-center uppercase">
								Recent notifications
							</h6>
							<hr />
						</div>
					)}
				</div>
				<div className="flex gap-x-4 md:gap-x-8">
					<div className="flex items-center gap-x-6">
						<PreventSSR>
						<span className="w-[7em] text-sm text-center font-bold">
							{user.username.length > 12 ? user.username.substring(0, 12) + '...' : user.username}
						</span>
						<img
							className="hidden rounded-full sm:block"
							height="45px"
							width="45px"
							src={user.avatar}
							alt="faker image"
						/>
						</PreventSSR>
					</div>
					<button className="self-center hidden px-6 py-2 text-sm font-bold text-white uppercase bg-pink-600 rounded md:block">Logout</button>
				</div>
			</div>
		</div>
	);
};

export default DashboardTopNav;
