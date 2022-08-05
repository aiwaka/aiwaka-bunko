<template>
  <div class="designed-pin">
    <div class="pin" :class="{ 'active-pin': active }">
      <svg class="star-icon" :class="{ 'active-pin': active }">
        <use xlink:href="#star-symbol" href="#star-symbol" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
* {
  margin: 0px;
  padding: 0px;
}

.designed-pin {
  position: relative;
  width: 40px;
}

$active-pin-color: orange;
$non-active-pin-color: gray;
.pin {
  background-color: $non-active-pin-color;
  width: 40px;
  height: 40px;
  text-align: center;
  vertical-align: middle;
  border-radius: 5px;
  &.active-pin {
    background-color: $active-pin-color;
    &:after {
      border-top: 15px solid $active-pin-color;
    }
  }
  $pin-width: 5px;
  &:after {
    content: "";
    position: absolute;
    border-top: 15px solid $non-active-pin-color;
    border-left: $pin-width solid transparent;
    border-right: $pin-width solid transparent;
    border-bottom: 0px;
    top: 40px;
    left: calc(50% - $pin-width);
  }
}

// svgの再描画を避けるためApp.vueのテンプレートにsvgを記述してそれをuseするようにしている.
.star-icon {
  fill: darkgray;
  width: 20px;
  height: 20px;
  margin-top: 5px;
  &.active-pin {
    fill: yellow;
  }
}
</style>
