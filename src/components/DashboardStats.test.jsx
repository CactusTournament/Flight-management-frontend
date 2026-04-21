import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import DashboardStats from './DashboardStats';

jest.mock('../api/apiFetch', () => ({
  apiFetch: jest.fn(() => Promise.resolve([{}, {}, {}])) // mock 3 items for each
}));

describe('DashboardStats', () => {
  it('renders dashboard stats with counts', async () => {
    render(
      <AuthContext.Provider value={{ auth: {} }}>
        <DashboardStats />
      </AuthContext.Provider>
    );
    // Wait for stats to update
    await waitFor(() => {
      expect(screen.getByText(/flights:/i)).toBeInTheDocument();
      expect(screen.getByText(/airports:/i)).toBeInTheDocument();
      expect(screen.getByText(/airlines:/i)).toBeInTheDocument();
      expect(screen.getByText(/gates:/i)).toBeInTheDocument();
      expect(screen.getByText(/aircraft:/i)).toBeInTheDocument();
      expect(screen.getByText(/passengers:/i)).toBeInTheDocument();
    });
  });
});
