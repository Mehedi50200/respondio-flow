import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from '../../composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
  })

  it('should initialize with light theme by default', () => {
    const { theme } = useTheme()
    expect(theme.value).toBe('light')
  })

  it('should set theme to dark', () => {
    const { setTheme, theme } = useTheme()
    setTheme('dark')
    
    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('should set theme to light', () => {
    const { setTheme, theme } = useTheme()
    setTheme('dark')
    setTheme('light')
    
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('should toggle theme from light to dark', () => {
    const { toggleTheme, theme } = useTheme()
    expect(theme.value).toBe('light')
    
    toggleTheme()
    
    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    const { toggleTheme, setTheme, theme } = useTheme()
    setTheme('dark')
    
    toggleTheme()
    
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('should initialize from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { initTheme, theme } = useTheme()
    
    initTheme()
    
    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should initialize from system preference when localStorage is empty', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { initTheme, theme } = useTheme()
    initTheme()
    
    // Should use system preference (dark in this mock)
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('should use light theme when system preference is light', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false, // System prefers light
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { initTheme, theme } = useTheme()
    initTheme()
    
    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })
})

