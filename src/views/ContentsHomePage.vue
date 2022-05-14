<template>
  <div class="contents-home">
    <h1>コンテンツ一覧</h1>
    <p>全部で{{ allDocumentNum }}件の文書があります。</p>
    <div class="document-list-container">
      <contents-list-item-vue
        v-for="doc in documentList"
        :key="doc.urlStr"
        :item="doc"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, toRefs } from "vue";
import { DocumentContent } from "@/modules/document-content";
import { getAllContents } from "@/composables/get-contents";
import ContentsListItemVue from "@/components/ContentsListItem.vue";

interface State {
  documentList: DocumentContent[];
  allDocumentNum: number;
}

export default defineComponent({
  components: { ContentsListItemVue },
  setup() {
    const { documentList, allDocumentNum } = toRefs(
      reactive<State>({
        documentList: [],
        allDocumentNum: 0,
      })
    );
    onMounted(() => {
      getAllContents(documentList).then((docNum) => {
        allDocumentNum.value = docNum;
      });
    });

    return { documentList, allDocumentNum };
  },
});
</script>

<style lang="scss" scoped></style>