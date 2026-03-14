import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { googleLogin, logoutUser } from "../firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnap;
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        unsubscribeSnap = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const loggedInUser = snapshot.data();
            setUser(loggedInUser);
          } else setUser(null);

          setAuthLoading(false);
        });
      } else {
        unsubscribeSnap?.();
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnap?.();
    };
  }, []);

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  const contextValue = {
    user,
    hasRole,
    googleLogin,
    logoutUser,
    authLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
