<template>
  <div id="app">
    <div class="relative">
        <slot />
    </div>

    <!-- popup -->
    <div id="popupContainer">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { register } from 'swiper/element/bundle'
register() // comment this line to test swiper SSR style
</script>
