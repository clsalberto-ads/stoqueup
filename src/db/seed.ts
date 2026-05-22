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
  { email: "admin@stoqueup.com.br", password: "password123", name: "Administrador", role: "admin", orgRole: "owner" },
  { email: "manager@stoqueup.com.br", password: "password123", name: "Gerente", role: "manager", orgRole: "admin" },
  { email: "user@stoqueup.com.br", password: "password123", name: "Usuário de Produção", role: "user", orgRole: "member" },
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

  // Inserir produtos de exemplo
  console.log("📦 Criando produtos de exemplo...");

  const productsData = [
    { name: "Arroz 5kg", description: "Arroz branco tipo 1", price: 2500, qtdMinima: 10, qtdMaxima: 100, minParaVenda: 5, currentStock: 20 },
    { name: "Feijão 1kg", description: "Feijão carioca", price: 899, qtdMinima: 20, qtdMaxima: 200, minParaVenda: 10, currentStock: 35 },
    { name: "Óleo de Soja 900ml", description: "Óleo de cozinha", price: 799, qtdMinima: 15, qtdMaxima: 0, minParaVenda: 8, currentStock: 50 },
    { name: "Produto Sem Limite", description: "Produto com qtdMaxima=0 (sem limite de produção)", price: 1500, qtdMinima: 5, qtdMaxima: 0, minParaVenda: 3, currentStock: 10 },
    { name: "Produto Bloqueado", description: "Produto com statusVenda=false (sem estoque)", price: 999, qtdMinima: 10, qtdMaxima: 50, minParaVenda: 5, currentStock: 2 },
  ];

  for (const p of productsData) {
    const productId = crypto.randomUUID();
    await db.insert(products).values({
      id: productId,
      name: p.name,
      description: p.description,
      price: p.price,
      qtdMinima: p.qtdMinima,
      qtdMaxima: p.qtdMaxima,
      minParaVenda: p.minParaVenda,
      currentStock: p.currentStock,
      statusVenda: p.currentStock >= p.minParaVenda,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`   ✅ ${p.name} (estoque: ${p.currentStock}, venda: ${p.currentStock >= p.minParaVenda ? "liberado" : "bloqueado"})`);
  }

  console.log("🚀 Seed concluído!");
  process.exit(0)
}

seed()
