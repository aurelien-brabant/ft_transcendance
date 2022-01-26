import { Fragment } from "react";
import { wildNavItems } from "../constants/nav";
import TopNavBar from "./TopNavBar";

const WildLayout: React.FC<{}> = ({ children }) => (
	<Fragment>
		<TopNavBar items={wildNavItems} />
		{children}
	</Fragment>
);

export default WildLayout;
