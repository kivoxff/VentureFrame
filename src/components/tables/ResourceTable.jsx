import { useState } from "react";
import { CSVLink } from "react-csv";

const StatusBadge = ({ rowStatus }) => {
  const statusColors = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    inactive: "bg-gray-100 text-gray-700",
    kyc_pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-700",
    blocked: "bg-red-100 text-red-700",
    default: "bg-gray-200 text-gray-800",
    "in stock": "bg-green-100 text-green-700",
    "out of stock": "bg-red-100 text-red-700",
  };

  const colorClass =
    statusColors[rowStatus?.toLowerCase()] || statusColors.default;

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {rowStatus}
    </span>
  );
};

const RowActions = ({ row, actions = [] }) => {
  return actions.map((action) => (
    <button onClick={() => action.func(row)} className="pr-2 hover:underline">
      {action.label}
    </button>
  ));
};

const ResourceTable = ({
  data,
  headers,
  rowActions,
  filterOptions,
  searchKeys,
  title,
  placeHolder,
  handleCreateClick = null,
}) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredData = (
    filter === "All"
      ? data
      : data.filter(
          (item) =>
            item.status?.toLowerCase() === filter.toLowerCase() ||
            item.role?.toLowerCase() === filter.toLowerCase(),
        )
  ).filter((item) => {
    if (!search) return true;
    const keyword = search.toLowerCase();
    return searchKeys.some((key) => item[key]?.toLowerCase().includes(keyword));
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <section>
      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-3 justify-between">
        <div className="overflow-x-auto scrollbar-none flex gap-2">
          {filterOptions.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 font-semibold border rounded-md capitalize
                            ${filter === item ? "bg-blue-600 text-white" : "border-gray-300"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          onChange={handleSearch}
          type="text"
          placeholder={placeHolder}
          className="p-2 w-52 border rounded-md text-xs"
        />
      </div>

      <div className="rounded-xl border bg-white shadow-xl">
        <div className="px-3 py-2 flex flex-col sm:flex-row items-center gap-1">
          <div className="w-full flex justify-between items-center">
            <h3 className="text-lg capitalize font-semibold">
              {filter + " " + title}
            </h3>
            {filteredData.length !== 0 && (
              <CSVLink
                data={filteredData}
                headers={headers.slice(0, -1)}
                filename={title + ".csv"}
                className="px-3 py-1 text-sm bg-blue-600 text-white font-semibold border rounded-md"
              >
                Export CSV
              </CSVLink>
            )}
          </div>
          {title === "Products" && (
            <button
              onClick={() => handleCreateClick(true)}
              className="px-3 py-1 w-full sm:w-auto text-sm bg-green-600 text-white text-nowrap font-semibold border rounded-md"
            >
              Add Product
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="px-3 py-2 text-left text-gray-500 capitalize"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-t">
                  {headers.map((h) =>
                    headers[headers.length - 1].key === h.key ? (
                      <td className="px-3 py-2 text-sm text-blue-600 capitalize">
                        <RowActions row={row} actions={rowActions} />
                      </td>
                    ) : h.key === "status" ? (
                      <td
                        key={h.key}
                        className="px-3 py-2 text-nowrap uppercase"
                      >
                        <StatusBadge rowStatus={row.status} />
                      </td>
                    ) : (
                      <td
                        className={`px-3 py-2 first:text-nowrap first:font-semibold nth-2:text-gray-500 ${h.key !== "email" && h.key !== "id" ? "capitalize" : ""}`}
                      >
                        {row[h.key]}
                      </td>
                    ),
                  )}
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center py-6 text-gray-400"
                  >
                    {"No " + title + " Found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ResourceTable;
