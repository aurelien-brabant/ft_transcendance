import { IoMdPeople, IoLogoGameControllerA } from "react-icons/io";
import { ImUser } from "react-icons/im";
import { BsTrophyFill } from "react-icons/bs";

export type NavItem = {
	id: string;
	label: string;
	href: string;
};

export const wildNavItems: NavItem[] = [
	{
		id: "discover",
		label: "Discover",
		href: "/#discover",
	},
	{
		id: "features",
		label: "Features",
		href: "/#features",
	},
	{
		id: "team",
		label: "The team",
		href: "/#team",
	},
];

export type DashboardNavItem = NavItem & {
	Icon: React.FC<{ className?: string }>;
};

export const dashboardNavItems: DashboardNavItem[] = [
	{
		id: "welcome",
		label: "Welcome",
		href: "/welcome",
		Icon: ImUser,
	},
	{
		id: "play",
		label: "Play",
		href: "/hub",
		Icon: IoLogoGameControllerA,
	},
	{
		id: "friends",
		label: "friends",
		href: "/friends",
		Icon: IoMdPeople,
	},
	{
		id: "leaderboard",
		label: "leaderboard",
		href: "/leaderboard",
		Icon: BsTrophyFill
	},
];
