<template>
  <div class="contents-home">
    <h1>コンテンツ一覧</h1>
    <!-- <p>全部で{{ allDocumentNum }}件の文書があります。</p> -->
    <div class="documents-list-container">
      <contents-list-item-vue
        v-for="doc in documentList"
        :key="doc.urlStr"
        :item="doc"
        :favorite="favDocIdList.includes(doc.urlStr)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { DocumentContent } from "@/modules/document-content";
import { getAllContents } from "@/composables/get-contents";
import ContentsListItemVue from "@/components/ContentsListItem.vue";
import { setAllFavDocIdListByUser } from "@/composables/favorite-document-operations";

interface State {
  allDocumentNum: number;
  documentList: DocumentContent[];
  favDocIdList: string[];
}

export default defineComponent({
  components: { ContentsListItemVue },
  setup() {
    const { allDocumentNum, documentList, favDocIdList } = toRefs(
      reactive<State>({
        allDocumentNum: 0,
        documentList: [],
        favDocIdList: [],
      })
    );
    onMounted(async () => {
      getAllContents(documentList).then((docNum) => {
        allDocumentNum.value = docNum;
      });
      await setAllFavDocIdListByUser(favDocIdList);
    });

    return { allDocumentNum, documentList, favDocIdList };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/mixins.scss";
.documents-list-container {
  display: grid;
  grid-template-columns: repeat(3, 3fr);
  margin: 2rem 3%;
  @include mediaquery(small-size) {
    grid-template-columns: repeat(2, 2fr);
  }
}
</style>
