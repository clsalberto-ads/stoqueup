"use client"

import { LogOut, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserMenuProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const displayName = user.name || user.email?.split("@")[0] || "Usuário"
  const avatarInitials = displayName.charAt(0).toUpperCase()
  const userEmail = user.email || ""

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 py-1.5 pr-2 rounded-lg hover:bg-muted transition-colors">
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
          {user.image ? (
            <img src={user.image} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span>{avatarInitials}</span>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">{userEmail}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
      </button>

      <div className="absolute right-0 top-full mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="rounded-lg border bg-popover shadow-md p-1">
          <div className="px-3 py-2 border-b sm:hidden">
            <p className="font-medium text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    toast.success("Até logo!")
                    router.push("/login")
                  }
                }
              })
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  )
}