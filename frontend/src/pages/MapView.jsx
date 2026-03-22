import React, { useState, useEffect } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import api from '../services/api';

const MapView = () => {
  const [location, setLocation] = useState({ lat: 19.076, lng: 72.8777 });
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [radius, setRadius] = useState(10);

  // 🔥 Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [location, radius]);

  const fetchData = async () => {
    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
        radius,
      };

      const [dRes, hRes] = await Promise.all([
        api.get('/donor/nearby', { params }),
        api.get('/hospitals/nearby', { params }),
      ]);

      setDonors(dRes.data || []);
      setHospitals(hRes.data || []);
    } catch {
      console.log('error');
    }
  };

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={12}
      style={{ height: '600px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 CLUSTERING */}
      <MarkerClusterGroup>

        {/* Donors */}
        {donors.map(d => {
          if (!d.location?.coordinates) return null;
          const [lng, lat] = d.location.coordinates;

          return (
            <Marker key={d._id} position={[lat, lng]}>
              <Popup>
                {d.name} ({d.bloodGroup})
              </Popup>
            </Marker>
          );
        })}

        {/* Hospitals */}
        {hospitals.map(h => {
          if (!h.location?.coordinates) return null;
          const [lng, lat] = h.location.coordinates;

          return (
            <Marker key={h._id} position={[lat, lng]}>
              <Popup>{h.name}</Popup>
            </Marker>
          );
        })}

      </MarkerClusterGroup>

    </MapContainer>
  );
};

export default MapView;