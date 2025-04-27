import React, { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "../lib/appwrite";
import { getActiveSubscription } from "../lib/appwrite"; // Import your subscription function

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null); // Subscription state
  const [selectedPlan, setSelectedPlan] = useState(null); // Selected Plan state
  const [paymentReference, setPaymentReference] = useState(null); // 🔥 NEW: Payment Reference
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndSubscription() {
      try {
        const currentUser = await getCurrentUser();
  
        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);

          try {
            const activeSubscription = await getActiveSubscription(currentUser.Id);
            if (activeSubscription) {
              setSubscription(activeSubscription);
            }
          } catch (subError) {
            console.log(subError)
            // Do nothing if subscription fetch fails
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
        subscription,
        setSubscription,
        selectedPlan,
        setSelectedPlan,
        paymentReference,     // 🔥 Provided in context
        setPaymentReference,  // 🔥 Provided in context
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
