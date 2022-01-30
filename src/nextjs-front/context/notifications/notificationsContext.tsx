import { createContext } from 'react';

export type NotificationItem = {
	category: string;
	content: string;
	issuedAt: Date
	isRead: boolean;
}

export type NotificationsContextType = {
	notifications: NotificationItem[];
	notify: (item: NotificationItem) => void
	markAsRead: (notificationId: string) => void
	markAllAsRead: () => void
};

const notificationsContext = createContext<NotificationsContextType>({
	notifications: [],
	notify: () => {},
	markAsRead: () => {},
	markAllAsRead: () => {}
});

export default notificationsContext;
