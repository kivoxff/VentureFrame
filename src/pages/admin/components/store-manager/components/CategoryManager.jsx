import { useEffect, useState } from "react";
import { db, functions, storage } from "../../../../../firebase/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import errorIcon from "../../../../../assets/icons/error.svg";
import confirmToast from "../../../../../utils/confirmToast";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
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
    const categoriesRef = collection(
      db,
      "storeConfig",
      "metadata",
      "categories",
    );
    const unsubscribe = onSnapshot(categoriesRef, (snap) => {
      const categories = snap.docs.map((doc) => ({
        catId: doc.id,
        catIcon: doc.data().icon ?? errorIcon,
      }));

      setCategories(categories);
    });

    return () => unsubscribe();
  }, []);

  const handleCategoryIcon = (e) => {
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

  const addCategory = async () => {
    const catName = formData.name.trim().toLowerCase();
    const iconFile = formData.file;
    if (!catName || !iconFile) return;

    const createNewCategory = httpsCallable(functions, "createCategory");
    const result = await createNewCategory({ categoryName: catName });
    const catId = result.data;

    const imageRef = ref(
      storage,
      `storeConfig/categories/${catId}/catIcon.jpg`,
    );
    await uploadBytes(imageRef, iconFile);
    const imageURL = await getDownloadURL(imageRef);

    const categoryRef = doc(db, "storeConfig", "metadata", "categories", catId);
    await updateDoc(categoryRef, {
      icon: imageURL,
    });

    setFormData({
      name: "",
      file: null,
      preview: "",
    });
  };

  const removeCategory = async (catId) => {
    const isConfirmed = await confirmToast(`Remove ${catId}`);

    if (isConfirmed) {
      const deleteCategory = httpsCallable(functions, "deleteCategory");
      await deleteCategory({ categoryId: catId });
    }
  };

  return (
    <div className="flex-1 px-3 py-2 flex flex-col gap-4 rounded-xl shadow-xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">🗃️ Category Manager</h3>
        <p className="text-xs text-gray-500">
          Add or remove product categories
        </p>
      </div>

      <div className="flex gap-2">
        <label className="shrink-0 w-10 h-10 flex justify-center items-center border border-gray-400 border-dashed rounded-md cursor-pointer">
          <input
            onChange={handleCategoryIcon}
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
            <span className="text-sm text-gray-400">Icon</span>
          )}
        </label>
        <input
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          value={formData.name}
          type="text"
          name="featureInput"
          placeholder="e.g. Electronics"
          className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
        />
        <button
          onClick={addCategory}
          type="button"
          className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {categories.map((item, idx) => (
          <div className="px-2 py-1 bg-white text-green-700 capitalize font-medium border border-gray-300 hover:border-violet-400 transition-colors rounded-full flex gap-2 items-center text-sm">
            <img src={item.catIcon} className="w-5 h-5 object-contain" />
            {item.catId}
            <button
              onClick={() => removeCategory(item.catId)}
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

export default CategoryManager;
