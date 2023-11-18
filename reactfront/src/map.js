//map.js
import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import './map.css';

const Map = () => {
  const mapRef = useRef(null);
  const destinationInputRef = useRef(null);
  const startingInputRef = useRef(null);
  const stopoverInputRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directions, setDirections] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [freewayDistance, setFreewayDistance] = useState(0);
  const [cityDistance, setCityDistance] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stopovers, setStopovers] = useState([]);
  const [showStopoverSearchBox, setShowStopoverSearchBox] = useState(true);
  const [totalDurationWithTraffic, setTotalDurationWithTraffic] = useState(null);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const currentIndex = stopovers.length;

  useEffect(() => {
    if (mapLoaded && directions) {
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setDirections(directions);
      directionsRenderer.setMap(mapRef.current);

      const leg = directions.routes[0].legs[currentStep];
      const stepLocation = leg.steps[0].start_location;

      mapRef.current.panTo(stepLocation);
      mapRef.current.setZoom(15);

      return () => {
        directionsRenderer.setMap(null);
      };
    }
  }, [mapLoaded, directions, currentStep]);

  const handleRecalculate = () => {
    window.location.reload(); 
  };

  useEffect(() => {
    return () => {
      if (trafficLayer) {
        trafficLayer.setMap(null);
      }
    };
  }, [trafficLayer]);

  const handlePrintDirections = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write('<html><head><title>Print Directions</title></head><body>');
  
    if (directions) {
      const mapImage = captureMapImage(mapRef.current, directions);
  
      printWindow.document.write('<div style="margin-bottom;">');
      printWindow.document.write('<button onclick="window.print()">Print</button>');
      printWindow.document.write('</div>');

      printWindow.document.write('<div style="margin-bottom: 20px;">');
      printWindow.document.write(`<img src="${mapImage}" alt="Map with Route" style="max-width: 100%;">`);
      printWindow.document.write('</div>');
  
      printWindow.document.write('<h2>Directions</h2>');
      directions.routes[0].legs.forEach((leg, index) => {
      printWindow.document.write(`<div style="cursor: pointer;" onclick="setCurrentStep(${index})">`);
      printWindow.document.write(`<strong>Leg ${index + 1}:</strong> ${leg.start_address} to ${leg.end_address}`);
      printWindow.document.write('</div>');
    });
  
      printWindow.document.write('<h3>Total Info</h3>');
      printWindow.document.write(`<div><strong>Total Distance:</strong> ${totalDistance.toFixed(2)} miles</div>`);
      printWindow.document.write(`<div><strong>Total Duration:</strong> ${formatDuration(totalDuration)}</div>`);
      printWindow.document.write(`<div><strong>Freeway Distance:</strong> ${freewayDistance.toFixed(2)} miles</div>`);
      printWindow.document.write(`<div><strong>City Distance:</strong> ${cityDistance.toFixed(2)} miles</div>`);
  
      printWindow.document.write('<h3>Step-by-Step Directions</h3>');
      if (directions) {
        const steps = [];
        directions.routes[0].legs.forEach((leg, legIndex) => {
          leg.steps.forEach((step, stepIndex) => {
            steps.push(
              `<div key="${legIndex}-${stepIndex}">
                <strong>Step ${steps.length + 1}:</strong> 
                <span>${step.instructions}</span> - 
                ${step.distance.text} - ${step.duration.text}
              </div>`
            );
          });
        });
        printWindow.document.write(steps.join(''));
      }
    } else {
      printWindow.document.write('<p>No directions to print.</p>');
    }
  
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  const captureMapImage = (map, directions, stopovers) => {
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
  
    const destination = directions.routes[0].legs[directions.routes[0].legs.length - 1].end_location;
    const waypoints = [
      ...directions.routes[0].legs.map(leg => leg.end_location),
      ...(stopovers || []) 
    ];
  
    const waypointsString = waypoints.map(point => `${point.lat()},${point.lng()}`).join('|');
  
    const googleMapsApiKey = 'AIzaSyDdIrXwXBDILYUAqBONwIbBmwAAObOgmKA'; 
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${destination.lat()},${destination.lng()}&zoom=${map.getZoom()}&size=600x300&maptype=roadmap&markers=${destination.lat()},${destination.lng()}&path=enc:${directions.routes[0].overview_polyline.points}&waypoints=${waypointsString}&bounds=${sw.lat()},${sw.lng()}|${ne.lat()},${ne.lng()}&key=${googleMapsApiKey}`;
  
    return mapUrl;
  };
  
  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  const handleDownloadDirections = () => {
    if (directions) {
      const steps = [];
      directions.routes[0].legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          steps.push(
            `Step ${steps.length + 1}: ${stripHtmlTags(step.instructions)} - ${step.distance.text} - ${step.duration.text}`
          );
        });
      });
  
      const indentedSteps = steps.map(step => `  ${step}`).join('\n');
  
      const content = `Directions: ${indentedSteps.trim()}
      Total Info:
      - Total Distance: ${totalDistance.toFixed(2)} miles
      - Total Duration: ${formatDuration(totalDuration)}
      - Freeway Distance: ${freewayDistance.toFixed(2)} miles
      - City Distance: ${cityDistance.toFixed(2)} miles`;
  
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'directions.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePlaceChanged = () => {
    const destinationInput = destinationInputRef.current;
    const startingInput = startingInputRef.current;
    const stopoverInput = stopoverInputRef.current;

    if (mapLoaded && window.google.maps.places) {
      const destinationSearchBox = new window.google.maps.places.SearchBox(destinationInput);
      const startingSearchBox = new window.google.maps.places.SearchBox(startingInput);
      const stopoverSearchBox = new window.google.maps.places.SearchBox(stopoverInput);

      destinationSearchBox.addListener('places_changed', () => {
        const destinationPlaces = destinationSearchBox.getPlaces();

        if (destinationPlaces && destinationPlaces.length > 0) {
          const destination = destinationPlaces[0].geometry.location;
          mapRef.current.panTo(destination);
          mapRef.current.setZoom(12);

          setDirections(null);
          setCurrentStep(0);
        }
      });

      startingSearchBox.addListener('places_changed', () => {
        const startingPlaces = startingSearchBox.getPlaces();

        if (startingPlaces && startingPlaces.length > 0) {
        }
      });

      stopoverSearchBox.addListener('places_changed', () => {
        const stopoverPlaces = stopoverSearchBox.getPlaces();

        if (stopoverPlaces && stopoverPlaces.length > 0) {
          const stopoverLocation = stopoverPlaces[0].geometry.location;
          handleAddStopover(stopoverLocation);
        }
      });
    } else {
      console.log('Google Maps API is not fully loaded yet.');
    }
  };

  const calculateDirections = async (origin, destination, stopovers) => {
    const directionsService = new window.google.maps.DirectionsService({
      apiKey: 'AIzaSyDy_Ttv3H6inWRBR8btYRSmFzFWPU4oDy4',
    });

    const waypoints = stopovers.map(stopover => ({ location: stopover, stopover: true }));

    try {
      const response = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING',
            waypoints: waypoints,
            durationInTraffic: true,
          },
          async (response, status) => {
            if (status === 'OK') {
              const overviewPath = response.routes[0].overview_path;
              for (let i = 0; i < overviewPath.length; i++) {
                const routeLocation = overviewPath[i];
                
                const gasStationRequest = {
                  location: routeLocation,
                  radius: 1609.34,
                  types: ['gas_station'],
                };
  
                const placesService = new window.google.maps.places.PlacesService(mapRef.current);
  
                placesService.nearbySearch(gasStationRequest, (results, status) => {
                  if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach((place) => {
                      const marker = new window.google.maps.Marker({
                        position: place.geometry.location,
                        map: mapRef.current,
                        title: place.name,
                        icon: {
                          url: 'https://cdn-icons-png.flaticon.com/512/3448/3448636.png',
                          scaledSize: new window.google.maps.Size(40, 40),
                        },
                      });
                      const infoWindow = new window.google.maps.InfoWindow({
                        content: `<div><strong>${place.name}</strong><br>${place.vicinity}</div>`,
                      });
  
                      marker.addListener('click', () => {
                        infoWindow.open(mapRef.current, marker);
                      });
                    });
                  } else {
                    console.error('Error fetching gas stations:', status);
                  }
                });
              }
  
              resolve(response);
            } else {
              reject('Directions request failed due to ' + status);
            }
          }
        );
      });
  
      setDirections(response);
      calculateTotalDistanceAndDuration(response);
    } catch (error) {
      console.error(error);
      setDirections(null);
    }
  };

  const calculateTotalDistanceAndDuration = (response) => {
    if (!response || !response.routes || !response.routes[0] || !response.routes[0].legs) {
      return;
    }
    const legs = response.routes[0].legs;
    let distanceTotal = 0;
    let durationTotal = 0;
    let freewayDistance = 0;
    let cityDistance = 0;

    legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        distanceTotal += step.distance.value;
        durationTotal += step.duration.value;

        const instructions = step.instructions.toLowerCase();
        if (instructions.includes('merge onto') || instructions.includes('exit') || instructions.includes('i-') ) {
          freewayDistance += step.distance.value;
        } else {
          cityDistance += step.distance.value;
        }
      });
    });


    setTotalDistance(distanceTotal / 1609.34);
    setTotalDuration(durationTotal);
    if (legs[0] && legs[0].duration_in_traffic) {
      setTotalDurationWithTraffic(legs[0].duration_in_traffic.value);
    } else {
      setTotalDurationWithTraffic(null);
    }
    setFreewayDistance(freewayDistance / 1609.34);
    setCityDistance(cityDistance / 1609.34);
  };

  const handleMapLoad = (map) => {
    setMapLoaded(true);
    mapRef.current = map;
    const newTrafficLayer = new window.google.maps.TrafficLayer();
    newTrafficLayer.setMap(map);
    setTrafficLayer(newTrafficLayer);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours and ${minutes} minutes`;
  };

  const handleAddStopover = (stopoverLocation) => {
    setShowStopoverSearchBox(true);

    const newStopoverLocation = stopoverInputRef.current.value;
    if (newStopoverLocation) {
      setStopovers(prevStopovers => [...prevStopovers, newStopoverLocation]);
      stopoverInputRef.current.value = ''; 
  
      const newStopoverSearchBox = new window.google.maps.places.SearchBox(stopoverInputRef.current);
      newStopoverSearchBox.addListener('places_changed', () => {
        const newStopoverPlaces = newStopoverSearchBox.getPlaces();
        if (newStopoverPlaces && newStopoverPlaces.length > 0) {
          const newStopoverLocation = newStopoverPlaces[0].geometry.location;
          handleAddStopover(newStopoverLocation);
        }
      });
    }
  };

  const renderStopoverInputs = () => {
    const stopoverInputs = stopovers.map((stopover, index) => (
      <div key={index} className="stopover-input-container">
        <input
          type="text"
          placeholder={`Enter stopover`}
          className="pac-input3"
          readOnly
          value={stopover}
        />
      </div>
    ));

    const newStopoverInput = (
        <div key="search-box" className="stopover-input-container">
          <input
            type="text"
            placeholder={`Enter stopover ${currentIndex + 1}`}
            className="pac-input3"
            ref={stopoverInputRef}
          />
        </div>
      );
    return [...stopoverInputs, showStopoverSearchBox && newStopoverInput];
  };

  const TotalInfo = ({ totalDistance, totalDuration, freewayDistance, cityDistance }) => (
    <div>
      <div><h3><strong>Total Info</strong></h3></div>
      <div><strong>Total Distance: </strong>{totalDistance.toFixed(2)} miles</div>
      <div><strong>Total Duration: </strong>{formatDuration(totalDuration)}</div>
      <div><strong>Freeway Distance: </strong>{freewayDistance.toFixed(2)} miles</div>
      <div><strong>City Distance: </strong>{cityDistance.toFixed(2)} miles</div>
    </div>
  );

  const StepByStepDirections = () => {
    if (!directions) {
      return null;
    }
  
    const steps = [];
    directions.routes[0].legs.forEach((leg, legIndex) => {
      leg.steps.forEach((step, stepIndex) => {
        steps.push(
          <div key={`${legIndex}-${stepIndex}`}>
            <strong>Step {steps.length + 1}:</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: step.instructions }}></span> -{" "}
            {step.distance.text} - {step.duration.text}
          </div>
        );
      });
    });
  
    return (
      <div style={{ marginTop: '20px' }}>
        <h3>Step-by-Step Directions</h3>
        {steps}
      </div>
    );
  };

  const handleFindDirections = () => {
    const startingInput = startingInputRef.current;
    const destinationInput = destinationInputRef.current;

    if (startingInput && destinationInput) {
      const startingPoint = startingInput.value;
      const destination = destinationInput.value;

      calculateDirections(startingPoint, destination, stopovers);

    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDdIrXwXBDILYUAqBONwIbBmwAAObOgmKA" libraries={['places', 'directions']}>
      <div className="map-container">
        <input
          id="destination-input"
          ref={destinationInputRef}
          type="text"
          placeholder="Enter destination"
          className="pac-input"
          onChange={handlePlaceChanged}
        />
        <input
          id="starting-input"
          ref={startingInputRef}
          type="text"
          placeholder="Enter starting point"
          className="pac-input2"
          onChange={handlePlaceChanged}
        />
        {renderStopoverInputs()}

        <button onClick={handleFindDirections} className="find-directions-button">
          Find Directions
        </button>

        <GoogleMap
          mapContainerStyle={{ width: '70%', height: '91vh' }}
          center={{ lat: 37.7993, lng: -122.3977 }}
          zoom={8}
          onLoad={handleMapLoad}
          ref={mapRef}
        >
          {directions && <DirectionsRenderer directions={directions} />}
          {totalDurationWithTraffic !== null && (
            <div className="traffic-overlay">
              Traffic Duration: {formatDuration(totalDurationWithTraffic)}
            </div>
          )}
        </GoogleMap>
      </div>

      {directions && (
      <div style={{ position: 'absolute', top: '9.1%', right: '0', maxWidth: '28.5%', maxHeight: '88%', backgroundColor: 'white', padding: '10px', overflowY: 'auto', zIndex: 2 }}>
      <h2>Directions</h2>
      {directions.routes[0].legs.map((leg, index) => (
      <div key={index} style={{ cursor: 'pointer' }} onClick={() => setCurrentStep(index)}>
        <strong>Leg {index + 1}:</strong> {leg.start_address} to {leg.end_address}
      </div>
      ))}
        <TotalInfo totalDistance={totalDistance} totalDuration={totalDuration} freewayDistance={freewayDistance} cityDistance={cityDistance} />
        <StepByStepDirections />
        <button onClick={handlePrintDirections} className="print-directions-button">
            Print
        </button>
        <button onClick={handleDownloadDirections} className="download-directions-button">
            Download
        </button>
        <button onClick={handleRecalculate} className="recalculate-button">
            Recalculate
        </button>
      </div>
      )}
    </LoadScript>
  );
};

export default Map; 