import type { Domicilio } from "@/types/domicilio";

/**
 * MOCK for `DomiciliosRecoleccionesCliente`, keyed by usuario (uppercased,
 * matching MOCK_USERS in mock/auth.ts). Remove once the BFF returns the
 * authenticated client's real saved addresses.
 */
export const MOCK_DOMICILIOS: Record<string, Domicilio[]> = {
  INBOX: [
    {
      id: "dom-1",
      alias: "Casa",
      contacto: "Cliente Inbox",
      telefono: "8341713030",
      calle: "Av. Gómez Morín",
      numero: "2000",
      colonia: "Del Valle",
      cp: "66220",
      ciudad: "San Pedro Garza García",
      estado: "Nuevo León",
      referencias: "Casa color blanco, portón negro, entre calles Roble y Encino.",
      predeterminado: true,
    },
    {
      id: "dom-2",
      alias: "Oficina",
      contacto: "Recepción",
      telefono: "8180001234",
      calle: "Av. Constitución",
      numero: "444",
      colonia: "Centro",
      cp: "64000",
      ciudad: "Monterrey",
      estado: "Nuevo León",
      referencias: "Edificio de oficinas, piso 3, preguntar por recepción.",
      predeterminado: false,
    },
  ],
};
