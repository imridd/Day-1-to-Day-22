import {
  createContext,
  useState,
  useEffect
} from "react";
import {getUser,saveUser,removeUser } from "../utils/localStorage";

export const AuthContext =
  createContext();

export const AuthProvider = ({
  children
}) => {

  const [currentUser,
    setCurrentUser] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const user = getUser();

    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);

  }, []);

  const login = (user) => {

    saveUser(user);

    setCurrentUser(user);
  };

  const logout = () => {

    removeUser();

    setCurrentUser(null);
  };

  const value = {

    login,

    logout,

    currentUser,

    role:
      currentUser?.role || null,

    isAuthenticated:
      !!currentUser
  };

  if (loading) {

    return <div>Loading...</div>;

  }

  return (

    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>

  );
};