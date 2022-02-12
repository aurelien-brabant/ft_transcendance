import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import authContext, { AuthContextType } from "../../context/auth/authContext";
import { NextPageWithLayout } from "../../pages/_app";
import AuthProvider from "../../context/auth/AuthProvider";
import LoadingScreen from "../LoadingScreen";

export type AuthConfig = {
	fallback: string;
	shouldBeAuthenticated: boolean;
};

const defaultConfig: AuthConfig = {
	fallback: "/signin",
	shouldBeAuthenticated: true,
};

const Authenticator: React.FC<{ authConfig?: Partial<AuthConfig> }> = ({
	children,
	authConfig,
}) => {
	// merge supplied config (if any) with default config
	const config = {
		...defaultConfig,
		...(authConfig ? { ...authConfig } : {}),
	};

	console.log(config);

	const { authenticateUser, isAuthenticated } = useContext(
		authContext
	) as AuthContextType;
	const [isLoading, setIsLoading] = useState(!isAuthenticated);
	const router = useRouter();

	useEffect(() => {
		setIsLoading(true);
		(async () => {
			if (!isAuthenticated) {
				console.log('Authenticating...');
				const success = await authenticateUser();

				/* could not authenticate, try to sign in again */
				if (config.shouldBeAuthenticated && !success) {
					await router.push(config.fallback);
					return;
				}
			}
			setIsLoading(false);
		})();
	}, [router.asPath]);

	if (isLoading) {
		return <LoadingScreen />
	}

	return <Fragment>{children}</Fragment>;
};

export default Authenticator;