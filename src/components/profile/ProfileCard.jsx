import { Link } from "react-router-dom";

const ProfileCard = ({
  type,
  profileData,
  loggedInUserId,
  isSaving = false,
  isEditing = false,
  setIsEditing = () => {},
  handleProfileImg = () => {},
  handleProfileChange = () => {},
  handleProfileSave = () => {},
  redirectTo,
  fieldNames = {},
  children,
}) => {
  const canEditProfile =
    type === "user" &&
    loggedInUserId &&
    profileData &&
    loggedInUserId === profileData.userId;

  const { photo, name, mail, id } = fieldNames;

  return (
    <section>
      <div className="h-48 bg-blue-700"></div>
      <div className="-mt-20 px-6 mx-auto max-w-7xl flex flex-col md:flex-row items-start gap-6">
        {/* left card */}
        <div className="p-4 w-full md:w-md flex flex-col gap-4 justify-between border bg-white rounded-2xl shadow-xl">
          <div className="border flex flex-col items-center relative">
            {canEditProfile && (
              <button
                onClick={() => {
                  if (isSaving) return;
                  isEditing ? handleProfileSave() : setIsEditing(true);
                }}
                className="absolute right-2 top-2 font-semibold"
              >
                {isEditing && !isSaving
                  ? "✅"
                  : isEditing && isSaving
                    ? "🔃"
                    : "✏️"}
              </button>
            )}

            <label className="m-2 w-28 aspect-square rounded-full border border-gray-500 overflow-hidden shadow-xl relative">
              <input
                onChange={handleProfileImg}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!isEditing}
              />
              <img
                src={profileData[photo]}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <span className="absolute top-1/2 left-1/2 transform -translate-1/2 text-3xl">
                  ➕
                </span>
              )}
            </label>
            <input
              type="text"
              onChange={handleProfileChange}
              name={name}
              value={profileData[name]}
              className={`w-2/3 text-xl font-bold text-center ${isEditing ? "border border-gray-400" : ""}`}
              disabled={!isEditing}
            />
            <span className="text-gray-500">Customer</span>
            <select
              name="status"
              className="mt-2 px-5 py-2 text-sm bg-gray-200 text-green-600 text-center font-semibold rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option
                value="blocked"
                className="text-yellow-600 text-start bg-gray-100"
              >
                🚫 Blocked
              </option>
              <option
                value="active"
                className="text-green-600 text-start bg-gray-100"
              >
                ✅ Active
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="uppercase text-gray-400 text-xs font-medium">
                Email Address
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xl">📧</span>
                <input
                  value={profileData[mail]}
                  type="email"
                  className="mt-1 px-1 w-full font-semibold"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="uppercase text-gray-400 text-xs font-medium">
                {type === "user" ? "User ID" : "Seller ID"}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xl">🆔</span>
                <input
                  value={profileData[id]}
                  type="text"
                  className="mt-1 px-1 w-full font-semibold"
                  disabled
                />
              </div>
            </div>
          </div>

          {redirectTo && (
            <Link
              to={redirectTo}
              className="mt-2 p-2 w-full border rounded-full font-semibold text-white text-center bg-blue-600 hover:bg-blue-700"
            >
              {type === "user"
                ? profileData?.sellerId
                  ? "View Seller Profile"
                  : "Apply to be Seller"
                : "View User Profile"}
            </Link>
          )}
        </div>

        <div className="w-full h-fit flex flex-col gap-5 border">
          {children}
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
