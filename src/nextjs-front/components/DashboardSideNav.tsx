import Link from "next/link";
import { dashboardNavItems } from "../constants/nav";

type DashboardSideNavProps = {
	isOpened: boolean;
};

const DashboardSideNav: React.FC<DashboardSideNavProps> = ({ isOpened }) => {
	return (
		<aside
			className={`sticky flex flex-col items-center ${
				isOpened ? "w-24 opacity-100" : "w-0 opacity-0"
			} md:w-24 md:opacity-100 py-2 bg-gray-900 top-14 gap-y-8 drop-shadow-lg z-20`}
			style={{ height: "calc(100vh - 3.5rem)", transition: "all .8s" }}
		>
			<nav>
				<ul className="flex flex-col gap-y-8">
					{dashboardNavItems.map((item) => (
						<li key={item.id}>
							<Link href={item.href}>
								<a>
									<item.Icon className="text-4xl text-neutral-200 hover:text-pink-600" />
								</a>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
};

export default DashboardSideNav;
