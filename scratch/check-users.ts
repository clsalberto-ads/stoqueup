import { db } from "../src/db";
import { user } from "../src/db/schema";

async function checkUsers() {
    try {
        const users = await db.select().from(user);
        console.log("Usuários encontrados:", users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
    }
    process.exit(0);
}

checkUsers();
