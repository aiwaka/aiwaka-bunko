<template>
  <div class="request-budge" :class="cssClassFromStatus">
    <div v-if="showDocTitle" class="doc-title">
      {{ request.targetName }}
    </div>
    <div class="status-message">
      <span>{{ request.getTypeStr() }}</span>
      <span v-if="request.requestType !== 2">：{{ statusMessage }}</span>
    </div>
    <div class="request-message">
      {{ request.message }}
    </div>
    <div class="button-container">
      <template v-if="request.status === 0">
        <button @click="modifyRequest" v-if="request.requestType !== 2">
          修正する
        </button>
      </template>
      <template v-if="request.status !== 1">
        <button @click="deleteRequest">取り消す</button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { DocumentRequest } from "@/modules/document-requests";

export default defineComponent({
  props: {
    request: {
      type: Object as PropType<DocumentRequest>,
      required: true,
    },
    showDocTitle: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["delete-request", "modify-request"],

  setup(props, context) {
    const statusMessage = computed((): string => {
      if (props.request.status === 0) {
        return "以下の内容でリクエストを送りました。";
      } else if (props.request.status === 1) {
        return "リクエストが処理されました。";
      } else if (props.request.status === 2) {
        return "リクエストが拒否されました。";
      } else {
        return (
          "例外状態になっています。管理者に問い合わせてください。" +
          `コード：${props.request.status}`
        );
      }
    });

    const modifyRequest = () => {
      context.emit("modify-request", props.request.id);
    };
    const deleteRequest = () => {
      context.emit("delete-request", props.request.id);
    };

    const cssClassFromStatus = computed(() => {
      if (props.request.status === 1) {
        return "accepted";
      } else if (props.request.status === 2) {
        return "rejected";
      } else {
        return "on-hold";
      }
    });

    return { cssClassFromStatus, deleteRequest, modifyRequest, statusMessage };
  },
});
</script>

<style lang="scss" scoped>
.request-budge {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  padding: 0.8rem 1.6rem;
  margin: 0.7rem 1rem;
  width: 30rem;
  &.on-hold {
    background-color: rgba($color: rgb(35, 98, 245), $alpha: 0.2);
  }
  &.accepted {
    background-color: rgba($color: rgb(76, 248, 49), $alpha: 0.2);
  }
  &.rejected {
    background-color: rgba($color: rgb(249, 34, 34), $alpha: 0.2);
  }

  .doc-title {
    font-weight: 800;
    font-size: larger;
  }

  .status-message {
    margin: 0.2rem auto;
  }

  .request-message {
    margin: 0.3 auto;
  }

  .button-container {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;

    button {
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
  }
}
</style>
