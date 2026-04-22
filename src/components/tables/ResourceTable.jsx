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
import { CSVLink } from "react-csv";
import { db } from "../../firebase/config";

// Custom cell renderers
const renderers = {
  statusDropdown: ({ row, currCellVal, schema }) => {
    const badgeThemes = [
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
      "bg-green-50 text-green-700 ring-green-600/20",
      "bg-blue-50 text-blue-700 ring-blue-600/20",
      "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      "bg-red-50 text-red-700 ring-red-600/20",
      "bg-purple-50 text-purple-700 ring-purple-600/20",
      "bg-pink-50 text-pink-700 ring-pink-600/20",
    ];

    // Find the current status object and its color theme
    const index = schema.statuses.findIndex(
      (item) => item.value === currCellVal,
    );
    const matched = schema.statuses[index];
    const label = matched?.label || currCellVal;
    const theme = badgeThemes[index >= 0 ? index % badgeThemes.length : 0];

    // Check if the current value is allowed to be changed via dropdown
    const isInteractive = schema.interactiveStatuses?.includes(currCellVal);

    // If NOT interactive, return a simple read-only badge
    if (!isInteractive) {
      return (
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-semibold capitalize tracking-wide 
            rounded-full ring-1 ring-inset shadow-sm ${theme}`}
        >
          {label}
        </span>
      );
    }

    // If interactive, filter the options to ONLY show other interactive statuses
    const dropdownOptions = schema.statuses.filter((s) =>
      schema.interactiveStatuses.includes(s.value),
    );

    // Render the dropdown using the exact same badge theme classes
    return (
      <select
        value={currCellVal}
        onChange={(e) => schema.onStatusChange(row, e.target.value)}
        disabled={schema.isDisabled}
        className={`inline-flex items-center px-3 py-1 text-xs font-semibold capitalize tracking-wide rounded-full ring-1 
          ring-inset shadow-sm outline-none cursor-pointer transition-all ${theme} focus-within:ring-blue-500`}
      >
        {dropdownOptions.map((status) => (
          <option
            key={status.value}
            value={status.value}
            className="text-gray-800 bg-white"
          >
            {status.label}
          </option>
        ))}
      </select>
    );
  },
  actionButton: ({ row, schema }) => (
    <div className="flex gap-4">
      {schema.actions.map((action, idx) => (
        <button
          key={idx}
          className="text-blue-600 hover:underline"
          onClick={() => action.func(row)}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
  // labelBadge: ({ currCellVal, schema }) => {
  //   const matched = schema.values?.find((item) => item.value === currCellVal);

  //   const label = matched?.label || currCellVal;

  //   // Fixed badge styles (same value = same color everywhere)
  //   const badgeThemes = [
  //     "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  //     "bg-green-50 text-green-700 ring-green-600/20",
  //     "bg-blue-50 text-blue-700 ring-blue-600/20",
  //     "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  //     "bg-red-50 text-red-700 ring-red-600/20",
  //     "bg-purple-50 text-purple-700 ring-purple-600/20",
  //     "bg-pink-50 text-pink-700 ring-pink-600/20",
  //   ];

  //   // find same item's index
  //   const index = schema.values?.findIndex(
  //     (item) => item.value === currCellVal,
  //   );

  //   const theme = badgeThemes[index >= 0 ? index % badgeThemes.length : 0];

  //   return (
  //     <span
  //       className={`inline-flex items-center px-3 py-1 text-xs font-semibold capitalize tracking-wide rounded-full ring-1 ring-inset shadow-sm ${theme}`}
  //     >
  //       {label}
  //     </span>
  //   );
  // },
};

function ResourceTable({
  title = "Table",
  collectionName,
  source = "admin",
  headers = [],
  customRenderers = {},
  filters = [],
  searchFields = [],
  rowsPerPage = [5, 8, 10],
  toolbar = [],
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
  const activeFilter =
    filters.find(
      (filter) =>
        filter.key === params.filterKey && filter.value === params.filterVal,
    ) || filters[0];

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
    <section className="p-4 bg-gray-100 shadow-md border border-gray-200 rounded-md">
      {/* Controls: Search & Filter */}
      <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
        {/* Filter Buttons (Layout Unchanged) */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => handleFilter(filter)}
              className={`px-3 py-1.5 font-semibold border shadow-sm rounded-md capitalize transition-colors ${
                params.filterKey === filter.key &&
                params.filterVal === filter.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Unified Search Component - Always horizontal, responsive widths */}
        <div className="w-sm flex border border-gray-300 bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
          <select
            className="w-1/2 bg-gray-50 px-2 py-2 outline-none border-r border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer truncate"
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
            className="w-full px-3 py-2 outline-none"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-xl border bg-white shadow-xl">
        {/* More Feature Buttons */}
        <div className="px-3 py-2 flex flex-wrap items-center justify-end gap-2">
          <div className="min-w-[70%] sm:min-w-60 flex-1 flex items-center justify-between gap-3">
            <h3 className="text-lg capitalize font-semibold truncate pr-2">
              {activeFilter.label + " " + title}
            </h3>

            {data.length > 0 && (
              <CSVLink
                data={data}
                headers={headers.slice(0, -1)}
                filename={title + ".csv"}
                className="px-3 py-1 text-sm text-nowrap bg-blue-600 text-white font-semibold border rounded-md shrink-0"
              >
                Export CSV
              </CSVLink>
            )}
          </div>

          {toolbar.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 flex-auto w-full sm:w-auto sm:flex-initial">
              {toolbar.map((tool, index) => (
                <button
                  key={index}
                  onClick={tool.func}
                  // flex-auto ensures smooth stretching if they wrap to a new line
                  className="flex-auto sm:flex-initial px-3 py-1 text-sm bg-green-600 text-white text-nowrap font-semibold border rounded-md"
                >
                  {tool.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
              <tr>
                {headers.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-left text-gray-500 text-nowrap capitalize"
                  >
                    {col.sortable &&
                    (!params.search || params.searchKey === col.key) ? (
                      <button
                        className="font-bold hover:underline"
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                        {params.sortBy === col.key
                          ? params.orderBy === "desc"
                            ? " ↓"
                            : " ↑"
                          : "↕"}
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
                  <td colSpan={headers.length} className="h-36 text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="h-36 text-center p-4">
                    No data found.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="border-t first:border-none">
                    {headers.map((col) => (
                      <td key={col.key} className="p-3 text-nowrap">
                        {renderCell(row, col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 p-3 rounded-lg border bg-white shadow-sm">
        {/* Rows per page */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-600 whitespace-nowrap">
            Rows per page:
          </label>

          <select
            className="px-2 py-1 border border-gray-300 rounded-md outline-none bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow"
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={handlePrev}
            disabled={page.current === 1 || loading}
            className="px-3 py-1.5 text-sm rounded-md border bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading && page.dir === "prev" ? "Loading..." : "Prev"}
          </button>

          <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Page <span className="text-blue-600">{page.current}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={!page.hasNext || loading}
            className="px-3 py-1.5 text-sm rounded-md border bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading && page.dir === "next" ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResourceTable;
