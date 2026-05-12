"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Calendar, type DateRange } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "./card"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    if (startDate) {
      const from = new Date(startDate)
      if (endDate) {
        return { from, to: new Date(endDate) }
      }
      return { from, to: undefined }
    }
    return undefined
  })

  const handleSelect = (selection: Date | DateRange | undefined) => {
    if (!selection || "from" in selection === false) {
      return
    }
    const range = selection as DateRange
    setDateRange(range)
    if (range.from && range.to) {
      onChange(range.from.toISOString().split('T')[0], range.to.toISOString().split('T')[0])
    } else if (range.from) {
      onChange(range.from.toISOString().split('T')[0], '')
    }
  }

  const clearSelection = () => {
    setDateRange(undefined)
    onChange('', '')
  }

  const hasSelection = dateRange?.from || dateRange?.to

  return (
  <Card className="mx-auto w-fit p-0">
        <CardContent className="p-0">
      <Calendar
      className="w-full"
        mode="range"
        selected={dateRange}
        onSelect={handleSelect}
        numberOfMonths={2}
        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
      />

      {hasSelection && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {dateRange?.from && <span>{dateRange.from.toLocaleDateString('pt-BR')}</span>}
            {dateRange?.from && dateRange?.to && <span className="mx-2">→</span>}
            {dateRange?.to && <span>{dateRange.to.toLocaleDateString('pt-BR')}</span>}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearSelection}>
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
  )
}
