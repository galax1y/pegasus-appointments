'use client'

import * as React from 'react'
import { AppContext, AppContextType } from '@/context/app-context'

import { Activity } from '@/models/activity'

import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { parseISO } from 'date-fns'

import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

import {
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select'

import { ChevronDownIcon } from 'lucide-react'
import { Badge } from '../ui/badge'

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

// Date-only values are calendar days, not UTC instants.
function parseLocalDate(value: string | Date) {
  if (value instanceof Date) return value
  return parseISO(value)
}

export function ChartAreaInteractive() {
  const [referenceDate, setReferenceDate] = React.useState<Date>(
    () => new Date(),
  )
  const { getActivitySummaryInInterval, appointments, projects } =
    React.useContext(AppContext) as AppContextType

  const [activities, setActivities] = React.useState<Activity[]>([])

  const [timeRange, setTimeRange] = React.useState('30d')

  const filteredData = activities.filter((item) => {
    const date = parseLocalDate(item.date)

    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const totalHours = filteredData.reduce(
    (total, item) => total + Number(item.hours_allocated || 0),
    0,
  )

  const totalProjects = new Set(
    filteredData
      .flatMap((item) => item.appointments ?? [])
      .map((appointment) => appointment.project_id)
      .filter(Boolean),
  ).size

  // id -> nome, montado a partir dos appointments
  const projectNames = React.useMemo(() => {
    const map = new Map<string | number, string>()
    for (const item of filteredData) {
      for (const a of item.appointments ?? []) {
        if (!a.project_id || map.has(a.project_id)) continue
        const name = projects?.find((p) => p.id === a.project_id)?.name
        map.set(a.project_id, name ?? `Project ${a.project_id}`)
      }
    }
    return map
  }, [filteredData, projects])

  const projectKeys = React.useMemo(
    () => Array.from(projectNames.keys()),
    [projectNames],
  )

  // uma linha por dia: { date, p_12: 3, p_15: 2, ... }
  const chartData = React.useMemo(
    () =>
      filteredData.map((item) => {
        const row: Record<string, string | number> = { date: item.date }
        for (const a of item.appointments ?? []) {
          if (!a.project_id) continue
          const key = `p_${a.project_id}`
          row[key] = Number(row[key] ?? 0) + Number(a.hours_allocated || 0)
        }
        return row
      }),
    [filteredData],
  )

  const chartConfig = React.useMemo(
    () =>
      Object.fromEntries(
        projectKeys.map((id, i) => [
          `p_${id}`,
          {
            label: projectNames.get(id),
            color: PALETTE[i % PALETTE.length],
          },
        ]),
      ) satisfies ChartConfig,
    [projectKeys, projectNames],
  )
  React.useEffect(() => {
    getActivitySummaryInInterval(
      addMonths(referenceDate, -1.5),
      addMonths(referenceDate, +1.5),
    ).then((response) => setActivities(response))
  }, [referenceDate, appointments])

  return (
    <Card className='pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            Showing allocated hours for the selected date
          </CardDescription>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date'
              className='w-48 justify-between font-normal'
            >
              {referenceDate ? (
                format(referenceDate, 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side='bottom'
            className='w-auto p-0 overflow-hidden'
            align='start'
          >
            <Calendar
              autoFocus
              mode='single'
              selected={referenceDate}
              captionLayout='dropdown'
              onSelect={(date) => {
                if (!date) return
                setReferenceDate(date)
              }}
            />
          </PopoverContent>
        </Popover>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className='hidden w-40 rounded-lg sm:ml-auto sm:flex'
            aria-label='Select a value'
          >
            <SelectValue placeholder='Last 3 months' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='90d' className='rounded-lg'>
              Last 3 months
            </SelectItem>
            <SelectItem value='30d' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='7d' className='rounded-lg'>
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-62.5 w-full'
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine
              axisLine
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                parseLocalDate(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <ChartTooltip
              cursor
              content={
                <ChartTooltipContent
                  indicator='dot'
                  labelClassName='border-b mb-1'
                  labelFormatter={(value) => (
                    <span>
                      {format(parseLocalDate(value), 'P', { locale: ptBR })}
                    </span>
                  )}
                />
              }
            />
            {projectKeys.map((id) => (
              <Bar
                key={id}
                dataKey={`p_${id}`}
                stackId='a'
                fill={`var(--color-p_${id})`}
              />
            ))}
          </BarChart>
        </ChartContainer>
        <div className='flex flex-wrap items-center justify-between gap-4 border-t px-4 pt-4 text-sm'>
          <div>
            <span className='text-muted-foreground mr-2'>
              Total hours worked:
            </span>
            <Badge variant='secondary' className='font-semibold'>
              {totalHours.toLocaleString()} hours
            </Badge>
          </div>
          <div>
            <span className='text-muted-foreground mr-2'>
              Projects worked on:
            </span>
            <Badge variant='secondary' className='font-semibold'>
              {totalProjects}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
