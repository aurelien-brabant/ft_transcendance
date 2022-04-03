import React, { ReactElement, useState } from "react";
import NotificationsProvider from "../context/notifications/NotificationsProvider";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";

const DashboardLayout: React.FC = ({ children }) => {
	const [isSidebarOpened, setIsSidebarOpened] = useState(false);

	return (
			<NotificationsProvider>
				<DashboardTopNav
					onHamburgerClick={() => {
						setIsSidebarOpened(!isSidebarOpened);
					}}
				/>
				<div className="flex items-start bg-gray-900">
					<DashboardSideNav isOpened={isSidebarOpened} />
					{React.Children.map(
						children as ReactElement,
						(child: ReactElement) =>
							React.cloneElement(child, { id: "main-content" })
					)}
				</div>
			</NotificationsProvider>
		);
};

export default DashboardLayout;
