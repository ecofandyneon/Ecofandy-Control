import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage } from "./firebase";

export async function subirArchivo(
  archivo,
  carpeta
) {

  const nombre =
    `${Date.now()}-${archivo.name}`;

  const referencia = ref(
    storage,
    `${carpeta}/${nombre}`
  );

  await uploadBytes(
    referencia,
    archivo
  );

  const url =
    await getDownloadURL(referencia);

  return {
    nombre,
    url
  };
}