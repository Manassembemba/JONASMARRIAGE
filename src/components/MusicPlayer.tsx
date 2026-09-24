import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles } from 'lucide-react';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialiser l'élément Audio
    const audio = new Audio('/assets/wedding_song.mp3');
    audio.loop = true;
    audio.volume = 0.65;
    audioRef.current = audio;

    // Tentative de lecture automatique au montage
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setHasInteracted(true);
      } catch {
        // Politique Autoplay des navigateurs : bloquée tant qu'il n'y a pas d'interaction
        setIsPlaying(false);
        setShowToast(true);

        // Déclencher dès la première interaction (clic, scroll, touche)
        const handleFirstInteraction = () => {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasInteracted(true);
                setShowToast(false);
              })
              .catch(() => {
                // Ignore
              });
          }
          cleanupListeners();
        };

        const cleanupListeners = () => {
          window.removeEventListener('click', handleFirstInteraction);
          window.removeEventListener('touchstart', handleFirstInteraction);
          window.removeEventListener('scroll', handleFirstInteraction);
          window.removeEventListener('keydown', handleFirstInteraction);
        };

        window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
        window.addEventListener('scroll', handleFirstInteraction, { passive: true, once: true });
        window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });
      }
    };

    tryAutoplay();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
          setShowToast(false);
        })
        .catch((err) => {
          console.error('Erreur de lecture audio :', err);
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <>
      {/* Toast d'incitation si autoplay restreint par le navigateur */}
      {showToast && !hasInteracted && (
        <div
          onClick={togglePlay}
          className="fixed bottom-24 right-5 z-40 bg-[#1b1c1a]/95 text-[#ffdea5] px-4 py-2.5 rounded-full shadow-2xl border border-[#c5a059]/50 flex items-center gap-2.5 cursor-pointer hover:bg-[#775a19] transition-all duration-300 animate-bounce text-xs font-medium backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059] animate-spin" />
          <span>Cliquez pour écouter la musique de mariage</span>
          <Music className="w-4 h-4 ml-1 text-[#ffdea5]" />
        </div>
      )}

      {/* Lecteur de Musique Flottant Luxe */}
      <div className="fixed bottom-6 right-5 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-xl backdrop-blur-md border transition-all duration-500 ${
            isPlaying
              ? 'bg-[#1b1c1a]/90 text-[#ffdea5] border-[#c5a059]/60 shadow-[#c5a059]/20 hover:bg-[#775a19] hover:text-white'
              : 'bg-white/90 text-[#605e5c] border-[#d1c5b4] hover:bg-[#1b1c1a] hover:text-[#ffdea5] hover:border-[#c5a059]'
          }`}
          title={isPlaying ? 'Mettre la musique en pause' : 'Lancer la musique de mariage'}
          aria-label="Contrôle de la musique de mariage"
        >
          {/* Disque vinyle tournant */}
          <div className="relative flex items-center justify-center">
            <Disc3
              className={`w-5 h-5 transition-transform ${
                isPlaying ? 'animate-spin text-[#c5a059]' : 'text-current'
              }`}
              style={{ animationDuration: isPlaying ? '3.5s' : '0s' }}
            />
            {isPlaying && (
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#1b1c1a]"></span>
            )}
          </div>

          {/* Ondes Sonores (Equalizer) */}
          {isPlaying && !isMuted ? (
            <div className="flex items-end gap-[2px] h-3.5 px-0.5">
              <span className="w-[2px] bg-[#c5a059] rounded-full animate-pulse h-3"></span>
              <span className="w-[2px] bg-[#ffdea5] rounded-full animate-pulse h-2 delay-75"></span>
              <span className="w-[2px] bg-[#c5a059] rounded-full animate-pulse h-3.5 delay-150"></span>
              <span className="w-[2px] bg-[#ffdea5] rounded-full animate-pulse h-1.5 delay-100"></span>
            </div>
          ) : (
            <span className="text-[11px] font-semibold tracking-wider uppercase hidden sm:inline-block">
              {isPlaying ? 'Pause' : 'Musique'}
            </span>
          )}

          {/* Bouton Muet / Son */}
          {isPlaying && (
            <span
              onClick={toggleMute}
              className="p-1 hover:text-white transition-colors ml-1"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#ffdea5]" />
              )}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
