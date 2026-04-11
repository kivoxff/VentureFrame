import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { functions } from "../firebase/config";

function Test() {
  const [loading, setLoading] = useState(false);

  const func1 = async () => {
    if (loading) return; // prevent multiple calls
    setLoading(true);

    try {
      const seedProducts = httpsCallable(functions, "seedTestProducts");
      await seedProducts({ count: 5 });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <button onClick={func1} disabled={loading}>
      {loading ? "Seeding..." : "Seed products"}
    </button>
  );
}

export default Test;