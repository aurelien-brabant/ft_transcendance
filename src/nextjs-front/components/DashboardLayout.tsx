import React, { ReactElement, useState } from "react";
import NotificationsProvider from "../context/notifications/NotificationsProvider";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";
import ChatProvider from "../context/chat/ChatProvider";

const DashboardLayout: React.FC = ({ children }) => {
	const [isSidebarOpened, setIsSidebarOpened] = useState(false);

	return (
		<ChatProvider>
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
		</ChatProvider>
	);
};

export default DashboardLayout;
