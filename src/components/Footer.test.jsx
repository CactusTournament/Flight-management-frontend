import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders copyright and React text', () => {
    render(<Footer />);
    expect(screen.getByText(/aviation management system/i)).toBeInTheDocument();
    expect(screen.getByText(/built with/i)).toBeInTheDocument();
    expect(screen.getByText(/react/i)).toBeInTheDocument();
  });
});
