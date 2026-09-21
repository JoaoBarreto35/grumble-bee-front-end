import type { Product, Season } from './types'

export function isPublicSeason(season: Season) {
  return season.status !== 'draft'
}

export function isPublicProduct(product: Product) {
  return product.status !== 'draft' && product.status !== 'archived'
}

export function seasonCardImage(season: Season, fallback = '') {
  return (
    season.cover_image_url
    ?? season.banner_image_url
    ?? season.mobile_banner_image_url
    ?? fallback
  )
}

export function seasonDesktopImage(season: Season, fallback = '') {
  return (
    season.banner_image_url
    ?? season.cover_image_url
    ?? season.mobile_banner_image_url
    ?? fallback
  )
}

export function seasonMobileImage(season: Season, fallback = '') {
  return (
    season.mobile_banner_image_url
    ?? season.banner_image_url
    ?? season.cover_image_url
    ?? fallback
  )
}
