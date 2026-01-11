import Appointment from '@/entities/appointment'

export interface Activity {
  date: string
  hours_allocated: number
  appointments: Appointment[]
}
