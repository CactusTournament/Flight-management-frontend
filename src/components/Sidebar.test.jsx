import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders all main navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    // Check for Arrivals/Departures link
    expect(screen.getByText(/arrivals\/departures/i)).toBeInTheDocument();
    // Check for admin dashboard link
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    // Check for at least one admin link (e.g., Flights)
    expect(screen.getByText(/flights/i)).toBeInTheDocument();
    // Check for at least one passenger link
    expect(screen.getByText(/passengers/i)).toBeInTheDocument();
  });
});
