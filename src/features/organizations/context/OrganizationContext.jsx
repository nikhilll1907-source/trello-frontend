import React, { createContext, useContext } from "react";
import useOrganizations from "../hooks/useOrganizations";

export const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
  const value = useOrganizations();
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganizationContext must be used within an OrganizationProvider");
  }
  return context;
};

export default OrganizationContext;
