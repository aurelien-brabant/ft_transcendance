import { createContext } from 'react';

export type NotificationItem = {
	id: string;
	category: string;
	content: string;
	issuedAt: Date
	isRead: boolean;
}

export type NotificationsContextType = {
	notifications: NotificationItem[];
	notify: (item: { category: string, content: string }) => void
	markAsRead: (notificationId: string) => void
	markAllAsRead: () => void,
	setNotifications: (data: any) => any
};

const notificationsContext = createContext<NotificationsContextType>({
	notifications: [],
	notify: () => {},
	markAsRead: () => {},
	markAllAsRead: () => {},
	setNotifications: () => {},
});

export default notificationsContext;
