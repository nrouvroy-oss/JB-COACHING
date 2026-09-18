// Composant lecteur vidéo inline réutilisable

interface VideoPlayerProps {
  url: string
  className?: string
}

export function VideoPlayer({ url, className = '' }: VideoPlayerProps) {
  // Ne rien afficher si l'URL est vide
  if (!url) return null

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className={`rounded-lg w-full ${className}`}
    >
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  )
}
