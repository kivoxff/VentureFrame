import { useEffect, useState } from "react";
import ResourceTable from "../tables/ResourceTable";
import ProductFormModal from "./ProductFormModal";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, functions, storage } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "../../context/AuthContext";
import confirmToast from "../../utils/confirmToast";

const ProductsManager = ({ source }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // get products
    // if (!user) return;
    const productsRef = collection(db, "products");

    const q =
      source === "seller" && user?.sellerId
        ? query(productsRef, where("sellerId", "==", user.sellerId))
        : productsRef;

    const unsubscribe = onSnapshot(q, (snap) => {
      const productsData = snap.docs.map((doc) => {
        const {
          productId: id,
          stockStatus: status,
          storeName: seller,
          ...data
        } = doc.data();

        return { id, status, seller, ...data };
      });

      setProducts(productsData);
    });

    return () => unsubscribe;
  }, [source, user]);

  const headers = [
    { label: "Product ID", key: "id" },
    { label: "Product Name", key: "title" },
    { label: "Seller", key: "seller" },
    { label: "Brand", key: "brand" },
    { label: "Status", key: "status" },
    { label: "Price", key: "price" },
    { label: "Stock", key: "stock" },
    { label: "Actions", key: "actions" },
  ];

  const rowActions = [
    {
      label: "Edit",
      func: (row) => handleEditClick(row),
    },

    {
      label: "Remove",
      func: async (row) => {
        const isConfirmed = await confirmToast(`Delete ${row.title}?`);

        if (isConfirmed) {
          await removeProduct({ productId: row.id, ProductImgs: row.images });
        }
      },
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(false);

  const getChangedFields = (original, updated) => {
    const changes = {};
    const IGNORED_FIELDS = ["createdAt", "updatedAt", "sid"];
    for (const key in updated) {
      if (IGNORED_FIELDS.includes(key)) continue;
      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        changes[key] = updated[key];
      }
    }

    return changes;
  };

  const uploadImages = async (images, productId) => {
    const imagesObj = [];

    for (const objOrFile of images) {
      if (objOrFile instanceof File) {
        const filePath = `products/${productId}/productImg_${Date.now()}_${Math.random()}`;
        const productRef = ref(storage, filePath);
        await uploadBytes(productRef, objOrFile);
        const fileUrl = await getDownloadURL(productRef);
        imagesObj.push({ url: fileUrl, path: filePath });
      } else {
        imagesObj.push(objOrFile);
      }
    }

    return imagesObj;
  };

  const saveProduct = async (productData) => {
    if (editingProduct) {
      const productId = editingProduct.id;

      const changes = getChangedFields(editingProduct, productData);
      console.log(changes);
      if (changes.images) {
        changes.images = await uploadImages(changes.images, productId);
      }

      const updateProduct = httpsCallable(functions, "updateProduct");
      await updateProduct({ productId: productId, updatedData: changes });
    } else {
      // create new product
      const { images, ...data } = productData;
      const createProduct = httpsCallable(functions, "createNewProduct");
      const result = await createProduct({
        ...data,
        createProductFor: source,
      });
      const productId = result.data;
      const imagesObj = await uploadImages(images, productId);

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        images: imagesObj,
      });
    }
    closeModal();
  };

  const handleCreateClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const removeProduct = async ({ productId }) => {
    const deleteProduct = httpsCallable(functions, "deleteProduct");
    await deleteProduct({ productId });
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  return (
    <section>
      <ResourceTable
        data={products}
        headers={headers}
        rowActions={rowActions}
        filterOptions={["All", "In Stock", "Out of Stock"]}
        searchKeys={["id", "brand"]}
        title={"Products"}
        placeHolder={"Search by Product ID or Brand"}
        handleCreateClick={handleCreateClick}
      />

      {/* -----------------Modal------------------- */}
      {isModalOpen && (
        <ProductFormModal
          onClose={closeModal}
          initialData={editingProduct}
          onSave={saveProduct}
        />
      )}
    </section>
  );
};

export default ProductsManager;
