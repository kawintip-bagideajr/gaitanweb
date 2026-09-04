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

  // Blox Fruits runs on Robux (gamepasses) — same Robux gift card,
  // marketed to Blox Fruits players specifically.
  { slug: "blox-fruits-robux-400", gameSlug: "blox-fruits", title: "Robux สำหรับ Blox Fruits", subtitle: "400 ROBUX", price: 135, stockCount: 5, image: "/products/blox-fruits-robux-400.svg" },
  { slug: "blox-fruits-robux-800", gameSlug: "blox-fruits", title: "Robux สำหรับ Blox Fruits", subtitle: "800 ROBUX", price: 255, stockCount: 5, image: "/products/blox-fruits-robux-800.svg" },
  { slug: "blox-fruits-robux-1700", gameSlug: "blox-fruits", title: "Robux สำหรับ Blox Fruits", subtitle: "1700 ROBUX", price: 485, stockCount: 3, image: "/products/blox-fruits-robux-1700.svg" },
  { slug: "blox-fruits-robux-4500", gameSlug: "blox-fruits", title: "Robux สำหรับ Blox Fruits", subtitle: "4500 ROBUX", price: 1199, stockCount: 2, image: "/products/blox-fruits-robux-4500.svg" },

  { slug: "minecraft-game-key", gameSlug: "minecraft", title: "Minecraft: Java & Bedrock Edition", subtitle: "Game Key (PC)", price: 219, stockCount: 8, image: "/products/minecraft-game-key.svg" },
  { slug: "minecraft-minecoins-320", gameSlug: "minecraft", title: "Minecraft Minecoins", subtitle: "320 Coins", price: 89, stockCount: 6, image: "/products/minecraft-minecoins-320.svg" },
  { slug: "minecraft-minecoins-1020", gameSlug: "minecraft", title: "Minecraft Minecoins", subtitle: "1,020 Coins", price: 259, stockCount: 6, image: "/products/minecraft-minecoins-1020.svg" },
  { slug: "minecraft-minecoins-1720", gameSlug: "minecraft", title: "Minecraft Minecoins", subtitle: "1,720 Coins", price: 419, stockCount: 4, image: "/products/minecraft-minecoins-1720.svg" },
  { slug: "minecraft-minecoins-3500", gameSlug: "minecraft", title: "Minecraft Minecoins", subtitle: "3,500 Coins", price: 789, stockCount: 2, image: "/products/minecraft-minecoins-3500.svg" },

  { slug: "valorant-vp-475", gameSlug: "valorant", title: "Valorant Points", subtitle: "475 VP", price: 159, stockCount: 6, image: "/products/valorant-vp-475.svg" },
  { slug: "valorant-vp-1000", gameSlug: "valorant", title: "Valorant Points", subtitle: "1,000 VP", price: 319, stockCount: 6, image: "/products/valorant-vp-1000.svg" },
  { slug: "valorant-vp-2050", gameSlug: "valorant", title: "Valorant Points", subtitle: "2,050 VP", price: 639, stockCount: 4, image: "/products/valorant-vp-2050.svg" },
  { slug: "valorant-vp-3650", gameSlug: "valorant", title: "Valorant Points", subtitle: "3,650 VP", price: 1099, stockCount: 2, image: "/products/valorant-vp-3650.svg" },
  { slug: "valorant-vp-5350", gameSlug: "valorant", title: "Valorant Points", subtitle: "5,350 VP", price: 1559, stockCount: 1, image: "/products/valorant-vp-5350.svg" },
] as const;

const CODE_PREFIX: Record<string, string> = {
  roblox: "RBLX",
  "blox-fruits": "RBLX",
  minecraft: "MCRT",
  valorant: "VLRT",
};

function randomCode(prefix: string) {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${part()}-${part()}-${part()}`;
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
          secretData: randomCode(CODE_PREFIX[p.gameSlug] ?? "CODE"),
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
