import React from 'react';
import { render, screen } from '@testing-library/react';
import CascadeDeleteModal from './CascadeDeleteModal';

describe('CascadeDeleteModal', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(<CascadeDeleteModal show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with entity name and buttons', () => {
    render(
      <CascadeDeleteModal
        show={true}
        entityName="test entity"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        onClose={jest.fn()}
        preview={{}}
        loading={false}
        error=""
        success={false}
      />
    );
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/delete this test entity/i)).toBeInTheDocument();
    expect(screen.getByText(/yes, delete/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders success message', () => {
    render(
      <CascadeDeleteModal
        show={true}
        entityName="item"
        success={true}
      />
    );
    expect(screen.getByText(/was successfully deleted/i)).toBeInTheDocument();
  });
});
