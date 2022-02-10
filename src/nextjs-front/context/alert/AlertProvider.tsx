import { Alert, AlertType } from "./alertContext";
import alertContext from "./alertContext";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";

type AlertMeta = {
	bg: string;
	fg: string;
};

const alertMeta: { [key: string]: AlertMeta } = {
	error: {
		bg: "bg-red-300",
		fg: "text-red-800",
	},
};

const getAlertClassName = (type: AlertType) =>
	`${alertMeta[type].bg} ${alertMeta[type].fg}`;

type IdentifiedAlert = Alert & { id: string };

const AlertProvider: React.FC = ({ children }) => {
	const [alertStack, setAlertStack] = useState<IdentifiedAlert[]>([]);

	const setAlert = (alert: Alert) => {
		setAlertStack([
			{
				...alert,
				id: uuidv4(),
			},
			...alertStack,
		]);
	};

	const getCurrentContent = () => alertStack[0].content;

	return (
		<alertContext.Provider
			value={{
				getCurrentContent,
				setAlert
			}}
		>
			<div className="fixed z-50 flex flex-col max-h-screen overflow-hidden right-16 top-8 gap-y-2">
				{alertStack.map((alert) => (
					<div
						key={alert.id}
						className={`flex justify-center max-w-full rounded w-72 drop-shadow-lg ${getAlertClassName(
							alert.type
						)}`}
					>
						<button
							className="absolute text-xl top-1 right-1"
							onClick={() => { setAlertStack(alertStack.filter(a => a.id !== alert.id)); }}
						>
							<IoIosClose />
						</button>
						<p className="px-4 py-2 text-lg ">
							{alert.content}
						</p>
					</div>
				))}
			</div>
			{children}
		</alertContext.Provider>
	);
};

export default AlertProvider;
