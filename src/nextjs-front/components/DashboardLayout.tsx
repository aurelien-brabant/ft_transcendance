import NotificationsProvider from "../context/notifications/NotificationsProvider";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";

const DashboardLayout: React.FC = ({ children }) => {
	return (
		<NotificationsProvider>
			<DashboardTopNav onHamburgerClick={() => {}} />
			<div className="flex items-start min-h-screen">
				<DashboardSideNav isOpened={true} />
				{children}
			</div>
		</NotificationsProvider>
	);
};

export default DashboardLayout;
