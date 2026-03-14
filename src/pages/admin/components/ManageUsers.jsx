import { useEffect, useState } from "react";
import ResourceTable from "../../../components/tables/ResourceTable";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribeSnap = onSnapshot(usersRef, (snap) => {
      if (!snap.empty) {
        const usersData = snap.docs.map((doc) => {
          const data = doc.data();

          return {
            id: data.userId,
            name: data.displayName,
            email: data.email,
            role: data.roles.includes("admin")
              ? "Admin"
              : data.roles.includes("seller")
                ? "Seller"
                : "Customer",
            status: data.userStatus,
            joinedDate: data.createdAt?.toDate()?.toLocaleDateString("en-IN"),
          };
        });

        console.log(usersData);
        setUsers(usersData);
      }
    });

    return () => unsubscribeSnap();
  }, []);

  const headers = [
    { label: "User ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Status", key: "status" },
    { label: "Role", key: "role" },
    { label: "Joined Date", key: "joinedDate" },
    { label: "Actions", key: "actions" },
  ];

  const rowActions = [
    {
      label: "View",
      func: (row) => navigate(`/profile/user/${row.id}`),
    },
  ];

  return (
    <ResourceTable
      data={users}
      headers={headers}
      rowActions={rowActions}
      filterOptions={[
        "All",
        "Active",
        "Blocked",
        "Customer",
        "Seller",
        "Admin",
      ]}
      searchKeys={["id", "name"]}
      title={"Users"}
      placeHolder={"Search by User ID or Name"}
    />
  );
};

export default ManageUsers;
