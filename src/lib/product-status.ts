import { AlertCircle, AlertTriangle, CheckCircle, LucideIcon } from "lucide-react"

export type ProductStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY'
export type ProductionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProductStatusConfig {
    label: string
    badge: 'destructive' | 'warning' | 'success' | 'secondary'
    textColor: string
    bgColor: string
    borderColor: string
    iconColor: string
    icon: LucideIcon
}

export interface ProductionStatusConfig {
    label: string
    variant: 'secondary' | 'warning' | 'success'
    iconName: 'Clock' | 'Package' | 'CheckCircle'
    buttonText: string
    buttonVariant: 'default' | 'outline'
    buttonColor?: string
}

export const PRODUCT_STATUS: Record<ProductStatus, ProductStatusConfig> = {
    CRITICAL: {
        label: 'Crítico',
        badge: 'destructive',
        textColor: 'text-destructive',
        bgColor: 'bg-destructive/15',
        borderColor: 'border-destructive/25',
        iconColor: 'text-destructive',
        icon: AlertCircle
    },
    WARNING: {
        label: 'Atenção',
        badge: 'warning',
        textColor: 'text-warning',
        bgColor: 'bg-warning/15',
        borderColor: 'border-warning/25',
        iconColor: 'text-warning',
        icon: AlertTriangle
    },
    HEALTHY: {
        label: 'Saudável',
        badge: 'success',
        textColor: 'text-success',
        bgColor: 'bg-success/15',
        borderColor: 'border-success/25',
        iconColor: 'text-success',
        icon: CheckCircle
    }
}

export const PRODUCTION_STATUS: Record<ProductionStatus, ProductionStatusConfig> = {
    PENDING: {
        label: 'Pendente',
        variant: 'secondary',
        iconName: 'Clock',
        buttonText: 'Iniciar Produção',
        buttonVariant: 'default'
    },
    IN_PROGRESS: {
        label: 'Produzindo',
        variant: 'warning',
        iconName: 'Package',
        buttonText: 'Concluir Produção',
        buttonVariant: 'default',
        buttonColor: 'bg-success hover:bg-success/80'
    },
    COMPLETED: {
        label: 'Concluído',
        variant: 'success',
        iconName: 'CheckCircle',
        buttonText: 'Concluído',
        buttonVariant: 'outline'
    }
}

export function getStatusConfig(status: ProductStatus): ProductStatusConfig {
    return PRODUCT_STATUS[status]
}

export function getProductionConfig(status: ProductionStatus): ProductionStatusConfig {
    return PRODUCTION_STATUS[status]
}