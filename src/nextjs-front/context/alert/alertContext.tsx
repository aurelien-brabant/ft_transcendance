import { createContext } from 'react';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export type Alert = {
	type: AlertType;
	content: string;
};

export type AlertContextType = {
	setAlert: (alert: Alert, previousStack?: any) => void;
	getCurrentContent: () => string;
};

const alertContext = createContext<AlertContextType | null>(null);

export default alertContext;
