import { Fragment, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "../../hooks/use-session";
import authContext, { AuthContextValue } from "../../context/auth/authContext";
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

	const session = useSession();
	const isAuthenticated = (session.state === 'authenticated');
	const { authenticateUser } = useContext(authContext) as AuthContextValue;
	const [isLoading, setIsLoading] = useState(!isAuthenticated);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			if (!isAuthenticated) {
				const success = await authenticateUser();
	
				/* could not authenticate, try to sign in again */
				if (config.shouldBeAuthenticated && !success) {
					await router.push(config.fallback);
				return;
				}
			}
			setIsLoading(false);

		}
		setIsLoading(true);
		checkAuth();
		
	}, [router.asPath]);

	if (isLoading) {
		return <LoadingScreen />
	}

	return <Fragment>{children}</Fragment>;
};

export default Authenticator;
