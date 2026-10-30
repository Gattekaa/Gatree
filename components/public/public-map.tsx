"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PublicMapProps {
  url: string;
  label?: string;
}

export function PublicMap({ url, label }: PublicMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(() => extractCoords(url));
  const [address, setAddress] = useState<string | null>(() => extractName(url));

  useEffect(() => {

    if (!position) {
      const query = extractQuery(url);
      if (query) {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data[0]) {
              setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
              if (!address) setAddress(data[0].display_name);
            }
          })
          .catch(() => {});
      }
      return;
    }

    if (address) return;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`,
      { headers: { "Accept-Language": "pt-BR" } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          setAddress(data.display_name);
        }
      })
      .catch(() => {});
  }, [url, position, address]);

  if (!position) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-white/6 bg-white/2">
        <p className="text-[13px] text-white/50">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/6 bg-white/2">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "380px", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          {label && (
            <p className="text-[14px] font-medium text-white/80">{label}</p>
          )}
          {address && (
            <p className="mt-0.5 line-clamp-1 text-[12px] text-white/50">{address}</p>
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir no Maps
        </a>
      </div>
    </div>
  );
}

function extractCoords(url: string): [number, number] | null {

  const match = url.match(/[?&@](-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];

  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("q");
    if (q) {
      const qMatch = q.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];
    }
  } catch {}

  return null;
}

function extractQuery(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("q");
  } catch {
    return url;
  }
}

function extractName(url: string): string | null {
  try {
    const parsed = new URL(url);
    const name = parsed.searchParams.get("name");
    return name ? decodeURIComponent(name) : null;
  } catch {
    return null;
  }
}
