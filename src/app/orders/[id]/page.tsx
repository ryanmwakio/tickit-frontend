import { OrderDetailPageClient } from "@/components/orders/order-detail-page-client";

export const metadata = {
  title: "Order Details | Tixhub",
  description: "View your order details and tickets",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <OrderDetailPageClient orderId={id} />;
}
