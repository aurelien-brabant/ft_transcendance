import { createContext } from 'react';
import {LoggedUser} from 'transcendance-types';

export type AuthContextType = {
	fetchAsLoggedUser: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
	getUserData: () => LoggedUser;
	authenticateUser: () => Promise<boolean>;
	logout: () => void;
	isPreAuthenticated: boolean;
	isAuthenticated: boolean;
	setIsAuthenticated: (data: any) => any;
	setIsPreAuthenticated: (data: any) => any;
	setUserData: (data: any) => any;
	clearUser: () => void
	mergeUserData: (data: any) => any;
	token: string;
	setToken: (data: any) => any;
	}

const authContext = createContext<AuthContextType | null>(null);

export default authContext;
