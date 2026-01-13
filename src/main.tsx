import React from 'react'
import ReactDOM from 'react-dom/client'

import { AppContextProvider } from './context/app-context'
import App from './App'
import { ThemeProvider } from './components/ui/theme-provider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppContextProvider>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <App />
      </ThemeProvider>
    </AppContextProvider>
  </React.StrictMode>
)
