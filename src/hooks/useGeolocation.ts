import {useState, useEffect} from 'react';

export const usePosition = () => {
  const [position, setPosition] = useState<{latitude: number, longitude: number}>({latitude: 0, longitude: 0});
  const [error, setError] = useState<string | null>(null);
  
  const onChange: PositionCallback = ({coords}) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError: PositionErrorCallback = error => {
    setError(error.message);
  };

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError('Geolocation is not supported');
      return;
    }
    const watcher = geo.watchPosition(onChange, onError);
    return () => geo.clearWatch(watcher);
  }, []);

  return {...position, error};
}