import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config"; // Update with your actual path
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DatabaseSeeder = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedDatabase = async () => {
    // Optional: Add a confirmation prompt so you don't click it accidentally
    if (!window.confirm("Are you sure you want to seed the database with fake data?")) {
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Seeding database... Please wait.");

    try {
      const seedDatabaseFn = httpsCallable(functions, "seedDatabase");
      const result = await seedDatabaseFn();

      if (result.data?.success) {
        toast.update(toastId, {
          render: result.data.message,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Seeding Error:", error);
      toast.update(toastId, {
        render: error.message || "An error occurred while seeding.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", border: "1px dashed #ccc", borderRadius: "8px", maxWidth: "400px" }}>
      <ToastContainer />
      <h3>Database Tools</h3>
      <p style={{ fontSize: "14px", color: "gray", marginBottom: "1rem" }}>
        Use this tool to populate the database with mock sellers, products, and orders for testing purposes.
      </p>
      
      <button 
        onClick={handleSeedDatabase} 
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#a0aec0" : "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {isLoading ? "Seeding..." : "Seed Fake Data"}
      </button>
    </div>
  );
};

export default DatabaseSeeder;