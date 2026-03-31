import { useEffect } from "react";
import { fetchAuthSession, signInWithRedirect } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthSession()
      .then(() => navigate("/dashboard"))
      .catch(() => {});
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Carbon Emissions Portal</h2>
      <button onClick={() => signInWithRedirect()}>
        Login with Cognito
      </button>
    </div>
  );
}
