"use server"

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function getNotifications(unreadOnly: boolean = true) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        
        if (!session) return [];

        return await db.query.notifications.findMany({
            where: unreadOnly 
                ? and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false))
                : eq(notifications.userId, session.user.id),
            orderBy: [desc(notifications.createdAt)],
            limit: 20
        });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return [];
    }
}

export async function getUnreadCount(): Promise<number> {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session) return 0;

        const result = await db.query.notifications.findMany({
            where: and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false))
        });
        return result.length;
    } catch {
        return 0;
    }
}

export async function markAsRead(notificationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Não autorizado");

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, session.user.id)
        ));

    return { success: true };
}

export async function markAllAsRead() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) throw new Error("Não autorizado");

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));

    return { success: true };
}

export async function createNotification(userId: string, title: string, content: string) {
    await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId,
        title,
        content,
        isRead: false,
        createdAt: new Date(),
    });
}