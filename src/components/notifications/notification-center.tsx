"use client"

import { useState, useEffect, startTransition } from "react"
import { Bell, BellRing, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils/date"

interface Notification {
    id: string
    title: string
    content: string
    isRead: boolean
    createdAt: string | Date
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/notifications", { credentials: "include" })
            const data = await res.json()
            setNotifications(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            const targetWasUnread = notifications.find(n => n.id === id)?.isRead === false
            const wasLastUnread = targetWasUnread && unreadCount <= 1
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (wasLastUnread) setIsOpen(false)
        } catch (err) {
            console.error("Error marking as read:", err)
        }
    }

    useEffect(() => {
        startTransition(() => loadNotifications())
        const interval = setInterval(() => startTransition(() => loadNotifications()), 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative h-9 w-9 rounded-full"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : unreadCount > 0 ? (
                        <BellRing className="h-4 w-4" />
                    ) : (
                        <Bell className="h-4 w-4" />
                    )}
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                            variant="destructive"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notificações</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {unreadCount} nova(s)
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma notificação</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 10).map((n) => (
                            <DropdownMenuItem 
                                key={n.id} 
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                onSelect={(e) => { e.preventDefault(); handleMarkAsRead(n.id); }}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {!n.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                    )}
                                    <span className="font-medium text-sm truncate flex-1">
                                        {n.title}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 ml-4">
                                    {n.content}
                                </p>
                                <span className="text-xs text-muted-foreground ml-4">
                                    {formatRelativeTime(n.createdAt)}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}