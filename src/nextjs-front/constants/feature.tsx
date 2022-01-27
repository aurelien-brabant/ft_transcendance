import { IoLogoGameControllerA } from "react-icons/io";
import { FaUserFriends } from "react-icons/fa";
import { BsTrophyFill } from 'react-icons/bs';

export type Feature = {
	label: string;
	description: string;
	Icon: React.FC<{ className: string }>
};

export const features: Feature[] = [
	{
		label: "PLAY ONLINE",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non pellentesque elit. Nam non eros sed elit consequat efficitur.",
		Icon: IoLogoGameControllerA
	},
	{
		label: "BATTLE FOR THE LEADERBOARD",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non pellentesque elit. Nam non eros sed elit consequat efficitur.",
		Icon: BsTrophyFill
	},
	{
		label: "MAKE FRIENDS",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non pellentesque elit. Nam non eros sed elit consequat efficitur.",
		Icon: FaUserFriends
	},
];

export default features;
