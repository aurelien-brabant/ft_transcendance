import { createContext } from 'react';

export type AuthContextType = {
	fetchAsLoggedUser: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
	getUserData: () => any;
	authenticateUser: () => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
	clearUser: () => void
	mergeUserData: (data: any) => any;
}

const authContext = createContext<AuthContextType | null>(null);

export default authContext;
