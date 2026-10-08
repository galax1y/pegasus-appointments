import Database from '@tauri-apps/plugin-sql'

import React, { useEffect, useState } from 'react'

import Project from '../entities/project'
import { Activity } from '@/models/activity'
import Appointment from '../entities/appointment'

import {
  addDays,
  endOfDay,
  isBefore,
  parseISO,
  format,
  startOfDay,
  isWithinInterval,
} from 'date-fns'

const toLocalDateTime = (date: Date) =>
  format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS")

const parseAppointmentDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseISO(date) : parseISO(date)

export interface AppContextType {
  projects: Project[]
  createProject: (name: string) => Promise<void>
  readProjects: () => Promise<void>
  updateProject: (id: number, name: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  clearEverything: () => Promise<void>

  appointments: Appointment[]
  createAppointment: (
    title: string,
    date: string,
    hours_allocated: number,
  ) => Promise<void>
  readAppointments: () => Promise<void>
  deleteAppointment: (id: number) => Promise<void>
  // updateAppointment: (name: string) => Promise<void>

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

  const [db, setDb] = useState<Database | null>(null)
  useEffect(() => {
    Database.load('sqlite:data.db')
      .then((result) => setDb(result))
      .catch((err) => console.error(`Error while loading the database: ${err}`))
  }, [])

  if (db === null) {
    return <div>Loading database...</div>
  }

  const createProject = async (name: string) => {
    const createdAt = toLocalDateTime(new Date())

    const response = await db.execute(
      'INSERT INTO projects (name, created_at, last_appointment_at) VALUES ($1, $2, $3)',
      [name, createdAt, null],
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
    const data = await db.select('SELECT * FROM projects')

    setProjects(data as Project[])
  }

  const updateProject = async (id: number, name: string) => {
    const response = await db.execute(
      'UPDATE projects SET name = $1 WHERE id = $2',
      [name, id],
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while updating the project')
    }

    readProjects()
  }

  const deleteProject = async (id: number) => {
    const now = new Date()

    const response = await db.execute(
      `
        UPDATE projects
        SET deactivated_at = 
          CASE
            WHEN deactivated_at IS NULL THEN $1
            ELSE NULL
          END
        WHERE id = $2
      `,
      [toLocalDateTime(now), id],
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while deleting the project')
    }

    refreshData()
  }

  const clearEverything = async () => {
    await db.execute('DELETE FROM appointments')
    await db.execute('DELETE FROM projects')
    setAppointments([])
    setProjects([])
    setSelectedProjectId(null)
  }

  const createAppointment = async (
    title: string,
    date: string,
    hours_allocated: number,
  ) => {
    if (!selectedProjectId) {
      throw new Error('Error: No selected project')
    }

    const response = await db.execute(
      'INSERT INTO appointments (title, date, hours_allocated, project_id) VALUES ($1, $2, $3, $4)',
      [title, date, hours_allocated, selectedProjectId],
    )

    if (response.rowsAffected === 0) {
      throw new Error('Error: Something went wrong while deleting the project')
    }

    let rows: Pick<Project, 'last_appointment_at'>[] = await db.select(
      'SELECT last_appointment_at FROM projects WHERE id = $1 ORDER BY last_appointment_at DESC LIMIT 1',
      [selectedProjectId],
    )

    let latestAppointment = rows[0].last_appointment_at

    if (!rows[0].last_appointment_at) {
      latestAppointment = date
    }

    if (
      latestAppointment &&
      isBefore(
        parseAppointmentDate(latestAppointment),
        parseAppointmentDate(date),
      )
    ) {
      latestAppointment = date
    }

    await db.execute(
      'UPDATE projects SET last_appointment_at = $1 WHERE id = $2',
      [latestAppointment, selectedProjectId],
    )

    refreshData()
  }

  const readAppointments = async () => {
    const sql =
      'SELECT appointments.* FROM appointments JOIN projects ON projects.id = appointments.project_id WHERE projects.deactivated_at IS NULL'

    const data: Appointment[] = await db.select(sql)

    setAppointments(data as Appointment[])
  }

  const deleteAppointment = async (id: number) => {
    const response = await db.execute(
      `DELETE FROM appointments WHERE id = $1`,
      [id],
    )

    if (response.rowsAffected === 0) {
      throw new Error(
        'Error: Something went wrong while deleting the appointment',
      )
    }

    const rows: any[] = await db.select(
      `
        SELECT date
        FROM appointments
        WHERE project_id = $1
        ORDER BY date DESC
        LIMIT 1
      `,
      [selectedProjectId],
    )

    const latestAppointment: string | null =
      rows.length > 0 ? rows[0].date : null

    await db.execute(
      `
        UPDATE projects
        SET last_appointment_at = $1
        WHERE id = $2
      `,
      [latestAppointment, selectedProjectId],
    )

    refreshData()
  }

  const getActivitySummaryInInterval = async (
    start: Date,
    end: Date,
  ): Promise<Activity[]> => {
    const appointments = (await db.select(
      'SELECT * FROM appointments WHERE date BETWEEN $1 AND $2',
      [toLocalDateTime(startOfDay(start)), toLocalDateTime(endOfDay(end))],
    )) as Appointment[]

    let currentDate = startOfDay(start)
    const endDate = endOfDay(end)

    const activities: Activity[] = []

    while (currentDate < endDate) {
      const appointmentsInCurrentDate = appointments.filter((a) =>
        isWithinInterval(parseAppointmentDate(a.date), {
          start: currentDate,
          end: endOfDay(currentDate),
        }),
      )

      activities.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        hours_allocated: appointmentsInCurrentDate.reduce(
          (agg, appointment) => agg + appointment.hours_allocated,
          0,
        ),
        appointments: appointmentsInCurrentDate,
      })

      currentDate = addDays(currentDate, 1)
    }

    return activities
  }

  const refreshData = () => {
    readProjects()
    readAppointments()
  }

  return (
    <AppContext.Provider
      value={{
        projects,
        createProject,
        readProjects,
        updateProject,
        deleteProject,
        clearEverything,
        appointments,
        createAppointment,
        readAppointments,
        // updateAppointment,
        deleteAppointment,
        selectedProjectId,
        setSelectedProjectId,
        getActivitySummaryInInterval,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
