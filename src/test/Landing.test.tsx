import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import Landing from '../pages/landing'

test('renders Landing page with title', () => {
  render(
    <ThemeProvider attribute="class" defaultTheme="light">
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    </ThemeProvider>
  )
  
  expect(screen.getByText(/CCIS Smart Faculty Profile Management System/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
})
