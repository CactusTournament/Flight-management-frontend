import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { SearchContext, SearchProvider } from './SearchContext';

const TestComponent = () => {
  const { searchResults, setSearchResults, showDropdown, setShowDropdown } = useContext(SearchContext);
  return (
    <div>
      <span data-testid="results">{searchResults.length}</span>
      <span data-testid="dropdown">{showDropdown ? 'open' : 'closed'}</span>
      <button onClick={() => setSearchResults(['a', 'b'])}>Set Results</button>
      <button onClick={() => setShowDropdown(true)}>Open Dropdown</button>
    </div>
  );
};

describe('SearchContext', () => {
  it('provides default values', () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    expect(screen.getByTestId('results').textContent).toBe('0');
    expect(screen.getByTestId('dropdown').textContent).toBe('closed');
  });

  it('updates searchResults and showDropdown', async () => {
    render(
      <SearchProvider>
        <TestComponent />
      </SearchProvider>
    );
    await act(async () => {
      screen.getByText('Set Results').click();
    });
    expect(screen.getByTestId('results').textContent).toBe('2');
    await act(async () => {
      screen.getByText('Open Dropdown').click();
    });
    expect(screen.getByTestId('dropdown').textContent).toBe('open');
  });
});
