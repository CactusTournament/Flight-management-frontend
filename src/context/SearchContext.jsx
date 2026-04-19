import React, { createContext, useState } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <SearchContext.Provider value={{ searchResults, setSearchResults, showDropdown, setShowDropdown }}>
      {children}
    </SearchContext.Provider>
  );
};
