import { useContext, useEffect, useState } from "react";
import { BsArrowLeftShort, BsShieldFillPlus } from "react-icons/bs";
// import { GiThorHammer } from "react-icons/gi";
// import Link from "next/link";
import chatContext, { ChatContextType } from "../../context/chat/chatContext";
// import faker from "@faker-js/faker";

export const GroupSettingsHeader: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	const { closeRightmostView } = useContext(chatContext) as ChatContextType;

	return (
		<div className="flex items-center justify-between p-3 px-5">
			<div className="flex gap-x-2">
				<button
					className="text-4xl"
					onClick={() => {
						closeRightmostView();
					}}
				>
					<BsArrowLeftShort />
				</button>
			</div>
			<h6>Group settings</h6>
		</div>
	);
};

const GroupSettings: React.FC<{ viewParams: any }> = ({ viewParams }) => {
	return (
		<div className="flex flex-col justify-between h-full px-4 py-4 overflow-auto gap-y-4">
			<div className="">
				<div className="flex justify-between">
					<span>Name</span>
					<span>Group name</span>
				</div>
				<div className="flex justify-between">
					<span>Visibility</span>
					<span>Public</span>
				</div>
				<div className="flex justify-between">
					<span>Members</span>
					<span>20</span>
				</div>
			</div>
			<div className="flex flex-col gap-y-4">
			<button className="px-3 py-2 uppercase bg-red-600">Leave group</button>
			<button className="px-3 py-2 uppercase bg-red-600">Disband group</button>
			</div>
		</div>
	);
};

export default GroupSettings;
