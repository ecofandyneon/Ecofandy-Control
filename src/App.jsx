import { useState } from "react";
import Login from "./Pages/Login";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [logueado, setLogueado] = useState(false);

  return (
    <>
      {logueado ? (
        <AppRoutes />
      ) : (
        <Login onLogin={() => setLogueado(true)} />
      )}
    </>
  );
}

export default App;
