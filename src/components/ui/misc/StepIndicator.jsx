const StepIndicator = ({
  steps = ["Address", "Payment", "Success"],
  currentStep = 3,
}) => {
  return (
    <div className="flex justify-between items-center">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={index} className="flex-1 flex items-center">
            <div className="flex flex-col items-center w-full">
              {/* Circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
                ${
                  isCompleted
                    ? "bg-violet-700 text-white"
                    : isActive
                      ? "border-2 border-violet-700 text-violet-700 bg-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {/* Label */}
              <span
                className={`text-sm mt-1
                ${
                  isActive ? "text-violet-700 font-semibold" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 transition-all
                ${isCompleted ? "bg-violet-700" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
