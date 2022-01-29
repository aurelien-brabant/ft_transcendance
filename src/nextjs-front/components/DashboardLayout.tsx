import { Fragment } from "react";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopNav from "./DashboardTopNav";

const DashboardLayout: React.FC = ({ children }) => {
	return (
		<Fragment>
			<DashboardTopNav onHamburgerClick={() => {}} />
			<div className="flex items-start min-h-screen">
				<DashboardSideNav isOpened={true} />
				{children}
			</div>
		</Fragment>
	);
};

export default DashboardLayout;
