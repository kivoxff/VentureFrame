import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { db, functions, storage } from "../../../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// APPLICATION_NOT_SUBMITTED -> Show Seller Form

// APPLICATION_SUBMITTED -> Show Application Pending

// APPLICATION_REJECTED -> Show Application Rejected

// KYC_NOT_SUBMITTED -> Show KYC Form

// KYC_SUBMITTED -> Show KYC Pending

// KYC_REJECTED -> Show KYC Rejected

// KYC_VERIFIED -> Fully Approved

const SellerForm = ({ onSave, initialData = null }) => {
  const emptyForm = {
    storeName: "",
    ownerName: "",
    contactMail: "",
    logo: null,
    storeCategories: [],
    storeAddress: "",
    aboutStore: "",
  };

  const [formData, setformData] = useState(emptyForm);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (initialData)
      setformData((prev) => ({
        ...prev,
        ...initialData,
      }));
    else setformData(emptyForm);
  }, [initialData]);

  useEffect(() => {
    if (!formData.logo) {
      setLogoPreview(null);
      return;
    }

    if (formData.logo instanceof File) {
      const objectUrl = URL.createObjectURL(formData.logo);
      setLogoPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof formData.logo === "string") {
      setLogoPreview(formData.logo);
    }
  }, [formData.logo]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setformData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStoreLogo = (e) => {
    const { name, files } = e.target;
    setformData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleCategoryChange = (e) => {
    const { checked, value } = e.target;
    setformData((prev) => ({
      ...prev,
      storeCategories: checked
        ? [...prev.storeCategories, value]
        : prev.storeCategories.filter((category) => category !== value),
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-4 grow-3 border shodow-2xl rounded-2xl">
      <h3 className="mb-4 pb-2 text-xl font-semibold border-b">
        📝 Seller Application
      </h3>
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <fieldset className="w-full flex gap-2 flex-col sm:flex-row">
          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Store Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🏪
              </span>
              <input
                onChange={handleFormChange}
                name="storeName"
                value={formData.storeName}
                type="text"
                placeholder="e.g. VentureFrame"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Owner Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                👤
              </span>
              <input
                onChange={handleFormChange}
                name="ownerName"
                value={formData.ownerName}
                type="text"
                placeholder="e.g. Rohit Thakare"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="w-full flex gap-2 flex-col">
          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🏪
              </span>
              <input
                onChange={handleFormChange}
                name="contactMail"
                value={formData.contactMail}
                type="email"
                placeholder="e.g. abc@gmail.com"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-fit flex flex-col">
            <label className="mb-2 font-medium">Store Image / Logo</label>

            {/* Preview */}
            {logoPreview && (
              <div className="mb-2">
                <img
                  src={logoPreview}
                  alt="Store Logo Preview"
                  className="w-16 h-16 object-cover rounded-xl border"
                />
              </div>
            )}

            <input
              onChange={handleStoreLogo}
              name="logo"
              type="file"
              accept="image/png, image/jpeg"
              className="w-full file:bg-blue-100 hover:file:bg-blue-200 file:p-1 file:rounded-md file:text-blue-800"
            />
          </div>

          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Store Categories</label>
            <div className="flex gap-3 flex-wrap">
              <label>
                <input
                  onChange={handleCategoryChange}
                  value={"electronics"}
                  checked={formData.storeCategories.includes("electronics")}
                  type="checkbox"
                />{" "}
                Electronics
              </label>
              <label>
                <input
                  onChange={handleCategoryChange}
                  value={"clothing"}
                  checked={formData.storeCategories.includes("clothing")}
                  type="checkbox"
                />{" "}
                Clothing
              </label>
              <label>
                <input
                  onChange={handleCategoryChange}
                  value={"mobiles"}
                  checked={formData.storeCategories.includes("mobiles")}
                  type="checkbox"
                />{" "}
                Mobiles
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className="w-full flex gap-2 flex-col">
          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Store Address</label>
            <div className="relative">
              <span className="absolute top-2 left-2 flex items-center">
                🏪
              </span>
              <textarea
                onChange={handleFormChange}
                name="storeAddress"
                value={formData.storeAddress}
                type="text"
                placeholder="e.g. Shop No. 12, MG Road, Andheri East, Mumbai - 400069"
                className="pl-8 pr-3 py-2 w-full h-32 border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">
              Why Should We Approve You?
            </label>
            <div className="relative">
              <span className="absolute top-2 left-2 flex items-center">
                ❓
              </span>
              <textarea
                onChange={handleFormChange}
                name="aboutStore"
                value={formData.aboutStore}
                type="text"
                placeholder={`• What products will you sell?\n• Are you a manufacturer or reseller?\n• Any brand authorization?`}
                className="pl-8 pr-3 py-2 w-full h-32 border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>
        </fieldset>

        <div className="w-full flex flex-col">
          <button
            type="submit"
            className="p-3 bg-blue-700 hover:bg-blue-800 text-white text-lg font-bold rounded-2xl shadow-xl"
          >
            Submit Application 🚀
          </button>
          <p className="mt-2 text-center font-extralight text-sm text-gray-500">
            By clicking submit, you are agree to our Terms & Seller Policy.
          </p>
        </div>
      </form>
    </div>
  );
};

const HowItWorksCard = ({ howItWorks }) => {
  return (
    <div className="p-4 grow bg-violet-900 text-white rounded-xl shadow-2xl">
      <h4 className="text-xl font-medium">⚙️ How it works</h4>

      <div className="mt-2 flex flex-col gap-4">
        {howItWorks.map((item, idx) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 p-2 bg-pink-200/50 flex justify-center items-center rounded-md">
              {item.icon}
            </div>
            <div>
              <h5 className="font-medium">{idx + 1 + ". " + item.title}</h5>
              <p className="text-xs">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WhySellWithUsCard = ({ whySellWithUs }) => {
  return (
    <div className="p-4 rounded-2xl shadow-2xl border">
      <h4 className="text-xl font-medium">❓ Why sell with us?</h4>
      <ul className="mt-2">
        {whySellWithUs.map((item) => (
          <li className="mt-2 pl-3 list-disc list-inside">{item}</li>
        ))}
      </ul>
    </div>
  );
};

const SubmissionStatusCard = ({
  type = "application", // or kyc
  storeName = "Store Name",
  submitDate = "00/00/00",
}) => {
  const isKyc = type === "kyc";
  return (
    <div className="p-4 flex flex-col justify-center items-center grow-3 bg-blue-50 border shadow-2xl rounded-2xl">
      <div className="text-8xl text-center">📬</div>
      <div className="text-center mt-4">
        <h4 className="text-4xl font-semibold">
          {isKyc ? "KYC Submited" : "Application Sent"}
        </h4>
        {submitDate && (
          <p className="mt-2 text-sm text-gray-400">
            Submitted on{" "}
            <span className="font-medium text-gray-600">
              {(submitDate.toDate?.() ?? submitDate).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            </span>
          </p>
        )}
        <p className="mt-2 text-gray-500">
          {isKyc ? "Your KYC documents for " : "Your request to open "}
          <span className="text-blue-500 font-medium uppercase">
            {storeName}
          </span>
          {isKyc
            ? " are under review by our Admin Team."
            : " is now with our Admin Team. "}
        </p>
      </div>
      <Link
        to={"/"}
        className="mt-4 p-3 w-1/3 bg-blue-600 hover:bg-blue-800 transition-colors text-center text-white font-medium rounded-xl"
      >
        Back To Home
      </Link>
    </div>
  );
};

const SellerKYCForm = ({ onSave, initialData = null }) => {
  const emptyForm = {
    panNumber: "",
    gstNumber: "",
    bankAccountNo: "",
    ifscCode: "",
    panCard: "",
    gstCertificate: "",
    bankProof: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [filePreview, setFilePreview] = useState({
    panCard: null,
    gstCertificate: null,
    bankProof: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    } else setFormData(emptyForm);
  }, [initialData]);

  useEffect(() => {
    const previews = {};
    const objectUrls = [];
    const handlePreview = (key, fileValue) => {
      if (!fileValue) {
        previews[key] = null;
        return;
      }

      if (fileValue instanceof File) {
        const objectUrl = URL.createObjectURL(fileValue);
        previews[key] = objectUrl;
        objectUrls.push(objectUrl);
      }

      if (typeof fileValue === "string") {
        previews[key] = fileValue;
      }
    };

    handlePreview("panCard", formData.panCard);
    handlePreview("gstCertificate", formData.gstCertificate);
    handlePreview("bankProof", formData.bankProof);

    setFilePreview(previews);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.panCard, formData.gstCertificate, formData.bankProof]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="p-4 h-fit grow-3 border shodow-2xl rounded-2xl">
      <h3 className="mb-4 pb-2 text-xl font-semibold border-b">
        📝 Seller KYC
      </h3>
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <fieldset className="w-full flex gap-2 flex-col sm:flex-row">
          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">PAN Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🪪
              </span>
              <input
                onChange={handleFormChange}
                name="panNumber"
                value={formData.panNumber}
                type="text"
                placeholder="e.g. ABCDE1234F"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">GST Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🔢
              </span>
              <input
                onChange={handleFormChange}
                name="gstNumber"
                value={formData.gstNumber}
                type="text"
                placeholder="e.g. 22ABCDE1234F1Z5"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="w-full flex gap-2 flex-col sm:flex-row">
          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">Bank Account Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🔢
              </span>
              <input
                onChange={handleFormChange}
                name="bankAccountNo"
                value={formData.bankAccountNo}
                type="text"
                placeholder="Enter account number"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="w-full flex flex-col">
            <label className="mb-2 font-medium">IFSC Code</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-2 flex items-center">
                🔢
              </span>
              <input
                onChange={handleFormChange}
                name="ifscCode"
                value={formData.ifscCode}
                type="text"
                placeholder="Enter IFSC code"
                className="pl-8 pr-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex gap-2 flex-col">
          <div className="w-fit flex flex-col">
            <label className="mb-2 font-medium">Upload PAN Card</label>
            {/* Preview */}
            {filePreview.panCard && (
              <div className="mb-2">
                <img
                  src={filePreview.panCard}
                  alt="PanCard Preview"
                  className="w-16 h-16 object-cover rounded-xl border"
                />
              </div>
            )}

            <input
              onChange={handleFileChange}
              name="panCard"
              type="file"
              accept="image/*"
              className="w-full file:bg-blue-100 hover:file:bg-blue-200 file:p-1 file:rounded-md file:text-blue-800"
            />
          </div>

          <div className="w-fit flex flex-col">
            <label className="mb-2 font-medium">
              Upload GST Certificate (Optional)
            </label>

            {/* Preview */}
            {filePreview.gstCertificate && (
              <div className="mb-2">
                <img
                  src={filePreview.gstCertificate}
                  alt="GST Certificate Preview"
                  className="w-16 h-16 object-cover rounded-xl border"
                />
              </div>
            )}

            <input
              onChange={handleFileChange}
              name="gstCertificate"
              type="file"
              accept="image/*"
              className="w-full file:bg-blue-100 hover:file:bg-blue-200 file:p-1 file:rounded-md file:text-blue-800"
            />
          </div>

          <div className="w-fit flex flex-col">
            <label className="mb-2 font-medium">Upload Bank Proof</label>

            {/* Preview */}
            {filePreview.bankProof && (
              <div className="mb-2">
                <img
                  src={filePreview.bankProof}
                  alt="Bank Proof Preview"
                  className="w-16 h-16 object-cover rounded-xl border"
                />
              </div>
            )}

            <input
              onChange={handleFileChange}
              name="bankProof"
              type="file"
              accept="image/*"
              className="w-full file:bg-blue-100 hover:file:bg-blue-200 file:p-1 file:rounded-md file:text-blue-800"
            />
          </div>
        </fieldset>

        <div className="w-full flex flex-col">
          <button
            type="submit"
            className="p-3 bg-blue-700 hover:bg-blue-800 text-white text-lg font-bold rounded-2xl shadow-xl"
          >
            Submit KYC 🚀
          </button>
          <p className="mt-2 text-center font-extralight text-sm text-gray-500">
            By submitting your KYC documents, you confirm that the information
            is correct and you agree to our Terms & Seller Policy.
          </p>
        </div>
      </form>
    </div>
  );
};

const RejectionStatusCard = ({
  type = "application", // or kyc
  storeName = "Store Name",
  declineReason = "Not Mentioned",
  onReapply,
}) => {
  const isKyc = type === "kyc";
  return (
    <div className="p-4 flex flex-col justify-center items-center grow-3 bg-red-50 border shadow-2xl rounded-2xl">
      <div className="text-8xl text-center">🚫</div>
      <div className="text-center mt-4">
        <h4 className="text-4xl text-rose-500 font-semibold">
          {isKyc ? "KYC Rejected" : "Application Declined"}
        </h4>
        <p className="mt-2 text-gray-500">
          {isKyc ? "Your KYC submission for " : "Your request to open "}
          <span className="text-blue-500 font-medium uppercase">
            {storeName}
          </span>
          {isKyc ? " has been rejected." : " has been declined."}
        </p>
      </div>

      <div className="mt-4 px-2 py-4 w-1/2 bg-white rounded-2xl">
        <span className="text-sm font-semibold">💂 ADMIN REMARKS</span>
        <p className="mt-1 text-justify text-sm text-gray-500 italic">
          {declineReason}
        </p>
      </div>

      <button
        onClick={onReapply}
        className="mt-4 p-3 w-1/3 bg-green-600 hover:bg-green-700 transition-colors text-white text-center font-medium rounded-xl"
      >
        {isKyc ? "Fix & Resubmit KYC" : "Re-Apply"}
      </button>
    </div>
  );
};

const SellerVerifiedCard = ({ storeName = "Store Name" }) => {
  return (
    <div className="p-4 flex flex-col justify-center items-center grow-3 bg-green-50 border shadow-2xl rounded-2xl">
      <div className="text-8xl text-center">🎉</div>

      <div className="text-center mt-4">
        <h4 className="text-4xl font-semibold">Seller Verified</h4>

        <p className="mt-2 text-gray-500">
          Congratulations!{" "}
          <span className="text-green-600 font-medium uppercase">
            {storeName}
          </span>{" "}
          is now verified and ready to start selling.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          You can now manage products, orders, and grow your business.
        </p>
      </div>

      <Link
        to="/seller-dashboard"
        className="mt-4 p-3 w-1/3 bg-green-600 hover:bg-green-800 transition-colors text-center text-white font-medium rounded-xl"
      >
        Go To Dashboard
      </Link>
    </div>
  );
};

function SellerApply() {
  const howItWorks = [
    {
      title: "Register",
      description:
        "Fill out the form with your basic business and contact details.",
      icon: "📝",
    },
    {
      title: "Admin Review",
      description: "Your seller application is reviewed by the admin.",
      icon: "🧐",
    },
    {
      title: "Complete KYC",
      description:
        "Submit PAN, bank details, and required documents for verification.",
      icon: "🪪",
    },
    {
      title: "Start Selling",
      description: "After approval, access your dashboard and list products.",
      icon: "💰",
    },
  ];

  const whySellWithUs = [
    "Global Audience Access",
    "Lowest Commission Fees",
    "Fast Payouts (Weekly)",
    "Seller Protection Program",
    "Advanced Analytics Dashboard",
  ];

  const [sellerData, setSellerData] = useState(null);
  const [sellerKyc, setSellerKyc] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const sid = user?.sellerId;
    if (!sid) return;
    try {
      const getSeller = async () => {
        const sellerRef = doc(db, "sellers", sid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          const data = sellerSnap.data();
          setSellerData(data);
        }

        const kycRef = doc(db, "sellers", sid, "kyc", sid);
        const kycSnap = await getDoc(kycRef);
        if (kycSnap.exists()) {
          const data = kycSnap.data();
          setSellerKyc(data);
        }
      };

      getSeller();
    } catch (err) {
      console.log(err);
    }
  }, [user?.sellerId]); // get draft seller

  const getChangedFields = (original, updated) => {
    const IGNORED_FIELDS = ["createdAt", "updatedAt", "sid"];
    const changes = {};

    for (const key in updated) {
      if (IGNORED_FIELDS.includes(key)) continue;
      if (
        JSON.stringify(updated[key]) !== JSON.stringify(original[key]) &&
        updated[key] !== undefined
      ) {
        changes[key] = updated[key];
      }
    }

    return changes;
  };

  const uploadFile = async (file, filePath, fileName) => {
    if (!file) return null;
    const fileRef = ref(storage, `${filePath}/${fileName}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);
    return fileURL;
  };

  const submitApplication = async (data) => {
    let sid; // seller id
    if (user.sellerId) {
      sid = user.sellerId;
    } else {
      // create seller
      const sellerinfo = {
        ...data,
        logo: null, // overwrite logo to null
      };
      const createNewSeller = httpsCallable(functions, "createNewSeller");
      sid = (await createNewSeller(sellerinfo)).data;
    }

    // get changes
    const changes = sellerData
      ? getChangedFields(sellerData, data)
      : { ...data };
    console.log(changes);

    // if logo changed
    if (changes.logo instanceof File) {
      //   const fileRef = ref(storage, `sellers/${sid}/logo.jpg`);
      //   await uploadBytes(fileRef, changes.logo);
      changes.logo = await uploadFile(
        changes.logo,
        `sellers/${sid}`,
        "logo.jpg",
      ); // set url of logo before update
    } else {
      delete changes.logo; // again avoid undefined before update
    }

    if (Object.keys(changes).length === 0) return; // return if not changes

    const sellerRef = doc(db, "sellers", sid);
    await updateDoc(sellerRef, changes);
    const submitSeller = httpsCallable(functions, "submitSellerApplication");
    await submitSeller();

    setSellerData((prev) => ({
      ...prev,
      ...changes,
      sellerStatus: "REVIEWING_SELLER",
      currentStatus: "APPLICATION_SUBMITTED",
      createdAt: new Date(),
    }));
  };

  const submitKYC = async (data) => {
    const sid = sellerData?.sellerId;
    const changes = sellerKyc ? getChangedFields(sellerKyc, data) : data;

    console.log(changes);

    if (changes.panCard instanceof File) {
      const panCardUrl = await uploadFile(
        changes.panCard,
        `sellers/${sid}/kyc`,
        "panCard.jpg",
      );

      changes.panCard = panCardUrl;
    } else {
      delete changes.panCard;
    }

    if (changes.gstCertificate instanceof File) {
      const gstCertificateUrl = await uploadFile(
        changes.gstCertificate,
        `sellers/${sid}/kyc`,
        "gstCertificate.jpg",
      );

      changes.gstCertificate = gstCertificateUrl;
    } else {
      delete changes.gstCertificate;
    }

    if (changes.bankProof instanceof File) {
      const bankProofUrl = await uploadFile(
        changes.bankProof,
        `sellers/${sid}/kyc`,
        "bankProof.jpg",
      );

      changes.bankProof = bankProofUrl;
    } else {
      delete changes.bankProof;
    }

    const sellerRef = doc(db, "sellers", sid, "kyc", sid);
    await setDoc(sellerRef, changes, { merge: true });
    const submitKYC = httpsCallable(functions, "submitSellerKYC");
    await submitKYC();

    setSellerKyc((prev) => ({
      ...prev,
      ...changes,
      kycStatus: "REVIEWING_KYC",
      updatedAt: new Date(),
    }));

    setSellerData((prev) => ({
      ...prev,
      kycStatus: "REVIEWING_KYC",
      currentStatus: "KYC_SUBMITTED",
    }));
  };

  const resubmitApplication = async () => {
    try {
      const reapply = httpsCallable(functions, "reapplySeller");
      await reapply({ sid: sellerData.sellerId });
      setSellerData((prev) => ({
        ...prev,
        sellerStatus: "DRAFT",
        currentStatus: "APPLICATION_NOT_SUBMITTED",
        rejectReason: null,
      }));
    } catch (error) {
      console.log("Error resubmit application", error.message);
    }
  };

  const resubmitKYC = async () => {
    try {
      const reapply = httpsCallable(functions, "reapplyKYC");
      await reapply({ sid: sellerData.sellerId });
      setSellerKyc((prev) => ({
        ...prev,
        kycStatus: "UNVERIFIED",
        rejectReason: null,
      }));

      setSellerData((prev) => ({
        ...prev,
        kycStatus: "UNVERIFIED",
        currentStatus: "KYC_NOT_SUBMITTED",
      }));
    } catch (error) {
      console.log("Error resubmit application", error.message);
    }
  };

  const getHeaderContent = () => {
    const currentStatus = sellerData?.currentStatus;

    switch (currentStatus) {
      case "APPLICATION_NOT_SUBMITTED":
        return sellerData?.sellerId
          ? {
              title: "Update Your Seller Application 📝",
              subTitle:
                "Edit your store details and submit again for approval.",
            }
          : {
              title: "Start Selling With Us 🚀",
              subTitle:
                "Join thousands of sellers and reach millions of customers. Fill out the form below to submit your store for approval",
            };

      case "APPLICATION_SUBMITTED":
        return {
          title: "Application Pending ⌛",
          subTitle:
            "Your application is under review. Please wait for admin approval before you can start selling.",
        };

      case "APPLICATION_REJECTED":
        return {
          title: "Application Rejected 🚩",
          subTitle:
            "Your seller application did not meet the approval requirements. You may update your information and reapply.",
        };

      case "KYC_NOT_SUBMITTED":
        return {
          title: "Update Your KYC Details 🪪",
          subTitle:
            "Fill out the required documents and submit again for verification.",
        };

      case "KYC_SUBMITTED":
        return {
          title: "KYC Under Review ⏳",
          subTitle:
            "Your KYC documents have been submitted and are currently under review. You will be able to start selling once verification is successful.",
        };

      case "KYC_REJECTED":
        return {
          title: "KYC Verification Failed ⚠️",
          subTitle:
            "There was an issue with your submitted KYC documents. Please update the required information and resubmit to proceed with selling.",
        };

      case "KYC_VERIFIED":
        return {
          title: "Application Approved 🎉",
          subTitle:
            "Congratulations! Your seller profile is verified and active.",
        };

      default: // Fallback for completely new users where currentStatus is undefined
        return {
          title: "Start Selling With Us 🚀",
          subTitle:
            "Join thousands of sellers and reach millions of customers. Fill out the form below to submit your store for approval",
        };
    }
  };

  const renderMainCard = () => {
    const currentStatus = sellerData?.currentStatus;

    switch (currentStatus) {
      case "APPLICATION_SUBMITTED":
        return (
          <SubmissionStatusCard
            storeName={sellerData.storeName}
            submitDate={sellerData.createdAt}
          />
        );

      case "APPLICATION_REJECTED":
        return (
          <RejectionStatusCard
            storeName={sellerData.storeName}
            declineReason={sellerData.rejectReason}
            onReapply={resubmitApplication}
          />
        );

      case "KYC_NOT_SUBMITTED":
        return <SellerKYCForm onSave={submitKYC} initialData={sellerKyc} />;

      case "KYC_SUBMITTED":
        return (
          <SubmissionStatusCard
            type="kyc"
            storeName={sellerData.storeName}
            submitDate={sellerKyc?.updatedAt || sellerData.createdAt}
          />
        );

      case "KYC_REJECTED":
        return (
          <RejectionStatusCard
            type="kyc"
            storeName={sellerData.storeName}
            declineReason={sellerKyc?.rejectReason || sellerData.rejectReason}
            onReapply={resubmitKYC}
          />
        );

      case "KYC_VERIFIED":
        return (
         <SellerVerifiedCard storeName={sellerData.storeName}/>
        );

      case "APPLICATION_NOT_SUBMITTED":
      default:
        return (
          <SellerForm onSave={submitApplication} initialData={sellerData} />
        );
    }
  };

  const { title, subTitle } = getHeaderContent();

  return (
    <section className="mx-auto p-4 max-w-7xl">
      <h2 className="mb-2 text-3xl sm:text-4xl font-bold text-center">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-gray-400 text-center">{subTitle}</p>

      <div className="mt-4 flex flex-col md:flex-row gap-4">
        {renderMainCard()}

        <div className="flex flex-col h-fit gap-4">
          <HowItWorksCard howItWorks={howItWorks} />
          <WhySellWithUsCard whySellWithUs={whySellWithUs} />
        </div>
      </div>
    </section>
  );
}

export default SellerApply;
