import { Projects } from './components/projects'
import { Appointments } from './components/appointments'
import {
  AppContext,
  AppContextProvider,
  AppContextType,
} from './context/app-context'

import './App.css'
import { useContext, useEffect } from 'react'

function App() {
  const { readProjects } = useContext(AppContext) as AppContextType

  // Initial data loading
  useEffect(() => {
    readProjects()
  }, [])

  return (
    <main className='container'>
      <div className='main-grid'>
        <Projects />
        <Appointments />
      </div>
    </main>
  )
}

export default App
