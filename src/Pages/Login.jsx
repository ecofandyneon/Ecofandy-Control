import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../Services/firebase";

function Login({ onLogin }) {
  const auth = getAuth(app);

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = async () => {
    try {
      await signInWithEmailAndPassword(auth, correo, password);
onLogin();
    } catch (error) {
      console.log(error);
      alert(error.code);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#111",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "#1b1b1b",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 0 20px #ff4fd8",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#ff4fd8",
            textShadow: "0 0 15px #ff4fd8",
          }}
        >
          ECOFANDY
        </h1>

        <h2>NEÓN</h2>

        <p>Control de Producción</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            borderRadius: "8px",
          }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={iniciarSesion}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            background: "#ff4fd8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default Login;