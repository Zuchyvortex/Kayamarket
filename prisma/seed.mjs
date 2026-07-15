import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // 1. Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kayamarket.com' },
    update: {},
    create: {
      email: 'admin@kayamarket.com',
      passwordHash: '$2a$10$X7...mockedhash...', // Mocked for now, in real app use bcrypt
      firstName: 'Kaya',
      lastName: 'Admin',
      phoneNumber: '+2348000000000',
      role: 'ADMIN',
    },
  });
  console.log('Created Admin User:', adminUser.email);

  // 2. Create Categories
  const categoriesData = [
    { name: 'Fresh Vegetables', slug: 'fresh-vegetables', description: 'Farm fresh leafy greens and vegetables', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80' },
    { name: 'Tubers & Roots', slug: 'tubers-roots', description: 'Yam, potatoes, and cassava', imageUrl: 'https://images.unsplash.com/photo-1596484552834-3a57fd8cb689?auto=format&fit=crop&q=80' },
    { name: 'Grains & Pasta', slug: 'grains-pasta', description: 'Rice, beans, garri, and pasta', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80' },
    { name: 'Proteins & Meat', slug: 'proteins-meat', description: 'Fresh beef, chicken, fish, and eggs', imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80' },
    { name: 'Oils & Spices', slug: 'oils-spices', description: 'Palm oil, vegetable oil, and cooking spices', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(category);
    console.log(`Created Category: ${category.name}`);
  }

  // 3. Create Sample Products
  const productsData = [
    {
      name: 'Fresh Tomatoes (Basket)',
      slug: 'fresh-tomatoes-basket',
      description: 'A large basket of farm-fresh, handpicked tomatoes perfect for stew.',
      price: 15000,
      inventory: 50,
      sku: 'VEG-TOM-001',
      categoryId: categories.find(c => c.slug === 'fresh-vegetables').id,
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80'],
      isFeatured: true,
    },
    {
      name: 'Premium Parboiled Rice (50kg)',
      slug: 'premium-parboiled-rice-50kg',
      description: 'High-quality, long-grain parboiled rice.',
      price: 75000,
      inventory: 100,
      sku: 'GRN-RIC-001',
      categoryId: categories.find(c => c.slug === 'grains-pasta').id,
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80'],
      isFeatured: true,
    },
    {
      name: 'Abuja Yam (Medium Tuber)',
      slug: 'abuja-yam-medium-tuber',
      description: 'Sweet and starchy premium Abuja yam.',
      price: 3500,
      inventory: 200,
      sku: 'TUB-YAM-001',
      categoryId: categories.find(c => c.slug === 'tubers-roots').id,
      images: ['https://images.unsplash.com/photo-1596484552834-3a57fd8cb689?auto=format&fit=crop&q=80'],
      isFeatured: false,
    },
    {
      name: 'Red Palm Oil (5 Litres)',
      slug: 'red-palm-oil-5l',
      description: 'Unadulterated local red palm oil.',
      price: 8500,
      inventory: 80,
      sku: 'OIL-PALM-001',
      categoryId: categories.find(c => c.slug === 'oils-spices').id,
      images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80'],
      isFeatured: true,
    },
    {
      name: 'Live Broiler Chicken',
      slug: 'live-broiler-chicken',
      description: 'Healthy, well-fed broiler chicken (approx 2.5kg).',
      price: 12000,
      inventory: 30,
      sku: 'PRO-CHK-001',
      categoryId: categories.find(c => c.slug === 'proteins-meat').id,
      images: ['https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80'],
      isFeatured: false,
    }
  ];

  for (const prod of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
    console.log(`Created Product: ${product.name}`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
