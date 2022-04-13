import { ReactElement } from "react";

export type SelectorItem = {
	label: string;
	component: ReactElement;
};

export type SelectorProps = {
	selected: number;
	setSelected: any;
	items: SelectorItem[];
};

const Selector: React.FC<SelectorProps> = ({ selected, setSelected, items }) => {

	return (
		<div className="w-full">
			<div className="flex overflow-x-auto">
				{items.map((item, index) => (
					<button
						key={item.label}
						className="flex flex-col items-center justify-end w-48 h-16 border-0 outline-0 gap-y-2"
						onClick={() => {
							setSelected(index);
						}}
					>
						<h2 className="px-2 font-bold uppercase text-neutral-300">
							{item.label}
						</h2>
						<div
							className={`transition h-1 w-full ${
								selected === index
									? "bg-pink-600"
									: "bg-neutral-200"
							}`}
						/>
					</button>
				))}

				<div className="flex flex-col justify-end w-48 h-16 gap-y-2">
					<div className="h-1 bg-neutral-200" />
				</div>
			</div>
			<div className="w-full overflow-x-auto">
				{items[selected].component}
			</div>
		</div>
	);
};

export default Selector;
