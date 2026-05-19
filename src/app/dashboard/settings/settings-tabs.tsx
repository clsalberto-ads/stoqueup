"use client"

import { useState, useEffect, useCallback, startTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2, Settings, Building2, User, BarChart3, Clock, Plus, Shield } from "lucide-react"
import { usePreferences } from "@/hooks/use-preferences"
import { updateOrgSalesDaysRange } from "@/lib/analytics-actions"

interface UserListItem {
    id: string
    email: string
    name: string
    role?: string | null
    createdAt?: string | Date
}

interface OrgData {
    id: string
    name: string
    metadata?: string | null
}

export function SettingsTabs({ user, organization }: { user: UserListItem, organization: OrgData | null }) {
    const [name, setName] = useState(user.name || "")
    const [isLoading, setIsLoading] = useState(false)
    const [isNewUserOpen, setIsNewUserOpen] = useState(false)
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserName, setNewUserName] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user")
    const [usersList, setUsersList] = useState<UserListItem[]>([user])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const { preferences, setSalesDaysRange } = usePreferences()

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true)
        try {
            const res = await fetch("/api/users")
            const data = await res.json()
            if (res.ok && data.users) {
                setUsersList(data.users)
            }
        } catch (err) {
            console.error("Erro ao buscar usuários:", err)
        } finally {
            setIsLoadingUsers(false)
        }
    }, [])

    useEffect(() => {
        if (user.role === "admin") {
            startTransition(() => fetchUsers())
        }
    }, [user.role, fetchUsers])

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            await authClient.updateUser({ name })
            toast.success("Perfil atualizado com sucesso!")
        } catch {
            toast.error("Erro ao atualizar o perfil.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSavePreferences = async (days: number) => {
        setIsLoading(true)
        try {
            await updateOrgSalesDaysRange(days)
            setSalesDaysRange(days)
            toast.success("Preferências salvas com sucesso!")
            window.location.href = `/dashboard?days=${days}`
        } catch {
            toast.error("Erro ao salvar preferências.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateUser = async () => {
        if (!newUserEmail || !newUserPassword || !newUserName) {
            toast.error("Preencha todos os campos")
            return
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newUserEmail)) {
            toast.error("Digite um e-mail válido")
            return
        }
        
        if (newUserPassword.length < 6) {
            toast.error("Senha deve ter pelo menos 6 caracteres")
            return
        }
        
        if (newUserName.trim().length < 2) {
            toast.error("Nome deve ter pelo menos 2 caracteres")
            return
        }
        
        setIsLoading(true)
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: newUserEmail.trim(),
                    name: newUserName.trim(),
                    password: newUserPassword,
                    role: newUserRole,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Erro ao criar usuário")
            } else {
                toast.success(`Usuário "${data.user?.name}" criado com sucesso!`)
                setIsNewUserOpen(false)
                setNewUserEmail("")
                setNewUserName("")
                setNewUserPassword("")
                setNewUserRole("user")
                if (user.role === "admin") {
                    fetchUsers()
                }
            }
        } catch {
            toast.error("Erro ao criar usuário")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Adicione um novo usuário para acessar o sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUserName">Nome Completo</Label>
                            <Input 
                                id="newUserName" 
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="João Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newUserEmail">E-mail</Label>
                            <Input 
                                id="newUserEmail" 
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="joao@exemplo.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newUserPassword">Senha</Label>
                            <Input 
                                id="newUserPassword" 
                                type="password"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nível de Acesso</Label>
                            <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val as "admin" | "user")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Colaborador
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Administrador
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => setIsNewUserOpen(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/80"
                            disabled={isLoading || !newUserEmail || !newUserPassword || !newUserName}
                            onClick={handleCreateUser}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Usuário
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-6 bg-muted p-1 grid grid-cols-4 w-full max-w-lg">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" /> Perfil
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="gap-2">
                        <Building2 className="h-4 w-4" /> Empresa
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Settings className="h-4 w-4" /> Sistema
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Shield className="h-4 w-4" /> Usuários
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informações Pessoais
                            </CardTitle>
                            <CardDescription>Atualize os dados da sua conta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="email">E-mail de Acesso</Label>
                                <Input id="email" value={user.email} disabled className="bg-muted cursor-not-allowed text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">O e-mail de login não pode ser alterado por motivos de segurança.</p>
                            </div>
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <Label>Nível de Acesso no Sistema</Label>
                                <div className="flex items-center gap-2">
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button 
                                className="bg-primary hover:bg-primary/80"
                                onClick={handleSaveProfile} 
                                disabled={isLoading || !name || name === user.name}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="organization">
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Dados da Empresa
                            </CardTitle>
                            <CardDescription>Configurações da sua organização no StoqueUp.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 max-w-md">
                                <Label htmlFor="orgName">Nome da Empresa</Label>
                                <Input id="orgName" defaultValue={organization?.name || "Minha Empresa"} disabled className="bg-muted text-muted-foreground" />
                                <p className="text-xs text-amber-600 font-medium">A alteração de dados corporativos será liberada em breve.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Preferências do Sistema
                            </CardTitle>
                            <CardDescription>Ajuste como o StoqueUp se comporta para você.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Período de Análise de Vendas
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Defina o período padrão para cálculo da média de vendas.
                                </p>
                                <Select 
                                    value={preferences.salesDaysRange.toString()}
                                    onValueChange={(val) => setSalesDaysRange(parseInt(val || "30"))}
                                >
                                    <SelectTrigger className="w-full max-w-xs">
                                        <SelectValue placeholder="Selecione o período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>7 dias</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="15">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>15 dias</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="30">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>30 dias</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Este período será usado para calcular a média de vendas/dia nos indicadores.
                                </p>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-base flex items-center gap-2">
                                    Notificações do Sistema
                                </Label>
                                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted">
                                    <div className="space-y-0.5">
                                        <p className="font-medium">Alertas de Estoque Mínimo</p>
                                        <p className="text-sm text-muted-foreground">Receba alertas quando um produto atingir o limite mínimo.</p>
                                    </div>
                                    <Badge variant={preferences.notificationsEnabled ? "default" : "secondary"}>
                                        {preferences.notificationsEnabled ? "Ativo" : "Inativo"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button 
                                className="bg-primary hover:bg-primary/80"
                                onClick={() => handleSavePreferences(preferences.salesDaysRange)}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Preferências
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Gerenciar Usuários
                            </CardTitle>
                            <CardDescription>Adicione e gerencie usuários do sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mb-4">
                                {user.role === "admin" && (
                                    <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsNewUserOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Usuário
                                    </Button>
                                )}
                            </div>

                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Usuário</th>
                                                <th className="px-4 py-3 font-medium">E-mail</th>
                                                <th className="px-4 py-3 font-medium">Acesso</th>
                                                <th className="px-4 py-3 font-medium text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersList.map((u) => (
                                                <tr key={u.id} className="border-b last:border-b-0">
                                                    <td className="px-4 py-3 font-medium">{u.name}</td>
                                                    <td className="px-4 py-3">{u.email}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                                            {u.role === 'admin' ? 'Administrador' : 'Colaborador'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {u.id === user.id ? (
                                                            <span className="text-xs text-muted-foreground">Você</span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {usersList.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                        Nenhum usuário cadastrado
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}