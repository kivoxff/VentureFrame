function SellerActionList({ sellers, view, declineClick, approveClick }) {
  const pendingSellers = sellers.filter(
    (seller) =>
      seller.currentStatus === "APPLICATION_SUBMITTED" ||
      seller.currentStatus === "KYC_SUBMITTED"
  );

  return (
    pendingSellers.length !== 0 && (
      <div className="mb-4 px-3 py-2 rounded-xl border bg-white shadow-xl">
        <div className="flex gap-3 items-center">
          <h3 className="text-lg font-semibold">Pending Sellers</h3>
          <span className="px-3 py-1 text-xs bg-yellow-100 text-rose-600 font-semibold border rounded-full">
            {pendingSellers.length} needs action
          </span>
        </div>

        {/* cards */}
        <div className="flex flex-wrap gap-2">
          {pendingSellers.map((seller) => {
              const isKycPending = seller.currentStatus === "KYC_SUBMITTED";

            return (
              <div className="mt-4 p-2 w-80 border rounded-2xl flex-1">
                <div className="flex gap-2 justify-between">
                  <span className="font-semibold text-xl">{seller.name}</span>
                  <span className="p-1 flex justify-center items-center bg-pink-100 rounded-md text-xs text-pink-700 font-semibold">
                    {seller.id}
                  </span>
                </div>

                <div className="mt-1 flex gap-2">
                  <span className="w-5">💌</span>
                  <span className="text-gray-500">{seller.email}</span>
                </div>

                <div className="mt-2 flex gap-2 text-sm">
                  <button
                    onClick={() => view(seller)}
                    className="p-2 w-full border rounded-full font-semibold hover:bg-blue-50 text-blue-600 text-nowrap transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => declineClick(seller, isKycPending)}
                    className="p-2 w-full border rounded-full font-semibold"
                  >
                    {isKycPending ? "Decline KYC" : "Decline seller"}
                  </button>
                </div>
                <button
                  onClick={() => approveClick(seller, isKycPending)}
                  className={`mt-2 p-2 w-full border rounded-full font-semibold text-white ${
                    isKycPending
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isKycPending ? "Approve KYC" : "Approve seller"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}

export default SellerActionList;
