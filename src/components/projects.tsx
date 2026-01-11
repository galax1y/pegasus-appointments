import { useContext, useState } from 'react'

import Project from '@/entities/project'
import { AppContext, AppContextType } from '../context/app-context'

import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardAction,
} from './ui/card'

import { Button } from './ui/button'

import { Trash } from 'lucide-react'

export function Projects() {
  const [name, setName] = useState<string>('')
  const { projects, createProject } = useContext(AppContext) as AppContextType

  async function onSubmit() {
    await createProject(name)
  }

  return (
    <section className='border rounded-md p-4'>
      <div style={{ display: 'flex', gap: 12 }}>
        <label htmlFor='new-project'>Add project: </label>
        <input
          id='new-project'
          placeholder='test'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={onSubmit}>Test</button>
      </div>
      <div>
        <h2>Existing projects</h2>
        <div>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: Project
}
const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>Id: {project.id}</CardDescription>
      </CardHeader>
      <CardContent>test</CardContent>
      <CardAction>
        <Button variant='outline' size='icon-sm'>
          <Trash />
        </Button>
      </CardAction>
    </Card>
  )
}
