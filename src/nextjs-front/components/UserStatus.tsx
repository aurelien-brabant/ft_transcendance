export type UserStatus = 'online' | 'offline' | 'deactivated';

const statusColors = {
	'online': 'bg-green-500',
	'offline': 'bg-red-500',
	'deactivated': 'bg-gray-700'
};

export const UserStatusItem: React.FC<{ status: UserStatus, withText?: boolean, className?: string }> = ({ status, withText, className }) => (
	<div className={`flex items-center gap-x-2 ${className}`}>
		<span className={`h-4 w-4 rounded-full -translate-y-[.05em] ${statusColors[status]}`} />
		{ withText && ( <span className="uppercase text-neutral-200">{status}</span>)}
	</div>
);

UserStatusItem.defaultProps = {
	withText: true
}
