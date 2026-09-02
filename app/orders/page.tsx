import { getServerSession } from "@/lib/auth-service";
import { listOrdersByUserId } from "@/lib/orders-data";
import { OrdersView } from "./orders-view";

export const instant = false;

export default async function OrdersPage() {
  const session = await getServerSession();
  const dbOrders = session ? await listOrdersByUserId(session.id) : null;
  return <OrdersView dbOrders={dbOrders} />;
}