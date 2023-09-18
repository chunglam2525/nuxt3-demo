
import { SwiperContainer as Swiper } from 'swiper/element/bundle'
export {}

declare global {
  type SwiperContainer = Swiper
  type SwiperOptions = Pick<Swiper,
    'spaceBetween' | 'direction' | 'autoHeight' | 'breakpoints' | 'enabled' |
    'slidesPerGroup' | 'slidesPerView' | 'centerInsufficientSlides' | 'centeredSlides' |
    'loop' | 'initialSlide' |
    'pagination' | 'grid'
  >
}
