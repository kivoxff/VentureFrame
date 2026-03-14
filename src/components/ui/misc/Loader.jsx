const Loader = ({size = "48%"}) => {
    return (
        <svg
            className="animate-spin"
            width={size}
            height={size}
            viewBox="0 0 50 50"
            fill="none"
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                stroke="#e9d5ff"
                strokeWidth="4"
            />

            <circle
                cx="25"
                cy="25"
                r="20"
                stroke="#7c3aed"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="21"
            />
        </svg>
    );
};

export default Loader;
