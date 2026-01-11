import Database from '@tauri-apps/plugin-sql'

import React from 'react'
import Appointment from '../entities/appointment'
import Project from '../entities/project'
import { addDays, endOfDay, isWithinInterval, startOfDay } from 'date-fns'
import { Activity } from '@/models/activity'

export interface AppContextType {
  projects: Project[]
  createProject: (name: string) => Promise<void>
  readProjects: () => Promise<void>
  // updateProject: (id: number, name: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>

  appointments: Appointment[]
  createAppointment: (
    title: string,
    date: string,
    hours_allocated: number
  ) => Promise<void>
  readAppointments: () => Promise<void>
  // updateAppointment: (name: string) => Promise<void>
  // deleteAppointment: (id: number) => Promise<void>

  selectedProjectId: number | null
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>
  getActivitySummaryInInterval: (start: Date, end: Date) => Promise<Activity[]>
}

export const AppContext = React.createContext<AppContextType | null>(null)

export const AppContextProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [appointments, setAppointments] = React.useState<Appointment[]>([])

  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(null)

  const createProject = async (name: string) => {
    const database = await Database.load('sqlite:data.db')

    const createdAt = new Date().toISOString()

    const response = await database.execute(
      'INSERT INTO projects (name, created_at, last_appointment_at) VALUES ($1, $2, $3)',
      [name, createdAt, null]
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while creating the project')
    }

    setProjects([
      ...projects,
      {
        id: response.lastInsertId!,
        name,
        created_at: createdAt,
        last_appointment_at: null,
        deactivated_at: null,
      },
    ])
  }

  const readProjects = async () => {
    const database = await Database.load('sqlite:data.db')

    const data = await database.select('SELECT * FROM projects')

    setProjects(data as Project[])
  }

  // const updateProject = async (id: number, name: string) => {
  //   const database = await Database.load('sqlite:data.db')

  //   const response = await database.execute(
  //     'UPDATE project SET name = $1 WHERE id = $2',
  //     [name, id]
  //   )

  //   if (response.rowsAffected === 0) {
  //     throw new Error('Error: Something went wrong while updating the project')
  //   }
  // }

  const deleteProject = async (id: number) => {
    const database = await Database.load('sqlite:data.db')

    const now = new Date()

    const response = await database.execute(
      `
        UPDATE projects
        SET deactivated_at = 
          CASE
            WHEN deactivated_at IS NULL THEN $1
            ELSE NULL
          END
        WHERE id = $2
      `,
      [now.toISOString(), id]
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while deleting the project')
    }

    refreshData()
  }

  const createAppointment = async (
    title: string,
    date: string,
    hours_allocated: number
  ) => {
    const database = await Database.load('sqlite:data.db')

    if (!selectedProjectId) {
      throw new Error('Error: No selected project')
    }

    const response = await database.execute(
      'INSERT INTO appointments (title, date, hours_allocated, project_id) VALUES ($1, $2, $3, $4)',
      [title, date, hours_allocated, selectedProjectId]
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while deleting the project')
    }

    await database.execute(
      'UPDATE projects SET last_appointment_at = $1 WHERE id = $2',
      [new Date().toISOString(), selectedProjectId]
    )

    refreshData()
  }

  const readAppointments = async () => {
    const database = await Database.load('sqlite:data.db')

    const sql =
      'SELECT appointments.* FROM appointments JOIN projects ON projects.id = appointments.project_id WHERE projects.deactivated_at IS NULL'

    const data: Appointment[] = await database.select(sql)

    setAppointments(data as Appointment[])
  }

  async function getActivitySummaryInInterval(
    start: Date,
    end: Date
  ): Promise<Activity[]> {
    const database = await Database.load('sqlite:data.db')

    const appointments = (await database.select(
      'SELECT * FROM appointments WHERE date BETWEEN $1 AND $2',
      [startOfDay(start).toISOString(), endOfDay(end).toISOString()]
    )) as Appointment[]

    let currentDate = startOfDay(start)
    const endDate = endOfDay(end)

    const activities: Activity[] = []

    while (currentDate < endDate) {
      const appointmentsInCurrentDate = appointments.filter((a) =>
        isWithinInterval(a.date, {
          start: currentDate,
          end: endOfDay(currentDate),
        })
      )

      activities.push({
        date: currentDate.toISOString(),
        hours_allocated: appointmentsInCurrentDate.reduce(
          (agg, appointment) => agg + appointment.hours_allocated,
          0
        ),
        appointments: appointmentsInCurrentDate,
      })

      currentDate = addDays(currentDate, 1)
    }

    return activities
  }

  const refreshData = () => {
    readProjects()
    readAppointments
  }

  return (
    <AppContext.Provider
      value={{
        projects,
        createProject,
        readProjects,
        // updateProject,
        deleteProject,
        appointments,
        createAppointment,
        readAppointments,
        // updateAppointment,
        // deleteAppointment,
        selectedProjectId,
        setSelectedProjectId,
        getActivitySummaryInInterval,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
