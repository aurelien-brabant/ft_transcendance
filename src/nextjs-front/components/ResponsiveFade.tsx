import { Fragment, useEffect, useState } from "react";
import { Fade, FadeProps } from "react-awesome-reveal";
import { MediaQueryAllQueryable, useMediaQuery } from "react-responsive";

type ResponsiveFadeProp = FadeProps & {
	useMediaQueryArg: Partial<
		MediaQueryAllQueryable & {
			query?: string;
		}
	>;
};

const ResponsiveFade: React.FC<ResponsiveFadeProp> = ({
	useMediaQueryArg,
	children,
	...rest
}) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const doesFit = useMediaQuery(useMediaQueryArg);

	if (!isMounted) return null; // do not render anything on the server-side

	return doesFit ? (
		<Fade {...rest}>{children}</Fade>
	) : (
		<Fragment>{children}</Fragment>
	);
};

export default ResponsiveFade;
