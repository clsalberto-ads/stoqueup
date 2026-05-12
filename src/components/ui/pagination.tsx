"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination = ({ className, page, totalPages, onPageChange, ...props }: PaginationProps) => {
    if (totalPages <= 1) return null

    const pages = getPaginationItems(page, totalPages)

    return (
        <nav aria-label="paginação" className={cn("flex items-center justify-center gap-1", className)} {...props}>
            <Button
                variant="ghost"
                size="icon"
                className="gap-1.5"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
            </Button>

            {pages.map((p, i) => (
                p === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-2">
                        <MoreHorizontal className="h-4 w-4" />
                    </span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "default" : "ghost"}
                        size="icon"
                        className="min-w-[2.5rem]"
                        onClick={() => onPageChange(p as number)}
                    >
                        {p}
                    </Button>
                )
            ))}

            <Button
                variant="ghost"
                size="icon"
                className="gap-1.5"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
            </Button>
        </nav>
    )
}

function getPaginationItems(page: number, totalPages: number): (number | string)[] {
    const items: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
            items.push(i)
        } else if (items[items.length - 1] !== 'ellipsis') {
            items.push('ellipsis')
        }
    }

    return items
}

export { Pagination }