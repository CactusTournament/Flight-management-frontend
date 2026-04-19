// Mock apiFetch to avoid import.meta.env issues in tests
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
  __esModule: true
}));
import React from 'react';
import { render, screen } from '@testing-library/react';
import PassengersPage from '../pages/PassengersPage';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import { BrowserRouter } from 'react-router-dom';

describe('PassengersPage', () => {
  it('renders passengers table for admin', () => {
    render(
      <AuthContext.Provider value={{ auth: { user: 'admin', role: 'ADMIN' } }}>
        <SearchContext.Provider value={{
          searchResults: [],
          setSearchResults: jest.fn(),
          showDropdown: false,
          setShowDropdown: jest.fn()
        }}>
          <BrowserRouter>
            <PassengersPage />
          </BrowserRouter>
        </SearchContext.Provider>
      </AuthContext.Provider>
    );
    // There are multiple elements with /passengers/i, check that at least one exists
    const passengersTexts = screen.getAllByText(/passengers/i);
    expect(passengersTexts.length).toBeGreaterThan(0);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
