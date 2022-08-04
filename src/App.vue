<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
    <symbol
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-100 -100 200 200"
      id="star-symbol"
    >
      <polygon
        points="0,-100 29.39,-40.45 95.11,-30.9 47.55,15.45 58.78,80.90 0,50 -58.78,80.9 -47.55,15.45 -95.11,-30.9 -29.39,-40.45"
      />
    </symbol>
  </svg>
  <site-header-vue />
  <section id="view-container">
    <router-view />
  </section>
  <site-footer-vue />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SiteHeaderVue from "./components/SiteHeader.vue";
import SiteFooterVue from "./components/SiteFooter.vue";

export default defineComponent({
  components: {
    SiteHeaderVue,
    SiteFooterVue,
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/mixins.scss";

#view-container {
  position: relative;

  @include mediaquery(small-size) {
    top: $header-height + 3rem;
    margin-bottom: 12rem;
  }

  margin: 1rem 5%;

  @include mediaquery(small-size) {
    flex-direction: column;
    top: $header-height + 3rem;
    margin-bottom: 12rem;
  }
}
</style>
