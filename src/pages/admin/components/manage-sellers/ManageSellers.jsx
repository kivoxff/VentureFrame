import SellerActionList from "./SellerActionList";
import ResourceTable from "../../../../components/tables/ResourceTable";
import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db, functions } from "../../../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import FeedbackModal from "../../../../components/ui/misc/FeedbackModal";
import confirmToast from "../../../../utils/confirmToast";
import { httpsCallable } from "firebase/functions";
import { toast, ToastContainer } from "react-toastify";

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sellersRef = collection(db, "sellers");
    const q = query(
      sellersRef,
      where("currentStatus", "in", ["APPLICATION_SUBMITTED", "KYC_SUBMITTED"]),
      limit(20),
    );
    const unsubscribeSnap = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const sellersData = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.sellerId,
            name: data.storeName,
            owner: data.ownerId,
            email: data.contactMail,

            currentStatus: data.currentStatus || "APPLICATION_NOT_SUBMITTED",

            totalProducts: data.totalProducts ?? 0,
            totalSales: data.totalSales ?? 0,
          };
        });

        setSellers(sellersData);
      }
    });

    return () => unsubscribeSnap();
  }, []);

  const handleModalOpen = (seller, isKycPending) => {
    setIsModalOpen(true);
    setSelectedSeller({ ...seller, isKycPending });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
  };

  const handleApprove = async (seller, isKycPending = false) => {
    try {
      if (isKycPending) {
        const approveKYC = httpsCallable(functions, "approveKYC");
        await approveKYC({ sid: seller.id, uid: seller.owner });
        toast.success("KYC Approved");
      } else {
        const approveSeller = httpsCallable(functions, "approveSeller");
        await approveSeller({ sid: seller.id });
        toast.success("Seller Approved");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const handleDecline = async ({ message }) => {
    const { id, isKycPending } = selectedSeller;

    try {
      if (isKycPending) {
        const declineKYC = httpsCallable(functions, "rejectKYC");
        await declineKYC({ sid: id, reason: message });
        toast.success("KYC Declined");
      } else {
        const declineSeller = httpsCallable(functions, "rejectSeller");
        await declineSeller({ sid: id, reason: message });
        toast.success("Seller Declined");
      }

      setIsModalOpen(false);
      setSelectedSeller(null);
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const handleViewSeller = (row) => {
    navigate(`/profile/seller/${row.id}`);
  };

  const headers = [
    { label: "Seller ID", key: "sellerId" },
    { label: "Store Name", key: "storeName", sortable: true },
    { label: "Email", key: "contactMail", sortable: true },
    // { label: "Total Sales", key: "totalSales", sortable: true },
    { label: "Status", key: "currentStatus", sortable: true },
    // { label: "Total Products", key: "totalProducts", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const customRenderers = {
    currentStatus: {
      rendererType: "statusDropdown",
      interactiveStatuses: ["KYC_VERIFIED", "SELLER_BLOCKED"],
      statuses: [
        { label: "App Not Submitted", value: "APPLICATION_NOT_SUBMITTED" },
        { label: "App Submitted", value: "APPLICATION_SUBMITTED" },
        { label: "App Rejected", value: "APPLICATION_REJECTED" },
        { label: "KYC Not Submitted", value: "KYC_NOT_SUBMITTED" },
        { label: "KYC Submitted", value: "KYC_SUBMITTED" },
        { label: "KYC Rejected", value: "KYC_REJECTED" },
        // The interactive ones:
        { label: "Active", value: "KYC_VERIFIED" },
        { label: "Blocked", value: "SELLER_BLOCKED" },
      ],

      onStatusChange: async (row, newStatus) => {
        // Map the table's exact status to what the Cloud Function expects
        const payloadStatus =
          newStatus === "SELLER_BLOCKED" ? "BLOCKED" : "ACTIVE";

        try {
          const updateSellerStatus = httpsCallable(
            functions,
            "manageSellerStatus",
          );

          // Call your cloud function
          const result = await updateSellerStatus({
            sellerId: row.sellerId,
            accountStatus: payloadStatus,
          });

          if (result.data?.success) {
            toast.success(result.data.message);
          }
        } catch (error) {
          toast.error(error.message);
          console.error("Error toggling seller status:", error);
        }
      },
    },
    actions: {
      rendererType: "actionButton",
      actions: [
        {
          label: "View",
          func: handleViewSeller,
        },
      ],
    },
  };

  const filters = [
    { label: "All", value: "ALL", key: "ALL" },
    {
      label: "Application Pending",
      value: "APPLICATION_SUBMITTED",
      key: "currentStatus",
    },
    { label: "KYC Pending", value: "KYC_SUBMITTED", key: "currentStatus" },
    // { label: "Active", value: "KYC_VERIFIED", key: "currentStatus" },
  ];

  const searchFields = [
    { label: "Seller ID", key: "sellerId" },
    { label: "Store Name", key: "storeName" },
    { label: "Email", key: "contactMail" },
  ];

  return (
    <section>
      <SellerActionList
        sellers={sellers}
        view={handleViewSeller}
        declineClick={handleModalOpen}
        approveClick={handleApprove}
      />

      {isModalOpen && (
        <FeedbackModal
          onClose={handleModalClose}
          title="Decline Seller"
          showRating={false}
          variant="danger"
          placeholder="Explain the reason for declining this user"
          submitLabel="Confirm decline"
          onSubmit={handleDecline}
        />
      )}

      <ResourceTable
        title={"Sellers"}
        collectionName="sellers"
        headers={headers}
        customRenderers={customRenderers}
        filters={filters}
        searchFields={searchFields}
      />
    </section>
  );
};

export default ManageSellers;
