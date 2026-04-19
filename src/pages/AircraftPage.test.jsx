// Mock apiFetch to avoid import.meta.env issues in tests
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
  __esModule: true
}));
import React from 'react';
import { render, screen } from '@testing-library/react';
import AircraftPage from '../pages/AircraftPage';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { BrowserRouter } from 'react-router-dom';

describe('AircraftPage', () => {
  it('renders aircraft table and add form for admin', () => {
    render(
      <AuthContext.Provider value={{ auth: { user: 'admin', role: 'ADMIN' } }}>
        <SearchContext.Provider value={{
          searchResults: [],
          setSearchResults: jest.fn(),
          showDropdown: false,
          setShowDropdown: jest.fn()
        }}>
          <BrowserRouter>
            <AircraftPage />
          </BrowserRouter>
        </SearchContext.Provider>
      </AuthContext.Provider>
    );
    // There are multiple elements with /aircraft/i, check that at least one exists
    const aircraftTexts = screen.getAllByText(/aircraft/i);
    expect(aircraftTexts.length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add aircraft/i })).toBeInTheDocument();
  });
});
