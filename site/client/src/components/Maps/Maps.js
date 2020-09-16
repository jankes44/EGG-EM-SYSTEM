import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "1000px",
  height: "750px",
};

const center = {
  lat: 55.951978,
  lng: -3.175562,
};

function MyComponent() {
  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyBC2FrJMN5Hh_b7jwQSr2P4jSFCdt1ER1I">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker position={center} label="Eloooo" />
        {/* Child components, such as markers, info windows, etc. */}
        <></>
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MyComponent);
