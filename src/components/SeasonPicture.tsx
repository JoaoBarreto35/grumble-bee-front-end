import type { Season } from '../lib/types'
import { seasonDesktopImage, seasonMobileImage } from '../lib/catalog'

type Props = {
  season: Season
  className?: string
  fallbackDesktop?: string
  fallbackMobile?: string
  alt?: string
}

export function SeasonPicture({
  season,
  className = '',
  fallbackDesktop = '',
  fallbackMobile,
  alt
}: Props) {
  const desktop = seasonDesktopImage(season, fallbackDesktop)
  const mobile = seasonMobileImage(
    season,
    fallbackMobile ?? fallbackDesktop
  )

  if (!desktop && !mobile) return null

  return (
    <picture className={className}>
      {mobile && <source media="(max-width: 899px)" srcSet={mobile} />}
      <img
        src={desktop || mobile}
        alt={alt ?? `Temporada ${season.name}`}
      />
    </picture>
  )
}
