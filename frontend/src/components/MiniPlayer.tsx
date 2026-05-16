import { Play, Pause, X, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isVisible,
    pauseTrack,
    resumeTrack,
    closePlayer,
    seekTo,
    setVolume: setAudioVolume,
  } = useAudioPlayer()

  if (!isVisible || !currentTrack) {
    return null
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const [isHoveringProgress, setIsHoveringProgress] = useState(false)
  const [hoverPosition, setHoverPosition] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(0.7)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const volumeSliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentTrack && !isMuted && volume > 0) {
      setAudioVolume(volume)
    }
  }, [currentTrack, volume, setAudioVolume])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percentage * duration
    seekTo(newTime)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, mouseX / rect.width))
    setHoverPosition(percentage * 100)
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeSliderRef.current) return
    
    const rect = volumeSliderRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newVolume = percentage
    
    setVolume(newVolume)
    setIsMuted(false)
    setPreviousVolume(newVolume)
    
    setAudioVolume(newVolume)
  }

  const toggleMute = () => {
    if (isMuted) {
      const volumeToRestore = previousVolume > 0 ? previousVolume : 0.7
      setIsMuted(false)
      setVolume(volumeToRestore)
      setTimeout(() => {
        setAudioVolume(volumeToRestore)
      }, 10)
    } else {
      if (volume > 0) {
        setPreviousVolume(volume)
      }
      setIsMuted(true)
      setAudioVolume(0)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-2xl z-50">
      <div
        ref={progressBarRef}
        className="h-1 bg-gray-700 cursor-pointer relative group"
        onClick={handleProgressClick}
        onMouseMove={handleProgressMouseMove}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => setIsHoveringProgress(false)}
      >
        <div
          className="h-full bg-gray-400 transition-all relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-opacity"
            style={{ opacity: isHoveringProgress ? 1 : 0.9 }}
          />
        </div>
        
        {isHoveringProgress && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg pointer-events-none z-10"
            style={{ left: `${hoverPosition}%` }}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            to={`/tracks/${currentTrack.id}`}
            className="flex items-center space-x-3"
          >
            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-primary-400 to-purple-600 flex-shrink-0 overflow-hidden">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <Music className="h-7 w-7 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-white truncate hover:text-primary-400 transition-colors text-sm">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {currentTrack.producer?.displayName || 'Unknown Producer'}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
          <button
            className="w-8 h-8 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous track"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={isPlaying ? pauseTrack : resumeTrack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            className="w-8 h-8 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next track"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
          <button
            onClick={toggleMute}
            className="w-8 h-8 text-white hover:text-gray-300 transition-colors flex items-center justify-center"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <div
            ref={volumeSliderRef}
            className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleVolumeClick}
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
          </div>
          <button
            onClick={closePlayer}
            className="ml-6 w-8 h-8 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer

