import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const mockSetAuth = jest.fn(async () => ({ success: false, error: 'Invalid username or password' }));

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <AuthContext.Provider value={{ setAuth: mockSetAuth }}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    // There may be multiple elements with /password/i (input and button)
    const passwordFields = screen.getAllByLabelText(/password/i);
    expect(passwordFields.some(el => el.tagName === 'INPUT')).toBe(true);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

});
