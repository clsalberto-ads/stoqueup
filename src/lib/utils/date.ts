export function formatRelativeTime(date: Date | string): string {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return "agora mesmo"
    if (diffMin < 60) return `${diffMin}m atrás`
    if (diffHour < 24) return `${diffHour}h atrás`
    if (diffDay === 1) return "ontem"
    if (diffDay < 7) return `${diffDay}d atrás`
    
    return then.toLocaleDateString("pt-BR", { 
        day: "2-digit", 
        month: "2-digit",
        year: then.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
    })
}