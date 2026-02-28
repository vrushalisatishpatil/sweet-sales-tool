import React from "react";

interface UserContextType {
  userRole: "admin" | "salesperson";
  userName: string | null;
  userEmail: string | null;
}

export const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
