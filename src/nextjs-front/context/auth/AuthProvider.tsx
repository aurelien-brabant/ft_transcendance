import { useEffect, useLayoutEffect, useState } from "react";
import authContext from "./authContext";

const AuthProvider: React.FC = ({ children }) => {
	const [userData, setUserData] = useState<any>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const loadBearer = () => window.localStorage.getItem("bearer");

	const logout = () => {
		window.localStorage.removeItem('bearer');
		setIsAuthenticated(false);
	}

	const clearUser = () => { setUserData(null); }

	const getUserData = (): any => userData;

	/**
	 * Wrapper around the standard fetch API that automatically
	 * sets the bearer token.
	 */

	const fetchAsLoggedUser = (
		input: RequestInfo,
		init?: RequestInit | undefined
	): Promise<Response> => {
		const bearer = loadBearer();

		return fetch(input, {
			...init,
			headers: {
				Authorization: `Bearer ${bearer}`,
			},
		});
	};

	/**
	 * Authenticate the user using the currently set bearer token, loading the userData
	 * that can be obtained with a call to getUserData (only if authentication succeeds, otherwise this function returns null).
	 * Returns whether or not the user has successfully been authenticated.
	 */

	const authenticateUser = async (): Promise<boolean> => {
		if (userData !== null) return true; /* already authenticated */
		const bearer = loadBearer();
		if (bearer === null) return false;

		const res = await fetchAsLoggedUser('http://localhost/api/auth/login');

		if (res.status != 200) return false;

		setUserData(await res.json());
		setIsAuthenticated(true);
		return true;
	}

	return (
		<authContext.Provider
			value={{
				fetchAsLoggedUser,
				getUserData,
				authenticateUser,
				logout,
				isAuthenticated,
				clearUser
			}}
		>
			{children}
		</authContext.Provider>
	);
};

export default AuthProvider;
