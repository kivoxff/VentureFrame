import {
  collection,
  endBefore,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase/config"; // Ensure this path is correct

// Custom cell renderers
const renderers = {
  statusDropdown: ({ row, currCellVal, schema }) => (
    <select
      value={currCellVal}
      onChange={(e) => schema.onStatusChange(row, e.target.value)}
      disabled={schema.isDisabled}
      className="border p-1"
    >
      {schema.statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  ),
  actionButton: ({ row, schema }) => (
    <div className="flex gap-2">
      {schema.actions.map((action, idx) => (
        <button
          key={idx}
          className="text-blue-600 underline"
          onClick={() => action.func(row)}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
};

// 1. REUSABLE DATA TABLE COMPONENT
function DataTable({
  collectionName,
  source = "admin",
  headers = [],
  customRenderers = {},
  filters = [],
  searchFields = [],
  rowsPerPage = [5, 8, 10],
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params with Defaults
  const params = {
    search: searchParams.get("search") || "",
    searchKey: searchParams.get("searchKey") || searchFields[0]?.key,
    filterKey: searchParams.get("filterKey") || filters[0]?.key,
    filterVal: searchParams.get("filterVal") || filters[0]?.value,
    sortBy: searchParams.get("sortBy") || headers.find((h) => h.sortable)?.key,
    orderBy: searchParams.get("orderBy") || "asc",
    rows: Number(searchParams.get("rowsPerPage")) || rowsPerPage[0],
  };

  const [searchInput, setSearchInput] = useState(params.search);
  const [page, setPage] = useState({ current: 1, dir: null, hasNext: false });
  const [cursors, setCursors] = useState({
    first: null,
    last: null,
    backup: null,
  });

  const sortableFields = headers.filter((h) => h.sortable);

  const renderCell = (row, colKey) => {
    const schema = customRenderers[colKey];
    const currCellVal = row[colKey];

    if (!schema) {
      return <span className="text-sm text-gray-700">{currCellVal}</span>;
    }

    const Renderer = renderers[schema.rendererType];
    return Renderer ? (
      <Renderer row={row} currCellVal={currCellVal} schema={schema} />
    ) : null;
  };

  // --- CORE UTILS ---

  const updateURL = (newParams) => {
    const updatedParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (!val) updatedParams.delete(key);
      else updatedParams.set(key, val);
    });

    setPage({ current: 1, dir: null, hasNext: false });
    setCursors({ first: null, last: null, backup: null });
    setSearchParams(updatedParams);
  };

  const handleSort = (colKey) => {
    const isAsc = params.sortBy === colKey && params.orderBy === "asc";
    updateURL({ sortBy: colKey, orderBy: isAsc ? "desc" : "asc" });
  };

  const handleFilter = ({ key, value }) =>
    updateURL({ filterKey: key, filterVal: value });

  // set pagination directions
  const handleNext = () => {
    setPage((p) => ({ ...p, dir: "next", current: p.current + 1 }));
  };

  const handlePrev = () => {
    setPage((p) => ({ ...p, dir: "prev", current: p.current - 1 }));
  };

  // Debounce Effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchNormalized = searchInput.trim();
      if (searchNormalized !== params.search)
        updateURL({ search: searchNormalized });
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [searchInput, params.search]);

  // Main Data Fetcher
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let constraints = [];

        // Source based rules (Fixed missing user.uid)
        // if (source === "seller") {
        //   constraints.push(where("sellerId", "==", sid));
        // }

        // Dynamic Filtering
        if (params.filterVal && params.filterKey !== "ALL") {
          constraints.push(where(params.filterKey, "==", params.filterVal));
        }

        // Search Logic (Basic Firestore Prefix Search)
        if (params.search && params.searchKey) {
          // Note: Firestore requires composite indexes if you combine inequalities (>=) with orderBy on a different field.
          constraints.push(
            where(params.searchKey, ">=", params.search),
            where(params.searchKey, "<=", params.search + "\uf8ff"),
          );
        }

        // Sorting (Skip if searching a different field due to Firestore limits)
        if (
          params.sortBy &&
          (!params.search || params.sortBy === params.searchKey)
        ) {
          constraints.push(orderBy(params.sortBy, params.orderBy));
        }

        // Apply Pagination Cursors
        if (page.dir === "next" && cursors.last) {
          constraints.push(startAfter(cursors.last));
          constraints.push(limit(params.rows));
        } else if (page.dir === "prev") {
          if (data.length === 0 && cursors.backup) {
            constraints.push(startAt(cursors.backup));
            constraints.push(limit(params.rows));
          } else if (cursors.backup) {
            constraints.push(endBefore(cursors.first));
            constraints.push(limitToLast(params.rows));
          }
        } else {
          constraints.push(limit(params.rows)); // Initial Load
        }

        // Execute Query
        const q = query(collection(db, collectionName), ...constraints);
        const snap = await getDocs(q);

        const { docs } = snap;

        setPage((p) => ({ ...p, hasNext: docs.length === params.rows }));

        if (docs.length > 0) {
          setCursors({ first: docs[0], last: docs.at(-1), backup: docs[0] });
        }

        const result = docs.map((doc) => ({
          id: doc.id, // Firestore document ID
          ...doc.data(),
        }));

        setData(result);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, collectionName, source, page.current]);

  return (
    <section className="p-4 bg-white shadow rounded-lg">
      {/* Controls: Search & Filter */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 items-center">
          <select
            className="border p-2 rounded"
           onChange={(e) => updateURL({ searchKey: e.target.value })}
            value={params.searchKey}
          >
            {searchFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="border p-2 rounded w-64"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
        </div>

        <div className="flex gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => handleFilter(filter)}
              className={`border p-2 rounded ${
                params.filterKey === filter.key && params.filterVal === filter.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-left">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((col) => (
                <th key={col.key} className="p-3 border">
                  {col.sortable && (!params.search || params.searchKey === col.key) ? (
                    <button
                      className="font-bold hover:underline"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {params.sortBy === col.key ?
                        (params.orderBy === "desc" ? " ↓" : " ↑"): "↕"}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center p-4">
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {headers.map((col) => (
                    <td key={col.key} className="p-3 border">
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <label className="mr-2">Rows per page:</label>
          <select
            className="border p-1 rounded"
            onChange={(e) => updateURL({ rowsPerPage: e.target.value })}
            value={params.rows}
          >
            {rowsPerPage.map((rows) => (
              <option key={rows} value={rows}>
                {rows}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 items-center">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page.current === 1 || loading}
            onClick={() => handlePrev()}
          >
            {loading && page.dir == "prev" ? "Loading..." : "Prev"}
          </button>
          <span>Page {page.current}</span>
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!page.hasNext || loading}
            onClick={handleNext}
          >
            {loading && page.dir == "next" ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}

// 2. APP IMPLEMENTATION (Configured for your exact Product schema)
export default function App() {
  const headers = [
    { key: "productId", label: "ID", sortable: false },
    { key: "title", label: "Title", sortable: true },
    { key: "price", label: "Price (₹)", sortable: true },
    { key: "brand", label: "Brand", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "stock", label: "Stock", sortable: true },
    { key: "stockStatus", label: "status", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const customRenderers = {
    // Note: We map statusDropdown to stockStatus here as an example if you want to edit stock state
    stockStatus: {
      rendererType: "statusDropdown",
      statuses: [
        { label: "In Stock", value: "In Stock" },
        { label: "Out of Stock", value: "Out of Stock" },
      ],
      onStatusChange: (row, newStatus) => {
        alert(`Product ${row.productId} stock status changed to ${newStatus}`);
        // Here you would trigger an updateDoc to Firestore
      },
    },
    actions: {
      rendererType: "actionButton",
      actions: [
        {
          label: "View",
          func: (row) => alert(`Viewing Product: ${row.title}`),
        },
        {
          label: "Delete",
          func: (row) => alert(`Deleting Product ID: ${row.productId}`),
        },
      ],
    },
  };

  // Fixed 'filters' array to match your seedTestProducts schema
  const filters = [
    { label: "All Products", key: "ALL", value: "ALL" },
    { label: "In Stock", key: "stockStatus", value: "In Stock" },
    { label: "Out of Stock", key: "stockStatus", value: "Out of Stock" },
  ];

  // Fixed 'searchFields' to match your seedTestProducts schema keys
  const searchFields = [
    { label: "Product Title", key: "title" },
    { label: "Brand Name", key: "brand" },
    { label: "Category", key: "category" },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      <DataTable
        collectionName="products"
        source="admin"
        headers={headers}
        customRenderers={customRenderers}
        filters={filters}
        searchFields={searchFields}
      />
    </div>
  );
}
