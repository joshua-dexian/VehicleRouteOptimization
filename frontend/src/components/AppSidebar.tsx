import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import { LayoutDashboard, Package, Route, Users, Settings, HelpCircle, BarChart3 } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    isActive: true,
    url: "/",
  },
  {
    title: "Orders",
    icon: Package,
    isActive: false,
    url: "/orders",
  },
  {
    title: "Routes",
    icon: Route,
    isActive: false,
    url: "/routes",
    badge: "1",
  },
  {
    title: "Drivers",
    icon: Users,
    isActive: false,
    url: "/drivers",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    isActive: false,
    url: "/analytics",
    badge: "New",
  }
]

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Sidebar className={cn("w-64", className)}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <img 
            src="/lovable-uploads/c87bfc54-bddf-445b-bee1-4333d507a9f8.png" 
            alt="dexian" 
            className="h-8"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="w-full justify-between"
                  >
                    <a href={item.url || "#"} className="flex items-center">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-agriculture-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full"
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"} Theme
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
