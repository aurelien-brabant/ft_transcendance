import { Fragment, useEffect, useState } from "react";
import { Slide, SlideProps } from "react-awesome-reveal";
import { MediaQueryAllQueryable, useMediaQuery } from "react-responsive";

type ResponsiveSlideProp = SlideProps & {
	useMediaQueryArg: Partial<
		MediaQueryAllQueryable & {
			query?: string;
		}
	>;
};

const ResponsiveSlide: React.FC<ResponsiveSlideProp> = ({
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
		<Slide {...rest}>{children}</Slide>
	) : (
		<Fragment>{children}</Fragment>
	);
};

export default ResponsiveSlide;
