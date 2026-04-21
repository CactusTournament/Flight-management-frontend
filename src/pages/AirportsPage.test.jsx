// Mock apiFetch to avoid import.meta.env issues in tests
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
  __esModule: true
}));
import React from 'react';
import { render, screen } from '@testing-library/react';
import AirportsPage from '../pages/AirportsPage';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { BrowserRouter } from 'react-router-dom';

import { act } from '@testing-library/react';

describe('AirportsPage', () => {
  it('renders airports table for admin', async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={{ auth: { user: 'admin', role: 'ADMIN' } }}>
          <SearchContext.Provider value={{
            searchResults: [],
            setSearchResults: jest.fn(),
            showDropdown: false,
            setShowDropdown: jest.fn()
          }}>
            <BrowserRouter>
              <AirportsPage />
            </BrowserRouter>
          </SearchContext.Provider>
        </AuthContext.Provider>
      );
    });
    // There are multiple elements with /airports/i, check that at least one exists
    const airportsTexts = screen.getAllByText(/airports/i);
    expect(airportsTexts.length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
