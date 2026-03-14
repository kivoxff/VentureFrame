import { useCallback, useEffect, useState } from "react";
import SearchDropdown from "../../../../../components/ui/drop-downs/SearchDropdown";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../../../../firebase/config";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import LoadMore from "../../../../../components/ui/misc/LoadMore";
import { useSectionProducts } from "../../../../../hooks/useSectionProducts";
import { useAuth } from "../../../../../context/AuthContext";

const SectionCard = ({
  section,
  saveSection,
  removeSection,
  addSectionProduct,
  removeSectionProduct,
  currentUser,
  cancelSecEdit,
  offset,
}) => {
  const [searchVal, setSearchVal] = useState("");
  const [isSecLockExp, setIsSecLockExp] = useState(false);

  const LOCK_TIMEOUT_MS = 30 * 1000; // 15 minutes
  const HEARTBEAT_MS = 15 * 1000; // 10 minutes

  // Initialize the hook with the string IDs from Firebase
  const ids = section.productIds;
  const {
    products: fetchedProducts,
    loadMore,
    hasMore,
  } = useSectionProducts({
    productIds: ids,
    PRODUCTS_PER_PAGE: 9,
  });

  // Combine products and FILTER OUT any IDs that the user has marked for deletion
  const displayProducts = [...section.newProducts, ...fetchedProducts].filter(
    (p) => !section.deletedIds.includes(p.id),
  );

  const isUnsaved = !section.isSaved;
  const islockedByMe = section.lockedBy && section.lockedBy === currentUser;
  const isEditing = isUnsaved || (islockedByMe && !isSecLockExp);

  const isLockedByOther = !isUnsaved && !islockedByMe && !isSecLockExp;

  useEffect(() => {
    console.log("HEARTBEAT BLOCKED");
    if (isUnsaved || !islockedByMe || isSecLockExp) return;

    console.log("HEARTBEAT STARTED");
    const heartbeatInterval = setInterval(async () => {
      console.log("HEARTBEAT CALLING LOCK", {
        slug: section.slug,
        time: new Date().toISOString(),
      });

      const startEdit = httpsCallable(functions, "lockSection");
      await startEdit({ secId: section.slug });
      console.log("loked");
    }, HEARTBEAT_MS);

    return () => {
      console.log("HEARTBEAT CLEARED");
      clearInterval(heartbeatInterval);
    };
  }, [isUnsaved, islockedByMe, isSecLockExp, currentUser, section.slug]);

  useEffect(() => {
    console.log("TIMER EFFECT RUN");

    if (!section.lockedAt) {
      console.log("NO LOCKED AT");
      setIsSecLockExp(true);
      return;
    }

    setIsSecLockExp(false);

    const lockedTime = section.lockedAt.toDate().getTime();
    const expiryTime = lockedTime + LOCK_TIMEOUT_MS + 2000; // buffer
    const now = Date.now() + offset;

    const remainingTime = expiryTime - now;
    console.log("LOCK DEBUG", {
      lockedAtMillis: lockedTime,
      lockedAtReadable: section.lockedAt.toDate(),
      expiryTime,
      now,
      remainingSeconds: remainingTime / 1000,
    });

    if (remainingTime <= 0) {
      console.log("LOCK EXPIRED");
      setIsSecLockExp(true);
      return;
    }

    const timer = setTimeout(() => {
      console.log("LOCK TIMER TRIGGERED -> EXPIRED");
      setIsSecLockExp(true);
    }, remainingTime);

    return () => {
      console.log("TIMER CLEARED");
      clearTimeout(timer);
    };
  }, [section.lockedAt?.toMillis(), offset]);

  return (
    <div className="p-3 w-full border border-gray-400 rounded-md">
      <div className="w-full flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="flex flex-wrap items-center gap-2">
          {!isLockedByOther && (
            <button
              onClick={() =>
                removeSection(section.title, section.slug, section.isSaved)
              }
              className="text-gray-400 text-sm hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors"
            >
              ✖
            </button>
          )}

          <h3 className="text-lg text-blue-700 font-medium break-all capitalize">
            {section.title}
          </h3>

          {/* SECTION TYPE */}
          <span className="px-2 py-1 text-xs border border-blue-300 rounded-full bg-gray-200">
            {section.type}
          </span>

          {isLockedByOther && (
            <span className="text-red-600 text-xs font-bold flex items-center gap-1">
              🔒 Locked
            </span>
          )}
        </div>

        {isEditing && (
          <div className="py-2 w-full sm:w-auto flex items-center relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              onChange={(e) => setSearchVal(e.target.value)}
              value={searchVal}
              type="text"
              placeholder="Search by product ID or Name"
              className="peer pl-9 pr-3 py-2 w-full sm:w-72 border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
            />

            {searchVal && (
              <SearchDropdown
                searchVal={searchVal}
                onSelect={(item) => {
                  addSectionProduct(section.title, item);
                  // setSearchVal("");
                }}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-2">
        {displayProducts.length > 0 ? (
          // products
          displayProducts.map((p) => (
            <div className="px-2 py-1 bg-white text-green-700 font-medium border border-gray-300 hover:border-violet-400 transition-colors rounded-full flex gap-2 items-center text-sm">
              {p.name}{" "}
              {isEditing && (
                <button
                  onClick={() => removeSectionProduct(section.title, p.id)}
                  type="button"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors text-xs"
                >
                  ✖
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-gray-500 text-sm italic">
            No products added yet...
          </span>
        )}
      </div>
      <LoadMore onClick={loadMore} hasMore={hasMore} />{" "}
      {/* Load more products */}
      <div className="flex justify-end mt-2 gap-2">
        {section.isSaved && isEditing && (
          <button
            onClick={() =>
              cancelSecEdit(section.title, section.slug, section.isSaved)
            }
            className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          onClick={async () => {
            const startEdit = httpsCallable(functions, "lockSection");
            isEditing
              ? saveSection(section)
              : await startEdit({ secId: section.slug });
          }}
          disabled={isLockedByOther}
          className={`px-4 py-2 text-white text-sm font-medium rounded-md 
            transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 
            ${
              isLockedByOther
                ? "bg-gray-400 cursor-not-allowed opacity-75"
                : !section.isSaved
                  ? "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500"
                  : isEditing
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            }`}
        >
          {!section.isSaved
            ? "Save Section"
            : isLockedByOther
              ? "Locked 🔒"
              : isEditing
                ? "Update Section"
                : "Edit Section"}
        </button>
      </div>
    </div>
  );
};

function SectionManager() {
  const { user } = useAuth();
  const [timeOffset, setTimeOffset] = useState(0);
  const [productSections, setProductSections] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "M-Grid",
  });

  useEffect(() => {
    // time sync only for ui
    const syncServerTime = async () => {
      const syncRef = doc(db, "storeConfig", "metadata");
      const t0 = Date.now();
      await setDoc(
        syncRef,
        {
          now: serverTimestamp(),
        },
        { merge: true },
      );

      const syncSnap = await getDoc(syncRef);

      const t1 = Date.now();

      const serverTime = syncSnap.data().now.toMillis();
      const clientMid = (t0 + t1) / 2;
      const offset = serverTime - clientMid;

      setTimeOffset(offset);
      console.log(offset);
    };

    // run immediately
    syncServerTime();

    // run every 15 minutes
    const interval = setInterval(syncServerTime, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sectionsRef = collection(db, "storeConfig", "metadata", "sections");
    const unsubscribe = onSnapshot(sectionsRef, (snap) => {
      console.log("SNAPSHOT RECEIVED", {
        time: new Date().toISOString(),
        docs: snap.docs.length,
      });

      setProductSections((prevSections) => {
        // 1. Process Database Sections
        const dbSections = snap.docs.map((doc) => {
          const sectionData = doc.data();

          console.log("SECTION DATA", {
            slug: doc.id,
            lockedBy: sectionData.lockedBy,
            lockedAt: sectionData.lockedAt?.toMillis(),
          });

          const existingSection = prevSections.find(
            (sec) => sec.title === sectionData.title,
          );

          // FIX: Prevent product duplication!
          // Only keep newProducts that haven't been saved to the DB yet.
          const preservedNewProducts = existingSection
            ? existingSection.newProducts.filter(
                (p) => !sectionData.productIds?.includes(p.id),
              )
            : [];

          const preservedDeletedIds = existingSection
            ? existingSection.deletedIds.filter((id) =>
                sectionData.productIds?.includes(id),
              )
            : [];

          return {
            ...sectionData,
            isSaved: true,
            newProducts: preservedNewProducts,
            deletedIds: preservedDeletedIds,
          };
        });

        // Process Local Sections (FIX: Prevent section duplication!)
        // Create an array of titles that are now in the DB
        const dbSecTitles = dbSections.map((sec) => sec.title);

        // Only keep unsaved local sections if they DO NOT exist in the DB yet
        const localSections = prevSections.filter(
          (sec) => !sec.isSaved && !dbSecTitles.includes(sec.title),
        );

        return [...localSections, ...dbSections];
      });
    });

    return () => unsubscribe();
  }, []);

  const cancelSecEdit = async (sectionTitle, secId, isSaved) => {
    // Wipe out any local changes made during this edit session
    setProductSections((prev) =>
      prev.map((sec) => {
        if (sec.title === sectionTitle) {
          return { ...sec, newProducts: [], deletedIds: [] };
        }
        return sec;
      }),
    );

    // Release the lock in the database (only if it's an existing section)
    if (isSaved && secId) {
      const stopEdit = httpsCallable(functions, "unlockSection");
      await stopEdit({ secId });
    }
  };

  const addSection = () => {
    const secTitle = formData.title.trim().toLowerCase();
    const secType = formData.type;

    const newSection = {
      title: secTitle,
      type: secType,
      productIds: [],
      newProducts: [],
      deletedIds: [],
      isSaved: false,
    };

    if (!productSections.some((item) => item.title === secTitle)) {
      setProductSections((prev) => [newSection, ...prev]);
    }

    setFormData({
      title: "",
      type: "M-Grid",
    });
  };

  const addSectionProduct = (sectionTitle, product) => {
    setProductSections((prev) =>
      prev.map((section) => {
        if (section.title !== sectionTitle) return section;

        // Is it soft-deleted? Just restore it and stop.
        const isSoftDeleted = section.deletedIds.includes(product.id);
        if (isSoftDeleted) {
          return {
            ...section,
            deletedIds: section.deletedIds.filter((id) => id !== product.id),
          };
        }

        const isProductExist = // is product exists in local or db
          section.productIds.includes(product.id) ||
          section.newProducts.some((p) => p.id === product.id);

        if (isProductExist) return section;

        return {
          // is new product
          ...section,
          newProducts: [
            { id: product.id, name: product.name },
            ...section.newProducts,
          ],
        };
      }),
    );
  };

  const removeSectionProduct = (sectionTitle, id) => {
    setProductSections((prev) =>
      prev.map((section) => {
        if (section.title === sectionTitle) {
          // Check if this ID belongs to a newly added product
          const isNewProduct = section.newProducts?.some((p) => p.id === id);

          if (isNewProduct) {
            // If it's a new product, just filter it out safely
            return {
              ...section,
              newProducts: section.newProducts.filter((p) => p.id !== id),
            };
          } else {
            // If it's an existing DB product, SOFT DELETE it.
            // Do NOT touch `productIds` so the hook ignores the change.
            return {
              ...section,
              deletedIds: [...section.deletedIds, id],
            };
          }
        }
        return section;
      }),
    );
  };

  const saveSection = async (section) => {
    const filteredIds = section.productIds.filter(
      (id) => !section.deletedIds.includes(id),
    );

    // Merge the new objects down to strings
    const mergedProductIds = [
      ...filteredIds,
      ...section.newProducts.map((p) => p.id),
    ];

    const payload = {
      ...section,
      productIds: mergedProductIds,
    };
    delete payload.newProducts; // Keep DB clean
    delete payload.deletedIds;

    const save = httpsCallable(functions, "saveSection");
    await save({ section: payload });
  };

  const removeSection = async (secTitle, secSlug, isSaved) => {
    if (isSaved) {
      const remove = httpsCallable(functions, "deleteSection");
      await remove({ sectionId: secSlug });
    } else {
      setProductSections((prev) =>
        prev.filter((sec) => sec.title !== secTitle),
      );
    }
  };

  return (
    <div className="flex-1 px-3 py-2 flex flex-col gap-4 rounded-xl shadow-xl">
      {/* heading */}
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">🗃️ Section Manager</h3>
        <p className="text-xs text-gray-500">Add or remove product sections</p>
      </div>

      {/* section form */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2">
        <div className="w-full">
          <label className="mb-2 font-medium">Section type</label>
          <select
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            value={formData.type}
            className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500"
          >
            <option value="M-Grid">Mobile Grid / Desktop Scroll</option>
            <option value="M-Scroll">Mobile Scroll / Desktop Grid</option>
          </select>
        </div>

        <div className="w-full">
          <label className="mb-2 font-medium">Section title</label>
          <div className="flex gap-2">
            <input
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              value={formData.title}
              type="text"
              placeholder="e.g. Best Seller"
              className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
            />
            <button
              onClick={addSection}
              type="button"
              className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 transition-colors whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* sections */}
      <div className="flex flex-col gap-4">
        {productSections.map((section, idx) => (
          <SectionCard
            key={section.slug || section.title}
            section={section}
            saveSection={saveSection}
            removeSection={removeSection}
            addSectionProduct={addSectionProduct}
            removeSectionProduct={removeSectionProduct}
            currentUser={user?.userId}
            cancelSecEdit={cancelSecEdit}
            offset={timeOffset}
          />
        ))}
      </div>
    </div>
  );
}

export default SectionManager;
