import { useContext } from 'react'
import { AppContext, AppContextType } from '../context/app-context'

import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ChartAreaInteractive } from './appointments/activity-chart'
import { NewAppointmentModal } from './appointments/new-appointment-modal'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './ui/dropdown-menu'

import {
  Trash,
  Folder,
  Calendar,
  CalendarX,
  MoreHorizontal,
  TimerIcon,
  PlusIcon,
} from 'lucide-react'
import { AppointmentTimerModal } from './appointments/appointment-timer-modal'

export function Appointments() {
  const { projects, selectedProjectId, appointments, deleteAppointment } =
    useContext(AppContext) as AppContextType

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const handleDelete = async (id: number) => {
    return toast.promise(deleteAppointment(id), {
      success: 'Appointment was successfully deleted.',
      error: (err) =>
        `Something went wrong while deleting the appointment. ${err}`,
    })
  }

  return (
    <section className='rounded-md h-fit'>
      <div className='flex flex-col'>
        <ChartAreaInteractive />
        <Separator className='my-3' />
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Folder className='h-5 w-5 text-muted-foreground' />

              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold leading-none'>
                  {selectedProject?.name ?? 'Select a project'}
                </h2>

                <span className='mt-1 text-xs text-muted-foreground'>
                  {selectedProject?.name
                    ? `${selectedProject.name}'s`
                    : "Select a project's"}{' '}
                  latest appointments
                </span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <AppointmentTimerModal
                selectedProjectId={selectedProjectId}
                trigger={
                  <Button size='sm' disabled={!selectedProjectId}>
                    <TimerIcon /> Cronometer
                  </Button>
                }
              />
              <NewAppointmentModal
                selectedProjectId={selectedProjectId}
                trigger={
                  <Button size='sm' disabled={!selectedProjectId}>
                    <PlusIcon /> New appointment
                  </Button>
                }
              />
            </div>
          </div>
          <div className='space-y-2'>
            {appointments.filter((a) => a.project_id === selectedProjectId)
              .length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
                <CalendarX className='h-10 w-10 text-muted-foreground mb-3' />

                <h3 className='text-sm font-semibold'>No appointments yet</h3>

                <p className='text-sm text-muted-foreground mt-1 max-w-sm'>
                  This project doesn&apos;t have any appointments.
                </p>
              </div>
            ) : (
              appointments
                .filter((a) => a.project_id === selectedProjectId)
                .map((a) => (
                  <div
                    key={a.id}
                    className='flex items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/50 transition'
                  >
                    <div className='flex items-center gap-4'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />

                      <div className='flex flex-col'>
                        <span className='font-medium'>{a.title}</span>

                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          Time allocated: {a.hours_allocated}h
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-semibold'>
                        {format(
                          typeof a.date === 'string'
                            ? parseISO(a.date)
                            : a.date,
                          'PP',
                        )}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleDelete(a.id)}
                            className='text-destructive'
                          >
                            <Trash className='mr-2 h-4 w-4 text-destructive' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
