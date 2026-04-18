import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import filterIcon from "../../../assets/icons/filter.svg";

const FilterStrip = ({ facets = {}, facetStats = {} }) => {
  const dynamicFilters = Object.entries(facets)
    .filter(([key]) => key !== "price" && key !== "stockStatus") // skip price and stockStatus
    .map(([key, counts]) => ({
      name: key,
      options: Object.keys(counts).sort((a, b) => b.localeCompare(a)),
    }));

  // 2. Fixed Filters
  const fixedFilters = [
    // {
    //   name: "Rating",
    //   options: ["⭐⭐⭐⭐ & Up", "⭐⭐⭐ & Up", "⭐⭐ & Up", "⭐ & Up"],
    // },
    // { name: "Availability", options: ["In Stock", "Out of Stock"] },
  ];

  const minAllowedPrice = facetStats?.price?.min || 0;
  const maxAllowedPrice = facetStats?.price?.max || 1000;

  /// Helper function to round numbers to cleaner values (nearest 100)
  const round = (num) => Math.round(num / 100) * 100;

  // 1. Calculate total price range
  const range = maxAllowedPrice - minAllowedPrice;

  // 2. Divide the range into 3 equal parts
  const step = Math.ceil(range / 3);

  // 3. Generate price presets using rounded values
  const pricePresets = [
    {
      // First bucket → lowest prices
      label: `Under ₹${round(minAllowedPrice + step)}`,
      min: round(minAllowedPrice),
      max: round(minAllowedPrice + step),
    },
    {
      // Middle bucket → mid-range prices
      label: `₹${round(minAllowedPrice + step)} - ₹${round(minAllowedPrice + step * 2)}`,
      min: round(minAllowedPrice + step),
      max: round(minAllowedPrice + step * 2),
    },
    {
      // Last bucket → highest prices
      label: `Over ₹${round(minAllowedPrice + step * 2)}`,
      min: round(minAllowedPrice + step * 2),
      max: round(maxAllowedPrice),
    },
  ];

  // --- URL State Management ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(null); // Local state for UI toggles

  // Local state for Price inputs (so typing doesn't lag the URL on every keystroke)
  const [localPrice, setLocalPrice] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  // Keep local price synced if URL changes externally (like clicking back button)
  useEffect(() => {
    setLocalPrice({
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    });
  }, [searchParams]);

  // --- Handlers ---

  // Derive selected options directly from the URL (e.g., ?brand=Nike,Apple)
  const getSelectedOptions = () =>
    searchParams.get(activeTab) ? searchParams.get(activeTab).split(",") : [];

  // Toggle multi-select pills and update URL
  const toggleSelection = (option) => {
    const selectedOptions = getSelectedOptions();

    let newFilters;
    if (selectedOptions.includes(option)) {
      newFilters = selectedOptions.filter((item) => item !== option);
    } else {
      newFilters = [...selectedOptions, option];
    }

    // Update URL Parameters
    if (newFilters.length > 0) {
      searchParams.set(activeTab, newFilters.join(","));
    } else {
      searchParams.delete(activeTab);
    }
    setSearchParams(searchParams);
  };

  // Helper to find the active data
  const getActiveFilterData = () => {
    const foundInDynamic = dynamicFilters.find(
      (filter) => filter.name === activeTab,
    );
    if (foundInDynamic) return foundInDynamic;
    return fixedFilters.find((filter) => filter.name === activeTab);
  };

  const activeData = getActiveFilterData();

  // --- Price URL Handlers ---
  const handlePresetClick = (preset) => {
    setLocalPrice({ min: preset.min, max: preset.max });
    searchParams.set("minPrice", preset.min);
    searchParams.set("maxPrice", preset.max);
    setSearchParams(searchParams);
  };

  const applyPriceFilter = () => {
    let minToApply = localPrice.min
      ? Math.max(Number(localPrice.min), minAllowedPrice)
      : "";
    let maxToApply = localPrice.max
      ? Math.min(Number(localPrice.max), maxAllowedPrice)
      : "";

    if (minToApply && maxToApply && minToApply > maxToApply) {
      const temp = minToApply;
      minToApply = maxToApply;
      maxToApply = temp;
    }

    setLocalPrice({ min: preset.min, max: preset.max });

    if (localPrice.min) searchParams.set("minPrice", minToApply);
    else searchParams.delete("minPrice");

    if (localPrice.max) searchParams.set("maxPrice", maxToApply);
    else searchParams.delete("maxPrice");

    setSearchParams(searchParams);
  };

  const clearPrice = () => {
    setLocalPrice({ min: "", max: "" });
    searchParams.delete("minPrice");
    searchParams.delete("maxPrice");
    setSearchParams(searchParams);
  };

  return (
    <div className="w-full flex flex-col font-sans shadow-sm bg-white sticky top-0 z-10">
      {/* --- 1. MAIN SCROLLABLE STRIP --- */}
      <section className="relative flex items-center w-full px-4 py-3 border-b border-gray-100 overflow-hidden">
        {/* Filter Icon Base */}
        <div className="shrink-0 flex items-center justify-center w-10 h-10 mr-4 bg-gray-50 border border-gray-200 rounded-full shadow-sm">
          <img
            src={filterIcon}
            alt="filter icon"
            className="w-5 h-5 opacity-70"
          />
        </div>

        {/* Scrollable Container for all Tabs */}
        <div className="flex items-center w-full gap-3 overflow-x-auto scrollbar-none scroll-smooth pr-4">
          {/* A. Dynamic Category Tabs */}
          {dynamicFilters.map((filter) => {
            const isActive = activeTab === filter.name;
            return (
              <button
                key={filter.name}
                onClick={() => setActiveTab(isActive ? null : filter.name)}
                className={`flex items-center shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${
                  isActive
                    ? "bg-violet-50 border-violet-400 text-violet-800 shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                {filter.name.charAt(0).toLocaleUpperCase() +
                  filter.name.slice(1)}
              </button>
            );
          })}

          {/* Visual Divider */}
          <div className="shrink-0 w-px h-6 bg-gray-300 mx-1"></div>

          {/* B. Fixed Filter Tabs */}
          {fixedFilters.map((filter) => {
            const isActive = activeTab === filter.name;
            return (
              <button
                key={filter.name}
                onClick={() => setActiveTab(isActive ? null : filter.name)}
                className={`flex items-center shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${
                  isActive
                    ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                {filter.name}
              </button>
            );
          })}

          {/* C. Dedicated Price Tab */}
          <button
            onClick={() => setActiveTab(activeTab === "Price" ? null : "Price")}
            className={`flex items-center shrink-0 px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 border ${
              activeTab === "Price"
                ? "bg-black border-black text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-900"
            }`}
          >
            Price ▾
          </button>
        </div>
      </section>

      {/* --- 2. DYNAMIC SUB-MENU TRAY --- */}
      <div
        className={`w-full bg-gray-50/90 backdrop-blur-sm border-b border-gray-100 transition-all duration-500 ease-in-out overflow-hidden flex items-center ${
          activeTab
            ? "max-h-125 opacity-100 py-4"
            : "max-h-0 opacity-0 py-0 border-transparent"
        }`}
      >
        <div className="w-full overflow-hidden">
          {/* Generic Options */}
          {activeData && activeTab !== "Price" && (
            <div className="flex gap-2 md:gap-3 px-4 md:px-8 w-full overflow-x-auto scrollbar-none pb-1">
              {activeData.options.map((option) => {
                const selectedOptions = getSelectedOptions();
                const isSelected = selectedOptions.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleSelection(option)}
                    className={`px-4 py-2 shrink-0 border rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? "bg-violet-600 border-violet-600 text-white shadow-md transform scale-[1.02]"
                        : "bg-white border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-700"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Price Panel */}
          {activeTab === "Price" && (
            <div className="w-full px-4">
              <div className="max-w-lg mx-auto bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                {/* Header with Clear */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Price Range
                  </h3>
                  <button
                    onClick={clearPrice}
                    className="text-xs font-medium text-gray-400 hover:text-black hover:underline transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        localPrice.min === preset.min &&
                        localPrice.max === preset.max
                          ? "bg-violet-600 border-violet-600 text-white shadow-md transform scale-[1.02]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Input Fields */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder={`Min (${minAllowedPrice})`}
                      value={localPrice.min}
                      onChange={(e) =>
                        setLocalPrice({ ...localPrice, min: e.target.value })
                      }
                      className="w-full pl-6 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <span className="text-xs text-gray-300 font-bold">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder={`Max (${maxAllowedPrice})`}
                      value={localPrice.max}
                      onChange={(e) =>
                        setLocalPrice({ ...localPrice, max: e.target.value })
                      }
                      className="w-full pl-6 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-gray-300 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={applyPriceFilter}
                  className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-violet-700 transform hover:scale-[1.02] transition-all duration-200 border border-violet-600"
                >
                  Apply Price Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterStrip;
