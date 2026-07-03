import { useState } from "react";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

function App() {
  const [logueado, setLogueado] = useState(false);

  return (
    <>
      {logueado ? (
        <Dashboard />
      ) : (
        <Login onLogin={() => setLogueado(true)} />
      )}
    </>
  );
}

export default App;