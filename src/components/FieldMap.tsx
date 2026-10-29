import { Button } from './arc/button/button';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster from 'supercluster';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Plus, Minus, RotateCcw, Search } from 'lucide-react';
import type { Point } from '../../shared/model';
import { defaultMapPoint } from '../services/maps';
import { quietMapStyle, mapAttribution } from './map/baseStyle';
import { getScaledSize, MIN_MARKER_TARGET_SIZE } from './map/markerUtils';
import { focusPoint, spreadMarkers } from './map/mapGeometry';
import { itemIcon, markerLabel, type MapItem } from './map/markers';
import './map/radar.css';

interface Props {
  items?: MapItem[]; point?: Point | null; center?: Point | null; selected?: string | null;
  onSelect?: (id: string | null) => void; onPoint?: (point: Point) => void;
  onBounds?: (bounds: string) => void; onLocate?: () => void; locating?: boolean; className?: string;
}
const noItems: MapItem[] = [];
// A same-origin worker keeps the production CSP restrictive (no blob workers).
setWorkerUrl(workerUrl);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function FieldMap({ items = noItems, point, center, selected, onSelect, onPoint, onBounds, onLocate, locating, className = '' }: Props) {
  const node = useRef<HTMLDivElement>(null), map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null), retryBase = useRef<() => void>(() => {});
  const meetupMarker = useRef<L.Marker | null>(null), pointFromMap = useRef<Point | null>(null);
  const [failed, setFailed] = useState(false), [moved, setMoved] = useState(false), [loaded, setLoaded] = useState(false);
  const callbacks = useRef({ onSelect, onPoint }); callbacks.current = { onSelect, onPoint };
  const initialPoint = useRef(point || center || defaultMapPoint);
  const previousCenter = useRef(center);
  const itemsRef = useRef(items); itemsRef.current = items;
  const initiallyFramed = useRef(false);
  const pickMode = !!onPoint;

  useEffect(() => {
    if (!node.current) return;
    const m = L.map(node.current, {
      zoomControl: false, scrollWheelZoom: !pickMode, zoomSnap: .25, zoomDelta: .5,
      attributionControl: true, zoomAnimation: !reducedMotion(), minZoom: 8, maxZoom: 19,
      maxBounds: [[14.5, 73.2], [16.1, 74.8]], maxBoundsViscosity: .8,
    }).setView([initialPoint.current.lat, initialPoint.current.lng], pickMode ? 15 : 13);
    map.current = m; m.attributionControl.setPrefix(false);
    let base: ReturnType<typeof maplibreGL> | undefined;
    let disposed = false;
    const startBase = () => {
      base?.remove(); base = undefined; setFailed(false); setLoaded(false);
      try {
        base = maplibreGL({ style: quietMapStyle(), attributionControl: { customAttribution: mapAttribution } });
        base.addTo(m);
        const gl = base.getMaplibreMap();
        gl.on('error', () => { if (!disposed) setFailed(true); });
        gl.on('load', () => { if (!disposed) setLoaded(true); });
        gl.on('idle', () => { if (!disposed && gl.isSourceLoaded('geography')) { setLoaded(true); } });
      } catch { if (!disposed) setFailed(true); }
    };
    startBase(); retryBase.current = startBase;
    layer.current = L.layerGroup().addTo(m);
    m.on('click', event => {
      if (callbacks.current.onPoint) {const next={ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) };pointFromMap.current=next;callbacks.current.onPoint(next);}
      else callbacks.current.onSelect?.(null);
    });
    // Programmatic centering/selection must not prompt an area search.
    m.on('dragend', () => setMoved(true));
    const userZoom = () => setMoved(true);
    node.current.addEventListener('wheel', userZoom, { passive: true });
    const touchZoom = (event: TouchEvent) => { if (event.touches.length > 1) setMoved(true); };
    node.current.addEventListener('touchmove', touchZoom, { passive: true });
    const keyZoom = (event: KeyboardEvent) => { if (['+', '-', '=', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && event.target === m.getContainer()) setMoved(true); };
    node.current.addEventListener('keydown', keyZoom);
    const element = node.current;
    let frame = 0;
    // Dizko InvalidateSizeOnShow: defer until layout and coalesce callbacks.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => m.invalidateSize({ animate: false }));
    });
    observer.observe(node.current);
    return () => { disposed = true; retryBase.current = () => {}; element.removeEventListener('wheel', userZoom); element.removeEventListener('touchmove', touchZoom); element.removeEventListener('keydown', keyZoom); observer.disconnect(); cancelAnimationFrame(frame); m.remove(); map.current = null; meetupMarker.current=null; };
  }, [pickMode]);

  useEffect(() => {
    const m = map.current, markers = layer.current;
    if (!m || !markers) return;
    if (!pickMode && items.length && !initiallyFramed.current) {
      initiallyFramed.current = true;
      if (m.getSize().y < 550) {
        m.fitBounds(L.latLngBounds(items.map(item => [item.point.lat, item.point.lng])), {
          paddingTopLeft: [32, 90], paddingBottomRight: [68, 100], maxZoom: 13, animate: false,
        });
      }
    }
    const index = new Supercluster<{ id: string }>({ radius: 52, maxZoom: 12 }).load(items.map(item => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [item.point.lng, item.point.lat] }, properties: { id: item.id },
    })));
    const byId = new Map(items.map(item => [item.id, item]));
    const draw = () => {
      if(pickMode)return;
      const focusedId = (document.activeElement as HTMLElement | null)?.dataset.mapItem;
      markers.clearLayers();
      const bounds = m.getBounds().pad(.15);
      const features = index.getClusters([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()], Math.floor(m.getZoom()));
      const size = Math.max(MIN_MARKER_TARGET_SIZE, Math.min(48, getScaledSize('auto', m.getZoom())));
      const positions = spreadMarkers(features.map(feature => {
        const pixel = m.latLngToContainerPoint([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
        return { id: String('cluster' in feature.properties ? feature.properties.cluster_id : feature.properties.id), x: pixel.x, y: pixel.y };
      }), size);
      features.forEach((feature, i) => {
        const props = feature.properties;
        const original: L.LatLngExpression = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        const position = m.containerPointToLatLng([positions[i].x, positions[i].y]);
        if ('cluster' in props) {
          const cluster = L.marker(position, { title: `${props.point_count} places. Zoom in.`, icon: L.divIcon({ className: 'radar-cluster', html: `<span>${props.point_count}</span>`, iconSize: [48, 48], iconAnchor: [24, 24] }) })
            .on('click', () => { m.setView(original, index.getClusterExpansionZoom(props.cluster_id), { animate: !reducedMotion() }); setMoved(true); }).addTo(markers);
          cluster.getElement()?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); cluster.fire('click'); } });
          return;
        }
        const item = byId.get(props.id); if (!item) return;
        if (m.latLngToContainerPoint(original).distanceTo(m.latLngToContainerPoint(position)) > 3) {
          L.polyline([original, position], { color: '#56675c', weight: 1, dashArray: '3 4', interactive: false }).addTo(markers);
          L.circleMarker(original, { radius: 2, color: '#193e32', weight: 1, fillOpacity: 1, interactive: false }).addTo(markers);
        }
        const marker = L.marker(position, { icon: itemIcon(item, size, selected === item.id), title: markerLabel(item), keyboard: true, riseOnHover: true, zIndexOffset: selected === item.id ? 1000 : 0 });
        marker.on('click', () => callbacks.current.onSelect?.(item.id)).addTo(markers);
        const element = marker.getElement();
        if (element) {
          element.dataset.mapItem = item.id; element.setAttribute('aria-label', markerLabel(item)); element.setAttribute('aria-pressed', String(selected === item.id));
          element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); callbacks.current.onSelect?.(item.id); } });
          if (focusedId === item.id) element.focus({ preventScroll: true });
        }
      });
    };
    draw(); m.on('moveend', draw);
    return () => { m.off('moveend', draw); };
  }, [items, point, selected, pickMode]);

  useEffect(()=>{
    const m=map.current,markers=layer.current;
    if(!pickMode||!m||!markers)return;
    if(!point){meetupMarker.current?.remove();meetupMarker.current=null;return;}
    if(meetupMarker.current){meetupMarker.current.setLatLng([point.lat,point.lng]);return;}
    const marker=L.marker([point.lat,point.lng],{
      icon:L.divIcon({className:'radar-meetup-pin',html:'<svg viewBox="0 0 24 28" width="44" height="52" aria-hidden="true"><ellipse cx="12" cy="25" rx="4" ry="1.5" fill="black" opacity=".14"/><path d="M21 10c0 7-9 14-9 14S3 17 3 10a9 9 0 1 1 18 0Z" fill="#193e32" stroke="white" stroke-width="1.5"/><circle cx="12" cy="10" r="3" fill="white"/></svg>',iconSize:[44,52],iconAnchor:[22,45]}),
      draggable:true,autoPan:true,autoPanPadding:L.point(35,35),title:'Meeting point. Drag to move, or use arrow keys.',
    }).addTo(markers);
    meetupMarker.current=marker;
    const update=()=>{const p=marker.getLatLng();const next={lat:Number(p.lat.toFixed(6)),lng:Number(p.lng.toFixed(6))};pointFromMap.current=next;callbacks.current.onPoint?.(next);};
    marker.on('dragend',update);
    const element=marker.getElement();
    element?.setAttribute('aria-label','Meeting point. Drag to move, or use arrow keys.');
    element?.addEventListener('keydown',event=>{
      const offset=event.shiftKey?24:6;
      const delta:Record<string,[number,number]>={ArrowLeft:[-offset,0],ArrowRight:[offset,0],ArrowUp:[0,-offset],ArrowDown:[0,offset]};
      if(!delta[event.key])return;
      event.preventDefault();event.stopPropagation();
      const pixel=m.latLngToContainerPoint(marker.getLatLng());
      marker.setLatLng(m.containerPointToLatLng(pixel.add(delta[event.key])));update();
    });
  },[point,pickMode]);

  useEffect(() => {
    const m = map.current;
    // The map already starts at initialPoint. Re-centering on mount would undo
    // the short-screen fitBounds once the layout frame runs.
    if (!pickMode && !selected && center === previousCenter.current) return;
    previousCenter.current = center;
    const target = pickMode ? point : selected ? itemsRef.current.find(item => item.id === selected)?.point : center;
    if (!target || !m) return;
    if(pickMode&&pointFromMap.current&&Math.abs(pointFromMap.current.lat-target.lat)<0.00001&&Math.abs(pointFromMap.current.lng-target.lng)<0.00001){pointFromMap.current=null;return;}
    const frame = requestAnimationFrame(() => {
      m.invalidateSize();
      const zoom = pickMode ? 15 : Math.max(m.getZoom(), selected ? 14 : 13);
      const position = pickMode ? target : focusPoint(m, target, zoom);
      m.setView([position.lat, position.lng], zoom, { animate: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [point, center, selected, pickMode]);

  return <div className={`field-map ${className}`}>
    <div className="map-canvas" ref={node} aria-label={pickMode ? 'Choose location. Tap the map or use coordinate fields.' : 'Map of civic reports and meetups. Every place is also available in the list.'} role="region" />
    {!loaded && !failed && <div className="radar-map-loading" role="status">Loading the map…</div>}
    <div className="radar-map-controls">
      {onLocate && <Button variant="ghost" type="button" aria-label="Use my location" title="Use my location" onClick={onLocate} disabled={locating}><LocateFixed size={20} /></Button>}
      <div className="radar-zoom"><Button variant="ghost" type="button" aria-label="Zoom in" onClick={() => { map.current?.zoomIn(); setMoved(true); }}><Plus size={18} /></Button><Button variant="ghost" type="button" aria-label="Zoom out" onClick={() => { map.current?.zoomOut(); setMoved(true); }}><Minus size={18} /></Button></div>
    </div>
    {onBounds && moved && <Button variant="ghost" type="button" className="radar-search-area" onClick={() => {
      const bounds = map.current?.getBounds();
      if (bounds) { onBounds([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',')); setMoved(false); }
    }}><Search size={16} />Search this area</Button>}
    {failed && <div className="radar-map-failure" role="status"><span>Map unavailable. Use the list or coordinates.</span><Button variant="ghost" type="button" onClick={() => retryBase.current()}><RotateCcw size={16} />Retry</Button></div>}
  </div>;
}
