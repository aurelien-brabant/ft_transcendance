import { useState } from "react";
import dragContext from "./dragContext";


const DragProvider: React.FC = ({ children }) => {
	const [lastX, setLastX] = useState<number>(0);
	const [lastY, setLastY] = useState<number>(0);
	
	return (
		<dragContext.Provider
			value={{
				lastX,
				setLastX,
				lastY,
				setLastY,
			}}
		>
			{children}
		</dragContext.Provider>
	);
};

export default DragProvider;
