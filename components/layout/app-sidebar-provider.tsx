import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}){
 return(
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        
        {/* Main content - each page will have its own header */}
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
 )
}