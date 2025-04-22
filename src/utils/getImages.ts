import  { get } from './apiUtils';

export async function getHospitalImages(searchTerms: string, width: number = 800, height: number = 600, count: number = 5): Promise<string[]> {
  try {
    const response = await fetch(`https://hooks.jdoodle.net/proxy?url=https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerms)}&per_page=${count}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    return data.results.map((photo: any) => {
      return `${photo.urls.raw}&w=${width}&h=${height}&fit=crop`;
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}
 