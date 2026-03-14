import SellerActionList from "./SellerActionList";
import ResourceTable from "../../../../components/tables/ResourceTable";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, functions } from "../../../../firebase/config";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../../../../components/ui/misc/FeedbackModal";
import confirmToast from "../../../../utils/confirmToast";
import { httpsCallable } from "firebase/functions";
import { toast, ToastContainer } from "react-toastify";

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sellersRef = collection(db, "sellers");
    const unsubscribeSnap = onSnapshot(sellersRef, (snap) => {
      if (!snap.empty) {
        const sellersData = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.sellerId,
            name: data.storeName,
            owner: data.ownerId,
            email: data.contactMail,
            status: data.sellerStatus,
            kycState: data.kycStatus ?? null,
            totalProducts: data.totalProducts ?? 0,
            totalSales: data.totalSales ?? 0,
          };
        });

        setSellers(sellersData);
      }
    });

    return () => unsubscribeSnap();
  }, []);

  const headers = [
    { label: "Seller ID", key: "id" },
    { label: "Seller Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Total Sales", key: "totalSales" },
    { label: "Status", key: "status" },
    { label: "Total Products", key: "totalProducts" },
    { label: "Actions", key: "actions" },
  ];

  const rowActions = [
    {
      label: "View",
      func: (row) => navigate(`/profile/seller/${row.id}`),
    },
  ];

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

  return (
    <section>
      <SellerActionList
        sellers={sellers}
        view={rowActions[0].func}
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
        data={sellers}
        headers={headers}
        rowActions={rowActions}
        filterOptions={["All", "Active", "Inactive", "Pending"]}
        searchKeys={["id", "email"]}
        title={"Sellers"}
        placeHolder={"Search by Seller ID or Email"}
      />
    </section>
  );
};

export default ManageSellers;
