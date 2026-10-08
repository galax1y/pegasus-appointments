import { getCurrentWindow } from '@tauri-apps/api/window'

import { Button } from './ui/button'
import { ModeToggle } from './mode-toggle'

import { Cross1Icon, MinusIcon, SquareIcon } from '@radix-ui/react-icons'

export function Navbar() {
  const appWindow = getCurrentWindow()

  return (
    <nav className='relative h-8 w-full backdrop-blur shadow-sm bg-accent outline-1'>
      <div
        data-tauri-drag-region
        className='flex items-center justify-between h-full'
      >
        <img
          className='w-6 h-6 ml-2 outline-2 border-2 border-primary/40 outline-primary/20 ring-2 ring-primary/10 rounded-full'
          src='favicon.ico'
        />

        <div className='flex items-center text-foreground'>
          <ModeToggle />

          <Button
            size='icon-sm'
            className='group rounded-none bg-accent text-foreground hover:bg-card transition-colors'
            onClick={() => appWindow.minimize()}
          >
            <MinusIcon className='group-hover:opacity-100' />
          </Button>

          <Button
            size='icon-sm'
            className='group rounded-none bg-accent text-foreground hover:bg-card transition-colors'
            onClick={() => appWindow.toggleMaximize()}
          >
            <SquareIcon className='opacity-70 group-hover:opacity-100' />
          </Button>

          <Button
            size='icon-sm'
            className='group rounded-none bg-accent text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors'
            onClick={() => appWindow.close()}
          >
            <Cross1Icon className='opacity-70 group-hover:opacity-100' />
          </Button>
        </div>
      </div>
    </nav>
  )
}
