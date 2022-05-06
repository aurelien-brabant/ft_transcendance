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
			"No download required. Sign in and start to play!",
		Icon: IoLogoGameControllerA
	},
	{
		label: "BATTLE FOR THE LEADERBOARD",
		description:
			"Prove your worth and get to the top!",
		Icon: BsTrophyFill
	},
	{
		label: "MAKE FRIENDS",
		description:
			"Join the community and make friends!",
		Icon: FaUserFriends
	},
];

export default features;
