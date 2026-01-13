import { useContext, useEffect } from 'react'

import { AppContext, AppContextType } from './context/app-context'

import { Navbar } from './components/navbar'
import { Projects } from './components/projects'
import { Toaster } from './components/ui/sonner'
import { Appointments } from './components/appointments'

function App() {
  const { readProjects, readAppointments } = useContext(
    AppContext
  ) as AppContextType

  useEffect(() => {
    readProjects()
    readAppointments()
  }, [])

  return (
    <div className='bg-background text-foreground min-h-screen'>
      <Navbar />
      <main className='relative flex flex-col'>
        <div className='self-center container grid lg:grid-cols-2 w-full flex-1 gap-6 my-6'>
          <Projects />
          <Appointments />
        </div>
      </main>
      <Toaster richColors position='bottom-center' />
    </div>
  )
}

export default App
