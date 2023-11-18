// components/YourComponent.js
import React, { useEffect, useState } from 'react';
import { getIncidents } from '../utils/apis';

const Incident = () => {
  const [incidents, setIncidents] = useState(null);

  useEffect(() => {
    getIncidents()
      .then(response => {
        setIncidents(response.data.result.incidents);
      })
      .catch(error => {
        console.error('Error fetching incidents', error);
      });
  }, []);

  // Render your component using the fetched incidents
  return (
    <div>
      {incidents && incidents.map(incident => (
        <div key={incident.id}>
          <h2>{incident.type}</h2>
          <p>Severity: {incident.severity}</p>
          <p>Status: {incident.status}</p>
          <p>Location: {incident.location.head.coordinates.join(', ')}</p>
          {/* Render other incident properties as needed */}
        </div>
      ))}
    </div>
  );
}
 export default Incident;