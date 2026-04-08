import { useEffect, useState } from "react";
import copyIcon from "../../../../../assets/icons/copy.svg";
import { toast } from "react-toastify";
import { collection, onSnapshot } from "firebase/firestore";
import { db, functions } from "../../../../../firebase/config";
import { httpsCallable } from "firebase/functions";

function PromoCodeManager() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    minOrder: "",
    usageLimit: "",
    expiry: "",
  });

  useEffect(() => {
    const codesRef = collection(db, "coupons");

    const unsubscribe = onSnapshot(codesRef, (snapshot) => {
      const AllCodes = snapshot.docs.map((doc) => doc.data());
      setPromoCodes(AllCodes);
    });

    return () => unsubscribe();
  }, []);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code: code });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isExists = promoCodes.some((promo) => promo.code === formData.code);
    if (isExists) {
      toast.error("Coupon code exists");
      return;
    }

    try {
      const createCoupon = httpsCallable(functions, "createCoupon");
      await createCoupon(formData);
      toast.success("Coupon created");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const copyCode = async (codeToCopy) => {
    await navigator.clipboard.writeText(codeToCopy);
    toast.success("Copied");
  };

  const removeCode = async (codeToRemove) => {
    try {
      const removeCoupon = httpsCallable(functions, "deleteCoupon");
      await removeCoupon({ code: codeToRemove });
      toast.success("Coupon Removed");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 px-3 py-2 flex flex-col gap-4 rounded-xl shadow-xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">🗃️ Promo Code Manager</h3>
        <p className="text-xs text-gray-500">
          Create and manage discount / promo codes
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-wrap gap-2">
        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">Promo code</label>
          <div className="flex gap-2">
            <input
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              value={formData.code}
              type="text"
              placeholder="Auto or custome"
              className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
            />
            <button
              onClick={generateCode}
              type="button"
              className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 transition-colors whitespace-nowrap"
            >
              Auto
            </button>
          </div>
        </div>

        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">Code type</label>
          <select
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            value={formData.type}
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500"
          >
            <option value="PERCENT">% Discount</option>
            <option value="FLAT">₹ Flat Amount</option>
          </select>
        </div>

        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">
            {formData.type === "PERCENT" ? "Discount %" : "Discount Amount"}
          </label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            value={formData.value}
            type="number"
            placeholder="Discount %"
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
          />
        </div>

        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">Min order of</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, minOrder: e.target.value })
            }
            value={formData.minOrder}
            type="number"
            placeholder="Default On All Orders"
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
          />
        </div>

        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">Usage limit</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, usageLimit: e.target.value })
            }
            value={formData.usageLimit}
            type="number"
            placeholder="Default No Limit"
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
          />
        </div>

        <div className="basis-full sm:basis-1/3 md:basis-1/4 grow flex flex-col">
          <label className="mb-2 font-medium">Expiry date</label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, expiry: e.target.value })
            }
            value={formData.expiry}
            type="date"
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 px-3 py-2 flex justify-center w-full text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-xl"
        >
          Create Promo Code
        </button>
      </form>

      <div className="flex gap-4 flex-wrap">
        {promoCodes.map((promo) => (
          <div className="p-4 grow flex flex-col border border-gray-300 rounded-xl shadow-sm">
            <span className="text-2xl text-violet-900 text-center font-bold">
              {promo.type === "PERCENT"
                ? `${promo.value}% OFF`
                : `₹${promo.value} OFF`}
            </span>

            <span className="mb-2 text-blue-700 text-center">
              {promo.minOrder
                ? "On orders above ₹" + promo.minOrder
                : "On every order"}
            </span>
            <span className="text-gray-400 text-center text-xs">
              <strong>Usage Limit:</strong>{" "}
              {promo.usageLimit ? promo.usageLimit : "Unlimited"}
            </span>
            <span className="text-gray-400 text-center text-xs">
              <strong>Expires on: </strong>
              {promo.expiry
                ? promo.expiry.toDate().toLocaleDateString()
                : "No Expiry"}
            </span>

            <button
              onClick={() => copyCode(promo.code)}
              className="mt-2 p-1.5 bg-pink-200 hover:bg-pink-300 transition-colors text-blue-700 font-medium rounded-xl flex gap-2 justify-center items-center cursor-pointer"
            >
              {promo.code}
              <img src={copyIcon} className="w-5 h-5 object-contain" />
            </button>
            <button
              onClick={() => removeCode(promo.code)}
              className="mt-2 p-1.5 border transition-colors text-gray-800 font-medium rounded-xl flex gap-2 justify-center items-center cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromoCodeManager;
