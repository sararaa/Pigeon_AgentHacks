export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  const geocoder = new google.maps.Geocoder();
  
  try {
    const result = await geocoder.geocode({ address: `${address}, Pasadena, CA` });
    if (result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng()
      };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}; 