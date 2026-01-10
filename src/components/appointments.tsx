import { useContext } from 'react'
import { AppContext, AppContextType } from '../context/app-context'

export function Appointments() {
  const { appointments } = useContext(AppContext) as AppContextType

  return (
    <section className='grid-item'>
      <div className='bigode'>
        <label htmlFor='new-appointment'>Add appointment: </label>
        <input id='new-appointment' />
      </div>
    </section>
  )
}
