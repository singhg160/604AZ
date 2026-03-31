import { useEffect, useState } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetchAuthSession();
        setLoading(false);
      } catch {
        navigate("/");
      }
    }
    checkAuth();
  }, [navigate]);

  if (loading) return <p>Checking authentication...</p>;
  return children;
}
