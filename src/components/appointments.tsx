import { useContext, useState } from 'react'
import { AppContext, AppContextType } from '../context/app-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from './ui/field'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { ChartAreaInteractive } from './appointments/activity-chart'
import { Separator } from './ui/separator'

export function Appointments() {
  const { appointments } = useContext(AppContext) as AppContextType

  return (
    <section className='border border-collapse rounded-md p-4'>
      <header>
        <NewAppointmentModal />
      </header>
      <Separator className='my-3' />
      <div>
        <ChartAreaInteractive />
      </div>
    </section>
  )
}

const newAppointmentSchema = z.object({
  title: z.string(),
  date: z.iso.date(),
  hours_allocated: z.number().positive(),
  project_id: z.number().positive(),
})

const NewAppointmentModal = () => {
  const [open, setOpen] = useState(false)
  const { projects, selectedProjectId } = useContext(
    AppContext
  ) as AppContextType

  const form = useForm({
    defaultValues: {
      title: '',
      project_id: selectedProjectId,
    },
    validators: {
      onChange: newAppointmentSchema,
    },
    onSubmit: async ({ value }) => {
      toast.info(`You submitted: ${JSON.stringify(value, null, 2)}`)
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
      <DialogTrigger asChild>
        <Button variant='outline' size='icon-sm' disabled={!selectedProjectId}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className='dark bg-background text-foreground'>
        <DialogHeader>
          <DialogTitle>Create new appointment</DialogTitle>
          <DialogDescription>
            Fill the form to create an appointment
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
                    <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
            <form.Field
              name='project_id'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel>Project</FieldLabel>
                      <FieldDescription>
                        For best results, select the language you speak.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={String(field.state.value)}
                      onValueChange={(value) =>
                        field.handleChange(Number(value))
                      }
                    >
                      <SelectTrigger
                        id='new-appointment-form'
                        aria-invalid={isInvalid}
                        className='min-w-[120px]'
                      >
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent position='item-aligned'>
                        <SelectItem value='auto'>Auto</SelectItem>
                        <SelectSeparator />
                        {projects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={String(project.id)}
                          >
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Field orientation='horizontal'>
            <Button
              variant='outline'
              type='submit'
              onClick={() => form.reset()}
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
