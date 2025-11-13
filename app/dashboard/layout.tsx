import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardFooter } from "@/components/dashboard-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <section className="flex flex-col w-full min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <DashboardFooter />
      </section>
    </SidebarProvider>
  );
}
