"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
        })

        if (error) {
            toast.error(error.message || "Erro ao realizar login")
            setIsLoading(false)
        } else {
            toast.success("Bem-vindo de volta!")
            router.push("/dashboard")
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">StoqueUp</h1>
                    <p className="text-slate-400 mt-1">Gestão inteligente de estoque</p>
                </div>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-white text-center">Entrar</CardTitle>
                        <CardDescription className="text-slate-400 text-center">
                            Acesse sua conta para gerenciar seu negócio
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="admin@stoqueup.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-blue-600"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-300">Senha</Label>
                                    <button type="button" className="text-xs text-blue-500 hover:text-blue-400 font-medium">
                                        Esqueceu a senha?
                                    </button>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-blue-600"
                                    required
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : "Entrar no Sistema"}
                            </Button>
                        </form>

                        <div className="mt-8 flex items-center gap-2 p-3 rounded-lg bg-blue-900/20 border border-blue-900/30 text-blue-400 text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>Utilize as credenciais de administrador configuradas no ambiente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
