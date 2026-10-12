import type { ContactoGuardado } from "@/types/contacto";

/** MOCK de la agenda de contactos, por usuario (en mayúsculas, como MOCK_USERS). */
export const MOCK_CONTACTOS: Record<string, ContactoGuardado[]> = {
  INBOX: [
    {
      id: "ct-1",
      nombre: "María López Garza",
      cp: "64000",
      ciudad: "Monterrey",
      colonia: "Centro",
      direccion: "Av. Constitución",
      numExt: "444",
      numInt: "",
      telefono: "8112345678",
      email: "maria.lopez@example.com",
    },
    {
      id: "ct-2",
      nombre: "Bodega Reynosa",
      cp: "88500",
      ciudad: "Reynosa",
      colonia: "Hidalgo",
      direccion: "Calle Hidalgo",
      numExt: "120",
      numInt: "B",
      telefono: "8999876543",
      email: "",
    },
  ],
};
