"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  value: string;
  onChange: (url: string) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(() => {
    if (!value) return null;
    const coordMatch = value.match(/@?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch)
      return [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
    try {
      const url = new URL(value);
      const q = url.searchParams.get("q");
      if (q) {
        const qCoords = q.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (qCoords) return [parseFloat(qCoords[1]), parseFloat(qCoords[2])];
      }
    } catch {}
    return null;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<string>(() => {
    if (!value) return "";
    try {
      const parsed = new URL(value);
      const name = parsed.searchParams.get("name");
      if (name) return decodeURIComponent(name);
    } catch {}
    try {
      const url = new URL(value);
      const q = url.searchParams.get("q");
      if (q) {
        const qCoords = q.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (!qCoords) return q;
      }
    } catch {}
    return "";
  });

  const debouncedQuery = useDebounce(searchQuery, 500);
  const enabled = !!debouncedQuery && debouncedQuery.length >= 3;

  const { data: searchResults = [], isFetching: isSearching } = useQuery<
    SearchResult[]
  >({
    queryKey: ["nominatim-search", debouncedQuery],
    queryFn: () =>
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5&addressdetails=0`,
        { headers: { "Accept-Language": "pt-BR" } },
      ).then((r) => r.json()),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  const displayedResults = enabled ? searchResults : [];

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      setPosition([lat, lng]);
      setSelectedName(result.display_name);
      setSearchQuery("");

      onChange(
        `https://www.google.com/maps?q=${lat},${lng}&name=${encodeURIComponent(result.display_name)}`,
      );
    },
    [onChange],
  );

  const reverseGeocode = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "pt-BR" } },
      ).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.display_name) setSelectedName(data.display_name);
    },
  });

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      onChange(`https://www.google.com/maps?q=${lat},${lng}`);
      reverseGeocode.mutate({ lat, lng });
    },
    [onChange, reverseGeocode],
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          leftIcon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar endereço ou lugar..."
          className="h-10 text-[14px]"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-ink-tertiary" />
          </div>
        )}

        {displayedResults.length > 0 && (
          <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-48 overflow-y-auto border border-hairline-strong bg-surface-1">
            {displayedResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="rounded-xl flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
                <span className="line-clamp-2 text-ink text-xs tracking-normal leading-[1.5]">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedName && (
        <div className="flex items-center gap-2 border border-hairline-strong bg-surface-2 px-3 py-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="break-words line-clamp-1 flex-1 text-ink text-xs tracking-normal leading-[1.5]">
            {selectedName}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedName("");
              setPosition(null);
              onChange("");
            }}
            className="rounded-xl shrink-0 text-ink-tertiary hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="overflow-hidden border border-hairline-strong">
        <MapContainer
          center={position || [-23.55, -46.63]}
          zoom={position ? 15 : 4}
          style={{ height: "200px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} icon={markerIcon} />}
          <MapClickHandler onClick={handleMapClick} />
          {position && <FlyToPosition position={position} />}
        </MapContainer>
      </div>

      <p className="break-words text-xs text-ink-tertiary">
        Busque um endereço ou clique no mapa para selecionar
      </p>
    </div>
  );
}

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (
      prevPos.current &&
      (prevPos.current[0] !== position[0] || prevPos.current[1] !== position[1])
    ) {
      map.flyTo(position, 15, { duration: 1 });
    }
    prevPos.current = position;
  }, [position, map]);

  return null;
}
