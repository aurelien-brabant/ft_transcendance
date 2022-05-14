import React, { Fragment, ReactElement, useState } from "react";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";

const DashboardLayout: React.FC = ({ children }) => {
	const [isSidebarOpened, setIsSidebarOpened] = useState(false);

	return (
		<Fragment>
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
		</Fragment>
	);
};

export default DashboardLayout;
