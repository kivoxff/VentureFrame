import { useState } from "react";
import crossIcon from "../../../assets/icons/cross.svg";

function FeedbackModal({
  title = "Shere your feedback",
  placeholder = "Tell us about your experience",
  submitLabel = "Submit feedback",
  showRating = true,
  variant = "primary",
  onClose,
  onSubmit,
}) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const getRatingLabel = (star) => {
    const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
    return labels[star - 1];
  };

  const handleSubmit = () => {
    onSubmit({
      rating: rating && showRating ? rating : null,
      message: message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="mx-auto p-4 w-fit border rounded-2xl bg-white">
        {/* heading */}
        <div className="mb-4 flex justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose}>
            <img src={crossIcon} className="w-full h-full" />
          </button>
        </div>

        {/* ratings */}
        {showRating && (
          <div className="mb-4 text-center">
            <div className="mb-2 flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  onClick={() => setRating(star)}
                  className={`text-4xl hover:scale-110 transition-transform ${rating >= star ? "text-yellow-400" : "text-gray-500"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="font-medium text-pink-500">
              {rating ? getRatingLabel(rating) : "Select a rating"}
            </span>
          </div>
        )}

        {/* comment */}
        <textarea
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          placeholder={placeholder}
          className="p-3 w-full h-28 border border-gray-400 rounded-2xl outline-none"
        />
        <button
          onClick={handleSubmit}
          className={`mt-1 p-2 w-full font-semibold transition-colors rounded-xl ${
            variant === "primary"
              ? "bg-blue-700 hover:bg-blue-800 text-white"
              : variant === "danger"
                ? "bg-rose-700 hover:bg-rose-800 text-white"
                : "bg-gray-800 hover:bg-gray-900 text-white"
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default FeedbackModal;
