import { createContext } from 'react';

export type DragContextType = {
	lastX: number;
	setLastX: (data: any) => any;
	lastY: number;
	setLastY: (data: any) => any;
	
};

const dragContext = createContext<DragContextType | null>(null);

export default dragContext;
