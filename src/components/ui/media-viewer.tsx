// Composant d'affichage média : vidéo, image ou lien PDF selon l'URL

interface MediaViewerProps {
  url: string
  className?: string
}

// Détermine le type de média à partir de l'extension de l'URL
function getMediaType(url: string): 'video' | 'image' | 'pdf' | 'unknown' {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.mp4') || clean.endsWith('.mov')) return 'video'
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png')) return 'image'
  if (clean.endsWith('.pdf')) return 'pdf'
  return 'unknown'
}

export function MediaViewer({ url, className = '' }: MediaViewerProps) {
  if (!url) return null

  const type = getMediaType(url)

  if (type === 'video') {
    return (
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className={`rounded-xl w-full ${className}`}
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    )
  }

  if (type === 'image') {
    return (
      <img
        src={url}
        alt="Démonstration de l'exercice"
        className={`rounded-xl w-full object-contain max-h-80 ${className}`}
      />
    )
  }

  if (type === 'pdf') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-sm text-[#d4ff00] hover:text-[#c2ee00] transition-colors ${className}`}
      >
        📄 Voir le PDF
      </a>
    )
  }

  // Type inconnu : lien générique
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-sm text-[#d4ff00] hover:text-[#c2ee00] transition-colors ${className}`}
    >
      Voir le fichier
    </a>
  )
}
