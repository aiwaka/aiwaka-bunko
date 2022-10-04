<template>
  <router-link :to="`/contents/${item.urlStr}`">
    <div class="document-item" :class="{ 'favorite-item': favorite }">
      <div class="item-title">{{ item.title }}</div>
      <div class="item-update">
        <span class="update-date-string">
          last update : {{ item.postDateAsString() }}
        </span>
        <span class="new-item-icon" v-if="item.update.toDate() > lastWeekDate">
          NEW!
        </span>
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { DocumentContent } from "@/modules/document-content";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    lastWeekDate: {
      type: Object as PropType<Date>,
      required: true,
    },
    item: {
      type: Object as PropType<DocumentContent>,
      required: true,
    },
    favorite: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.document-item {
  border: 2px solid #777777;
  border-radius: 7px;
  backdrop-filter: blur(1.5rem);
  margin: 1rem 1.6rem;
  padding: 1rem 1.8rem;
  &.favorite-item {
    background-color: rgba($color: orange, $alpha: 0.3);
    &:hover {
      background-color: rgba($color: orange, $alpha: 0.6);
    }
  }
  &:first-child {
    margin-top: 0;
  }
  &:hover {
    backdrop-filter: blur(0);
    background-color: rgba(100, 100, 255, 0.2);
  }

  .item-title {
    font-size: 1.8rem;
  }
  .item-update {
    font-size: 1.1rem;
    color: #888888;
    display: flex;
    column-gap: 1rem;
    flex-wrap: wrap;

    .new-item-icon {
      padding: 0.1rem;
      border-radius: 3px;
      background-color: orange;
      color: beige;
    }
  }
}
</style>
