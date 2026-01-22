"use client"

import { useTaskContext } from "@/lib/task-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, AtSign, UserPlus, MessageSquare, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

export function NotificationsPanel() {
  const {
    notifications,
    unreadNotificationsCount,
    currentUser,
    getUserById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useTaskContext()

  const userNotifications = notifications
    .filter((n) => n.toUserId === currentUser?.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <AtSign className="w-4 h-4 text-primary" />
      case "assignment":
        return <UserPlus className="w-4 h-4 text-emerald-500" />
      case "comment":
        return <MessageSquare className="w-4 h-4 text-amber-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" dir="rtl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">התראות</h3>
          {unreadNotificationsCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsRead}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="w-4 h-4" />
              סמן הכל כנקרא
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {userNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">אין התראות חדשות</p>
              <p className="text-sm mt-1">נעדכן אותך כשמישהו יתייג אותך או ישייך אליך משימה</p>
            </div>
          ) : (
            <div className="divide-y">
              {userNotifications.map((notification) => {
                const fromUser = getUserById(notification.fromUserId)
                return (
                  <button
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className={`w-full p-4 text-right hover:bg-muted/50 transition-colors flex gap-3 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={fromUser?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {notification.fromUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <p className="text-sm leading-relaxed">{notification.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: he })}
                      </p>
                    </div>
                    {!notification.read && <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-1.5" />}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
