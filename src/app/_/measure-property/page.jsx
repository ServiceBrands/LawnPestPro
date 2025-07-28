"use client";
import React from "react";

function MainComponent() {
  const [map, setMap] = React.useState(null);
  const [drawingManager, setDrawingManager] = React.useState(null);
  const [measurements, setMeasurements] = React.useState([]);
  const [selectedClient, setSelectedClient] = React.useState("");
  const [clients, setClients] = React.useState([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [currentPolygon, setCurrentPolygon] = React.useState(null);
  const [savedMeasurements, setSavedMeasurements] = React.useState([]);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [measurementName, setMeasurementName] = React.useState("");
  const [totalArea, setTotalArea] = React.useState(0);

  React.useEffect(() => {
    loadClients();
    loadGoogleMaps();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch("/api/clients/list", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  };

  const initializeMap = React.useCallback(
    (mapElement) => {
      if (!mapElement || !window.google || map) return;

      const newMap = new window.google.maps.Map(mapElement, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 15,
        mapTypeId: "satellite",
      });

      const newDrawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            window.google.maps.drawing.OverlayType.POLYGON,
            window.google.maps.drawing.OverlayType.POLYLINE,
          ],
        },
        polygonOptions: {
          fillColor: "#00FF00",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#00FF00",
          editable: true,
          draggable: true,
        },
        polylineOptions: {
          strokeColor: "#FF0000",
          strokeWeight: 3,
          editable: true,
          draggable: true,
        },
      });

      newDrawingManager.setMap(newMap);

      newDrawingManager.addListener("overlaycomplete", (event) => {
        if (event.type === "polygon") {
          const polygon = event.overlay;
          const area = window.google.maps.geometry.spherical.computeArea(
            polygon.getPath()
          );
          const areaInSqFt = (area * 10.764).toFixed(2);

          const measurement = {
            id: Date.now(),
            type: "area",
            area: areaInSqFt,
            polygon: polygon,
            coordinates: polygon
              .getPath()
              .getArray()
              .map((coord) => ({
                lat: coord.lat(),
                lng: coord.lng(),
              })),
          };

          setMeasurements((prev) => [...prev, measurement]);
          setCurrentPolygon(polygon);
          setTotalArea((prev) => prev + parseFloat(areaInSqFt));

          polygon.addListener("click", () => {
            setCurrentPolygon(polygon);
          });

          polygon
            .getPath()
            .addListener("set_at", () =>
              updatePolygonArea(polygon, measurement.id)
            );
          polygon
            .getPath()
            .addListener("insert_at", () =>
              updatePolygonArea(polygon, measurement.id)
            );
        } else if (event.type === "polyline") {
          const polyline = event.overlay;
          const path = polyline.getPath();
          let distance = 0;

          for (let i = 0; i < path.getLength() - 1; i++) {
            distance +=
              window.google.maps.geometry.spherical.computeDistanceBetween(
                path.getAt(i),
                path.getAt(i + 1)
              );
          }

          const distanceInFt = (distance * 3.28084).toFixed(2);

          const measurement = {
            id: Date.now(),
            type: "distance",
            distance: distanceInFt,
            polyline: polyline,
            coordinates: path.getArray().map((coord) => ({
              lat: coord.lat(),
              lng: coord.lng(),
            })),
          };

          setMeasurements((prev) => [...prev, measurement]);
        }
      });

      setMap(newMap);
      setDrawingManager(newDrawingManager);
    },
    [map]
  );

  const updatePolygonArea = (polygon, measurementId) => {
    const area = window.google.maps.geometry.spherical.computeArea(
      polygon.getPath()
    );
    const areaInSqFt = (area * 10.764).toFixed(2);

    setMeasurements((prev) =>
      prev.map((m) => (m.id === measurementId ? { ...m, area: areaInSqFt } : m))
    );

    const newTotal =
      measurements.reduce(
        (sum, m) =>
          m.type === "area" && m.id !== measurementId
            ? sum + parseFloat(m.area)
            : sum,
        0
      ) + parseFloat(areaInSqFt);

    setTotalArea(newTotal);
  };

  const clearMeasurements = () => {
    measurements.forEach((measurement) => {
      if (measurement.polygon) measurement.polygon.setMap(null);
      if (measurement.polyline) measurement.polyline.setMap(null);
    });
    setMeasurements([]);
    setCurrentPolygon(null);
    setTotalArea(0);
  };

  const deleteMeasurement = (measurementId) => {
    const measurement = measurements.find((m) => m.id === measurementId);
    if (measurement) {
      if (measurement.polygon) {
        measurement.polygon.setMap(null);
        setTotalArea((prev) => prev - parseFloat(measurement.area));
      }
      if (measurement.polyline) measurement.polyline.setMap(null);

      setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));

      if (currentPolygon === measurement.polygon) {
        setCurrentPolygon(null);
      }
    }
  };

  const saveMeasurement = () => {
    if (!measurementName.trim()) {
      alert("Please enter a name for this measurement");
      return;
    }

    const savedMeasurement = {
      id: Date.now(),
      name: measurementName,
      clientId: selectedClient,
      clientName:
        clients.find((c) => c.id === selectedClient)?.name || "No Client",
      totalArea: totalArea.toFixed(2),
      measurements: measurements.map((m) => ({
        id: m.id,
        type: m.type,
        area: m.area,
        distance: m.distance,
        coordinates: m.coordinates,
      })),
      createdAt: new Date().toLocaleDateString(),
    };

    setSavedMeasurements((prev) => [...prev, savedMeasurement]);
    setShowSaveDialog(false);
    setMeasurementName("");
    alert("Measurement saved successfully!");
  };

  const loadSavedMeasurement = (savedMeasurement) => {
    clearMeasurements();

    savedMeasurement.measurements.forEach((measurement) => {
      if (measurement.type === "area") {
        const polygon = new window.google.maps.Polygon({
          paths: measurement.coordinates,
          fillColor: "#00FF00",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#00FF00",
          editable: true,
          draggable: true,
        });

        polygon.setMap(map);

        const newMeasurement = {
          ...measurement,
          polygon: polygon,
        };

        setMeasurements((prev) => [...prev, newMeasurement]);

        polygon.addListener("click", () => setCurrentPolygon(polygon));
        polygon
          .getPath()
          .addListener("set_at", () =>
            updatePolygonArea(polygon, measurement.id)
          );
        polygon
          .getPath()
          .addListener("insert_at", () =>
            updatePolygonArea(polygon, measurement.id)
          );
      } else if (measurement.type === "distance") {
        const polyline = new window.google.maps.Polyline({
          path: measurement.coordinates,
          strokeColor: "#FF0000",
          strokeWeight: 3,
          editable: true,
          draggable: true,
        });

        polyline.setMap(map);

        setMeasurements((prev) => [
          ...prev,
          { ...measurement, polyline: polyline },
        ]);
      }
    });

    setTotalArea(parseFloat(savedMeasurement.totalArea));
  };

  const searchAddress = (address) => {
    if (!map || !address.trim()) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(18);

        new window.google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: address,
        });
      } else {
        alert("Address not found. Please try a different address.");
      }
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
          <p className="text-lg text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-white hover:text-green-200">
                <i className="fas fa-arrow-left text-lg"></i>
              </a>
              <i className="fas fa-ruler-combined text-2xl"></i>
              <h1 className="text-xl font-bold">Property Measurement Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Total Area: {totalArea.toFixed(2)} sq ft
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Address Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter property address..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      searchAddress(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    searchAddress(input.value);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client (Optional)
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">No Client Selected</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={measurements.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save mr-2"></i>Save Measurement
              </button>
              <button
                onClick={clearMeasurements}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                <i className="fas fa-trash mr-2"></i>Clear All
              </button>
            </div>

            {/* Current Measurements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Current Measurements
              </h3>
              {measurements.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No measurements yet. Use the drawing tools on the map to start
                  measuring.
                </p>
              ) : (
                <div className="space-y-2">
                  {measurements.map((measurement, index) => (
                    <div
                      key={measurement.id}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {measurement.type === "area" ? "Area" : "Distance"}{" "}
                            #{index + 1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {measurement.type === "area"
                              ? `${measurement.area} sq ft`
                              : `${measurement.distance} ft`}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteMeasurement(measurement.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Measurements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Saved Measurements</h3>
              {savedMeasurements.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No saved measurements yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedMeasurements.map((saved) => (
                    <div key={saved.id} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{saved.name}</p>
                          <p className="text-sm text-gray-600">
                            {saved.clientName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: {saved.totalArea} sq ft
                          </p>
                          <p className="text-xs text-gray-500">
                            {saved.createdAt}
                          </p>
                        </div>
                        <button
                          onClick={() => loadSavedMeasurement(saved)}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={initializeMap} className="w-full h-full" />

          {/* Map Instructions */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ul className="text-sm space-y-1">
              <li>• Use polygon tool to measure areas</li>
              <li>• Use line tool to measure distances</li>
              <li>• Click and drag to edit shapes</li>
              <li>• Switch to satellite view for better accuracy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Save Measurement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Measurement Name *
                </label>
                <input
                  type="text"
                  value={measurementName}
                  onChange={(e) => setMeasurementName(e.target.value)}
                  placeholder="e.g., Front Lawn, Backyard, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <p className="text-sm text-gray-600">
                  {selectedClient
                    ? clients.find((c) => c.id === selectedClient)?.name
                    : "No client selected"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <p className="text-sm text-gray-600">
                  {measurements.filter((m) => m.type === "area").length} areas,{" "}
                  {measurements.filter((m) => m.type === "distance").length}{" "}
                  distances
                </p>
                <p className="text-sm text-gray-600">
                  Total Area: {totalArea.toFixed(2)} sq ft
                </p>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={saveMeasurement}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;