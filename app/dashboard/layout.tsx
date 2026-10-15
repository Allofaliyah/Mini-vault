
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserProvider } from "@/context/UserContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <UserProvider>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />

          <main className="min-h-screen md:ml-64">
            {children}
          </main>
        </div>
      </UserProvider>
    </ProtectedRoute>
  );
}
