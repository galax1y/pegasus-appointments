import { useContext, useState } from 'react'
import { AppContext, AppContextType } from '../context/app-context'

import './projects.css'

export function Projects() {
  const [name, setName] = useState<string>('')
  const { projects, createProject } = useContext(AppContext) as AppContextType

  async function onSubmit() {
    await createProject(name)
  }

  return (
    <section className='grid-item'>
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
        <div>
          <h1>Existing projects</h1>
        </div>
        <div className='projects'>
          {projects.map((project) => (
            <div className='project-card' key={project.id}>
              <small>project id: {project.id}</small>
              <p>project name: {project.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
