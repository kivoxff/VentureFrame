import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

let offsetPromise = null;

export const getServerOffset = async () => {
  if (!offsetPromise) {
    offsetPromise = (async () => {
      const syncRef = doc(db, "storeConfig", "metadata");
      const t0 = Date.now();

      await setDoc(syncRef, { now: serverTimestamp() }, { merge: true });
      const syncSnap = await getDoc(syncRef);
      const t1 = Date.now();

      const serverTime = syncSnap.data().now.toMillis();
      const clientMid = (t0 + t1) / 2;

      return serverTime - clientMid;
    })();
  }

  return await offsetPromise;
};

export const getServerNow = async () => {
  const offset = await getServerOffset();
  return Date.now() + offset;
};
