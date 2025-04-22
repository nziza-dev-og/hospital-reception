import  { useState, useEffect } from 'react';
import { getHospitalImages } from '../utils/getImages';

export function useImages(searchTerm: string, width: number = 800, height: number = 600, count: number = 5) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await getHospitalImages(searchTerm, width, height, count);
        setImages(results);
      } catch (err) {
        setError('Failed to load images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [searchTerm, width, height, count]);

  return { images, loading, error };
}
 