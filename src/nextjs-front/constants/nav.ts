export type NavItem = {
	id: string;
	label: string;
	href: string;
};

export const wildNavItems: NavItem[] = [
	{
		id: 'discover',
		label: 'Discover',
		href: '/home#discover',
	},
	{
		id: 'features',
		label: 'Features',
		href: '/home#features',
	},
	{
		id: 'team',
		label: 'The team',
		href: '/home#team',
	}
];
