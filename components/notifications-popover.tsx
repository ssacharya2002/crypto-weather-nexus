"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { markAllAsRead } from "@/redux/features/notificationsSlice"

export default function NotificationsPopover() {
  const { notifications } = useAppSelector((state) => state.notifications)
  const dispatch = useAppDispatch()
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length)
  }, [notifications])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      // Mark all as read when opening
      dispatch(markAllAsRead())
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button  variant="outline" size="icon" className="relative  cursor-pointer">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          <p className="text-xs text-muted-foreground">Real-time updates and alerts</p>
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <ScrollArea className="h-80">
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div key={index} className={`p-4 ${notification.read ? "" : "bg-muted/50"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    <Badge
                      variant={notification.type === "price_alert" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {notification.type === "price_alert" ? "Price" : "Weather"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

