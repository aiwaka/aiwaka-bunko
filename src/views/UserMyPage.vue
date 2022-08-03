<template>
  <div class="user-mypage">
    <h1>{{ loginUserName }}</h1>
    <!-- TODO: 自分のページにはソート機能がほしいかも -->
    <h2>リクエスト一覧</h2>
    <div class="request-container">
      <request-budge-vue
        v-for="req in requestList"
        :key="req.id"
        :request="req"
        @modify-request="modifyRequest"
        @delete-request="deleteRequest"
      />
    </div>

    <h2>ログアウト</h2>
    <button @click="logout">Logout</button>
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
  getAllRequestByUser,
  modifyRequestInterface,
} from "@/composables/request-record-operations";
import RequestBudgeVue from "@/components/RequestBudge.vue";

interface State {
  errorMessage: string;
  loginUserName: string;
  requestList: DocumentRequest[];
}

export default defineComponent({
  components: { RequestBudgeVue },
  setup() {
    const { errorMessage, loginUserName, requestList } = toRefs(
      reactive<State>({
        errorMessage: "",
        loginUserName: "",
        requestList: [],
      })
    );
    const router = useRouter();

    onMounted(async () => {
      const userName = await getUserName();
      if (userName) {
        loginUserName.value = userName;
        // リクエスト情報を取得
        await getAllRequestByUser(requestList);
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

    return { deleteRequest, modifyRequest, loginUserName, logout, requestList };
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
