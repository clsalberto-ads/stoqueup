"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DateRange {
  from?: Date
  to?: Date
}

interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange | undefined
  onSelect?: (date: Date | DateRange | undefined) => void
  defaultMonth?: Date
  numberOfMonths?: number
  disabled?: (date: Date) => boolean
  className?: string
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  numberOfMonths = 1,
  disabled,
  className
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date())

  const getRange = () => {
    if (mode === "range" && selected && "from" in selected) {
      return selected as DateRange
    }
    return undefined
  }

  const range = getRange()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"]

  const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

  const isDateSelected = (date: Date) => {
    if (!selected) return false
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString()
    }
    if (mode === "range" && selected && "from" in selected) {
      const r = selected as DateRange
      if (r.from && date.toDateString() === r.from.toDateString()) return true
      if (r.to && date.toDateString() === r.to.toDateString()) return true
    }
    return false
  }

  const isInRange = (date: Date) => {
    if (mode !== "range" || !range || !range.from || !range.to) return false
    return date > range.from && date < range.to
  }

  const handleDayClick = (date: Date) => {
    if (disabled?.(date)) return

    if (mode === "single") {
      onSelect?.(date)
    } else {
      const r = range
      if (!r?.from || (r.from && r.to)) {
        onSelect?.({ from: date, to: undefined })
      } else {
        if (date < r.from) {
          onSelect?.({ from: date, to: r.from })
        } else {
          onSelect?.({ from: r.from, to: date })
        }
      }
    }
  }

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm">{MONTHS[month]} {year}</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {DAYS.map((day, i) => (
            <div key={i} className="text-[10px] text-muted-foreground font-medium py-1.5 text-center">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            if (!day) {
              return <div key={i} className="aspect-square" />
            }

            const date = new Date(year, month, day)
            const selectedDay = isDateSelected(date)
            const inRange = isInRange(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isDisabled = disabled?.(date) || false

            return (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                disabled={isDisabled}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs transition-colors",
                  isDisabled && "text-muted-foreground/40 cursor-not-allowed",
                  !isDisabled && "hover:bg-muted cursor-pointer",
                  isToday && !selectedDay && "border border-primary/50",
                  selectedDay && "bg-primary text-primary-foreground",
                  inRange && !selectedDay && "bg-muted"
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const months: Date[] = []
  for (let i = 0; i < numberOfMonths; i++) {
    months.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1))
  }

  return (
    <div className={cn("flex items-center", className)}>
      <button onClick={prevMonth} className="p-1.5 hover:bg-muted rounded shrink-0">
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex gap-4 overflow-hidden">
        {months.map((m, i) => (
          <div key={i}>
            {renderMonth(m)}
          </div>
        ))}
      </div>

      <button onClick={nextMonth} className="p-1.5 hover:bg-muted rounded shrink-0">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}