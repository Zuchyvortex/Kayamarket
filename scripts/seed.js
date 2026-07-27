const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { id: "c-1", name: "Rice & Grains", slug: "rice", description: "Premium local parboiled and imported rice.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60" },
  { id: "c-2", name: "Beans & Tubers", slug: "beans", description: "Fresh Oloyin beans, yam, and sweet potatoes.", image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60" },
  { id: "c-3", name: "Fresh Produce", slug: "produce", description: "Farm fresh tomatoes, peppers, and vegetables.", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60" },
  { id: "c-4", name: "Meat & Poultry", slug: "meat", description: "Hygienically processed beef, chicken, and fish.", image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60" },
  { id: "c-5", name: "Oils & Spices", slug: "oils", description: "Original palm oil, groundnut oil, and local spices.", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60" },
  { id: "c-6", name: "Packaged Foods", slug: "packaged", description: "Canned goods, noodles, and packaged snacks.", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop&q=60" }
];

const PRODUCTS = [
  { id: "p-1", name: "Kaya Premium Parboiled Rice (50kg)", slug: "kaya-premium-rice-50kg", description: "100% stone-free, long grain parboiled rice. Perfectly processed and packed.", price: 75000, inventory: 45, categorySlug: "rice", sku: "RICE-50KG-001", weight: "50kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", isFeatured: true, isBestSeller: true, isNewArrival: false },
  { id: "p-2", name: "Fresh Roma Tomatoes (Basket)", slug: "fresh-roma-tomatoes-basket", description: "Handpicked, firm, and fresh Roma tomatoes straight from the farm.", price: 25000, inventory: 12, categorySlug: "produce", sku: "TOM-BSK-001", weight: "15kg", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60", isFeatured: true, isBestSeller: true, isNewArrival: true },
  { id: "p-3", name: "Honey Beans (Oloyin) - 25kg", slug: "honey-beans-25kg", description: "Clean, naturally sweet Nigerian brown beans. Zero weevils.", price: 42000, inventory: 8, categorySlug: "beans", sku: "BNS-OLY-025", weight: "25kg", image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60", isFeatured: false, isBestSeller: false, isNewArrival: false },
  { id: "p-4", name: "Original Palm Oil (25 Liters)", slug: "original-palm-oil-25l", description: "Unadulterated, grade A red palm oil sourced from the East.", price: 30000, inventory: 30, categorySlug: "oils", sku: "OIL-PLM-025", weight: "25L", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60", isFeatured: false, isBestSeller: true, isNewArrival: false },
  { id: "p-5", name: "Smoked Catfish (Pack of 10)", slug: "smoked-catfish-pack-10", description: "Well-dried, sand-free smoked catfish. Perfect for traditional soups.", price: 15000, inventory: 25, categorySlug: "meat", sku: "FSH-SMK-010", weight: "1kg", image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60", isFeatured: true, isBestSeller: false, isNewArrival: true },
  { id: "p-6", name: "Ijebu Garri (Paint Bucket)", slug: "ijebu-garri-paint", description: "Extra dry, pleasantly sour Ijebu Garri. Excellent for drinking or making eba.", price: 4500, inventory: 150, categorySlug: "rice", sku: "GRI-IJB-001", weight: "4kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", isFeatured: false, isBestSeller: true, isNewArrival: false }
];

async function main() {
  console.log("Seeding Database...");
  
  // Seed Categories
  for (const cat of CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
        }
      });
    } catch(e) { console.log("Category exists:", cat.slug); }
  }

  // Seed Products
  for (const prod of PRODUCTS) {
    try {
      let category = await prisma.category.findUnique({ where: { slug: prod.categorySlug } });
      if (!category) {
        category = await prisma.category.findFirst();
      }
      if (category) {
        await prisma.product.create({
          data: {
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            price: prod.price,
            inventory: prod.inventory,
            sku: prod.sku,
            images: [prod.image],
            categoryId: category.id,
            isFeatured: prod.isFeatured,
            isBestSeller: prod.isBestSeller,
            isNewArrival: prod.isNewArrival,
            isActive: true
          }
        });
      }
    } catch(e) { console.log("Product error:", prod.slug); }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
