import { Fragment } from "react";
import { wildNavItems } from "../constants/nav";
import Footer from "./Footer";
import TopNavBar from "./TopNavBar";

const WildLayout: React.FC<{}> = ({ children }) => (
	<Fragment>
		<TopNavBar items={wildNavItems} />
		{children}
		<Footer />
	</Fragment>
);

export default WildLayout;
