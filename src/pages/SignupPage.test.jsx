import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignupPage from '../pages/SignupPage';
import { AuthContext } from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const mockSetAuth = jest.fn(async () => ({ success: false, error: 'Signup failed' }));

describe('SignupPage', () => {
  it('renders signup form', () => {
    render(
      <AuthContext.Provider value={{ setAuth: mockSetAuth }}>
        <BrowserRouter>
          <SignupPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    // There are two password fields: Password and Confirm Password
    const passwordFields = screen.getAllByLabelText(/password/i);
    expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

});
