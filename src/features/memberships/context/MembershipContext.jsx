import React, { createContext, useContext } from "react";
import useMemberships from "../hooks/useMemberships";

export const MembershipContext = createContext(null);

export const MembershipProvider = ({ organizationId, children }) => {
  const value = useMemberships(organizationId);
  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
};

export const useMembershipContext = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembershipContext must be used within a MembershipProvider");
  }
  return context;
};

export default MembershipContext;
