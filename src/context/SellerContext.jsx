import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const [sellerData, setSellerData] = useState(null);
  const [sellerKyc, setSellerKyc] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const sid = user?.sellerId;

    if (!sid) {
      setSellerData(null);
      setSellerKyc(null);
      setSellerLoading(false);
      return;
    }

    setSellerLoading(true);

    const sellerRef = doc(db, "sellers", sid);
    const kycRef = doc(db, "sellers", sid, "kyc", sid);

    const unsubSeller = onSnapshot(sellerRef, (sellerSnap) => {
      setSellerData(sellerSnap.exists() ? sellerSnap.data() : null);
    });

    const unsubKyc = onSnapshot(kycRef, (kycSnap) => {
      setSellerKyc(kycSnap.exists() ? kycSnap.data() : null);
      setSellerLoading(false);
    });


    return () => {
      unsubSeller();
      unsubKyc();
    };
  }, [user?.sellerId]);

  const contextValue = {
    sellerData,
    setSellerData,
    sellerKyc,
    setSellerKyc,
    sellerLoading,
  };

  return (
    <SellerContext.Provider value={contextValue}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => useContext(SellerContext);
