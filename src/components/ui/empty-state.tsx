import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
    iconClassName?: string
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    iconClassName
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 text-center",
            className
        )}>
            <div className={cn(
                "h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground",
                iconClassName
            )}>
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="text-muted-foreground max-w-xs mt-1">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    )
}