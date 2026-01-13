import { useContext, useState } from 'react'
import { AppContext, AppContextType } from '@/context/app-context'

import * as z from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useForm } from '@tanstack/react-form'

import { Input } from '../ui/input'
import { Field } from '../ui/field'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { FieldGroup, FieldLabel, FieldError } from '../ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '../ui/dialog'

import { ChevronDownIcon, CirclePlus } from 'lucide-react'

const newAppointmentSchema = z.object({
  title: z
    .string()
    .min(5, { error: 'Please be more descriptive (5+ characters)' }),
  date: z.date({ error: 'Please select a valid date.' }),
  hours_allocated: z
    .number({ error: 'Please fill this field (0-24)h' })
    .positive({ error: 'Please fill this field (0-24)h' })
    .max(24, { error: 'There is 24 hours in a day bro.' }),
  project_id: z
    .number({ error: 'Insert how many hours have been allocated.' })
    .positive({ error: 'Insert how many hours have been allocated.' }),
})

interface NewAppointmentModal {
  selectedProjectId: number | null
  trigger: React.ReactNode
}

export function NewAppointmentModal({
  trigger,
  selectedProjectId,
}: NewAppointmentModal) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const { createAppointment, projects } = useContext(
    AppContext
  ) as AppContextType

  const form = useForm({
    defaultValues: {
      project_id: selectedProjectId,
      title: '',
      date: new Date(),
      hours_allocated: 0,
    },
    validators: {
      onSubmit: newAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!date) {
        toast.error('Select a valid date.')
        return
      }

      toast.promise(
        createAppointment(
          value.title,
          date.toISOString(),
          value.hours_allocated
        ),
        {
          success: () => {
            setOpen(false)
            return 'Appointment was created successfully.'
          },
          error: 'Something went wrong while creating the appointment.',
        }
      )
    },
    onSubmitInvalid: () => {
      toast.error('Please review invalid fields.')
    },
  })

  const handleOpen = (newState: boolean) => {
    const isOpening = newState === true
    if (isOpening && !selectedProjectId) {
      setOpen(false)
      return toast.error(
        'First select a project to allocate the new appointment.'
      )
    }
    setOpen(newState)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='bg-background text-foreground'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            <CirclePlus size={20} className='mr-2' />
            Create new appointment
          </DialogTitle>
          <DialogDescription>
            Project: {projects.find((p) => p.id === selectedProjectId)?.name}
          </DialogDescription>
        </DialogHeader>

        <form
          id='new-appointment-form'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name='title'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='Working on x...'
                      aria-invalid={isInvalid}
                      autoComplete='off'
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <div className='grid grid-cols-2 gap-4'>
              <form.Field
                name='date'
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !!date === false

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Select Date</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            id='date'
                            className='w-48 justify-between font-normal'
                          >
                            {date ? (
                              format(date, 'PPP')
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
                            selected={date}
                            captionLayout='dropdown'
                            onSelect={(date) => {
                              setDate(date)
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name='hours_allocated'
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Hours allocated
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const isNan = Number.isNaN(e.target.value)

                          field.handleChange(
                            !isNan ? Number(e.target.value) : 0
                          )
                        }}
                        placeholder='Insert how many hours you have worked on this appointment for this date.'
                        aria-invalid={isInvalid}
                        autoComplete='off'
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Field orientation='horizontal'>
            <Button
              variant='outline'
              type='submit'
              onClick={() => {
                setDate(undefined)
                form.reset()
              }}
            >
              Reset
            </Button>

            <Button type='submit' form='new-appointment-form'>
              Submit
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
