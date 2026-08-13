// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EnvioPerfil } from "@/types/envio";

const authState = vi.hoisted(() => ({
  session: null as { usuario: string; nombre: string } | null,
  isLoginOpen: false,
  openLogin: vi.fn(),
}));

const seam = vi.hoisted(() => ({
  listarEnvios: vi.fn(),
  obtenerDetalleEnvio: vi.fn(),
  asignarNombreEnvio: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/envios", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/envios")>();
  return { ...original, ...seam };
});

import { EnviosView } from "./envios-view";

const envio: EnvioPerfil = {
  guia: "4003229791",
  nombre: "Paquete ropa",
  fechaProgramada: "15 de agosto",
  rastreo: {
    Guia: "4003229791",
    Estatus: "EN TRANSITO",
    F_Estatus: "13-AUG-2026 10:00",
    OficinaEstatus: "MEXICO",
    Remitente: "Persona remitente",
    EstadoOrigen: "CDMX",
    CdOrigen: "Ciudad de MÃ©xico",
    Origen: "MÃ©xico",
    Destinatario: "Persona destinataria",
    EstadoDestino: "Jalisco",
    CdDestino: "Guadalajara",
    Destino: "Guadalajara",
    F_Documentacion: "",
    Recibio: null,
  },
};

describe("EnviosView", () => {
  beforeEach(() => {
    authState.session = null;
    authState.isLoginOpen = false;
    authState.openLogin.mockReset();
    seam.listarEnvios.mockReset();
    seam.obtenerDetalleEnvio.mockReset();
    seam.asignarNombreEnvio.mockReset();
  });

  afterEach(cleanup);

  it("bloquea datos y lecturas para una persona sin sesiÃ³n", async () => {
    render(<EnviosView />);

    await waitFor(() => expect(authState.openLogin).toHaveBeenCalledTimes(1));
    expect(seam.listarEnvios).not.toHaveBeenCalled();
    expect(seam.obtenerDetalleEnvio).not.toHaveBeenCalled();
    expect(screen.queryByText("Paquete ropa")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesi.n/i }));
    expect(authState.openLogin).toHaveBeenCalledTimes(2);
  });

  it("lista los envÃ­os de la identidad autenticada y selecciona el primero", async () => {
    authState.session = { usuario: "INBOX", nombre: "Cliente demo" };
    seam.listarEnvios.mockResolvedValue([envio]);

    render(<EnviosView />);

    await waitFor(() => expect(seam.listarEnvios).toHaveBeenCalledWith("INBOX"));
    expect(await screen.findAllByText("Paquete ropa")).not.toHaveLength(0);
    expect(screen.getAllByText("4003229791", { selector: "dd" })).toHaveLength(2);
  });

  it("carga el detalle una sola vez y lo reutiliza al volver a abrirlo", async () => {
    authState.session = { usuario: "INBOX", nombre: "Cliente demo" };
    seam.listarEnvios.mockResolvedValue([envio]);
    seam.obtenerDetalleEnvio.mockResolvedValue({ guia: envio.guia, eventos: [] });

    render(<EnviosView />);
    const boton = await screen.findByRole("button", { name: /ver detalles/i });

    fireEvent.click(boton);
    await waitFor(() => expect(seam.obtenerDetalleEnvio).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: /ver menos/i }));
    fireEvent.click(screen.getByRole("button", { name: /ver detalles/i }));

    expect(seam.obtenerDetalleEnvio).toHaveBeenCalledTimes(1);
  });
});
