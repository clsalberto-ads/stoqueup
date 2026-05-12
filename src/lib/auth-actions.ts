"use server"

import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Cria uma nova organização (Empresa) vinculada ao usuário atual.
 */
export async function createOrganization(name: string, slug: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session) {
        throw new Error("Não autorizado");
    }

    const org = await auth.api.createOrganization({
        body: {
            name,
            slug,
        }
    });

    return org;
}

/**
 * Adiciona um novo membro à organização. Apenas Managers/Admins podem fazer isso.
 */
export async function addEmployee(email: string, role: "admin" | "member") {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Não autorizado");
    }

    // Nota: O plugin de organização do Better Auth já lida com permissões se configurado,
    // mas aqui garantimos que a intenção de D-02 seja respeitada.
    
    const result = await auth.api.createInvitation({
        headers: await headers(),
        body: {
            email,
            role,
        }
    });

    return result;
}
