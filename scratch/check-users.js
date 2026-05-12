const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function run() {
    try {
        const users = await sql`SELECT id, name, email, role FROM "user"`;
        console.log("USERS_RESULT:", JSON.stringify(users));
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}

run();
