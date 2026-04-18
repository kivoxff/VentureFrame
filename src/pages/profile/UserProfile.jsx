import { useEffect, useState } from "react";
import ProfileCard from "../../components/profile/ProfileCard";
import { useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { storage } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Loader from "../../components/ui/misc/Loader";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [originalUserData, setOriginalUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { uid } = useParams();
  const { user } = useAuth();

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImg(file);

    const previewURL = URL.createObjectURL(file);
    handleProfileChange({
      target: { name: "photoURL", value: previewURL },
    });
  };

  const getChangedFields = (original, updated) => {
    const IGNORED_FIELDS = ["createdAt", "updatedAt", "userId", "email"];
    const changes = {};

    for (const key in updated) {
      if (IGNORED_FIELDS.includes(key)) continue;
      if (original[key] !== updated[key]) {
        changes[key] = updated[key];
      }
    }

    return changes;
  };

  const handleProfileSave = async () => {
    const changes = getChangedFields(originalUserData, userData);

    if (!selectedImg && Object.keys(changes).length === 0) {
      setIsEditing(false);
      toast.info("No Changes Made");
      return;
    }

    try {
      setIsSaving(true); // start loading

      // store and get image form cloud storage
      if (selectedImg) {
        const fileRef = ref(storage, `users/${user.userId}/profile.jpg`);
        await uploadBytes(fileRef, selectedImg);
        const photoURL = await getDownloadURL(fileRef);
        changes.photoURL = photoURL;
      }

      // store changes in firestore
      const userRef = doc(db, "users", user.userId);
      await updateDoc(userRef, {
        ...changes,
        updatedAt: serverTimestamp(),
      });

      setUserData((prev) => ({
        ...prev,
        ...changes,
      }));

      setOriginalUserData((prev) => ({
        ...prev,
        ...changes,
      }));

      setSelectedImg(null);
      setIsEditing(false);
      setIsSaving(false);
      toast.success("Profile Updated");
    } catch (err) {
      setIsSaving(false);
      toast.error(err.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
        setOriginalUserData(userSnap.data());
      } else {
        toast.error("No user found");
      }
    };

    fetchUser();
  }, [uid]);

  useEffect(() => {
    return () => {
      if (userData?.photoURL?.startsWith("blob:")) {
        URL.revokeObjectURL(userData.photoURL);
      }
    };
  }, [userData?.photoURL]);

  if (!userData) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <ProfileCard
      type={"user"}
      profileData={userData}
      loggedInUserId={user?.userId}
      isSaving={isSaving}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      handleProfileImg={handleProfileImg}
      handleProfileChange={handleProfileChange}
      handleProfileSave={handleProfileSave}
      fieldNames={{
        photo: "photoURL",
        name: "displayName",
        mail: "email",
        id: "userId",
      }}
      const
      redirectTo={
        userData?.sellerId
          ? `/profile/seller/${userData.sellerId}`
          : user?.userId === uid
            ? "/seller-apply"
            : null
      }
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
              Member Since
            </label>
            <div className="p-2 flex items-center bg-blue-100 rounded-md">
              <span className="text-xl">📅</span>
              <input
                value={userData.createdAt.toDate().toLocaleDateString()}
                type="text"
                className="mt-1 px-3 w-full font-semibold rounded-md"
                disabled
              />
            </div>
          </div>

          <div className="w-full">
            <label className="text-gray-400 text-xs font-medium">
              Current Role
            </label>
            <div className="p-2 flex items-center gap-1 bg-blue-100 rounded-md">
              <span className="text-xl">🛡️</span>
              {/* <input value={userData.role} type="text" className="mt-1 px-1 w-full font-semibold rounded-md" /> */}
              <select className="px-2 font-semibold appearance-none outline-none text-start">
                <option
                  value="blocked"
                  className="text-yellow-600 text-start bg-gray-100"
                >
                  Customer
                </option>
                <option
                  value="active"
                  className="text-green-600 text-start bg-gray-100"
                >
                  Admin
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* third card */}
      <div className="p-4 border bg-white rounded-2xl shadow-xl">
        <div className="w-full flex justify-between">
          <h3 className="text-lg font-bold">Shipping Information</h3>
          <span className="text-xl">📍</span>
        </div>

        <div className="pt-4 flex gap-1">
          <span className="text-2xl">🏚️</span>
          <div className="w-full flex flex-col">
            <h4 className="px-2 font-bold">Primary Address</h4>
            <textarea
              onChange={handleProfileChange}
              name="address"
              value={userData.address}
              disabled={!isEditing}
              placeholder="No Address"
              className={`px-2 w-full h-fit text-sm text-gray-500 font-semibold ${isEditing ? "border border-gray-400" : ""}`}
            ></textarea>
            <span className="px-2 text-sm text-gray-500 font-semibold uppercase">
              India
            </span>
          </div>
        </div>
      </div>
    </ProfileCard>
  );
};

export default UserProfile;