import { getProducts, getCategories } from "@/app/actions/productActions";
import { getHomepageConfig } from "@/app/actions/homepageActions";
import HomeClient from "./HomeClient";

export const revalidate = 0;

export default async function HomePage() {
  const [products, categories, homepageConfig] = await Promise.all([
    getProducts(),
    getCategories(),
    getHomepageConfig()
  ]);

  return (
    <HomeClient 
      initialProducts={products} 
      initialCategories={categories} 
      homepageConfig={homepageConfig} 
    />
  );
}
