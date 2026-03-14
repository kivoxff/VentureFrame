import { toast } from "react-toastify";
import { auth } from "./config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const googleLogin = async () => {
    try {
        const userCredential = await signInWithPopup(auth, provider);
        // toast.success("Logged In");
        return userCredential.user;
    } catch (err) {
        toast.error(err);
    }
}

export const logoutUser = async () => {
    await signOut(auth);
    // toast.success("Logged Out");
}
