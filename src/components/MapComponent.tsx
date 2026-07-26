/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LatLng, PlantationType } from '../types';
import { Check, AlertTriangle, Info } from 'lucide-react';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  radius: number | null;
  polygon: LatLng[] | null;
  plantationType: PlantationType;
  onChange: (data: {
    latitude: number;
    longitude: number;
    radius: number | null;
    polygon: LatLng[] | null;
  }) => void;
  language?: string;
}

export default function MapComponent({
  latitude,
  longitude,
  radius,
  polygon,
  plantationType,
  onChange,
  language = 'en',
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const tempMarkersRef = useRef<L.Marker[]>([]);

  const [drawNodes, setDrawNodes] = useState<LatLng[]>(polygon || []);
  const [liveStats, setLiveStats] = useState<{
    area: number;
    perimeter: number;
    isValid: boolean;
    selfIntersects: boolean;
  }>({ area: 0, perimeter: 0, isValid: true, selfIntersects: false });

  // Keep Refs updated to bypass stale closure traps in Leaflet listeners
  const plantationTypeRef = useRef(plantationType);
  const latRef = useRef(latitude);
  const lngRef = useRef(longitude);
  const radiusRef = useRef(radius);
  const drawNodesRef = useRef<LatLng[]>(polygon || []);

  useEffect(() => {
    plantationTypeRef.current = plantationType;
  }, [plantationType]);

  useEffect(() => {
    latRef.current = latitude;
    lngRef.current = longitude;
  }, [latitude, longitude]);

  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  useEffect(() => {
    drawNodesRef.current = polygon || [];
    setDrawNodes(polygon || []);
    setLiveStats(calculateLiveStats(polygon || []));
  }, [polygon]);

  // Segment intersection helper
  const isSegmentsIntersecting = (p1: LatLng, p2: LatLng, p3: LatLng, p4: LatLng): boolean => {
    const ccw = (A: LatLng, B: LatLng, C: LatLng) => {
      return (C.lat - A.lat) * (B.lng - A.lng) > (B.lat - A.lat) * (C.lng - A.lng);
    };
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
  };

  const checkSelfIntersection = (nodes: LatLng[]): boolean => {
    const len = nodes.length;
    if (len < 4) return false;
    for (let i = 0; i < len; i++) {
      for (let j = i + 2; j < len; j++) {
        // Skip checking adjacent lines (which share a vertex) or the closing line connection
        if (i === 0 && j === len - 1) continue;
        const p1 = nodes[i];
        const p2 = nodes[(i + 1) % len];
        const p3 = nodes[j];
        const p4 = nodes[(j + 1) % len];
        if (isSegmentsIntersecting(p1, p2, p3, p4)) {
          return true;
        }
      }
    }
    return false;
  };

  const calculateLiveStats = (coords: LatLng[]) => {
    if (coords.length < 3) {
      return {
        area: 0,
        perimeter: 0,
        isValid: false,
        selfIntersects: false,
      };
    }

    const selfIntersects = checkSelfIntersection(coords);

    // Centroid calculation
    let sumLat = 0;
    let sumLng = 0;
    coords.forEach((pt) => {
      sumLat += pt.lat;
      sumLng += pt.lng;
    });
    const centroidLat = sumLat / coords.length;
    const cosLat = Math.cos((centroidLat * Math.PI) / 180);

    // Perimeter calculation
    let perimeter = 0;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const dLat = (p2.lat - p1.lat) * 111000;
      const dLng = (p2.lng - p1.lng) * 111000 * cosLat;
      perimeter += Math.sqrt(dLat * dLat + dLng * dLng);
    }

    // Area calculation using Shoelace formula
    let shoelaceSum = 0;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      const x1 = (p1.lng - coords[0].lng) * 111000 * cosLat;
      const y1 = (p1.lat - coords[0].lat) * 111000;
      const x2 = (p2.lng - coords[0].lng) * 111000 * cosLat;
      const y2 = (p2.lat - coords[0].lat) * 111000;
      shoelaceSum += x1 * y2 - x2 * y1;
    }
    const area = Math.abs(shoelaceSum) / 2;

    return {
      area: Math.round(area * 10) / 10,
      perimeter: Math.round(perimeter * 10) / 10,
      isValid: coords.length >= 3 && !selfIntersects,
      selfIntersects,
    };
  };

  // 1. Inject Leaflet Stylesheet dynamically if not loaded
  useEffect(() => {
    const linkId = 'leaflet-css-injection';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // 2. Initialize Map once container and CSS are available
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false, // Position custom Zoom later
    });
    mapRef.current = map;

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom Elegant SVG DivIcon for the primary seedling GPS node
    const customIcon = L.divIcon({
      className: 'custom-sapling-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -top-10 flex flex-col items-center">
            <div class="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-600 border-2 border-white shadow-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div class="w-1.5 h-2.5 bg-emerald-700 shadow-md"></div>
          </div>
          <div class="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });

    // Create Draggable Primary Marker
    const marker = L.marker([latitude, longitude], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange({
        latitude: parseFloat(pos.lat.toFixed(7)),
        longitude: parseFloat(pos.lng.toFixed(7)),
        radius: radiusRef.current,
        polygon: drawNodesRef.current.length > 0 ? drawNodesRef.current : null,
      });
    });

    // Bind map click helper for Polygon Drawing
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (plantationTypeRef.current === 'Orchard / Large Plantation') {
        const newNode: LatLng = { lat: parseFloat(e.latlng.lat.toFixed(7)), lng: parseFloat(e.latlng.lng.toFixed(7)) };
        const next = [...drawNodesRef.current, newNode];
        drawNodesRef.current = next;
        setDrawNodes(next);
        setLiveStats(calculateLiveStats(next));

        onChange({
          latitude: latRef.current,
          longitude: lngRef.current,
          radius: null,
          polygon: next,
        });
      }
    });

    // Add zoom controls
    L.control.zoom({ position: 'topright' }).addTo(map);

    // ResizeObserver to automatically notify leaflet of size changes safely using requestAnimationFrame
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (mapRef.current) {
          map.invalidateSize();
        }
      });
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Keep Center & Marker updated when props change from reverse lookup or manual entry
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const currentMarkerLatLng = markerRef.current.getLatLng();
    if (currentMarkerLatLng.lat !== latitude || currentMarkerLatLng.lng !== longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    }
  }, [latitude, longitude]);

  // 4. Update Circle Overlays for Small Plantations (Radius)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    // Clean old circle
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (plantationType === 'Small Plantation' && radius !== null) {
      circleRef.current = L.circle([latitude, longitude], {
        radius: radius,
        color: '#10B981', // emerald-500
        fillColor: '#10B981',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);
    }
  }, [latitude, longitude, radius, plantationType]);

  // 5. Update Polygon overlays and draw markers with dynamic Vertex Dragging
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean old polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    // Clean temporary node markers
    tempMarkersRef.current.forEach((m) => m.remove());
    tempMarkersRef.current = [];

    setDrawNodes(polygon || []);
    setLiveStats(calculateLiveStats(polygon || []));

    if (plantationType === 'Orchard / Large Plantation' && polygon && polygon.length > 0) {
      const leafletCoords = polygon.map((pt) => [pt.lat, pt.lng] as L.LatLngTuple);
      
      polygonRef.current = L.polygon(leafletCoords, {
        color: checkSelfIntersection(polygon) ? '#EF4444' : '#2563EB', // red if intersects, blue if valid
        fillColor: checkSelfIntersection(polygon) ? '#EF4444' : '#2563EB',
        fillOpacity: 0.2,
        weight: 3,
      }).addTo(map);

      // Render draggable nodes at vertex points
      polygon.forEach((pt, index) => {
        const isIntersectionColor = checkSelfIntersection(polygon) ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500';
        const dotIcon = L.divIcon({
          className: 'vertex-dot-icon',
          html: `
            <div class="h-4 w-4 ${isIntersectionColor} border-2 border-white rounded-full shadow-md flex items-center justify-center text-[9px] text-white font-black cursor-grab active:cursor-grabbing hover:scale-110 transition-all">
              ${index + 1}
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const m = L.marker([pt.lat, pt.lng], {
          draggable: true,
          icon: dotIcon,
        }).addTo(map);

        // Handle vertex dragging for real-time visual path rendering and live stats calculations
        m.on('drag', (e: L.LeafletEvent) => {
          const target = e.target as L.Marker;
          const pos = target.getLatLng();
          
          // Construct updated polygon node array on-the-fly
          const tempNodes = (polygon || []).map((node, idx) => 
            idx === index 
              ? { lat: parseFloat(pos.lat.toFixed(7)), lng: parseFloat(pos.lng.toFixed(7)) }
              : node
          );

          // Render live stats and colors
          const tempStats = calculateLiveStats(tempNodes);
          setLiveStats(tempStats);

          if (polygonRef.current) {
            polygonRef.current.setLatLngs(tempNodes.map(pt => [pt.lat, pt.lng] as L.LatLngTuple));
            polygonRef.current.setStyle({
              color: tempStats.selfIntersects ? '#EF4444' : '#2563EB',
              fillColor: tempStats.selfIntersects ? '#EF4444' : '#2563EB',
            });
          }
        });

        // Trigger parent change only on drag end to prevent interrupting/cancelling active dragging gestures
        m.on('dragend', (e: L.LeafletEvent) => {
          const target = e.target as L.Marker;
          const pos = target.getLatLng();
          
          const nextPolygon = [...(polygon || [])];
          nextPolygon[index] = {
            lat: parseFloat(pos.lat.toFixed(7)),
            lng: parseFloat(pos.lng.toFixed(7)),
          };

          drawNodesRef.current = nextPolygon;
          setDrawNodes(nextPolygon);

          onChange({
            latitude: latRef.current,
            longitude: lngRef.current,
            radius: radiusRef.current,
            polygon: nextPolygon,
          });
        });

        tempMarkersRef.current.push(m);
      });
    }
  }, [polygon, plantationType]);

  const clearPolygon = () => {
    drawNodesRef.current = [];
    setDrawNodes([]);
    setLiveStats({ area: 0, perimeter: 0, isValid: false, selfIntersects: false });
    onChange({
      latitude,
      longitude,
      radius,
      polygon: null,
    });
  };

  const removeLastNode = () => {
    if (drawNodes.length === 0) return;
    const next = drawNodes.slice(0, -1);
    drawNodesRef.current = next;
    setDrawNodes(next);
    setLiveStats(calculateLiveStats(next));
    onChange({
      latitude,
      longitude,
      radius,
      polygon: next.length > 0 ? next : null,
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-50">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] flex-1 z-0" />
      
      {plantationType === 'Orchard / Large Plantation' && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-neutral-150 flex flex-col gap-3 max-w-sm md:max-w-md animate-fadeIn transition-all">
          
          {/* Real-time Boundary Status Info Badge */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="text-xs font-bold text-neutral-800 uppercase font-mono tracking-wide">
              {language === 'en' ? "Boundary Geometry" : "সীমানা জ্যামিতি"}
            </span>
            {drawNodes.length >= 3 ? (
              liveStats.selfIntersects ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  {language === 'en' ? "Self-Intersecting" : "পরস্পর ওভারল্যাপ"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Check className="h-3 w-3" />
                  {language === 'en' ? "Valid Boundary" : "সঠিক সীমানা"}
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                <Info className="h-3 w-3" />
                {language === 'en' ? "Trace Perimeter" : "সীমানা অঙ্কন করুন"}
              </span>
            )}
          </div>

          {/* Real-time calculated Area and Perimeter metrics */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-50/80 p-2.5 rounded-lg border border-neutral-150/40 text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                {language === 'en' ? "Area" : "ক্ষেত্রফল"}
              </span>
              <span className="text-xs font-black text-neutral-800 font-mono">
                {drawNodes.length >= 3 ? (
                  liveStats.area < 10000 ? (
                    `${liveStats.area.toLocaleString()} m²`
                  ) : (
                    `${(liveStats.area / 10000).toFixed(3)} Hectares`
                  )
                ) : (
                  '--'
                )}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                {language === 'en' ? "Perimeter" : "পরিসীমা"}
              </span>
              <span className="text-xs font-black text-neutral-800 font-mono">
                {drawNodes.length >= 3 ? `${liveStats.perimeter.toLocaleString()} m` : '--'}
              </span>
            </div>
          </div>

          {/* Action guidance */}
          <div className="text-[10px] text-neutral-500 text-left leading-normal">
            {drawNodes.length < 3 ? (
              <span className="text-blue-600 font-medium">
                {language === 'en' 
                  ? "💡 Click on the map in a sequence to place at least 3 vertices." 
                  : "💡 কমপক্ষে ৩টি কোণ তৈরি করতে পর্যায়ক্রমে মানচিত্রে ক্লিক করুন।"}
              </span>
            ) : (
              <span className="text-neutral-500">
                {language === 'en' 
                  ? "👉 Drag any numbered vertex marker to adjust. Click map to append new nodes." 
                  : "👉 যেকোনো নম্বরযুক্ত মার্কারটি টেনে কোণ পরিবর্তন করুন। নতুন বিন্দু সংযোগ করতে মানচিত্রে ক্লিক করুন।"}
              </span>
            )}
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={removeLastNode}
              disabled={drawNodes.length === 0}
              className="flex-1 text-center py-2 px-3 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-700 text-xs font-bold rounded-lg transition-all border border-neutral-200 cursor-pointer"
            >
              {language === 'en' ? "Undo Node" : "পূর্বাবস্থায় ফেরান"}
            </button>
            <button
              type="button"
              onClick={clearPolygon}
              disabled={drawNodes.length === 0}
              className="flex-1 text-center py-2 px-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-bold rounded-lg transition-all border border-red-100 cursor-pointer"
            >
              {language === 'en' ? "Clear Boundary" : "সীমানা মুছুন"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

