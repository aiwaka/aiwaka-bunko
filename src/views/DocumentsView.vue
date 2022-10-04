<template>
  <div class="documents-view">
    <template v-if="documentItem !== null">
      <h1>{{ documentItem.title }}</h1>
      <p class="update-timestamp">
        last update : {{ documentItem.postDateAsString() }}
        <new-item-icon-vue v-if="documentItem.update.toDate() > lastWeekDate" />
      </p>
      <h2>概要</h2>
      <p>{{ documentItem.description }}</p>
      <template v-if="documentItem.notes.length !== 0">
        <h2>注意</h2>
        <ul>
          <li v-for="note in documentItem.notes" :key="note">
            {{ note }}
          </li>
        </ul>
      </template>
      <h2>ダウンロード</h2>
      <div class="button-container">
        <button-ui-vue
          class="download-button"
          :click-callback="downloadOpenTab"
        >
          新しいタブで開く
        </button-ui-vue>
        <button-ui-vue class="download-button" :click-callback="downloadDirect">
          ファイルをダウンロード
        </button-ui-vue>
      </div>

      <h2>お気に入り登録</h2>
      <div class="favorite-container">
        <designed-pin-vue
          @click="toggleFavorite"
          class="favorite-pin"
          :active="favoriteDoc"
        />
        <div class="favorite-status-text">
          <span v-if="favoriteDoc">登録済み</span>
        </div>
      </div>

      <h2>リクエスト</h2>
      <p>
        文書の修正等を行いたい場合は、ここでリクエストを行ってください。
        継続的に参加したい、または自分で修正を行いたい場合はGitHubリポジトリへの参加申請を行ってください。
      </p>
      <h3>追加</h3>
      <p>
        リクエスト内容を記入して追加してください。
        メッセージは、GitHub参加依頼の場合は必要ありません。
      </p>
      <div class="add-request-form">
        <fieldset class="add-request-form-field">
          <label for="request-type"> タイプ </label>
          <select id="request-type" name="type" v-model="newRequestType">
            <option
              v-for="(type, index) in requestTypeStr"
              :key="type"
              :value="index"
            >
              {{ type }}
            </option>
          </select>
          <label for="request-message"> メッセージ </label>
          <input
            id="request-message"
            type="text"
            name="message"
            placeholder="message"
            v-model="newRequestMessage"
          />
          <button-ui-vue
            class="add-button"
            :click-callback="addRequest"
            :disabled="addButtonDisabled"
          >
            追加
          </button-ui-vue>
        </fieldset>
      </div>
      <h3>これまでのリクエスト一覧</h3>
      <div class="request-container">
        <request-budge-vue
          v-for="req in requestList"
          :key="req.id"
          :request="req"
          @modify-request="modifyRequest"
          @delete-request="deleteRequest"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, toRefs } from "vue";
import { DocumentContent } from "@/modules/document-content";
import { getOneContent } from "@/composables/get-contents";
import {
  downloadDocument,
  openFileAsNewTab,
} from "@/composables/download-file";
import { DocumentRequest, requestTypeStr } from "@/modules/document-requests";
import {
  createRequestToFirestore,
  deleteRequestInterface,
  setRequestByUserAndTarget,
  modifyRequestInterface,
} from "@/composables/request-record-operations";
import {
  createFavoriteToFirestore,
  deleteFavoriteFromFirestore,
  getIfDocInFavorite,
} from "@/composables/favorite-document-operations";
import RequestBudgeVue from "@/components/RequestBudge.vue";
import DesignedPinVue from "@/components/DesignedPin.vue";
import ButtonUiVue from "@/components/ButtonUi.vue";
import NewItemIconVue from "@/components/NewItemIcon.vue";
import { setPreviousDate } from "@/composables/set-previous-date";

interface State {
  documentItem: DocumentContent | null;
  favoriteDoc: boolean;
  lastWeekDate: Date;
  newRequestMessage: string;
  newRequestType: number;
  requestList: DocumentRequest[];
}

