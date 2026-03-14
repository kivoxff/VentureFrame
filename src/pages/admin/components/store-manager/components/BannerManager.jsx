import { useEffect, useState } from "react";
import { db, functions, storage } from "../../../../../firebase/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import errorIcon from "../../../../../assets/icons/error.svg";
import confirmToast from "../../../../../utils/confirmToast";

function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    link: "",
    file: null,
    preview: "",
  });

  useEffect(() => {
    const localUrl = formData.preview;

    if (localUrl) {
      return () => URL.revokeObjectURL(localUrl);
    }
  }, [formData.preview]);

  useEffect(() => {
    const bannersRef = collection(db, "storeConfig", "metadata", "banners");
    const unsubscribe = onSnapshot(bannersRef, (snap) => {
      const banners = snap.docs.map((doc) => ({
        banId: doc.id,
        banLink: doc.data().redirectTo,
        banImage: doc.data().banner ?? errorIcon,
      }));

      setBanners(banners);
    });

    return () => unsubscribe();
  }, []);

  const handleBannerImg = (e) => {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);

    if (formData.preview) {
      URL.revokeObjectURL(formData.preview);
    }

    setFormData((prev) => ({
      ...prev,
      file,
      preview,
    }));
  };

  const addBanner = async () => {
    const banImage = formData.file;
    const banLink = formData.link;

    if (!banImage || !banLink) return;

    const createNewBanner = httpsCallable(functions, "createBanner");
    const result = await createNewBanner({ redirectTo: banLink });
    const bannerId = result.data;

    const imageRef = ref(
      storage,
      `storeConfig/banners/${bannerId}/banImage.jpg`,
    );

    await uploadBytes(imageRef, banImage);
    const imageURL = await getDownloadURL(imageRef);

    const bannerRef = doc(db, "storeConfig", "metadata", "banners", bannerId);

    await updateDoc(bannerRef, {
      banner: imageURL,
    });

    setFormData({
      link: "",
      file: null,
      preview: "",
    });
  };

  const removeBanner = async (banId, banLink) => {
    if (!banId) return;

    const isConfirmed = await confirmToast(`Remove ${banLink}`);

    if (isConfirmed) {
      const deleteBanner = httpsCallable(functions, "deleteBanner");
      await deleteBanner({ bannerId: banId });
    }
  };

  return (
    <div className="flex-1 px-3 py-2 flex flex-col gap-4 rounded-xl shadow-xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">🖼️ Banner Manager</h3>
        <p className="text-xs text-gray-500">Add or remove banner images</p>
      </div>

      <div className="flex gap-2">
        <label className="shrink-0 w-10 h-10 flex justify-center items-center border border-gray-400 border-dashed rounded-md cursor-pointer">
          <input
            onChange={handleBannerImg}
            accept="image/*,svg+xml"
            type="file"
            className="hidden"
          />
          {formData.preview ? (
            <img
              src={formData.preview}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-sm text-gray-400">IMG</span>
          )}
        </label>

        <input
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              link: e.target.value,
            }))
          }
          value={formData.link}
          type="text"
          name="featureInput"
          placeholder="e.g. https://..."
          className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
        />

        <button
          onClick={addBanner}
          type="button"
          className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {banners.map((item) => (
          <div className="px-2 py-1 bg-white text-green-700 font-medium border border-gray-300 hover:border-violet-400 transition-colors rounded-full flex gap-2 items-center text-sm">
            <img src={item.banImage} className="w-5 h-5 object-contain" />
            <a
              href={item.banLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open
            </a>
            <button
              onClick={() => removeBanner(item.banId, item.banLink)}
              type="button"
              className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors text-xs"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BannerManager;
