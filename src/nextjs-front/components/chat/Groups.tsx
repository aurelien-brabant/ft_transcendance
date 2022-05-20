import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EyeOffIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/outline";
import { UsersIcon } from "@heroicons/react/solid";
import { BaseUserData, Channel } from 'transcendance-types';
import { useSession } from "../../hooks/use-session";
import chatContext, { ChatContextType, ChatGroup, ChatGroupPrivacy, ChatMessagePreview } from "../../context/chat/chatContext";
import relationshipContext, { RelationshipContextType } from "../../context/relationship/relationshipContext";

/* All group conversations tab */
const Groups: React.FC<{viewParams: Object;}> = ({ viewParams }) => {
	const { user } = useSession();
	const { socket, openChatView } = useContext(chatContext) as ChatContextType;
	const { blocked } = useContext(relationshipContext) as RelationshipContextType;
	const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);

	const baseChatGroups = useMemo(() =>
		chatGroups
			.filter(
				(group) =>
					group.privacy !== "private" ||
					(group.privacy === "private" && group.in)
			)
			.sort(
				(a: ChatGroup, b: ChatGroup) =>
					(new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			)
	), [chatGroups]);

	const [filteredGroups, setFilteredGroups] = useState(baseChatGroups);
	const [visiblityFilter, setVisiblityFilter] = useState<ChatGroupPrivacy | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	/* Chat groups loading */
	const getLastMessage = (channel: Channel, isProtected = false) => {
		let message: ChatMessagePreview = {
			createdAt: channel.createdAt,
			content: "",
		};

		if (channel.messages && channel.messages.length > 0) {
			const lastMessage = channel.messages.reduce(function(prev, current) {
				return (prev.id > current.id) ? prev : current;
			})

			message.createdAt = new Date(lastMessage.createdAt);

			if (!isProtected) {
				if (lastMessage.author && !!blocked.find((user) => { return user.id == lastMessage.author.id; })) {
					message.content = "Blocked message";
				} else if (lastMessage.content.length > 22) {
					message.content = lastMessage.content.slice(0, 22) + "...";
				} else {
					message.content = lastMessage.content;
				}
			}
		}
		return message;
	}

	const updateChannelsListener = (channels: Channel[]) => {
		const groups: ChatGroup[] = [];

		for (const channel of Array.from(channels)) {
			const lastMessage: ChatMessagePreview = getLastMessage(channel, (channel.privacy === "protected"));

			groups.push({
				id: channel.id,
				label: channel.name,
				lastMessage: lastMessage.content,
				in: !!channel.users.find((chanUser: BaseUserData) => {
					return chanUser.id === user.id;
				}),
				peopleCount: channel.users.length,
				privacy: channel.privacy as ChatGroupPrivacy,
				updatedAt: lastMessage.createdAt
			});
		}
		/* Sorts from most recent */
		groups.sort(
			(a: ChatGroup, b: ChatGroup) =>
				(new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		);
		setChatGroups(groups);
	}

	/* Open a group if user is not banned */
	const handleOpenGroup = (gm: ChatGroup) => {
		socket.emit("openChannel", {
			channelId: gm.id,
			userId: user.id
		});

		socket.on("canOpenChannel", (channelId: string) => {
			if (channelId != gm.id) return ;

			openChatView(
				gm.privacy === 'protected' ? 'password_protection' : 'group',
				gm.label, {
					channelId: gm.id,
					channelName: gm.label,
					privacy: gm.privacy
				}
			);
		})
	};

	/* Select all | private | public | protected */
	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setVisiblityFilter(
			e.target.value !== "all"
				? (e.target.value as ChatGroupPrivacy)
				: null
		);
	};

	/* Search a group */
	const handleSearch = (term: string) => {
		const searchTerm = term.toLowerCase();

		setFilteredGroups(
			baseChatGroups.filter(
				(grp) =>
					grp.label.toLowerCase().includes(searchTerm) &&
					(visiblityFilter ? grp.privacy === visiblityFilter : true)
			)
		);
	};

	useEffect(() => {
		handleSearch((searchInputRef.current as HTMLInputElement).value);
	}, [visiblityFilter]);

	useEffect(() => {
		setFilteredGroups(baseChatGroups);
	}, [baseChatGroups]);

	const channelsChangeListener = () => {
		socket.emit("getUserChannels", { userId: user.id });
	};

	useEffect(() => {
		socket.emit("getUserChannels", { userId: user.id });

		/* Listeners */
		socket.on("updateUserChannels", updateChannelsListener);
		socket.on("channelCreated", channelsChangeListener);
		socket.on("channelUpdated", channelsChangeListener);
		socket.on("channelDeleted", channelsChangeListener);
		socket.on("peopleCountChanged", channelsChangeListener);
		socket.on("newGm", channelsChangeListener);

		return () => {
			socket.off("updateUserChannels", updateChannelsListener);
			socket.off("channelCreated", channelsChangeListener);
			socket.off("channelUpdated", channelsChangeListener);
			socket.off("channelDeleted", channelsChangeListener);
			socket.on("peopleCountChanged", channelsChangeListener);
			socket.on("newGm", channelsChangeListener);
		};
	}, []);

	return (
		<Fragment>
			<div className="h-[15%] gap-x-2 flex items-center p-4 bg-dark/90 border-04dp border-b-4 justify-between">
				<input
					ref={searchInputRef}
					type="text"
					className="py-1 bg-transparent border-b-2 border-pink-600 text-md outline-0 max-w-[45%]"
					placeholder="search for a group"
					onChange={(e) => {
						handleSearch(e.target.value);
					}}
				/>
				<select
					className="drag-cancellable px-2 py-1 text-sm bg-dark outline-none"
					onChange={handleSelect}
				>
					<option value="all">all</option>
					<option value="public">public</option>
					<option value="private">private</option>
					<option value="protected">protected</option>
				</select>
				<button className="px-2 py-1 text-sm font-bold uppercase bg-pink-600 hover:bg-pink-500 rounded" onClick={() => {
					openChatView('group_new', 'Create a new group', {});
				}}>
					+Group
				</button>
			</div>
			<div className="h-[85%] overflow-x-auto">
				{filteredGroups.map((gm) => (
					<div
						key={gm.label}
						className="relative items-center px-10 py-5 grid grid-cols-3 border-b border-04dp bg-dark/90 hover:bg-04dp/90 transition"
						onClick={() => {
							handleOpenGroup(gm);
						}}
					>
						<div className="absolute bottom-0 left-0 flex items-center px-3 py-1 text-sm text-white bg-04dp drop-shadow-md gap-x-1">
							<div className="flex items-center gap-x-1">
								<UsersIcon className="h-3 w-3" />
								{gm.peopleCount}
							</div>
							{gm.privacy === "private" && (
								<EyeOffIcon className="h-3 w-3" />
							)}
						</div>
						<div>
							<div
								style={
									{
										backgroundColor: gm.privacy === 'public'
											? "#0d9488"
											: gm.privacy === 'private' ? "#db2777" : "#0c4a6e"
									}
								}
								className="flex items-center justify-center w-16 h-16 text-4xl rounded-full"
							>
								{gm.label[0].toUpperCase()}
							</div>
						</div>
						<div className="col-span-2">
							<div className="flex items-center justify-between">
								<h6 className="text-lg font-bold">
									{gm.label}
								</h6>
								{gm.privacy === "protected" &&
									(gm.in ? (
										<LockOpenIcon className="h-4 w-4 opacity-50" />
									) : (
										<LockClosedIcon className="h-4 w-4" />
									))}
							</div>
							<p>
								{gm.lastMessage === "Blocked message"
									? <span className="opacity-30">{gm.lastMessage}</span>
									: gm.lastMessage
								}
							</p>
						</div>
					</div>
				))}
			</div>
		</Fragment>
	);
};

export default Groups;
