import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResizableTable from './ResizableTable';

describe('ResizableTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' }
  ];
  const data = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 }
  ];

  it('renders table with data', () => {
    render(<ResizableTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders actions column for admin', () => {
    render(
      <ResizableTable
        columns={columns}
        data={data}
        isAdmin={true}
        renderActions={() => (
          <>
            <button>Edit</button>
            <button>Delete</button>
          </>
        )}
      />
    );
    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn();
    render(
      <ResizableTable
        columns={columns}
        data={data}
        isAdmin={true}
        renderActions={() => (
          <>
            <button onClick={onEdit}>Edit</button>
            <button>Delete</button>
          </>
        )}
      />
    );
    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(onEdit).toHaveBeenCalled();
  });
});
