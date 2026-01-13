import { getCurrentWindow } from '@tauri-apps/api/window'

import { Button } from './ui/button'
import { ModeToggle } from './mode-toggle'
import { Cross1Icon, MinusIcon, SquareIcon } from '@radix-ui/react-icons'

export function Navbar() {
  const appWindow = getCurrentWindow()

  return (
    <nav className='relative h-8 w-full backdrop-blur border-b shadow-md'>
      <div
        data-tauri-drag-region
        className='flex items-center justify-between h-full'
      >
        <img
          className='w-6 h-6 ml-2 outline-2 outline-primary rounded-full'
          src='favicon.ico'
        />
        <h1 className='font-pretty font-medium text-primary text-xl backdrop-blur-2xl tracking-wide space select-none'>
          Pegasus
        </h1>

        <div className='flex items-center text-foreground'>
          <ModeToggle />

          <Button
            size='icon-sm'
            className='group rounded-none rounded-l-sm bg-input text-foreground hover:bg-muted transition-colors'
            onClick={() => appWindow.minimize()}
          >
            <MinusIcon className='opacity-70 group-hover:opacity-100' />
          </Button>

          <Button
            size='icon-sm'
            className='group rounded-none bg-input text-foreground hover:bg-muted transition-colors'
            onClick={() => appWindow.toggleMaximize()}
          >
            <SquareIcon className='opacity-70 group-hover:opacity-100' />
          </Button>

          <Button
            size='icon-sm'
            className='group rounded-none bg-input text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors'
            onClick={() => appWindow.close()}
          >
            <Cross1Icon className='opacity-70 group-hover:opacity-100' />
          </Button>
        </div>
      </div>
    </nav>
  )
}
