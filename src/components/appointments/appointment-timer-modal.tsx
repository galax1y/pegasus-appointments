'use client'

import * as React from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Pause, Play, RotateCcw } from 'lucide-react'

import { AppContext, AppContextType } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// If you already export this schema somewhere, import it instead.
const newAppointmentSchema = z.object({
  title: z
    .string()
    .min(5, { error: 'Please be more descriptive (5+ characters)' }),
  date: z.date({ error: 'Please select a valid date.' }),
  hours_allocated: z
    .number({ error: 'Please fill this field (0-24)h' })
    .positive({ error: 'Timer is too short (min ~18s).' })
    .max(24, { error: 'There is 24 hours in a day bro.' }),
  project_id: z
    .number({ error: 'Please select a project.' })
    .positive({ error: 'Please select a project.' }),
})

type FieldErrors = Partial<
  Record<keyof z.infer<typeof newAppointmentSchema>, string[]>
>

interface AppointmentTimerModalProps {
  selectedProjectId: number | null
  trigger: React.ReactNode
}

function formatElapsed(ms: number) {
  const total = Math.floor(ms / 1000)
  const h = String(Math.floor(total / 3600)).padStart(2, '0')
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function AppointmentTimerModal({
  selectedProjectId,
  trigger,
}: AppointmentTimerModalProps) {
  const { createAppointment, projects } = React.useContext(
    AppContext,
  ) as AppContextType

  const [open, setOpen] = React.useState(false)

  // Timer lives here (not inside DialogContent), so closing the modal
  // doesn't lose or stop it.
  const [accumulatedMs, setAccumulatedMs] = React.useState(0)
  const [startedAt, setStartedAt] = React.useState<number | null>(null)
  const [now, setNow] = React.useState(() => Date.now())

  const [title, setTitle] = React.useState('')
  const [date, setDate] = React.useState<Date>(() => new Date())
  const [projectId, setProjectId] = React.useState<number | null>(
    selectedProjectId,
  )
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setProjectId(selectedProjectId)
  }, [selectedProjectId])

  React.useEffect(() => {
    if (startedAt === null) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [startedAt])

  const isRunning = startedAt !== null
  const elapsedMs = accumulatedMs + (startedAt !== null ? now - startedAt : 0)

  const start = () => {
    const t = Date.now()
    setNow(t)
    setStartedAt(t)
  }

  const pause = () => {
    if (startedAt === null) return
    setAccumulatedMs((acc) => acc + (Date.now() - startedAt))
    setStartedAt(null)
  }

  const resetTimer = () => {
    setAccumulatedMs(0)
    setStartedAt(null)
  }

  const MIN_MS = 60_000

  const handleSave = async () => {
    const rawMs =
      accumulatedMs + (startedAt !== null ? Date.now() - startedAt : 0)
    pause()

    // nothing tracked at all -> nothing to save
    if (rawMs === 0) return

    const finalMs = Math.max(rawMs, MIN_MS)

    const parsed = newAppointmentSchema.safeParse({
      title,
      date,
      hours_allocated: finalMs / 3_600_000,
      project_id: selectedProjectId,
    })

    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors)
      return
    }

    setErrors({})
    setSaving(true)
    try {
      await createAppointment(
        parsed.data.title,
        format(parsed.data.date, 'yyyy-MM-dd'),
        parsed.data.hours_allocated,
      )
      resetTimer()
      setTitle('')
      setDate(new Date())
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Appointment timer</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-center gap-3 py-2'>
          <span className='font-mono text-5xl tabular-nums'>
            {formatElapsed(elapsedMs)}
          </span>
          <div className='flex gap-2'>
            <Button onClick={isRunning ? pause : start}>
              {isRunning ? (
                <>
                  <Pause className='size-4' /> Pause
                </>
              ) : (
                <>
                  <Play className='size-4' />{' '}
                  {elapsedMs > 0 ? 'Resume' : 'Start'}
                </>
              )}
            </Button>
            <Button
              variant='outline'
              onClick={resetTimer}
              disabled={elapsedMs === 0}
            >
              <RotateCcw className='size-4' /> Reset
            </Button>
          </div>
          {errors.hours_allocated && (
            <p className='text-sm text-destructive'>
              {errors.hours_allocated[0]}
            </p>
          )}
        </div>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='timer-title'>Title</Label>
            <Input
              id='timer-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='What did you work on?'
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title[0]}</p>
            )}
          </div>

          <div className='grid gap-2'>
            <Label>Project</Label>
            <Select
              value={projectId?.toString() ?? ''}
              onValueChange={(v) => setProjectId(Number(v))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a project' />
              </SelectTrigger>
              <SelectContent>
                {projects
                  ?.filter((p) => p.deactivated_at === null)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.project_id && (
              <p className='text-sm text-destructive'>{errors.project_id[0]}</p>
            )}
          </div>

          <div className='grid gap-2'>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline' className='justify-start font-normal'>
                  {format(date, 'PPP', { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  captionLayout='dropdown'
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className='text-sm text-destructive'>{errors.date[0]}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving || elapsedMs === 0}>
            Save appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
