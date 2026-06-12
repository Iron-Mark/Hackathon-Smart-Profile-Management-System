import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../pages/landing'

test('renders Landing page with title', () => {
  render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  )
  
  expect(screen.getByText(/CCIS Smart Faculty Profile Management System/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
})
