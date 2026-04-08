import { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

let offsetPromise = null;

// single source of truth (promise)
const getServerOffset = async () => {
  if (!offsetPromise) {
    offsetPromise = (async () => {
      const ref = doc(db, "storeConfig", "metadata");

      const t0 = Date.now();
      await setDoc(ref, { now: serverTimestamp() }, { merge: true });
      const snap = await getDoc(ref);
      const t1 = Date.now();

      const serverTime = snap.data().now.toMillis();
      const clientMid = (t0 + t1) / 2;

      return serverTime - clientMid;
    })();
  }

  return offsetPromise;
};

// use anywhere (logic, API, etc.)
export const getServerNow = async () => {
  const offset = await getServerOffset();
  return Date.now() + offset;
};

// ---------------- CONTEXT ----------------

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  const [timeOffset, setTimeOffset] = useState(null);

  useEffect(() => {
    // reuse same promise (no extra API call)
    getServerOffset().then((offset) => {
      setTimeOffset(offset);
    });
  }, []);

  return (
    <TimeContext.Provider value={{ timeOffset }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => useContext(TimeContext);