"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  BarChart3,
  Settings,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAbility } from "@/components/providers/ability-provider"
import type { Subjects, Actions } from "@/lib/ability"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  subject: Subjects
  action?: Actions
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, subject: "Dashboard" },
  { title: "Vendas", url: "/dashboard/sales", icon: ShoppingCart, subject: "Sales" },
  { title: "Produtos", url: "/dashboard/products", icon: Package, subject: "Products" },
  { title: "Produção", url: "/dashboard/production", icon: Factory, subject: "Production" },
  { title: "Indicadores", url: "/dashboard/metrics", icon: BarChart3, subject: "Metrics" },
]

const footerNavItems: NavItem[] = [
  { title: "Configurações", url: "/dashboard/settings", icon: Settings, subject: "Settings" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const ability = useAbility()

  const visibleNavItems = navItems.filter((item) =>
    ability.can(item.action ?? "read", item.subject),
  )

  const visibleFooterItems = footerNavItems.filter((item) =>
    ability.can(item.action ?? "read", item.subject),
  )

  return (
    <Sidebar collapsible="icon" {...props} className="bg-sidebar">
      <SidebarHeader className="flex-row flex-nowrap items-center gap-2 py-2 w-fit">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <Package className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">StoqueUp</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />} tooltip={item.title}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {visibleFooterItems.length > 0 && (
        <SidebarFooter>
          <SidebarMenu>
            {visibleFooterItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.url} />} tooltip={item.title}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
