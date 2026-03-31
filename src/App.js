import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <button onClick={signOut}>Sign out</button>
          <Dashboard user={user} />
        </div>
      )}
    </Authenticator>
  );
}
