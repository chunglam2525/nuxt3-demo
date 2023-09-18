<template>
  <div class="font-roboto">
    <NuxtLayout>
      <!-- <NuxtLoadingIndicator color="#fff" /> -->
      <Swiper
        :items="Array(30).fill(0)" :swiper-options="{
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: '10%',
          centerInsufficientSlides: true,
          breakpoints: {
            1069: {
              slidesPerView: 3,
              slidesPerGroup: 3
            }
          }
        }"
      >
        <template #item="{ item: item, index }">
          <swiper-slide>
            <div class="border-shadow-inset">
              {{ index }}
            </div>
          </swiper-slide>
        </template>
      </Swiper>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
const nuxtApp = useNuxtApp()
</script>

<style scoped>
  .border-shadow-inset {
    box-shadow:inset 0px 0px 0px 10px #f00;
  }
</style>
