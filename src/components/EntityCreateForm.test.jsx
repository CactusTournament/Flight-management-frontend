import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntityCreateForm from './EntityCreateForm';

describe('EntityCreateForm', () => {
  const fields = [
    { label: 'Name', type: 'text', value: '', onChange: jest.fn(), placeholder: 'Enter name', required: true },
    { label: 'Type', type: 'select', value: '', onChange: jest.fn(), options: [ { value: 'a', label: 'A' }, { value: 'b', label: 'B' } ], placeholder: 'Select type', required: true },
  ];

  it('renders all fields and submit button', () => {
    render(<EntityCreateForm fields={fields} onSubmit={jest.fn()} />);
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    // Update: check for the visible select option text instead of placeholder
    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('shows error message if error prop is set', () => {
    render(<EntityCreateForm fields={fields} onSubmit={jest.fn()} error="Test error" />);
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    render(<EntityCreateForm fields={fields} onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByRole('button', { name: /create/i })).toBeDisabled();
  });
});
