<template>
  <template v-if="!swiperReady">
    <component :is="'style'">
      {{ dynamicDefaultCSSRule }}
    </component>
  </template>
  <swiper-container
    ref="swiperRef" v-bind="$attrs"
    :class="[uuid, {'!touch-none': isMoving, 'swiper-wrapper-pre': !swiperReady}]" :init="false"
    @afterinit="onSwiperVarUpdate" @resize="onSwiperVarUpdate"
    @slideslengthchange="onSwiperItemsChange"
    @toedge="onSwiperReachEdge" @fromedge="onSwiperReachEdge"
    @transitionend="onSwiperTransitionEnd" @slidermove="onSwiperSliderMove"
  >
    <template v-for="(item, i) in items" :key="`CoreLogicSwiper-slide-${i}-${JSON.stringify(item)}`">
      <slot name="item" :="{item, index: i}" />
    </template>
  </swiper-container>
  <div v-if="$slots.backBtn" class="swiper-prev-btn" :class="{'hidden': swiperIsBeginning}" @click="slidePrev">
    <slot name="backBtn" />
  </div>
  <div v-if="$slots.nextBtn" class="swiper-next-btn" :class="{'hidden': swiperIsEnd}" @click="slideNext">
    <slot name="nextBtn" />
  </div>
</template>

<script lang="ts" setup generic="T">
import { Mousewheel, Grid, Pagination, A11y } from 'swiper/modules'
const emit = defineEmits(['onSlideChange', 'onNavBtn'])
const props = defineProps<{
  items: Array<T> | null,
  swiperOptions: SwiperOptions
  paginationCutoff?: number,
  injectStyle?: string
}>()

const swiperIsBeginning = ref<boolean>(true)
const swiperIsEnd = ref<boolean>(true)
const swiperRef = ref<SwiperContainer>()
const swiperReady = ref<boolean>(false)
const isMoving = ref<boolean>(false)

const onSwiperVarUpdate = (event: any) => {
  onSwiperReachEdge(event)
  updatePaginationBullet()
}
const onSwiperItemsChange = (event: any) => {
  if (event.detail) {
    const [swiper] = event.detail
    swiper.slideReset(300)
  }
}
const onSwiperTransitionEnd = (event: any) => {
  if (event.detail) {
    const [swiper] = event.detail
    emit('onSlideChange', swiper)
  }
  updatePaginationBullet()
  isMoving.value = false
}
const onSwiperSliderMove = () => {
  isMoving.value = true
}
const onSwiperReachEdge = (event: any) => {
  if (event.detail) {
    const [swiper] = event.detail
    swiperIsBeginning.value = swiper.isBeginning && !swiper.params.rewind
    swiperIsEnd.value = swiper.isEnd && !swiper.params.rewind
  }
}
const updatePaginationBullet = () => {
  if (props.paginationCutoff && swiperRef.value && swiperRef.value?.swiper && swiperRef.value.shadowRoot) {
    const activeIndex = (swiperRef.value?.swiper.activeIndex ?? 0)
    const activeCufoffSet = (activeIndex + 1) % props.paginationCutoff === 0
      ? Math.round((activeIndex + 1) / props.paginationCutoff)
      : ~~((activeIndex + 1) / props.paginationCutoff) + 1
    const bulletEls = swiperRef.value.shadowRoot.querySelectorAll('.swiper-pagination-bullet')
    bulletEls.forEach((bulletEl, i: number) => {
      if (props.paginationCutoff) {
        const highbound = activeCufoffSet * props.paginationCutoff
        const lowbound = highbound - props.paginationCutoff
        if (lowbound < (i + 1) && (i + 1) <= highbound) {
          (bulletEl as HTMLElement).style.display = 'inline-block'
          return
        }
        (bulletEl as HTMLElement).style.display = 'none'
      }
    })
  }
}
const slidePrev = () => {
  if (!swiperRef.value) { return }
  emit('onNavBtn', -1)
  swiperRef.value.swiper.slidePrev()
}
const slideNext = () => {
  if (!swiperRef.value) { return }
  emit('onNavBtn', 1)
  swiperRef.value.swiper.slideNext()
}

