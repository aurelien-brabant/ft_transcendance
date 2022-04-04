import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "transcendance-types";
import authContext from "./authContext";

const AuthProvider: React.FC = ({ children }) => {
	const [userData, setUserData] = useState<User | null>();
	const [isPreAuthenticated, setIsPreAuthenticated] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [token, setToken] = useState<string>('');
	const [isChatOpened, setIsChatOpened] = useState(false);
	
	const loadBearer = () => window.localStorage.getItem("bearer");

	const logout = () => {
		setIsChatOpened(false);
		window.localStorage.removeItem('bearer');
		setIsPreAuthenticated(false);
		setIsAuthenticated(false);
	}

	const clearUser = () => { setUserData(null); }
	const getUserData = (): any => userData;

	/**
	 * Merge the object passed as an argument with the current userData object.
	 * Updated data is NOT fetched from the API. It's arbitrarily updated on the
	 * front-end side. DON'T use that if you're not sure changes have been applied
	 * correctly.
	 */

	const mergeUserData = (data: any) => {
		const mergedData = { ...userData, ...data };
		setUserData(mergedData);
		
		return mergedData;
	}

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
	 * Authenticate the user by calling the API diretly, using the currently set bearer token.
	 *
	 * If no bearer token is available, no call is made and this function returns false.
	 * Otherwise, a request to the /api/auth/login endpoint is made in order to authenticate
	 * the user. If the response's status code is not 200, the authentication process is aborted
	 * and the bearer is deleted from the local storage.
	 *
	 * An optional 'refresh' parameter can be passed to this function, which is set to false
	 * by default. If set to true, authenticateUser can be used to refresh the userData by
	 * making a new call to the same API endpoint. This can be used to fetch changed user data.
	 * HOWEVER, consider updating it dynamically on the front-end side if possible since it doesn't
	 * require an extra API call.
	 */

	const authenticateUser = async (refresh: boolean = false): Promise<boolean> => {
		if (isAuthenticated && !refresh) return true; /* already authenticated */
		const bearer = loadBearer();
		if (bearer === null) return false;

		const res = await fetchAsLoggedUser('/api/auth/login');

		if (res.status != 200) {
			logout();
			return false;
		}

		setUserData(await res.json());
		setIsPreAuthenticated(true);
		return true;
	}

	return (
		<authContext.Provider
			value={{
				fetchAsLoggedUser,
				getUserData,
				authenticateUser,
				logout,
				isPreAuthenticated,
				isAuthenticated,
				setIsAuthenticated,
				setIsPreAuthenticated,
				setUserData,
				clearUser,
				mergeUserData,
				token,
				setToken,
				isChatOpened,
				setIsChatOpened,
			}}
		>
			{children}
		</authContext.Provider>
	);
};

export default AuthProvider;
