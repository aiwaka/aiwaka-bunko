<template>
  <div class="documents-view">
    <template v-if="documentItem !== null">
      <h1>{{ documentItem.title }}</h1>
      <p class="update-timestamp">
        last update : {{ documentItem.postDateAsString() }}
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
        <button
          class="download-button"
          @click="openFileAsNewTab($props.urlStr)"
        >
          新しいタブで開く
        </button>
        <button
          class="download-button"
          @click="downloadDocument($props.urlStr)"
        >
          ダウンロード
        </button>
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
          <button
            class="add-button"
            @click.prevent="addRequest"
            :disabled="addButtonDisabled"
          >
            追加
          </button>
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
import RequestBudgeVue from "@/components/RequestBudge.vue";

interface State {
  documentItem: DocumentContent | null;
  newRequestMessage: string;
  newRequestType: number;
  requestList: DocumentRequest[];
}

export default defineComponent({
  components: { RequestBudgeVue },

  props: {
    urlStr: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { documentItem, newRequestMessage, newRequestType, requestList } =
      toRefs(
        reactive<State>({
          documentItem: null,
          newRequestMessage: "",
          newRequestType: 0,
          requestList: [],
        })
      );
    onMounted(async () => {
      // 文書情報を取得
      const item = await getOneContent(props.urlStr);
      documentItem.value = item;

      // リクエスト情報を取得
      await setRequestByUserAndTarget(requestList, props.urlStr);
    });

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
      modifyRequestInterface(id, requestList);
    };
    const deleteRequest = async (id: string) => {
      deleteRequestInterface(id, requestList);
    };

    return {
      addButtonDisabled,
      addRequest,
      deleteRequest,
      documentItem,
      downloadDocument,
      modifyRequest,
      newRequestMessage,
      newRequestType,
      openFileAsNewTab,
      requestList,
      requestTypeStr,
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
  margin: 1.2rem 1rem;
}
.download-button {
  padding: 0.5rem 0.8rem;
  border: 2px solid rgb(100, 200, 255);
  border-radius: 8px;
  transition: 0.25s ease-out;
  &:hover {
    color: #333333;
    background-color: rgb(100, 200, 255);
    border: 2px solid rgb(172, 255, 244);
  }
}

// todo: このあたりの登録フォーム等を使いまわしているデザイン定義を他に移す
// todo: そもそも重複しているロジックをmixin等に移す？
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

  button {
    grid-column-start: 2;
    @include mediaquery(small-size) {
      grid-column-start: 1;
    }
    width: fit-content;
    height: 3rem;
    justify-self: right;

    padding: 0.2rem 0.7rem;
    border: 2px solid #999;
    border-radius: 5px;
    background-color: transparent;
    cursor: pointer;
    &:hover,
    &:focus {
      outline: none;
      background-color: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(1.5rem);
    }
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
