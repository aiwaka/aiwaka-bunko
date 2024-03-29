<template>
  <div class="user-mypage">
    <h1>{{ loginUserName }}</h1>
    <h2>お気に入り文書一覧</h2>
    <div class="favorite-doc-container">
      <contents-list-item-vue
        v-for="doc in favDocList"
        :key="doc.urlStr"
        :item="doc"
        :favorite="true"
        :last-week-date="lastWeekDate"
      />
    </div>
    <!-- TODO: 自分のページにはソート機能がほしいかも -->
    <h2>リクエスト一覧</h2>
    <div class="request-container">
      <request-budge-vue
        v-for="req in requestList"
        :key="req.id"
        :request="req"
        :show-doc-title="true"
        @modify-request="modifyRequest"
        @delete-request="deleteRequest"
      />
    </div>

    <h2>ログアウト</h2>
    <button-ui-vue :click-callback="logout">ログアウト</button-ui-vue>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { auth } from "@/settings/firebase";
import { getUserName } from "@/composables/user-record-operations";
import { DocumentRequest } from "@/modules/document-requests";
import {
  deleteRequestInterface,
  setAllRequestByUser,
  modifyRequestInterface,
} from "@/composables/request-record-operations";
import { DocumentContent } from "@/modules/document-content";
import RequestBudgeVue from "@/components/RequestBudge.vue";
import ContentsListItemVue from "@/components/ContentsListItem.vue";
import { setAllFavDocByUser } from "@/composables/favorite-document-operations";
import ButtonUiVue from "@/components/ButtonUi.vue";
import { setPreviousDate } from "@/composables/set-previous-date";

interface State {
  errorMessage: string;
  favDocList: DocumentContent[];
  lastWeekDate: Date;
  loginUserName: string;
  requestList: DocumentRequest[];
}

export default defineComponent({
  components: { RequestBudgeVue, ContentsListItemVue, ButtonUiVue },
  setup() {
    const {
      errorMessage,
      favDocList,
      lastWeekDate,
      loginUserName,
      requestList,
    } = toRefs(
      reactive<State>({
        errorMessage: "",
        favDocList: [],
        lastWeekDate: new Date(),
        loginUserName: "",
        requestList: [],
      })
    );
    const router = useRouter();

    onMounted(async () => {
      setPreviousDate(lastWeekDate.value);
      const userName = await getUserName();
      if (userName) {
        loginUserName.value = userName;
        // お気に入り情報を取得
        await setAllFavDocByUser(favDocList);
        // リクエスト情報を取得
        await setAllRequestByUser(requestList);
      }
    });

    const logout = () => {
      if (confirm("ログアウトしますか？")) {
        signOut(auth)
          .then(() => {
            router.push("/");
          })
          .catch((error) => {
            errorMessage.value = error.message;
          });
      }
    };
    const deleteRequest = async (id: string) => {
      deleteRequestInterface(id, requestList);
    };
    const modifyRequest = async (id: string) => {
      modifyRequestInterface(id, requestList);
    };

    return {
      deleteRequest,
      favDocList,
      modifyRequest,
      lastWeekDate,
      loginUserName,
      logout,
      requestList,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/mixins.scss";
$question-height: 2.8rem;

.login-name-display {
  width: 80%;
  margin: 16px auto;
}

.favorite-doc-container {
  display: grid;
  grid-template-columns: repeat(3, 3fr);
  margin: 2rem 3%;
  @include mediaquery(small-size) {
    grid-template-columns: repeat(2, 2fr);
  }
}

.error-exist {
  border: 2px solid red;
}
.error-msg {
  color: red;
}
.request-container {
  display: grid;
  grid-template-columns: repeat(3, 3fr);
  @include mediaquery(small-size) {
    grid-template-columns: 1fr;
  }
}
</style>
