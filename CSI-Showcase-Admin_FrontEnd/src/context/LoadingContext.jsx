import React, { createContext, useContext, useMemo, useState } from 'react';

const LoadingContext = createContext({
  globalLoading: false,
  setGlobalLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);

  const value = useMemo(() => ({ globalLoading, setGlobalLoading }), [globalLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);