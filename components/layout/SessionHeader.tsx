import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { getServerSession } from "@/lib/auth-service";

export async function SessionHeader() {
  const session = await getServerSession();

  return (
    <AuthProvider
      session={
        session
          ? { id: session.id, name: session.name, email: session.email }
          : null
      }
    >
      <Header />
    </AuthProvider>
  );
}