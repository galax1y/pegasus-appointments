import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import {
  CircleX,
  CircleCheck,
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  ArrowLeft,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
} from 'lucide-react'

import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { useContext } from 'react'
import { AppContext, AppContextType } from '@/context/app-context'
import { toast } from 'sonner'

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
            table.setRowSelection(checked ? { [row.id]: true } : {})
            setSelectedProjectId(checked ? row.original.id : null)
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
          Project
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
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

      return format(last_appointment_at, 'PP')
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
      return (
        <span className='text-xs'>{format(created_at, 'PP HH:mm:ss')}</span>
      )
    },
  },
  {
    accessorKey: 'deactivated_at',
    header: 'Active',
    filterFn: (row, columnId, filterValue: StatusFilter) => {
      const value = row.getValue<Date | null>(columnId)

      console.log('filterValue:', filterValue)

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
        return <CircleCheck size={20} color='green' />
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { id, deactivated_at } = row.original
      const { deleteProject } = useContext(AppContext) as AppContextType

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
            <DropdownMenuItem onClick={handleToggleActive}>
              {deactivated_at ? 'Reactivate project' : 'Deactivate project'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
