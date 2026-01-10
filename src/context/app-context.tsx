import Database from '@tauri-apps/plugin-sql'

import React from 'react'
import Appointment from '../entities/appointment'
import Project from '../entities/project'

export interface AppContextType {
  projects: Project[]
  createProject: (name: string) => Promise<void>
  readProjects: () => Promise<void>
  updateProject: (id: number, name: string) => Promise<void>
  // deleteProject: (id: number) => Promise<void>

  appointments: Appointment[]
  // createAppointment: (name: string) => Promise<void>
  // readAppointments: () => Promise<void>
  // updateAppointment: (name: string) => Promise<void>
  // deleteAppointment: (id: number) => Promise<void>
}

export const AppContext = React.createContext<AppContextType | null>(null)

export const AppContextProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [appointments, setAppointments] = React.useState<Appointment[]>([])

  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  )

  const createProject = async (name: string) => {
    const database = await Database.load('sqlite:data.db')

    const response = await database.execute(
      'INSERT INTO projects (name) VALUES ($1)',
      [name]
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while creating the project')
    }

    setProjects([...projects, { id: response.lastInsertId!, name }])
  }

  const readProjects = async () => {
    const database = await Database.load('sqlite:data.db')

    const data = await database.select('SELECT * FROM projects')
    console.log('readProjects:', data)
    setProjects(data as Project[])
  }

  const updateProject = async (id: number, name: string) => {
    const database = await Database.load('sqlite:data.db')

    const response = await database.execute(
      'UPDATE Project SET name = $1 WHERE id = $2',
      [name, id]
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while updating the project')
    }
  }

  return (
    <AppContext.Provider
      value={{
        projects,
        createProject,
        readProjects,
        updateProject,
        // deleteProject,
        appointments,
        // createAppointment,
        // readAppointments,
        // updateAppointment,
        // deleteAppointment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
