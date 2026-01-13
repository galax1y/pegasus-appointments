'use client'

import * as React from 'react'
import { AppContext, AppContextType } from '@/context/app-context'

import { Activity } from '@/models/activity'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { addMonths, format } from 'date-fns'

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
  ChartLegend,
  ChartTooltip,
  ChartContainer,
  ChartLegendContent,
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

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  hours: {
    label: 'hours',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [referenceDate, setReferenceDate] = React.useState<Date>(
    () => new Date()
  )
  const { getActivitySummaryInInterval, appointments } = React.useContext(
    AppContext
  ) as AppContextType

  const [activities, setActivities] = React.useState<Activity[]>([])

  const [timeRange, setTimeRange] = React.useState('90d')

  const filteredData = activities.filter((item) => {
    const date = new Date(item.date)
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

  React.useEffect(() => {
    getActivitySummaryInInterval(
      addMonths(referenceDate, -1.5),
      addMonths(referenceDate, +1.5)
    ).then((response) => setActivities(response))
  }, [referenceDate, appointments])

  return (
    <Card className='pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            Showing appointment allocated hours for the selected reference date
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
          <BarChart data={filteredData}>
            <defs>
              <linearGradient id='fillDesktop' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-desktop)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillHours' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-hours)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-hours)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return format(value, 'P')
                  }}
                  indicator='dot'
                />
              }
            />
            <Bar
              dataKey='hours_allocated'
              fill='url(#fillHours)'
              stroke='var(--color-hours)'
              stackId='a'
            />

            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
