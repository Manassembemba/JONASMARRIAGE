import React, { useState } from 'react';
import { useWeddingData } from '../context/WeddingDataContext';
import { DEFAULT_GALLERY_ITEMS } from '../data/weddingData';
import { Camera, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { galleryItems } = useWeddingData();
  const items = galleryItems && galleryItems.length > 0 ? galleryItems : DEFAULT_GALLERY_ITEMS;
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % items.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + items.length) % items.length
      );
    }
  };

  return (
    <section id="galerie" className="w-full py-20 bg-[#fbf9f5] relative">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-2 text-[#775a19]">
            <Camera className="w-4 h-4 text-[#c5a059]" />
            <span className="text-[11px] font-semibold tracking-[0.22em] leading-normal uppercase">
              Instantanés de Bonheur
            </span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#1b1c1a] font-normal leading-[1.22] sm:leading-[1.18] tracking-[0.015em]">
            Quelques moments de nous
          </h2>
          <p className="text-xs sm:text-sm text-[#4e4639] max-w-xl mx-auto mt-2 leading-relaxed">
            Regards complices, préparatifs et éclats de tendresse capturés dans l'attente du grand jour.
          </p>
        </div>

        {/* Masonry / Grille Moderne de Style Éditorial */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6 items-center">
          {items.map((item, index) => (
            <div
              key={item.id || `photo-${index}`}
              onClick={() => openLightbox(index)}
              className={`${item.span || 'col-span-12 md:col-span-6'} rounded-2xl overflow-hidden shadow-lg border border-[#c5a059]/25 group relative cursor-pointer ${item.aspect || 'aspect-[4/3]'} bg-[#eae8e4] transition-all duration-500 hover:shadow-2xl hover:border-[#c5a059]/60`}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Hover overlay with caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c1a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#ffdea5] uppercase block">
                      {item.subtitle}
                    </span>
                    <h3 className="font-editorial text-base sm:text-lg text-white font-medium">
                      {item.title}
                    </h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && items[selectedPhotoIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={prevPhoto}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextPhoto}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
            aria-label="Suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
          >
            <img
              src={items[selectedPhotoIndex].url}
              alt={items[selectedPhotoIndex].title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-white/20"
            />
            <div className="text-center text-white mt-4">
              <p className="font-editorial text-lg sm:text-xl font-medium">
                {items[selectedPhotoIndex].title}
              </p>
              <p className="text-xs text-[#ffdea5] uppercase tracking-widest mt-1">
                {items[selectedPhotoIndex].subtitle} ({selectedPhotoIndex + 1} /{' '}
                {items.length})
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
