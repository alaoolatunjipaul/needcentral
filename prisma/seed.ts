import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { categories, products, sellers } from "@/lib/data";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    await db.category.createMany({
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        tagline: c.tagline,
      })),
      skipDuplicates: true,
    });

    await db.seller.createMany({
      data: sellers.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        description: s.description,
        joinedYear: s.joinedYear,
      })),
      skipDuplicates: true,
    });

    await db.product.createMany({
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.category,
        sellerId: p.sellerId ?? null,
        priceCents: p.priceCents,
        compareAtPriceCents: p.compareAtPriceCents ?? null,
        image: p.image,
        description: p.description,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        featured: p.featured ?? false,
        originCountry: p.origin?.country ?? null,
        originCountryCode: p.origin?.countryCode ?? null,
        madeInAfrica: p.origin?.madeInAfrica ?? null,
        ratingDistribution: p.ratingDistribution
          ? (p.ratingDistribution as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      })),
      skipDuplicates: true,
    });

    console.log(
      [
        `Seeded ${categories.length} categories`,
        `${sellers.length} sellers`,
        `${products.length} products`,
      ].join(", ") + "."
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
