import {useState} from "react";
import NotificationsProvider from "../context/notifications/NotificationsProvider";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";

const DashboardLayout: React.FC = ({ children }) => {
	const [ isSidebarOpened, setIsSidebarOpened ] = useState(false);

	return (
		<NotificationsProvider>
			<DashboardTopNav onHamburgerClick={() => { setIsSidebarOpened(!isSidebarOpened); }} />
			<div className="flex items-start min-h-screen bg-gray-900">
				<DashboardSideNav isOpened={isSidebarOpened} />
				{children}
			</div>
		</NotificationsProvider>
	);
};

export default DashboardLayout;
