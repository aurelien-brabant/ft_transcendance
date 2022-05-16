import Image from 'next/image';
import { Fragment } from "react";
import { team } from "../constants/team";

const Footer: React.FC<{}> = () => (
	<footer className="flex flex-col items-center justify-center px-2 py-4 text-center bg-gray-900 gap-y-4 text-neutral-200">
		<Image src="/logo_pink.svg" alt="transcendance footer logo" height={50} width={50} />
		<h6>ft_transcendance, a 42 project</h6>
		<small>
			Made with love by{" "}
			{team.map((member, i, a) => (
				<Fragment key={member.login42}>
					<b>{member.firstname}</b>
					{i === a.length - 1
						? ""
						: i == a.length - 2
							? " and "
							: ", "}
				</Fragment>
			))}{" "}
		</small>
	</footer>
);

export default Footer;
