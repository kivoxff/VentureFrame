import { useNavigate } from "react-router-dom";
import ResourceTable from "../../../components/tables/ResourceTable";
import { functions } from "../../../firebase/config";
import { toast } from "react-toastify";
import { httpsCallable } from "firebase/functions";

function ManageUsers({ source }) {
  const navigate = useNavigate();

  const headers = [
    { key: "userId", label: "User ID", sortable: false },
    { key: "displayName", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "primaryRole", label: "Role", sortable: true },
    { key: "userStatus", label: "Status", sortable: true },
    // { key: "joinedDate", label: "Joined Date", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const customRenderers = {
    userStatus: {
      rendererType: "statusDropdown",
      interactiveStatuses: ["ACTIVE", "BLOCKED"],
      statuses: [
        { label: "Active", value: "ACTIVE" },
        { label: "Blocked", value: "BLOCKED" },
      ],
      onStatusChange: async (row, newStatus) => {
        try {
          const manageStatus = httpsCallable(functions, "manageUserStatus");

          const result = await manageStatus({
            userId: row.userId,
            accountStatus: newStatus,
          });

          if (result.data?.success) {
            toast.success(result.data.message);
          }
        } catch (error) {
          console.error("Error updating user status:", error);
        }
      },
    },

    primaryRole: {
      rendererType: "statusDropdown",
      interactiveStatuses: [],
      statuses: [
        {
          value: "USER",
          label: "Customer",
        },
        {
          value: "SELLER",
          label: "Vendor",
        },
        {
          value: "ADMIN",
          label: "Administrator",
        },
      ],
    },

    actions: {
      rendererType: "actionButton",
      actions: [
        {
          label: "View",
          func: (row) => navigate(`/profile/user/${row.id}`),
        },
      ],
    },
  };

  const filters = [
    { label: "All", key: "ALL", value: "ALL" },
    { label: "Active", key: "userStatus", value: "ACTIVE" },
    { label: "Blocked", key: "userStatus", value: "BLOCKED" },
    // { label: "Customer", key: "primaryRole", value: "user" },
    // { label: "Seller", key: "primaryRole", value: "seller" },
    // { label: "Admin", key: "primaryRole", value: "admin" },
  ];

  const searchFields = [
    { label: "User ID", key: "userId" },
    { label: "Name", key: "displayName" },
    { label: "Email", key: "email" },
  ];

  return (
    <ResourceTable
      title={"Users"}
      collectionName="users"
      source={source}
      headers={headers}
      customRenderers={customRenderers}
      filters={filters}
      searchFields={searchFields}
    />
  );
}

export default ManageUsers;
