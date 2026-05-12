import { AppSidebar } from "@/components/layout/sidebar"
import { UserMenu } from "@/components/layout/user-menu"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/lib/auth"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  
  try {
    const cookieStore = await cookies()
    const headersList = await headers()
    session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieStore.toString(),
        ...Object.fromEntries(headersList.entries())
      })
    })
  } catch {
    // Session not available - user not logged in
  }

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
              {session?.user ? (
                <UserMenu user={session.user} />
              ) : null}
            </div>
          </header>
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}