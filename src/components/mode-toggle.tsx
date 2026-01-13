import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/theme-provider'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      className='h-full aspect-square mr-4'
      variant='ghost'
      size='icon-sm'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-500 ease-in-out dark:rotate-0 dark:scale-100' />
      <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-0 transition-transform duration-500 ease-in-out dark:-rotate-90 dark:scale-0' />
      <span className='sr-only'>Trocar tema</span>
    </Button>
  )
}
