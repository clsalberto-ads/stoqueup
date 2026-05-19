"use client"

import Image from "next/image"
import { LogOut, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 py-1.5 pr-2 rounded-lg hover:bg-muted transition-colors">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium shrink-0">
            {user.image ? (
              <Image src={user.image} alt={displayName} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
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
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
