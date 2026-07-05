import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Services/firebase";

export default function useProduccion() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "proyectos"),
      (snapshot) => {
        const datos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProyectos(datos);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    proyectos,
    loading,
  };
}