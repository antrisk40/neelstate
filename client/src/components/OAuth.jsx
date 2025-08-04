import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result when component mounts
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const auth = getAuth(app);
        const result = await getRedirectResult(auth);
        
        if (result) {
          setIsLoading(true);
          // User signed in via redirect
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: result.user.displayName,
              email: result.user.email,
              photo: result.user.photoURL,
            }),
          });
          const data = await res.json();
          dispatch(signInSuccess(data));
          navigate("/");
        }
      } catch (error) {
        console.log("Could not sign in with Google", error);
        setIsLoading(false);
      }
    };

    handleRedirectResult();
  }, [dispatch, navigate]);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      
      // Use redirect instead of popup
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.log("Could not sign in with Google", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      disabled={isLoading}
      type="button"
      className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
    >
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
