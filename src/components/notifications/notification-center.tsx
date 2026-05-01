"use client"

import { useState, useEffect, useTransition } from "react"
import { Bell, BellDot, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/notification-actions"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()

    const unreadCount = notifications.filter(n => !n.isRead).length

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
    }

    useEffect(() => {
        fetchNotifications()
        // Polling simples para MVP
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllAsRead()
            toast.success("Todas marcadas como lidas")
            fetchNotifications()
        })
    }

    const handleReadOne = (id: string) => {
        startTransition(async () => {
            await markAsRead(id)
            fetchNotifications()
        })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200">
                    {unreadCount > 0 ? (
                        <>
                            <BellDot className="h-5 w-5 text-blue-600" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        </>
                    ) : (
                        <Bell className="h-5 w-5 text-slate-500" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h4 className="font-bold text-slate-900">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0"
                            onClick={handleMarkAllRead}
                            disabled={isPending}
                        >
                            Ler todas
                        </Button>
                    )}
                </div>
                <Separator />
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-10 text-center text-slate-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => !n.isRead && handleReadOne(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                                            n.title.includes('Crítico') ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            {n.title.includes('Crítico') ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            <p className={`text-sm font-bold leading-none ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {n.content}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
