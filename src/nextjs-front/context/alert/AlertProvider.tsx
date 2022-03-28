import { Fragment, useEffect, useRef, useState } from "react";
import { Bounce } from "react-awesome-reveal";
import { IoIosClose } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";
import alertContext, { Alert, AlertType } from "./alertContext";

type AlertMeta = {
	bg: string;
	fg: string;
};

const alertMeta: { [key: string]: AlertMeta } = {
	error: {
		bg: "bg-red-300",
		fg: "text-red-800",
	},
	warning: {
		bg: "bg-orange-300",
		fg: "text-orange-800",
	},
	info: {
		bg: "bg-blue-300",
		fg: "text-blue-800",
	},
	success: {
		bg: "bg-green-300",
		fg: "text-green-800",
	}
};

const getAlertClassName = (type: AlertType) =>
	`${alertMeta[type].bg} ${alertMeta[type].fg}`;

type IdentifiedAlert = Alert & { id: string; timeout: number };

const ALERT_TIMEOUT_MS = 5000;
const ALERT_MAX_N = 10;

const AlertProvider: React.FC = ({ children }) => {
	const [alertStack, setAlertStack] = useState<IdentifiedAlert[]>([]);
	const [removedAlert, setRemovedAlert] = useState<null | IdentifiedAlert>(
		null
	);
	// used to avoid animation replaying between two renders if the alert was already there
	// one typical use case is on page change.
	// reset to false each time an alert is set.
	const hasAnimationBeenTriggered = useRef(false);

	// previousState is typed as any because we don't want to expose the type of it
	const setAlert = (alert: Alert, previousStack: any = alertStack): any => {
		hasAnimationBeenTriggered.current = false;
		const stack = previousStack as IdentifiedAlert[]; // explicitly type it now
		const alertId = uuidv4();
		const newAlert: Partial<IdentifiedAlert> = {
			...alert,
			id: alertId,
		};
		const timeout = setTimeout(setRemovedAlert, ALERT_TIMEOUT_MS, newAlert)
		newAlert.timeout = timeout;


		const currentStack = stack.length == ALERT_MAX_N ? stack.slice(0, ALERT_MAX_N - 1) : stack;
		const newStack = [
			newAlert as IdentifiedAlert,
			...currentStack
		];
		setAlertStack(newStack);

		return newStack;
	};

	// Triggered each time a new alert is added to the queue.
	// The queue itself is not a state because we want to avoid
	// the state desynchronization problem that the queue is meant
	// to counteract.

	useEffect(() => {
		if (removedAlert !== null) {
			removeAlert(removedAlert);
		}
	}, [removedAlert]);

	const getCurrentContent = () => alertStack[0].content;

	const removeAlert = (alert: IdentifiedAlert) => {
		clearTimeout(alert.timeout);
		setAlertStack(alertStack.filter((a) => a.id !== alert.id));
	};

	return (
		<alertContext.Provider
			value={{
				getCurrentContent,
				setAlert,
			}}
		>
			<div className="fixed z-50 flex flex-col max-h-screen overflow-hidden right-16 top-8 gap-y-2">
				{alertStack.map((alert, index) => {
					const Wrapper: React.FC =
						index === 0 && !hasAnimationBeenTriggered.current
							? ({ children }) => {
								hasAnimationBeenTriggered.current = true;
								return (
									<Bounce duration={300}>{children}</Bounce>
							  )
							} : ({ children }) => <Fragment>{children}</Fragment>;

					return (
						<Wrapper key={alert.id}>
							<div
								className={`flex justify-center max-w-full rounded w-72 drop-shadow-lg ${getAlertClassName(
									alert.type
								)}`}
							>
								<button
									className="absolute text-xl top-1 right-1"
									onClick={() => {
										removeAlert(alert);
									}}
								>
									<IoIosClose />
								</button>
								<p className="px-4 py-2 text-lg ">
									{alert.content}
								</p>
							</div>
						</Wrapper>
					);
				})}
			</div>
			{children}
		</alertContext.Provider>
	);
};

export default AlertProvider;
