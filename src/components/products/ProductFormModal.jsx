import { useEffect, useState } from "react";

const ImagePreview = ({ fileOrObj, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (fileOrObj instanceof File) {
      const fileURL = URL.createObjectURL(fileOrObj);
      setPreview({ url: fileURL, path: null });

      return () => URL.revokeObjectURL(fileURL);
    } else setPreview(fileOrObj);
  }, [fileOrObj]);

  return (
    <div className="w-14 h-14 border border-gray-300 rounded-lg overflow-hidden relative">
      <img src={preview?.url} className="w-full h-full object-cover" />
      <button
        onClick={onRemove}
        type="button"
        className="absolute top-1 right-1 bg-white/90 p-1 text-[10px] rounded-full text-red-500 hover:bg-red-100 hover:text-white shadow-sm transition-all"
      >
        ✖
      </button>
    </div>
  );
};

function ProductFormModal({ onClose, initialData, onSave }) {
  const emptyForm = {
    title: "",
    originalPrice: "",
    discount: "",
    stock: "",
    brand: "",
    category: "",
    description: "",

    features: [],
    images: [],
    options: [],
    specs: [],
  };

  const [formData, setFormData] = useState(emptyForm);
  const [tempFeature, setTempFeature] = useState("");
  const [tempOption, settempOption] = useState({ name: "", value: "" });
  const [tempSpec, setTempSpec] = useState({ name: "", value: "" });

  useEffect(() => {
    if (initialData) {
      setFormData(structuredClone(initialData)); // try another way if possible
    } else {
      setFormData(emptyForm);
    }
  }, [initialData]);

  const addFeature = (e) => {
    if (tempFeature.trim() && !formData.features.includes(tempFeature)) {
      setFormData({
        ...formData,
        features: [...formData.features, tempFeature],
      });

      setTempFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, idx) => index !== idx),
    });
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({
      ...formData,
      images: [...formData.images, file],
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, idx) => index !== idx),
    });
  };

  const addOption = () => {
    const name = tempOption.name.trim().toLowerCase();
    const value = tempOption.value.trim().toLowerCase();

    if (!name || !value) return;

    const existingOptIdx = formData.options.findIndex(
      (opt) => opt.name.toLowerCase() === name,
    );
    let newOptions = [...formData.options];

    if (existingOptIdx > -1) {
      const option = newOptions[existingOptIdx];
      const valueExists = option.values.includes(value);

      if (!valueExists) {
        newOptions[existingOptIdx] = {
          ...option,
          values: [...option.values, value]
        }
      }
    } else {
      newOptions.push({
        name: name,
        values: [value],
      });
    }
    
    setFormData({ ...formData, options: newOptions });
    settempOption({ ...tempOption, value: "" });
  };

  const removeOption = (groupIndex) => {
    setFormData({
      ...formData,
      options: [...formData.options.filter((_, idx) => idx !== groupIndex)],
    });
  };

  const removeOptVal = (groupIndex, valueIndex) => {
    let newOptions = [...formData.options];

    newOptions[groupIndex].values = newOptions[groupIndex].values.filter(
      (_, idx) => idx !== valueIndex,
    );

    if (newOptions[groupIndex].values.length === 0) {
      removeOption(groupIndex);
    } else {
      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const addSpec = () => {
    const name = tempSpec.name.trim().toLowerCase();
    const value = tempSpec.value.trim().toLowerCase();
    if (!name || !value) return;

    const existingSpecIdx = formData.specs.findIndex(
      (spec) => spec.name.toLowerCase() === name,
    );

    let newSpecs = [...formData.specs];

    if (existingSpecIdx > -1) {
      const spec = newSpecs[existingSpecIdx];

      const valueExists =
        spec.value.toLowerCase() === value;

      if (!valueExists) {
        newSpecs[existingSpecIdx] = {...spec, value: value};
      }
    } else {
      newSpecs.push({ name: name, value: value });
    }

    setFormData({
      ...formData,
      specs: newSpecs,
    });

    setTempSpec({ name: "", value: "" });
  };

  const removeSpec = (index) => {
    setFormData({
      ...formData,
      specs: [...formData.specs.filter((_, idx) => idx !== index)],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      {/* MODAL */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* SCROLLABLE AREA */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* --- BASIC INFO --- */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-gray-500 text-sm font-bold uppercase mb-2">
              Basic Information
            </legend>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Product Title
              </label>
              {/* Darker border: border-gray-400 */}
              <input
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                value={formData.title}
                type="text"
                name="title"
                placeholder="e.g. Wireless Noise Cancelling Headphones"
                className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Price
                </label>
                <input
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  value={formData.originalPrice}
                  type="number"
                  name="originalPrice"
                  placeholder="0.00"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Discount
                </label>
                <input
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  value={formData.discount}
                  type="number"
                  name="discount"
                  placeholder="0"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Stock
                </label>
                <input
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  value={formData.stock}
                  type="number"
                  name="stock"
                  placeholder="100"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Brand
                </label>
                <input
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  value={formData.brand}
                  type="text"
                  name="brand"
                  placeholder="e.g. Sony"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Category
                </label>
                <select
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  value={formData.category}
                  name="category"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md bg-white focus:outline-none focus:border-violet-500 text-gray-700"
                >
                  <option value="" disabled className="hidden">
                    Select Category
                  </option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="mobiles">Mobiles</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Key Features
              </label>
              <div className="flex gap-2">
                <input
                  onChange={(e) => setTempFeature(e.target.value)}
                  value={tempFeature}
                  type="text"
                  name="featureInput"
                  placeholder="e.g. Active Noise Cancellation"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
                <button
                  onClick={addFeature}
                  type="button"
                  className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Feature List */}
            {formData.features.length !== 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, idx) => (
                  <div
                    key={feature}
                    className="p-2 flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md group hover:border-violet-400 transition-colors"
                  >
                    <span className="text-wrap text-sm text-gray-700 px-2">
                      {feature}
                    </span>
                    <button
                      onClick={() => removeFeature(idx)}
                      type="button"
                      title="Remove"
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-all"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <hr className="border-gray-500" />

          {/* --- IMAGES --- */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-gray-500 text-sm font-bold uppercase mb-2">
              Product Images
            </legend>

            <div className="flex flex-wrap gap-4 items-end">
              <label className="w-14 h-14 flex items-center justify-center bg-violet-50 text-violet-600 border border-dashed border-violet-400 rounded-lg cursor-pointer hover:bg-violet-100 transition-colors">
                <input
                  onChange={uploadImage}
                  type="file"
                  accept="image/*"
                  name="productImg"
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <span className="text-xl leading-none">+</span>
                  <span className="text-[10px] font-bold uppercase">Add</span>
                </div>
              </label>

              {formData.images.map((img, idx) => (
                <ImagePreview
                  fileOrObj={img}
                  onRemove={() => removeImage(idx)}
                />
              ))}
            </div>
          </fieldset>

          <hr className="border-gray-500" />

          {/* --- VARIANTS --- */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-gray-500 text-sm font-bold uppercase mb-2">
              Variant / Type of Product
            </legend>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Option Name
                </label>
                <input
                  onChange={(e) =>
                    settempOption({ ...tempOption, name: e.target.value })
                  }
                  value={tempOption.name}
                  type="text"
                  name="variantName"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                  placeholder="e.g. Color"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Option Value
                </label>
                <div className="flex gap-2">
                  <input
                    onChange={(e) =>
                      settempOption({ ...tempOption, value: e.target.value })
                    }
                    value={tempOption.value}
                    type="text"
                    name="variantValue"
                    className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                    placeholder="e.g. Red"
                  />
                  <button
                    onClick={addOption}
                    type="button"
                    className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {formData.options.length !== 0 && (
              <div className="flex flex-col gap-3 pt-2 capitalize">
                {formData.options.map((opt, groupIdx) => (
                  <div
                    key={opt}
                    className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-gray-50 rounded-md border border-gray-300 hover:border-violet-400 transition-colors"
                  >
                    <div className="text-blue-600 text-nowrap font-semibold flex items-center gap-2">
                      <button
                        onClick={() => removeOption(groupIdx)}
                        type="button"
                        className="p-1 hover:bg-red-100 hover:text-red-600 text-gray-400 rounded-full text-xs transition-colors"
                      >
                        ✖
                      </button>
                      {opt.name} :
                    </div>

                    <div className="flex justify-center sm:justify-start flex-wrap gap-2">
                      {opt.values.map((val, valueIdx) => (
                        <div
                          key={val}
                          className="px-2 py-1 bg-white text-green-700 font-medium border border-gray-300 hover:border-violet-400 transition-colors rounded-full flex gap-2 items-center text-sm"
                        >
                          {val}{" "}
                          <button
                            onClick={() => removeOptVal(groupIdx, valueIdx)}
                            type="button"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors text-xs"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <hr className="border-gray-500" />

          {/* --- SPECS --- */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-gray-500 text-sm font-bold uppercase mb-2">
              Product Specs
            </legend>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Spec Name
                </label>
                <input
                  onChange={(e) =>
                    setTempSpec({ ...tempSpec, name: e.target.value })
                  }
                  value={tempSpec.name}
                  type="text"
                  name="specName"
                  placeholder="e.g. Bluetooth"
                  className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Spec Value
                </label>
                <div className="flex gap-2">
                  <input
                    onChange={(e) =>
                      setTempSpec({ ...tempSpec, value: e.target.value })
                    }
                    value={tempSpec.value}
                    type="text"
                    name="specValue"
                    placeholder="e.g. v5.3"
                    className="px-3 py-2 w-full border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 placeholder-gray-400"
                  />
                  <button
                    onClick={addSpec}
                    type="button"
                    className="px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-md hover:bg-violet-200 whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {formData.specs.length !== 0 && (
              <div className="flex flex-wrap gap-2 capitalize">
                {formData.specs.map((spec, idx) => (
                  <div
                    key={spec}
                    className="px-3 py-1 bg-gray-50 border border-gray-300 rounded-md flex gap-2 items-center text-sm hover:border-violet-400 transition-colors"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="text-blue-600 font-medium text-nowrap">
                        {spec.name} :
                      </span>
                      <span className="text-green-600">{spec.value}</span>
                    </div>
                    <button
                      onClick={() => removeSpec(idx)}
                      type="button"
                      className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors text-xs ml-1"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <hr className="border-gray-500" />

          {/* --- DESCRIPTION --- */}
          <fieldset className="flex flex-col gap-4">
            <legend className="text-gray-500 text-sm font-bold uppercase mb-2">
              About product
            </legend>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                value={formData.description}
                name="description"
                placeholder="Write a detailed description of the product..."
                className="px-3 py-2 w-full h-24 border border-gray-400 rounded-md focus:outline-none focus:border-violet-500 resize-none placeholder-gray-400"
              ></textarea>
            </div>
          </fieldset>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-gray-50 border-t border-gray-300 flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormModal;
