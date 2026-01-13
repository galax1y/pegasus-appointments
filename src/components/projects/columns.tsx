import { useContext, useState } from 'react'
import { AppContext, AppContextType } from '@/context/app-context'

import { toast } from 'sonner'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { NewAppointmentModal } from '../appointments/new-appointment-modal'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'

import {
  CircleX,
  CircleCheck,
  ArrowUpDown,
  MoreHorizontal,
  ArrowUpNarrowWide,
  ArrowUpWideNarrow,
} from 'lucide-react'
import { Input } from '../ui/input'

export type ProjectDt = {
  id: number
  name: string
  created_at: Date
  last_appointment_at: Date | null
  deactivated_at: Date | null
}

export type StatusFilter = 'active' | 'inactive' | 'all'

export const columns: ColumnDef<ProjectDt>[] = [
  {
    id: 'select',
    cell: ({ row, table }) => {
      const { setSelectedProjectId } = useContext(AppContext) as AppContextType

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => {
            if (checked) {
              table.resetRowSelection()
              table.setRowSelection({ [row.id]: true })
              setSelectedProjectId(row.original.id)
            } else {
              table.resetRowSelection()
              setSelectedProjectId(null)
            }
          }}
          className='rounded-full size-5 border-2'
          aria-label='Select row'
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const [value, setValue] = useState(row.original.name)
      const { updateProject } = useContext(AppContext) as AppContextType

      const handleBlur = () => {
        if (value !== row.original.name) {
          // 🔁 Update project name here
          updateProject(row.original.id, value)
          toast.info('Update name')
        }
      }

      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className='h-8 m-0 border border-input/75 bg-input shadow-md'
        />
      )
    },
  },
  {
    accessorKey: 'last_appointment_at',
    header: ({ column }) => {
      const isSortedAsc = column.getIsSorted() === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(isSortedAsc)}
        >
          Last Appointment
          {isSortedAsc ? (
            <ArrowUpNarrowWide className='ml-2' size={16} />
          ) : (
            <ArrowUpWideNarrow className='ml-2' size={16} />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const { last_appointment_at } = row.original

      if (!last_appointment_at) {
        return (
          <span className='text-xs text-muted-foreground'>
            No appointments were made.
          </span>
        )
      }

      return (
        <span className='text-xs'>{format(last_appointment_at, 'PP')}</span>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      const isSortedAsc = column.getIsSorted() === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          {isSortedAsc ? (
            <ArrowUpNarrowWide className='ml-2' size={16} />
          ) : (
            <ArrowUpWideNarrow className='ml-2' size={16} />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const { created_at } = row.original
      return <span className='text-xs'>{format(created_at, 'PP HH:mm')}</span>
    },
  },
  {
    accessorKey: 'deactivated_at',
    header: 'Active',
    filterFn: (row, columnId, filterValue: StatusFilter) => {
      const value = row.getValue<Date | null>(columnId)

      if (filterValue === 'all') return true
      if (filterValue === 'active') return value === null
      if (filterValue === 'inactive') return value !== null

      return true
    },
    cell: ({ row }) => {
      const { deactivated_at } = row.original

      if (deactivated_at) {
        return <CircleX size={20} className='text-destructive' />
      } else {
        return <CircleCheck size={20} className='text-secondary' />
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const { id, deactivated_at } = row.original
      const { deleteProject, setSelectedProjectId } = useContext(
        AppContext
      ) as AppContextType

      const handleToggleActive = () => {
        return toast.promise(deleteProject(id), {
          success: `Project was successfully ${
            deactivated_at ? 'reactivated' : 'deactivated'
          }.`,
          error: (err) =>
            `Could not ${
              deactivated_at ? 'reactivate' : 'deactivate'
            } project. err: ${err}`,
        })
      }

      const handleNewAppointment = () => {
        setSelectedProjectId(id)
        table.setRowSelection({ [row.id]: true })
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='dark' align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NewAppointmentModal
                selectedProjectId={row.original.id}
                trigger={
                  <span
                    onClick={handleNewAppointment}
                    className="focus:bg-accent hover:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  >
                    Add appointment
                  </span>
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleActive}>
              {deactivated_at ? 'Reactivate project' : 'Deactivate project'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
