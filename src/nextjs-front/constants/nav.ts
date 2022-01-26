export type NavItem = {
	id: number,
	label: string;
	href: string;
};

export const wildNavItems: NavItem[] = [
	{
		id: 0,
		label: 'Discover',
		href: '/#discover',
	},
	{
		id: 1,
		label: 'Features',
		href: '/#features',
	},
	{
		id: 2,
		label: 'The team',
		href: '/#team',
	}
];
