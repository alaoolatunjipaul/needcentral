import { getServerSession } from "@/lib/auth-service";
import { AccountView, type AccountSession } from "./account-view";

export const instant = false;

export default async function AccountPage() {
  const session = await getServerSession();

  const sessionUser: AccountSession | null = session
    ? { id: session.id, name: session.name, email: session.email }
    : null;

  return <AccountView sessionUser={sessionUser} />;
}