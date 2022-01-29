import Image from 'next/image';
import Link from 'next/link';
import {dashboardNavItems} from '../constants/nav';
import faker from 'faker';

type DashboardSideNavProps = {
	isOpened: boolean;
};

const DashboardSideNav: React.FC<DashboardSideNavProps> = () => {
	return (
		<aside className="sticky flex flex-col items-center w-24 py-2 bg-gray-900 top-14 gap-y-8 drop-shadow-lg" style={{height: 'calc(100vh - 3.5rem)'}}>
			<nav>
				<ul className="flex flex-col gap-y-8">
					{dashboardNavItems.map(item => (
						<li key={item.id}><Link href={item.href}><a><item.Icon className="text-4xl text-neutral-200 hover:text-pink-600"  /></a></Link></li>
					))}
				</ul>
			</nav>
		</aside>
	);
}

export default DashboardSideNav;
