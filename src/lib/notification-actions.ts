"use server"

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth.api.getSession();
    if (!session) return [];

    return await db.query.notifications.findMany({
        where: eq(notifications.userId, session.user.id),
        orderBy: [desc(notifications.createdAt)],
        limit: 20
    });
}

export async function markAsRead(notificationId: string) {
    const session = await auth.api.getSession();
    if (!session) throw new Error("Não autorizado");

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, session.user.id)
        ));

    revalidatePath("/");
    return { success: true };
}

export async function markAllAsRead() {
    const session = await auth.api.getSession();
    if (!session) throw new Error("Não autorizado");

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));

    revalidatePath("/");
    return { success: true };
}

/**
 * Função utilitária para criar notificações internamente.
 * Não é uma Server Action para ser chamada diretamente do cliente (sem "use server" explícito se for interna, mas aqui estamos em um arquivo "use server").
 */
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
