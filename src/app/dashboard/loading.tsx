import { Loader2, Package } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
                <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2 text-primary-foreground font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando ...</span>
            </div>
        </div>
    )
}
