import "dotenv/config";
import { auth } from "../lib/auth";
import { db } from "./index";
import { user as userTable } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Iniciando semente de banco de dados...");

    const email = "admin@stoqueup.com.br";
    const password = "admin123";
    const name = "Gerente StoqueUp";

    try {
        // 1. Criar o usuário via Better Auth API para garantir hash de senha correto
        console.log(`CRIANDO: Usuário ${email}...`);
        
        const newUser = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });

        if (newUser) {
            console.log("✅ Usuário criado com sucesso!");

            // 2. Promover a Admin
            console.log("PROMOVENDO: Definindo role como 'admin'...");
            await db.update(userTable)
                .set({ role: "admin" })
                .where(eq(userTable.email, email));
            
            console.log("🚀 Semente concluída! Você já pode fazer login.");
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes("already exists") || message.includes("user_already_exists")) {
            console.log("ℹ️ Usuário já existe. Pulando criação.");
        } else {
            console.error("❌ Erro ao criar semente:", error);
        }
    }

    process.exit(0);
}

seed();
