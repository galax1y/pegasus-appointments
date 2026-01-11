import { useContext, useEffect } from 'react'

import { Projects } from './components/projects'
import { Appointments } from './components/appointments'
import { AppContext, AppContextType } from './context/app-context'

function App() {
  const { readProjects } = useContext(AppContext) as AppContextType

  // Initial data loading
  useEffect(() => {
    readProjects()
  }, [])

  return (
    <main className='dark bg-background text-foreground'>
      <div className='grid grid-cols-2 gap-4 p-2'>
        <Projects />
        <Appointments />
      </div>
    </main>
  )
}

export default App
