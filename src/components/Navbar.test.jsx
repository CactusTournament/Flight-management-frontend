import React from 'react';
jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(),
}));
import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(
      <AuthContext.Provider value={{ auth: {}, setAuth: jest.fn() }}>
        <SearchContext.Provider value={{
          setSearchResults: jest.fn(),
          setShowDropdown: jest.fn(),
          searchResults: [],
          showDropdown: false
        }}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </SearchContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
