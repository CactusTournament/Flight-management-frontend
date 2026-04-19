// Mock apiFetch to avoid import.meta.env issues in tests
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
  __esModule: true
}));
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AdminDashboard from '../pages/AdminDashboard';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('AdminDashboard', () => {
  it('renders dashboard stats and links', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={{ auth: { user: 'admin', role: 'ADMIN' } }}>
          <BrowserRouter>
            <AdminDashboard />
          </BrowserRouter>
        </AuthContext.Provider>
      );
    });
    expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();
    // There are multiple elements with /aircraft/i, check for the admin link specifically
    // There are multiple 'Aircraft' links, check that at least one exists
    const aircraftLinks = screen.getAllByRole('link', { name: /aircraft/i });
    expect(aircraftLinks.length).toBeGreaterThan(0);
    // There are multiple elements with /airports/i, check that at least one exists
    const airportsTexts = screen.getAllByText(/airports/i);
    expect(airportsTexts.length).toBeGreaterThan(0);
    // There are multiple elements with /flights/i, check that at least one exists
    const flightsTexts = screen.getAllByText(/flights/i);
    expect(flightsTexts.length).toBeGreaterThan(0);
    // There are multiple elements with /passengers/i, check that at least one exists
    const passengersTexts = screen.getAllByText(/passengers/i);
    expect(passengersTexts.length).toBeGreaterThan(0);
  });
});
