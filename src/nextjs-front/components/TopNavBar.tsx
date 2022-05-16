import Link from "next/link";
import { NavItem } from "../constants/nav";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";
import { FaHamburger } from "react-icons/fa";
import { GiHamburger } from "react-icons/gi";

type TopNavBarProps = {
	items: NavItem[];
};

const TopNavBar: React.FC<TopNavBarProps> = ({ items }) => {
	const [isScrolling, setIsScrolling] = useState(false);
	const [activateTab, setActiveTab] = useState("");
	const [isMobileMenuOpened, setIsMobileMenuOpened] = useState(false);

	const handleScroll = useCallback(() => {
		let tmp = "";

		for (const item of items) {
			const el = document.getElementById(item.id.toLowerCase());
			if (
				el &&
				window.scrollY - window.screen.height / 2 >=
					el.getBoundingClientRect().top
			) {
				tmp = item.id;
			}
		}

		setIsScrolling(window.scrollY > 60);
		setActiveTab(tmp);
	}, [items]);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [handleScroll]);

	return (
		<Fragment>
			<div
				className={` py-14 px-2 bg-gray-900 drop-shadow-lg fixed bottom-0 ${
					isMobileMenuOpened ? "w-72 z-50" : "opacity-0 w-0 z-0"
				} top-20 md:hidden 
				`}
				style={{ transition: "all .2s" }}
			>
				<nav className="flex flex-col items-center">
					<ul className="flex flex-col text-xl gap-y-6 text-neutral-200">
						{items.map((item) => (
							<li
								key={item.id}
								className={`uppercase hover:text-pink-600 ${
									activateTab === item.id
										? "text-pink-600"
										: ""
								}`}
							>
								<Link href={item.href}>
									<a
										onClick={() => {
											setIsMobileMenuOpened(false);
										}}
									>
										{item.label}
									</a>
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
			<header
				className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-24 lg:h-32 px-8 md:px-24 text-white ${
					isScrolling || isMobileMenuOpened ? "bg-gray-900 md:bg-gray-900/[.99]" : ""
				} ${isScrolling ? "drop-shadow-lg" : ""}`}
				style={{ transition: "all .4s" }}
			>
				<div className="flex items-center gap-x-8 md:gap-x-16">
					<div className="flex items-center gap-x-6">
						{isMobileMenuOpened ? (
							<GiHamburger
								className="text-4xl md:hidden"
								onClick={() => {
									setIsMobileMenuOpened(false);
								}}
							/>
						) : (
							<FaHamburger
								className="text-4xl md:hidden"
								onClick={() => {
									setIsMobileMenuOpened(true);
								}}
							/>
						)}
						<Link href="/">
							<a className="flex">
								<Image src="/logo_pink.svg" alt="transcendance top logo" height={70} width={70} />
							</a>
						</Link>
					</div>
					<nav className="hidden md:block">
						<ul className="flex md:gap-x-6 lg:gap-x-16">
							{items.map((item) => (
								<li
									key={item.id}
									className={`uppercase hover:text-pink-600 ${
										activateTab === item.id
											? "text-pink-600"
											: ""
									}`}
								>
									<Link href={item.href}>
										<a>{item.label}</a>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
				<Link href="/signin">
					<a className="px-8 py-2 font-bold uppercase bg-pink-600">
						Play
					</a>
				</Link>
			</header>
		</Fragment>
	);
};

export default TopNavBar;
