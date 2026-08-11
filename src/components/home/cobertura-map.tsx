"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { Sucursal } from "@/types/sucursal";

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];

const pinIcon = (tipo: Sucursal["tipo"]) =>
  L.divIcon({
    className: "",
    html: `<div style="
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        background:${tipo === "sucursal" ? "var(--color-primary)" : "#1f2937"};
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 4px rgba(0,0,0,.35);
      ">
        <span style="
          transform:rotate(45deg);width:12px;height:12px;border-radius:50%;
          background:white;display:block;
        "></span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });

function FitBounds({ sucursales }: { sucursales: Sucursal[] }) {
  const map = useMap();

  useEffect(() => {
    const points = sucursales
      .filter((s) => s.Latitud != null && s.Longitud != null)
      .map((s) => [s.Latitud as number, s.Longitud as number] as [number, number]);

    if (points.length === 0) {
      map.setView(MEXICO_CENTER, 5);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
  }, [sucursales, map]);

  return null;
}

export function CoberturaMap({
  sucursales,
  onSelect,
  selectedOficina,
}: {
  sucursales: Sucursal[];
  onSelect?: (sucursal: Sucursal) => void;
  selectedOficina?: number | null;
}) {
  const icons = useMemo(
    () => ({
      sucursal: pinIcon("sucursal"),
      distribucion: pinIcon("distribucion"),
    }),
    [],
  );

  return (
    <MapContainer
      center={MEXICO_CENTER}
      zoom={5}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds sucursales={sucursales} />
      {sucursales
        .filter((s) => s.Latitud != null && s.Longitud != null)
        .map((s) => (
          <Marker
            key={s.K_Oficina}
            position={[s.Latitud as number, s.Longitud as number]}
            icon={icons[s.tipo]}
            eventHandlers={{
              click: () => onSelect?.(s),
            }}
            opacity={
              selectedOficina && selectedOficina !== s.K_Oficina ? 0.55 : 1
            }
          >
            <Popup>
              <div className="flex min-w-[180px] flex-col gap-1 text-sm">
                <p className="font-display font-bold text-black">{s.D_Oficina}</p>
                <p className="text-black/70">{s.Calle}</p>
                <p className="text-black/70">
                  {s.D_Ciudad}, {s.D_Estado} — CP {s.Codigo_Postal}
                </p>
                {s.Telefono && <p className="text-black/70">Tel. {s.Telefono}</p>}
                {s.Observaciones && (
                  <p className="text-xs text-black/60">{s.Observaciones}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
