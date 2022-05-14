<template>
  <div class="register-page">
    <div class="register-form">
      <label>ハンドルネーム</label>：
      <input placeholder="name" v-model="state.newUserName" />
      <label>所属</label>：
      <input placeholder="belongs" v-model="state.newUserBelongs" />
      <label>メールアドレス</label>：
      <input placeholder="email" v-model="state.newUserEmail" />
      <label>パスワード</label>：
      <input
        placeholder="password"
        type="password"
        v-model="state.newUserPassword"
      />
      <button @click="registerUser">Register</button>
    </div>
    <div v-if="state.errorMessage" class="error-msg">
      {{ state.errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { validators } from "@/modules/validations";
import { auth } from "@/settings/firebase";
import getUserName from "@/composables/get-username";
import { addUserRecord } from "@/composables/add-user-record";

interface FormSchema {
  [key: string]: string;
  name: string;
  belongs: string;
  email: string;
  password: string;
}

interface State {
  newUserName: string;
  newUserBelongs: string;
  newUserEmail: string;
  newUserPassword: string;
  errorMessage: string;
  loggedIn: boolean;
}

const validateForm = (values: FormSchema): boolean => {
  // フォーム項目と適用するバリデーションを並べる.
  let validationSchema = [
    { prop: "name", type: "required" },
    { prop: "belongs", type: "required" },
    { prop: "email", type: "required" },
    { prop: "email", type: "email" },
    { prop: "password", type: "required" },
  ];

  let result = true;
  for (const schema of validationSchema) {
    // 一つでもfalseになればresultはfalseになる
    result &&= validators[schema.type](values[schema.prop]);
  }
  return result;
};

export default defineComponent({
  setup() {
    const state = reactive<State>({
      newUserName: "",
      newUserBelongs: "",
      newUserEmail: "",
      newUserPassword: "",
      errorMessage: "",
      loggedIn: false,
    });
    const router = useRouter();
    const route = useRoute();

    onMounted(async () => {
      const userName = await getUserName();
      state.loggedIn = !!userName;
    });

    const registerUser = () => {
      const formValues: FormSchema = {
        name: state.newUserName,
        belongs: state.newUserBelongs,
        email: state.newUserEmail,
        password: state.newUserPassword,
      };
      if (!validateForm(formValues)) {
        // 引っかかったら終了させる
        state.errorMessage = "間違いがあります。";
        return;
      } else {
        state.errorMessage = "";
      }

      const confirmPass = window.prompt("認証パスを入力してください。");
      if (confirmPass !== process.env.VUE_APP_REGISTER_PASS) {
        state.errorMessage = "認証パスが誤っています。";
        return;
      }
      createUserWithEmailAndPassword(
        auth,
        state.newUserEmail,
        state.newUserPassword
      )
        .then((cred) => {
          // アカウント登録情報を使ってデータベースに情報を登録
          const uid = cred.user.uid;
          addUserRecord(uid, state.newUserName, state.newUserBelongs);

          // リダイレクトを行う
          if (route.query.redirect) {
            const redirect = route.query.redirect;
            if (typeof redirect === "string") {
              router.push(redirect);
            } else {
              router.push("/");
            }
          } else {
            router.push("/");
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === "auth/weak-password") {
            state.errorMessage = `パスワードが不適切です。\n${errorMessage}`;
          } else {
            state.errorMessage = `登録処理中に何らかの問題が発生しました。\n${errorCode}:${errorMessage}`;
          }
        });
    };

    return { state, registerUser };
  },
});
</script>

<style lang="scss" scoped>
.login-name-display {
  width: 80%;
  margin: 16px auto;
}

.error-msg {
  color: red;
  border: 1px solid red;
}
</style>