import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Same catalog shape as the old src/lib/mock-data.ts placeholder —
// this is now the single source of truth, loaded into the real DB.
const GAMES = [
  { slug: "roblox", name: "Roblox", coverImage: "/games/roblox.svg" },
  { slug: "blox-fruits", name: "Blox Fruits", coverImage: "/games/blox-fruits.svg" },
  { slug: "minecraft", name: "Minecraft", coverImage: "/games/minecraft.svg" },
  { slug: "valorant", name: "Valorant", coverImage: "/games/valorant.svg" },
] as const;

const PRODUCTS = [
  { slug: "roblox-gift-card-100", gameSlug: "roblox", title: "Roblox Gift Card", subtitle: "100 ROBUX", price: 35, stockCount: 6, image: "/products/roblox-gift-card-100.svg" },
  { slug: "roblox-gift-card-250", gameSlug: "roblox", title: "Roblox Gift Card", subtitle: "250 ROBUX", price: 85, stockCount: 6, image: "/products/roblox-gift-card-250.svg" },
  { slug: "roblox-gift-card-500", gameSlug: "roblox", title: "Roblox Gift Card", subtitle: "500 ROBUX", price: 160, stockCount: 6, image: "/products/roblox-gift-card-500.svg" },
  { slug: "roblox-gift-card-800", gameSlug: "roblox", title: "Roblox Gift Card", subtitle: "800 ROBUX", price: 255, stockCount: 4, image: "/products/roblox-gift-card-800.svg" },
  { slug: "roblox-gift-card-1700", gameSlug: "roblox", title: "Roblox Gift Card", subtitle: "1700 ROBUX", price: 485, stockCount: 2, image: "/products/roblox-gift-card-1700.svg" },
] as const;

function randomCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RBLX-${part()}-${part()}-${part()}`;
}

async function main() {
  console.log("Seeding games...");
  const gameBySlug = new Map<string, string>();
  for (const g of GAMES) {
    const game = await db.game.upsert({
      where: { slug: g.slug },
      update: { name: g.name, coverImage: g.coverImage },
      create: g,
    });
    gameBySlug.set(g.slug, game.id);
  }

  console.log("Seeding products + stock...");
  for (const p of PRODUCTS) {
    const gameId = gameBySlug.get(p.gameSlug)!;
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: { title: p.title, subtitle: p.subtitle, price: p.price, gameId, image: p.image },
      create: {
        slug: p.slug,
        gameId,
        title: p.title,
        subtitle: p.subtitle,
        price: p.price,
        image: p.image,
      },
    });

    const existingStock = await db.stockItem.count({ where: { productId: product.id } });
    const toCreate = Math.max(0, p.stockCount - existingStock);
    for (let i = 0; i < toCreate; i++) {
      await db.stockItem.create({
        data: {
          productId: product.id,
          // Placeholder plaintext. A real deployment must encrypt this
          // at the application layer (e.g. AES-GCM with a KMS-managed
          // key) before it ever reaches the database.
          secretData: randomCode(),
          status: "AVAILABLE",
        },
      });
    }
  }

  console.log("Seeding demo users...");
  const adminPassword = await bcrypt.hash("admin1234", 10);
  await db.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      displayName: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customerPassword = await bcrypt.hash("customer1234", 10);
  await db.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      displayName: "Demo Customer",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  console.log("Done. Demo logins:");
  console.log("  admin@example.com / admin1234");
  console.log("  customer@example.com / customer1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
