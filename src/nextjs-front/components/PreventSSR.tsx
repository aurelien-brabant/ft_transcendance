import { Fragment, useEffect, useState } from "react";

/* Only render children on client side */

const PreventSSR: React.FC = ({ children }) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return isMounted ? <Fragment>{children}</Fragment> : null;
};

export default PreventSSR;
