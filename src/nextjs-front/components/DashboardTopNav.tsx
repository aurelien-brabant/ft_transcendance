import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { faker } from "@faker-js/faker";
import { FaHamburger } from "react-icons/fa";
import { GiHamburger } from "react-icons/gi";

type DashboardTopNavProps = {
	onHamburgerClick: () => void;
};

const DashboardTopNav: React.FC<DashboardTopNavProps> = () => (
	<div className="sticky top-0 z-20 flex items-center justify-between gap-x-8 bg-neutral-100 h-14 drop-shadow-lg">
		<div className="flex items-center justify-center h-full gap-x-8">
			<div className="flex items-center justify-center w-24 h-full bg-gray-900">
				<Image
					src="/logo.svg"
					width={50}
					height={50}
					alt="ft_transcendance's logo"
				/>
			</div>
			<FaHamburger className="text-4xl" />
			<div className="flex items-center text-gray-900">
				<FiSearch className="text-3xl" />
				<input
					type="text"
					name="search"
					placeholder="Search for a player"
					className="px-6 py-2 text-lg border-0 outline-0 bg-inherit"
				/>
			</div>
		</div>

		<div className="flex items-center justify-center px-32">
			<div className="flex gap-x-16">
				<div className="flex items-center gap-x-6">
					<span>{faker.name.firstName()}</span>
					<img
						className="rounded-full"
						height="45px"
						width="45px"
						src={faker.image.avatar()}
						alt="faker image"
					/>
				</div>

				<button className="self-center px-6 py-2 text-white uppercase bg-pink-600">
					Logout
				</button>
			</div>
		</div>
	</div>
);

export default DashboardTopNav;
