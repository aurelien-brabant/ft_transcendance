import { ReactElement, useState } from "react";
import React from 'react';
import NotificationsProvider from "../context/notifications/NotificationsProvider";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";
import { BsFillChatDotsFill } from "react-icons/bs";
import Chat from "./Chat";

const DashboardLayout: React.FC = ({ children }) => {
	const [isSidebarOpened, setIsSidebarOpened] = useState(false);
	const [isChatOpened, setIsChatOpened] = useState(false);

	return (
		<NotificationsProvider>
			{!isChatOpened ? (
				<button
					className="fixed z-10 flex items-center justify-center p-4 text-5xl bg-orange-500 rounded-full transition hover:scale-105 text-neutral-200 bottom-10 right-10"
					onClick={() => {
						setIsChatOpened(true);
					}}
				>
					<BsFillChatDotsFill />
				</button>
			) : (
					<Chat onClose={() => { setIsChatOpened(false); } } />
			)}
			<DashboardTopNav
				onHamburgerClick={() => {
					setIsSidebarOpened(!isSidebarOpened);
				}}
			/>
			<div className="flex items-start bg-gray-900">
				<DashboardSideNav isOpened={isSidebarOpened} />
				{React.Children.map(children as ReactElement, (child: ReactElement) => React.cloneElement(child, { id: 'main-content'}))}
			</div>
		</NotificationsProvider>
	);
};

export default DashboardLayout;
