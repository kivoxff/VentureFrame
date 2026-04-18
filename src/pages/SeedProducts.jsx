import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

export default function SeedProducts() {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const seedTestProducts = httpsCallable(functions, "seedTestProducts");

      await seedTestProducts({ count: Number(count) });

      setMessage(`${count} products seeded successfully.`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to seed products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 max-w-md border rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Seed Test Products</h2>

      <input
        type="number"
        min="1"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        className="border p-2 w-full"
        placeholder="Enter product count"
      />

      <button
        onClick={handleSeedProducts}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Seeding..." : "Seed Products"}
      </button>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </section>
  );
}
