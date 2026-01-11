import { useContext, useEffect } from 'react'

import { Projects } from './components/projects'
import { Toaster } from './components/ui/sonner'
import { Appointments } from './components/appointments'
import { AppContext, AppContextType } from './context/app-context'

function App() {
  const { readProjects } = useContext(AppContext) as AppContextType

  // Initial data loading
  useEffect(() => {
    readProjects()
  }, [])

  return (
    <>
      <main className='dark bg-background text-foreground min-h-screen flex flex-col'>
        <div className='self-center container grid lg:grid-cols-2 w-full flex-1 gap-6 my-6'>
          <Projects />
          <Appointments />
        </div>
      </main>
      <Toaster richColors position='bottom-center' />
    </>
  )
}

export default App