export default defineComponent({
  components: { RequestBudgeVue, DesignedPinVue, ButtonUiVue, NewItemIconVue },

  props: {
    urlStr: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const {
      documentItem,
      favoriteDoc,
      lastWeekDate,
      newRequestMessage,
      newRequestType,
      requestList,
    } = toRefs(
      reactive<State>({
        documentItem: null,
        favoriteDoc: false,
        lastWeekDate: new Date(),
        newRequestMessage: "",
        newRequestType: 0,
        requestList: [],
      })
    );
    onMounted(async () => {
      setPreviousDate(lastWeekDate.value);
      // 文書情報を取得
      const item = await getOneContent(props.urlStr);
      documentItem.value = item;

      // リクエスト情報を取得
      await setRequestByUserAndTarget(requestList, props.urlStr);

      // お気に入りかどうか取得
      const favFlag = await getIfDocInFavorite(props.urlStr);
      if (favFlag === undefined) {
        console.log("error: favorite flag is undefined.");
      } else {
        favoriteDoc.value = favFlag;
      }
    });

    // ダウンロードする関数を包んで引数なしの関数を作りコールバックとして渡す.
    const downloadOpenTab = () => {
      openFileAsNewTab(props.urlStr);
    };
    const downloadDirect = () => {
      downloadDocument(props.urlStr);
    };

    const addButtonDisabled = computed(() => {
      return newRequestType.value !== 2 && newRequestMessage.value === "";
    });

    const addRequest = async () => {
      if (newRequestType.value !== 2 && newRequestMessage.value === "") {
        alert("修正依頼または意見を送る場合はメッセージが必須です。");
      }
      if (documentItem.value) {
        const addedRequest = await createRequestToFirestore(
          newRequestType.value,
          props.urlStr,
          documentItem.value?.title,
          newRequestMessage.value
        );
        if (addedRequest) {
          requestList.value.push(addedRequest);
          newRequestType.value = 0;
          newRequestMessage.value = "";
        }
      }
    };

    const modifyRequest = async (id: string) => {
      await modifyRequestInterface(id, requestList);
    };
    const deleteRequest = async (id: string) => {
      await deleteRequestInterface(id, requestList);
    };

    // 一つでもあればfavに入っているので, 作るときはひとつ作り, 消すときはすべて消すようにする.
    const addToFavorite = () => {
      if (documentItem.value !== null) {
        createFavoriteToFirestore(props.urlStr, documentItem.value.title);
        favoriteDoc.value = true;
      }
    };
    const removeFromFavorite = () => {
      deleteFavoriteFromFirestore(props.urlStr);
      favoriteDoc.value = false;
    };
    const toggleFavorite = () => {
      if (favoriteDoc.value) {
        removeFromFavorite();
      } else {
        addToFavorite();
      }
    };

    return {
      addButtonDisabled,
      addRequest,
      deleteRequest,
      documentItem,
      downloadDirect,
      downloadOpenTab,
      favoriteDoc,
      lastWeekDate,
      modifyRequest,
      newRequestMessage,
      newRequestType,
      requestList,
      requestTypeStr,
      toggleFavorite,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/mixins.scss";

h1 {
  font-size: 3.2rem;
}

.button-container {
  display: flex;
  margin: 1.2rem 1rem;
  .download-button {
    margin: auto 1rem;
  }
}

.favorite-container {
  display: flex;
  padding: 0.5rem auto;
  .favorite-status-text {
    margin-left: 0.8rem;
    span {
      color: rgba(orange, 0.8);
    }
  }
}

// TODO: このあたりの登録フォーム等を使いまわしているデザイン定義を他に移す
// そもそも重複しているロジックをmixin等に移す？
fieldset.add-request-form-field {
  $item-height: 2.8rem;

  display: grid;
  grid-template-rows: repeat(2, $item-height) 1fr;
  grid-template-columns: 8rem 1fr;
  row-gap: 2rem;
  column-gap: 0.7rem;
  width: 97%;
  margin: 2rem auto;
  padding: 1.6rem 2rem;

  @include mediaquery(small-size) {
    grid-template-rows: repeat(5, $item-height);
    grid-template-columns: 1fr;
    row-gap: 1.2rem;
  }

  label {
    @include mediaquery(normal-size) {
      grid-column-start: 1;
    }
    line-height: $item-height;
    margin-right: 0.7rem;
  }

  input {
    color: inherit;
    background-color: transparent;
    border: 1px solid #777777;
    transition: ease-in-out 0.2s;

    &:focus {
      outline-width: 0;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(1.5rem);
    }
  }

  select {
    color: inherit;
    background-color: transparent;
    border: 1px solid #777777;
    transition: ease-in-out 0.2s;

    &:focus {
      outline-width: 0;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(1.5rem);
    }
  }

  .add-button {
    grid-column-start: 2;
    @include mediaquery(small-size) {
      grid-column-start: 1;
    }
    justify-self: right;
  }
}

.request-container {
  display: grid;
  grid-template-columns: repeat(3, 3fr);
  @include mediaquery(small-size) {
    grid-template-columns: 1fr;
  }
}
</style>
