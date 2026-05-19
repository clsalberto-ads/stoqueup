"use server"

import { auth } from "./auth"
import { headers } from "next/headers"
import { supabase, PRODUCTS_BUCKET } from "./supabase"
import { randomUUID } from "crypto"

export async function uploadProductImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: "Não autorizado" }

    const file = formData.get("file") as File | null
    if (!file) return { error: "Nenhum arquivo enviado" }

    if (!file.type.startsWith("image/")) return { error: "Apenas imagens são permitidas" }

    if (file.size > 4 * 1024 * 1024) return { error: "A imagem deve ter no máximo 4MB" }

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${randomUUID()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
        })

    if (error) return { error: error.message }

    const { data: urlData } = supabase.storage
        .from(PRODUCTS_BUCKET)
        .getPublicUrl(data.path)

    return { url: urlData.publicUrl }
}

export async function deleteProductImage(url: string): Promise<{ success: boolean } | { error: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: "Não autorizado" }

    const path = url.split("/").pop()
    if (!path) return { error: "URL inválida" }

    const { error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .remove([path])

    if (error) return { error: error.message }
    return { success: true }
}