// #region reload style on SSR

const createDefaultCSSRule = (options: Partial<SwiperContainer>) => {
  let slideStyle: string = ''
  let spaceBetween: string | undefined
  const direction: string = (options.direction === 'vertical' || (options.grid && options.grid.fill !== 'row'))
    ? 'column'
    : 'row'
  let width: string | undefined
  if (options.spaceBetween) {
    spaceBetween = typeof options.spaceBetween === 'string' ? options.spaceBetween : options.spaceBetween + 'px'
  }
  if (options.slidesPerView && options.slidesPerView !== 'auto') {
    width = `calc((100% ${!spaceBetween || options.slidesPerView === 1 ? '' : `- (${spaceBetween} * (${options.slidesPerView} - 1))`}) / ${options.slidesPerView})`
  } else if (options.slidesPerView === undefined) {
    width = '100%'
  }
  // if (spaceBetween) {
  //   if (direction === 'row' || options.grid) { slideStyle += `margin-right: ${spaceBetween};` }
  //   if (direction === 'row' || options.grid) { slideStyle += `margin-bottom: ${spaceBetween};` }
  // }
  if (width) {
    slideStyle += `width: ${width};`
    slideStyle += `max-width: ${width};`
  }

  let containerStyle: string = ''
  containerStyle = (options.enabled || options.enabled === undefined)
    ? `
      display: flex;
      flex-direction: ${direction};
      ${options.grid ? 'flex-wrap: wrap;' : ''}
      overflow: hidden;
      gap: ${spaceBetween || 0};
    `
    : `
      display: block;
      overflow: auto;
    `
  return [slideStyle, containerStyle]
}
const getDynamicDefaultCSSRule = (className: string) => {
  let processingSwiperOptions: Partial<SwiperContainer>
  const { breakpoints: _, ...swiperOptions } = props.swiperOptions
  processingSwiperOptions = { ...swiperOptions }
  const styleArr = createDefaultCSSRule(processingSwiperOptions)
  let slideStyle = styleArr[0]
  let containerStyle = styleArr[1]
  if (props.swiperOptions.breakpoints) {
    Object.entries(props.swiperOptions.breakpoints).forEach(([breakpoint, options]) => {
      processingSwiperOptions = { ...processingSwiperOptions, ...options }
      const styleArr = createDefaultCSSRule(processingSwiperOptions)
      slideStyle += `@media (min-width: ${breakpoint}px) {
        ${styleArr[0]}
      };`
      containerStyle += `@media (min-width: ${breakpoint}px) {
        ${styleArr[1]}
      };`
    })
  }
  return `
    swiper-container.${className} {
      ${containerStyle}
    }
    swiper-container.${className} swiper-slide {
      flex-shrink: 0;
      ${slideStyle}
    }
  `
}

const swiperOptionsKey = computed(() => {
  return JSON.stringify(props.swiperOptions)
})
const uuid = useState(swiperOptionsKey.value, () => `swiper-${useUUID()}`)
const dynamicDefaultCSSRule = useState(uuid.value, () => getDynamicDefaultCSSRule(uuid.value))
// #endregion

onMounted(() => {
  if (swiperRef.value && swiperRef.value.initialize) {
    Object.assign(swiperRef.value, {
      modules: [Mousewheel, Grid, Pagination, A11y],
      a11y: { enabled: true },
      mousewheel: { enabled: true, forceToAxis: true, thresholdDelta: 4 },
      ...props.swiperOptions,
      injectStyles: [`
        .swiper-pagination-bullet {
          opacity: 0.2;
          background-color: #fff;
          height: 1rem;
          width: 1rem;
        }
        @media (min-width: 768px) {
          .swiper-pagination-bullet {
            height: 10px;
            width: 10px;
          }
        }
        .swiper-pagination-bullet.swiper-pagination-bullet-active {
          opacity: 1;
        }
        ${props.injectStyle ? props.injectStyle : ''}
      `]
    })
    swiperRef.value.initialize()
    swiperReady.value = true
  }
})
</script>

<style scoped>
  :deep(a, iframe) {
    user-select: none;
    -webkit-user-drag: none;
  }
</style>
