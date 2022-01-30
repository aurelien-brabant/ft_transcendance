import {useState} from 'react';
import notificationsContext, {NotificationItem} from './notificationsContext';

const NotificationsProvider: React.FC = ({ children }) => {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);

	const notify = (item: NotificationItem) => {
		setNotifications([item, ...notifications]);
	}

	const markAllAsRead = () => {
		setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
	}

	// TODO: provide implementation when ID system is put in place
	const markAsRead = (_notificationId: string) => {
	}

	return (
		<notificationsContext.Provider value={{notifications, notify, markAsRead, markAllAsRead}}>
			{children}
		</notificationsContext.Provider>
	);
}

export default NotificationsProvider;
