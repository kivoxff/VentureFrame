import { toast } from "react-toastify";

const ConfirmToastBody = ({ confirmClick, cancelClick, message }) => {
  return (
    <div className="text-center w-full">
      <span className="text-3xl">🚨</span>
      <p className="font-bold text-gray-600">{message}</p>
      <div className="mt-1 flex items-center justify-center gap-4">
        <button
          onClick={cancelClick}
          className="py-1 px-2 font-medium text-black bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={confirmClick}
          className="py-1 px-2 font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

const confirmToast = (message = "Are you sure?") => {
  return new Promise((resolve) => {
    const toastId = toast(
      ({ closeToast }) => (
        <ConfirmToastBody
          confirmClick={() => {
            resolve(true);
            closeToast();
          }}
          cancelClick={() => {
            resolve(false);
            closeToast();
          }}
          message={message}
        />
      ),
      {
        toastId: "confirm-toast", // reuse same toast on repeat call
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        position: "top-center",
      },
    );
  });
};

export default confirmToast;
