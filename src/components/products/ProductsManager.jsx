import { useEffect, useState } from "react";
import ProductFormModal from "./ProductFormModal";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, functions, storage } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import confirmToast from "../../utils/confirmToast";
import { useNavigate } from "react-router-dom";
import ResourceTable from "../tables/ResourceTable";

const ProductsManager = ({ source }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(false);

  const navigate = useNavigate();

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
      const productId = editingProduct.productId;

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

  const headers = [
    { key: "productId", label: "ID", sortable: false },
    { key: "title", label: "Title", sortable: true },
    { key: "price", label: "Price (₹)", sortable: true },
    { key: "brand", label: "Brand", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "stock", label: "Stock", sortable: true },
    { key: "stockStatus", label: "Status", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const customRenderers = {
    stockStatus: {
      rendererType: "statusDropdown",
      interactiveStatuses: [],
      statuses: [
        {
          value: "In Stock",
          label: "In Stock",
        },
        {
          value: "Out of Stock",
          label: "Out of Stock",
        },
      ],
    },
    actions: {
      rendererType: "actionButton",
      actions: [
        {
          label: "View",
          func: (row) => navigate(`/product-details/${row.productId}`),
        },
        {
          label: "Edit",
          func: (row) => handleEditClick(row),
        },

        {
          label: "Remove",
          func: async (row) => {
            const isConfirmed = await confirmToast(`Delete ${row.title}?`);

            if (isConfirmed) {
              await removeProduct({
                productId: row.productId,
              });
            }
          },
        },
      ],
    },
  };

  const filters = [
    { label: "All", key: "ALL", value: "ALL" },
    { label: "In Stock", key: "stockStatus", value: "In Stock" },
    { label: "Out of Stock", key: "stockStatus", value: "Out of Stock" },
  ];

  const searchFields = [
    { label: "Product ID", key: "productId" },
    { label: "Product Title", key: "title" },
    { label: "Brand Name", key: "brand" },
    { label: "Category", key: "category" },
  ];

  const toolbar = [
    { label: "Add Product", func: () => handleCreateClick() },
    // { label: "Add Product", func: () => alert("Product Added") },
    // { label: "Add Product", func: () => alert("Product Added") },
    // { label: "Add Product", func: () => alert("Product Added") },
  ];

  return (
    <section>
      {/* -----------------Table------------------- */}
      <ResourceTable
        title={"Products"}
        collectionName="products"
        source={source}
        headers={headers}
        customRenderers={customRenderers}
        filters={filters}
        searchFields={searchFields}
        toolbar={toolbar}
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
