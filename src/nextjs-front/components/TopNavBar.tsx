import Link from "next/link";
import { NavItem } from "../constants/nav";
import Image from "next/image";

type TopNavBarProps = {
	items: NavItem[];
};

const TopNavBar: React.FC<TopNavBarProps> = ({ items }) => {
	return (
		<header className="fixed top-0 left-0 right-0 flex items-center justify-between h-32 px-24 text-white">
			<div className="flex items-center gap-x-16">
				<Link href="/"><a><Image src="/logo.svg" height={70} width={70} /></a></Link>
				<nav>
					<ul className="flex gap-x-16">
						{items.map((item) => (
							<li
								key={item.id}
								className="uppercase hover:text-pink-600"
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
	);
};

export default TopNavBar;
