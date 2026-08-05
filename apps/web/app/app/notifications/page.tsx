import { Alert, Button, Card, EmptyState } from '@claimradar/design-system';
import { Bell, BellRing, Check } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { getNotifications } from '@/lib/user-data';
import { markNotificationRead } from '../actions';
import { formatDate } from '../_components/badges';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await requireAppAuth();
  const notifications = await getNotifications(user.id);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Notifications</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Match alerts, deadline reminders and account updates.
          </p>
        </div>
        <a
          href="/app/settings"
          className="text-sm text-trust-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
        >
          Manage notification preferences
        </a>
      </div>

      {notifications.unavailable && (
        <Alert variant="warning" title="Notifications temporarily unavailable">
          We could not reach the database. Try again shortly.
        </Alert>
      )}

      {notifications.length === 0 && !notifications.unavailable ? (
        <Card>
          <EmptyState
            icon={<Bell className="h-8 w-8" aria-hidden />}
            title="No notifications yet"
            description="When something matches your profile or a deadline approaches, you will hear about it here."
          />
        </Card>
      ) : (
        <Card className="p-0">
          {unreadCount > 0 && (
            <p className="border-b border-border px-5 py-3 text-xs font-medium text-text-muted">
              {unreadCount} unread
            </p>
          )}
          <ul className="divide-y divide-border">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={
                  notification.read_at
                    ? 'flex items-start justify-between gap-3 px-5 py-4'
                    : 'flex items-start justify-between gap-3 bg-background-elevated px-5 py-4'
                }
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  {notification.read_at ? (
                    <Bell className="mt-1 h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                  ) : (
                    <BellRing className="mt-1 h-4 w-4 shrink-0 text-trust-primary" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                    {notification.body && (
                      <p className="mt-1 text-sm text-text-secondary">{notification.body}</p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                      {notification.type.replace(/_/g, ' ')} · {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
                {!notification.read_at && (
                  <form
                    action={async (formData) => {
                      await markNotificationRead(formData);
                    }}
                    className="shrink-0"
                  >
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label={`Mark "${notification.title}" as read`}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Mark read
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
