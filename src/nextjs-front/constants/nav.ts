export type NavItem = {
	id: string;
	label: string;
	href: string;
};

export const wildNavItems: NavItem[] = [
	{
		id: 'discover',
		label: 'Discover',
		href: '/#discover',
	},
	{
		id: 'features',
		label: 'Features',
		href: '/#features',
	},
	{
		id: 'team',
		label: 'The team',
		href: '/#team',
	}
];
