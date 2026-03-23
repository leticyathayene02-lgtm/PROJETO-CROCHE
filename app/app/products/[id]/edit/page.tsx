import { notFound } from "next/navigation";
import { getProduct } from "@/app/app/products/actions";
import { EditProductForm } from "./edit-product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
