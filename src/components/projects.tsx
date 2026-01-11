import { useContext, useState } from 'react'

import { toast } from 'sonner'

import { AppContext, AppContextType } from '../context/app-context'

import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

import { ArrowDownWideNarrow, ArrowUpWideNarrow, Clock } from 'lucide-react'
import { DataTable } from './projects/data-table'
import { columns, ProjectDt, StatusFilter } from './projects/columns'
import Project from '@/entities/project'

export function Projects() {
  const [name, setName] = useState<string>('')
  const { projects, createProject, selectedProjectId, setSelectedProjectId } =
    useContext(AppContext) as AppContextType

  const projectsDataTable = mapProjectsToDataTable(projects)

  async function onSubmit() {
    if (name.length < 5) {
      return toast.error('Project name must be more descriptive.')
    }

    await createProject(name)

    setName('')
    toast.success('Project created.')
  }

  function mapProjectsToDataTable(projects: Project[]): ProjectDt[] {
    return projects.map((p) => {
      return {
        id: p.id,
        name: p.name,
        created_at: new Date(p.created_at),
        deactivated_at: p.deactivated_at ? new Date(p.deactivated_at) : null,
        last_appointment_at: p.last_appointment_at
          ? new Date(p.last_appointment_at)
          : null,
      }
    })
  }

  return (
    <section className='border border-collapse rounded-md p-4'>
      <div className='flex gap-4'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Create new project...'
          className='placeholder:text-xs'
        />
        <Button onClick={onSubmit}>Create project</Button>
      </div>
      <div className='mt-8'>
        <DataTable columns={columns} data={projectsDataTable} />
      </div>
    </section>
  )
}
