// Mock apiFetch to avoid import.meta.env issues in tests
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
  __esModule: true
}));
import React from 'react';
import { render, screen } from '@testing-library/react';
import FlightsPage from '../pages/FlightsPage';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { BrowserRouter } from 'react-router-dom';

describe('FlightsPage', () => {
  it('renders flights table for admin', () => {
    render(
      <AuthContext.Provider value={{ auth: { user: 'admin', role: 'ADMIN' } }}>
        <SearchContext.Provider value={{
          searchResults: [],
          setSearchResults: jest.fn(),
          showDropdown: false,
          setShowDropdown: jest.fn()
        }}>
          <BrowserRouter>
            <FlightsPage />
          </BrowserRouter>
        </SearchContext.Provider>
      </AuthContext.Provider>
    );
    // There are multiple elements with /flights/i, check that at least one exists
    const flightsTexts = screen.getAllByText(/flights/i);
    expect(flightsTexts.length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
