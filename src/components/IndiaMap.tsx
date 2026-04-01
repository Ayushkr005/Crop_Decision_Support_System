import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TranslatableText } from './TranslatableText';

// District coordinates for Indian districts (sample data - expand as needed)
const districtCoordinates: { [key: string]: [number, number] } = {
  'Mumbai': [72.8777, 19.0760],
  'Delhi': [77.1025, 28.7041],
  'Bangalore': [77.5946, 12.9716],
  'Hyderabad': [78.4867, 17.3850],
  'Ahmedabad': [72.5714, 23.0225],
  'Chennai': [80.2707, 13.0827],
  'Kolkata': [88.3639, 22.5726],
  'Pune': [73.8567, 18.5204],
  'Jaipur': [75.7873, 26.9124],
  'Lucknow': [80.9462, 26.8467],
};

// Soil types with colors
const soilTypes = [
  { name: 'Alluvial Soil', color: '#8B7355', description: 'Rich in minerals, good for cereals' },
  { name: 'Black Soil', color: '#2C2C2C', description: 'High water retention, ideal for cotton' },
  { name: 'Red Soil', color: '#CD5C5C', description: 'Rich in iron, good for groundnut' },
  { name: 'Laterite Soil', color: '#D2691E', description: 'Good for tea, coffee, cashew' },
  { name: 'Desert Soil', color: '#F4A460', description: 'Low fertility, needs irrigation' },
];

interface IndiaMapProps {
  selectedDistrict?: string;
}

export const IndiaMap = ({ selectedDistrict }: IndiaMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map centered on India
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for major crop-producing areas
    map.current.on('load', () => {
      // Add soil type layers
      soilTypes.forEach((soil, index) => {
        map.current?.addLayer({
          id: `soil-${index}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [78 + index, 20 + index],
                  [79 + index, 20 + index],
                  [79 + index, 21 + index],
                  [78 + index, 21 + index],
                  [78 + index, 20 + index],
                ]],
              },
              properties: {},
            },
          },
          paint: {
            'fill-color': soil.color,
            'fill-opacity': 0.4,
          },
        });
      });

      // Add markers for districts
      Object.entries(districtCoordinates).forEach(([district, coords]) => {
        const marker = new mapboxgl.Marker({ color: '#22c55e' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3 class="font-bold">${district}</h3><p>Major crop producing area</p>`)
          )
          .addTo(map.current!);
      });
    });

    // Fly to selected district if available
    if (selectedDistrict && districtCoordinates[selectedDistrict]) {
      map.current.flyTo({
        center: districtCoordinates[selectedDistrict],
        zoom: 10,
        duration: 2000,
      });
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, mapboxToken, selectedDistrict]);

  if (!isTokenSet) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <TranslatableText>India Agricultural Map</TranslatableText>
          </CardTitle>
          <CardDescription>
            <TranslatableText>Enter your Mapbox API token to view the interactive map</TranslatableText>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter Mapbox Access Token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              <TranslatableText>Get your free token from</TranslatableText>{' '}
              <a 
                href="https://account.mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <button
            onClick={() => {
              if (mapboxToken.trim()) {
                setIsTokenSet(true);
              }
            }}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <TranslatableText>Load Map</TranslatableText>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle>
          <TranslatableText>India Agricultural Map</TranslatableText>
        </CardTitle>
        <CardDescription>
          <TranslatableText>Interactive map showing crop-producing regions and soil types</TranslatableText>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[500px]" />
        
        <div className="p-4 bg-muted/50">
          <h4 className="font-semibold mb-2 text-sm">
            <TranslatableText>Soil Type Legend</TranslatableText>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {soilTypes.map((soil, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-4 h-4 rounded border border-border" 
                  style={{ backgroundColor: soil.color }}
                />
                <div>
                  <div className="font-medium">
                    <TranslatableText>{soil.name}</TranslatableText>
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    <TranslatableText>{soil.description}</TranslatableText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
