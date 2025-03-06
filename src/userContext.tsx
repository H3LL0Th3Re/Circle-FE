import React, { createContext, useContext, useState, ReactNode } from "react";

// Define User interface
interface User {
  fullname: string;
  email: string;
  username: string;
  bio: string;
  profile_pic: string;
  banner_pic: string;
}

// Define UserContext value
interface UserContextType {
  user: User; // Make user always defined
  setUser: (user: User) => void; // setUser always expects a user
  logout: () => void; // Additional logout function
  isAuthenticated: boolean;
}

// Create UserContext
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to use UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};




// Define a default user object with empty values
const defaultUser: User = {
  fullname: "",
  email: "",
  username: "",
  bio: "",
  profile_pic: "",
  banner_pic: "",
};
// const [isAuthenticated, setIsAuthenticated] = useState(false);
// UserProvider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("token");
    return !!token; // If token exists, isAuthenticated is true
  });

  

  const updateUser = (userData: User) => {
    setUser(userData);
    if (userData.fullname === "") {
      localStorage.removeItem("token"); 
    }
  };

  const logout = () => {
    setUser(defaultUser); // Reset to defaultUser on logout
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // Clear token on logout
    console.log("User logged out.");
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, logout, isAuthenticated}}>
      {children}
    </UserContext.Provider>
  );
};
