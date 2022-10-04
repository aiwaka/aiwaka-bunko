<template>
  <div class="contents-home">
    <h1>コンテンツ一覧</h1>
    <!-- <p>全部で{{ allDocumentNum }}件の文書があります。</p> -->
    <div class="documents-list-container">
      <contents-list-item-vue
        v-for="doc in documentList"
        :key="doc.urlStr"
        :last-week-date="lastWeekDate"
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
import { setPreviousDate } from "@/composables/set-previous-date";

interface State {
  allDocumentNum: number;
  documentList: DocumentContent[];
  favDocIdList: string[];
  lastWeekDate: Date;
}

export default defineComponent({
  components: { ContentsListItemVue },
  setup() {
    const { allDocumentNum, documentList, favDocIdList, lastWeekDate } = toRefs(
      reactive<State>({
        allDocumentNum: 0,
        documentList: [],
        favDocIdList: [],
        lastWeekDate: new Date(),
      })
    );
    onMounted(async () => {
      // 一週間前（この関数を定義しているファイルにおける定数で期間を決定している）の
      // 日付を各書類データに渡して更新が新しいかどうか判定
      setPreviousDate(lastWeekDate.value);
      getAllContents(documentList).then((docNum) => {
        allDocumentNum.value = docNum;
      });
      await setAllFavDocIdListByUser(favDocIdList);
    });

    return { allDocumentNum, documentList, favDocIdList, lastWeekDate };
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
