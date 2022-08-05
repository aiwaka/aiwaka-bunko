<template>
  <button class="button-ui" :disabled="disabled" @click="clickCallback">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    clickCallback: {
      type: Function as PropType<() => void>,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.button-ui {
  margin: 0.3rem 0.5rem;
  border: 1px solid rgb(100, 200, 255);
  border-radius: 12px;
  transition: 0.25s ease-out;

  &[disabled] {
    color: #999999;
  }
  &:not([disabled]):hover {
    color: #333333;
    background-color: rgb(100, 200, 255);
    border: 1px solid rgb(172, 255, 244);
  }
}
</style>
