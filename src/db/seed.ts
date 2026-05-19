import "dotenv/config";
import { auth } from "../lib/auth";
import { db } from "./index";
import {
  user,
  session,
  account,
  verification,
  products,
  inventoryLogs,
  productionTasks,
  notifications,
  organization,
  member,
  invitation,
} from "./schema";
import { eq } from "drizzle-orm";

const ORGANIZATION = { name: "StoqueUp", slug: "stoqueup" }

const USERS = [
  { email: "admin@stoqueup.com.br", password: "admin123", name: "Administrador", role: "admin", orgRole: "owner" },
  { email: "manager@stoqueup.com.br", password: "manager123", name: "Gerente", role: "manager", orgRole: "admin" },
  { email: "user@stoqueup.com.br", password: "user1234", name: "Usuário de Produção", role: "user", orgRole: "member" },
]

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  console.log("🧹 Limpando dados existentes...");

  const tables = [
    invitation, member, organization,
    notifications,
    inventoryLogs, productionTasks, products,
    session, account, verification, user,
  ]

  for (const table of tables) {
    await db.delete(table)
  }

  console.log("✅ Dados existentes removidos.");

  const createdUsers: { id: string, email: string }[] = []

  for (const u of USERS) {
    try {
      console.log(`👤 Criando usuário: ${u.email}...`);

      const result = await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
        }
      })

      if (result.user) {
        await db.update(user)
          .set({ role: u.role })
          .where(eq(user.email, u.email))

        createdUsers.push({ id: result.user.id, email: u.email })
        console.log(`✅ ${u.email} criado com role "${u.role}".`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes("already exists") || message.includes("user_already_exists")) {
        console.log(`ℹ️  ${u.email} já existe. Atualizando role...`);
        const existing = await db.update(user)
          .set({ role: u.role })
          .where(eq(user.email, u.email))
          .returning({ id: user.id })

        if (existing[0]) {
          createdUsers.push({ id: existing[0].id, email: u.email })
        }
        console.log(`✅ ${u.email} atualizado para role "${u.role}".`);
      } else {
        console.error(`❌ Erro ao criar ${u.email}:`, message);
      }
    }
  }

  const orgId = crypto.randomUUID()
  const now = new Date()

  console.log(`🏢 Criando organização: ${ORGANIZATION.name}...`);

  await db.insert(organization).values({
    id: orgId,
    name: ORGANIZATION.name,
    slug: ORGANIZATION.slug,
    createdAt: now,
  })

  for (const u of USERS) {
    const userData = createdUsers.find(cu => cu.email === u.email)
    if (!userData) continue

    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: userData.id,
      role: u.orgRole,
      createdAt: now,
    })

    console.log(`   ➕ ${u.email} adicionado como "${u.orgRole}" na organização.`);
  }

  console.log("🚀 Seed concluído!");
  process.exit(0)
}

seed()
