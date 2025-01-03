import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "../lib/appwrite";
import { getActiveSubscription } from "../lib/appwrite"; // Import your subscription function

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null); // Add subscription state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndSubscription() {
      try {
        const currentUser = await getCurrentUser();
  
        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);
  
          // Try fetching the user's active subscription independently
          try {
            const activeSubscription = await getActiveSubscription(currentUser.Id);
            if (activeSubscription) {
              setSubscription(activeSubscription); // Update the subscription state
            }
          } catch (subError) {

            // Keep subscription as it is; do not set to null unnecessarily
          }
        } else {
          setIsLogged(false);
          setUser(null);
          setSubscription(null);
        }
      } catch (userError) {
        console.error("Error fetching user:", userError);
        setIsLogged(false);
        setUser(null);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }
  
    fetchUserAndSubscription();
  }, []);
  
  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        subscription, // Provide subscription state
        setSubscription,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
