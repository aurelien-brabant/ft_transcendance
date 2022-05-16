import aldubarPic from "../public/team/aldubar.webp";
import mboivinPic from "../public/team/mboivin.webp";
import abrabantPic from "../public/team/abrabant.webp";
import vdeschamPic from "../public/team/vdescham.webp";
import adelcrosPic from "../public/team/adelcros.jpeg"; // if someone can download it again in .webp

export type TeamMember = {
	firstname: string;
	lastname: string;
	login42: string;
	role: string;
	introduction?: string;
	linkedinLink?: string;
	githubLink?: string;
	imageSrc: any;
};

export const team: TeamMember[] = [
		{
		firstname: "Mathilde",
		lastname: "Boivin",
		login42: "mboivin",
		role: "Typescript Developer",
		imageSrc: mboivinPic,
		githubLink: 'https://github.com/matboivin'
	},
{
		firstname: "Aurélien",
		lastname: "Brabant",
		login42: "abrabant",
		role: "Typescript Frontend Developer",
		imageSrc: abrabantPic,
		linkedinLink: 'https://www.linkedin.com/in/aurelien-brabant/',
		githubLink: 'https://github.com/aurelien-brabant'
	},

	{
		firstname: "Alexandre",
		lastname: "Dubar",
		login42: "aldubar",
		role: "Typescript Frontend Developer",
		linkedinLink: "https://www.linkedin.com/in/alexandre-dubar/",
		githubLink: 'https://github.com/busshi',
		imageSrc: aldubarPic,
	},

	{
		firstname: "Valentin",
		lastname: "Deschamps",
		login42: "vdescham",
		role: "Typescript Frontend Developer",
		imageSrc: vdeschamPic,
		githubLink: 'https://github.com/Nnevalti'
	},
	{
		firstname: "Astrid",
		lastname: "Delcros",
		login42: "adelcros",
		role: "Node.js developer",
		imageSrc: adelcrosPic,
		githubLink: 'https://github.com/AstridDELCROS'
	},
];
