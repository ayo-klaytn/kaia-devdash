import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <section className="flex flex-col w-full">
        <Header />
        {children}
      </section>
    </SidebarProvider>
  );
}
