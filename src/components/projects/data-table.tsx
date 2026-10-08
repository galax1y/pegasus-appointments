'use client'

import React, { useContext, useState } from 'react'

import { Input } from '../ui/input'
import { Button } from '../ui/button'

import {
  ColumnDef,
  flexRender,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'

import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableHeader,
} from '@/components/ui/table'

import { StatusFilter } from './columns'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AppContext, AppContextType } from '@/context/app-context'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { clearEverything } = useContext(AppContext) as AppContextType
  const [filter, setFilter] = useState<StatusFilter>('active')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'deactivated_at', value: 'active' },
  ])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  function handleFilterByDeactivated() {
    const column = table.getColumn('deactivated_at')

    if (filter === 'all') {
      column?.setFilterValue('active')
      setFilter('active')
    }
    if (filter === 'active') {
      column?.setFilterValue('inactive')
      setFilter('inactive')
    }
    if (filter === 'inactive') {
      column?.setFilterValue('all')
      setFilter('all')
    }
  }

  return (
    <>
      <div className='w-full flex items-center justify-between'>
        <div className='flex items-center'>
          <Button
            size='sm'
            variant='secondary'
            className='mr-2 font-bold underline'
            onClick={handleFilterByDeactivated}
          >
            {filter === 'all' && 'All'}
            {filter === 'active' && 'Active'}
            {filter === 'inactive' && 'Deactivated'}
          </Button>{' '}
          <span className='font-medium'>projects</span>
          <Input
            placeholder='Filter projects by name...'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='ml-2 max-w-sm shadow-sm placeholder:text-xs'
          />
        </div>
        <div className='flex items-center gap-2'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <Trash2 /> Full wipe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all projects?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All projects will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearEverything}>
                  Clear projects
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className='overflow-hidden rounded-md border mt-3 shadow-sm'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
