import { useEffect, useState } from "react";
import ProfileCard from "../../components/profile/ProfileCard";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loader from "../../components/ui/misc/Loader";

const SellerProfile = () => {
  const [sellerData, setSellerData] = useState(null);
  const [sellerKyc, setSellerKyc] = useState(null);
  const { sid } = useParams();

  useEffect(() => {
    // fetch
    const fetchSeller = async () => {
      const sellerDocRef = doc(db, "sellers", sid);
      const sellerSnap = await getDoc(sellerDocRef);

      if (sellerSnap.exists()) {
        setSellerData(sellerSnap.data());
      }

      const kycDocRef = doc(db, "sellers", sid, "kyc", sid);
      const kycSnap = await getDoc(kycDocRef);

      if (kycSnap.exists()) {
        setSellerKyc(kycSnap.data());
      }
    };

    fetchSeller();
  }, []);

  if (!sellerData) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <ProfileCard
      type={"seller"}
      profileData={sellerData}
      fieldNames={{
        photo: "logo",
        name: "storeName",
        mail: "contactMail",
        id: "sellerId",
      }}
      redirectTo={`/profile/user/${sellerData?.ownerId}`}
    >
      {/* second card */}
      <div className="p-4 border bg-white rounded-2xl shadow-xl">
        <div className="w-full flex justify-between">
          <h3 className="text-lg font-bold">Account Overview</h3>
          <span className="text-xl">🟡</span>
        </div>

        <div className="pt-4 flex flex-wrap md:flex-nowrap justify-between gap-4">
          <div className="w-full">
            <label className="text-gray-400 text-xs font-medium">
              Store Since
            </label>
            <div className="p-2 flex items-center bg-blue-100 rounded-md">
              <span className="text-xl">📅</span>
              <input
                type="text"
                value={sellerData.createdAt.toDate().toLocaleDateString()}
                className="mt-1 px-3 w-full font-semibold rounded-md"
                disabled
              />
            </div>
          </div>

          <div className="w-full">
            <label className="text-gray-400 text-xs font-medium">
              Store Categories
            </label>
            <div className="p-2 flex items-start bg-blue-100 rounded-md">
              <span className="text-xl">👕</span>
              <div className="mt-1 px-3 w-full font-semibold flex flex-wrap gap-2 rounded-md">
                {sellerData.storeCategories.map((category) => (
                  <span className="px-2 border border-gray-400 text-blue-600 rounded-full capitalize">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* third card */}
      <div className="p-4 border bg-white rounded-2xl shadow-xl">
        <div className="w-full flex justify-between">
          <h3 className="text-lg font-bold">Store Information</h3>
          <span className="text-xl">📍</span>
        </div>

        <div className="pt-4 flex gap-1">
          <span className="text-2xl">🏚️</span>
          <div className="w-full flex flex-col">
            <h4 className="px-2 font-bold">Store Address</h4>
            <textarea
              name="address"
              value={sellerData.storeAddress}
              className="px-2 w-full h-fit text-sm text-gray-500 font-semibold resize-none"
              disabled
            ></textarea>
            <span className="px-2 text-sm text-gray-500 font-semibold uppercase">
              {sellerData.country}
            </span>
          </div>
        </div>

        <div className="pt-4 flex gap-1">
          <span className="text-2xl">❓</span>
          <div className="w-full flex flex-col">
            <h4 className="px-2 font-bold">About Store</h4>
            <textarea
              name="address"
              value={sellerData.aboutStore}
              className="px-2 w-full h-fit text-sm text-gray-500 font-semibold resize-none"
              disabled
            ></textarea>
          </div>
        </div>
      </div>

      {/* forth card */}
      {sellerKyc && (
        <div className="p-4 border bg-white rounded-2xl shadow-xl relative">
          <div className="flex justify-between items-center flex-wrap">
            <h3 className="text-lg font-bold">Business Profile & KYC</h3>
            {sellerKyc.kycStatus === "VERIFIED" && <span>✔️</span>}
          </div>

          <div className="pt-4 flex flex-wrap md:flex-nowrap justify-between gap-4">
            <div className="w-full flex flex-col">
              <label className="text-gray-400 text-xs font-medium">
                GST Number
              </label>
              <span className="font-medium">{sellerKyc.gstNumber}</span>
            </div>

            <div className="w-full flex flex-col">
              <label className="text-gray-400 text-xs font-medium">
                PAN Number
              </label>
              <span className="font-medium">{sellerKyc.panNumber}</span>
            </div>
          </div>

          <div className="mt-4 w-full flex flex-col">
            <label className="text-gray-400 text-xs font-medium">
              Bank Details
            </label>
            <div className="mt-1 p-2 border border-gray-400 border-dashed font-medium rounded-2xl">
              <span className="mr-2">
                A/C: ••••••••{sellerKyc.bankAccountNo.slice(6)}
              </span>
              <span className="text-gray-400 font-semibold">|</span>
              <span className="ml-2">IFSC: {sellerKyc.ifscCode}</span>
            </div>
          </div>

          <div className="mt-4 w-full flex flex-col">
            <label className="text-gray-400 text-xs font-medium">
              Uploaded Documents
            </label>
            <div className="mt-1 flex flex-wrap gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={sellerKyc.panCard}
                  className="w-24 h-24 object-cover rounded-2xl"
                />
                <span className="font-medium">PAN Card</span>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={sellerKyc.gstCertificate}
                  className="w-24 h-24 object-cover rounded-2xl"
                />
                <span className="font-medium">GST Certificate</span>
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={sellerKyc.bankProof}
                  className="w-24 h-24 object-cover rounded-2xl"
                />
                <span className="font-medium">Bank Proof</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProfileCard>
  );
};

export default SellerProfile;
