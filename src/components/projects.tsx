import { useContext, useEffect, useState } from 'react'

import { toast } from 'sonner'

import Project from '@/entities/project'
import { AppContext, AppContextType } from '../context/app-context'

import { Input } from './ui/input'
import { Button } from './ui/button'

import { DataTable } from './projects/data-table'
import { columns, ProjectDt } from './projects/columns'
import { PlusIcon } from 'lucide-react'

export function Projects() {
  const [name, setName] = useState<string>('')
  const { projects, createProject } = useContext(AppContext) as AppContextType

  const [projectsDataTable, setProjectsDataTable] = useState<ProjectDt[]>([])

  useEffect(() => {
    setProjectsDataTable(mapProjectsToDataTable(projects))
  }, [projects])

  async function onSubmit() {
    if (name.length < 5) {
      return toast.error('Project name should have at least 5 characters.')
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
    <section className='rounded-md'>
      <div className='flex gap-4'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Create new project...'
          className='shadow-sm'
        />
        <Button onClick={onSubmit} className='shadow-lg'>
          <PlusIcon /> Create project
        </Button>
      </div>
      <div className='mt-8'>
        <DataTable columns={columns} data={projectsDataTable} />
      </div>
    </section>
  )
}
