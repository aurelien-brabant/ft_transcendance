export type UserStatus = 'online' | 'offline';

const statusColors = {
	'online': 'bg-green-500',
	'offline': 'bg-gray-700'
};

export const UserStatusItem: React.FC<{ status: UserStatus, withText?: boolean }> = ({ status, withText }) => (
	<div className="flex items-center gap-x-2">
		<span className={`h-4 w-4 rounded-full -translate-y-[.05em] ${statusColors[status]}`} />
		{ withText && ( <span className="uppercase text-neutral-200">{status}</span>)}
	</div>
);

UserStatusItem.defaultProps = {
	withText: true
}
