import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext, AuthProvider } from './AuthContext';

// Mock fetch to always succeed and return a user with roles
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ roles: [{ authority: 'ROLE_ADMIN' }] }),
    })
  );
});

afterAll(() => {
  global.fetch.mockRestore();
});

// Mock fetch in the test to simulate authentication and ensure setAuth sets the expected value
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Test component with button to trigger setAuth
const SetAuthTestComponent = () => {
  const { auth, setAuth } = useContext(AuthContext);
  return (
    <>
      <span data-testid="user">{auth?.user || ''}</span>
      <button onClick={() => setAuth({ user: 'testuser', password: 'pw' })}>Set Auth</button>
    </>
  );
};

// Simple test component for default/localStorage tests
const TestComponent = () => {
  const { auth } = useContext(AuthContext);
  return <span data-testid="user">{auth?.user || ''}</span>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default auth value', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user').textContent).toBe('');
  });

  it('setAuth updates auth and localStorage', async () => {
    render(
      <AuthProvider>
        <SetAuthTestComponent />
      </AuthProvider>
    );
    await userEvent.click(screen.getByText('Set Auth'));
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });
    const stored = JSON.parse(localStorage.getItem('auth'));
    expect(stored.user).toBe('testuser');
  });

  it('loads auth from localStorage', () => {
    localStorage.setItem('auth', JSON.stringify({ user: 'persisted', password: 'pw' }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user').textContent).toBe('persisted');
  });
});
