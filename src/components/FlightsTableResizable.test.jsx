import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlightsTableResizable from './FlightsTableResizable';

describe('FlightsTableResizable', () => {
  const flights = [
    {
      id: 1,
      flightNumber: 'AA123',
      aircraft: { type: 'Boeing 737' },
      airline: { name: 'American Airlines' },
      gate: { code: 'A1' },
      originAirport: { name: 'JFK' },
      destinationAirport: { name: 'LAX' },
      passengers: [ { firstName: 'John', lastName: 'Doe' } ],
      departureTime: new Date().toISOString(),
      arrivalTime: new Date().toISOString()
    }
  ];

  it('renders flights table with data', () => {
    render(<FlightsTableResizable flights={flights} />);
    expect(screen.getByText('AA123')).toBeInTheDocument();
    expect(screen.getByText('Boeing 737')).toBeInTheDocument();
    expect(screen.getByText('American Airlines')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders actions for admin', () => {
    render(
      <FlightsTableResizable
        flights={flights}
        isAdmin={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onEditSave={jest.fn()}
        onEditCancel={jest.fn()}
      />
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
