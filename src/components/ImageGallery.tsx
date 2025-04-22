import  { useImages } from '../hooks/useImages';

interface ImageGalleryProps {
  searchTerm: string;
  width?: number;
  height?: number;
  count?: number;
  onSelect?: (imageUrl: string) => void;
}

const ImageGallery = ({ 
  searchTerm, 
  width = 800, 
  height = 600, 
  count = 5,
  onSelect 
}: ImageGalleryProps) => {
  const { images, loading, error } = useImages(searchTerm, width, height, count);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loader" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (images.length === 0) {
    return <div className="text-gray-500 text-center py-4">No images found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((imageUrl, index) => (
        <div 
          key={index} 
          className={`relative rounded-lg overflow-hidden ${onSelect ? 'cursor-pointer' : ''}`}
          onClick={() => onSelect && onSelect(imageUrl)}
        >
          <img 
            src={imageUrl} 
            alt={`${searchTerm} ${index + 1}`} 
            className="w-full h-40 object-cover" 
          />
          {onSelect && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 transition-opacity">
              <span className="text-white text-sm font-medium">Click to select</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
 