<template>
  <div class="login-page">
    <div class="login-form">
      <h1>ログイン</h1>
      <fieldset :class="{ 'error-exist': state.errorMessage }">
        <label for="form-name">email</label>
        <input
          id="form-name"
          type="email"
          placeholder="email"
          v-model="state.userEmail"
        />
        <label for="form-password">password</label>
        <input
          id="form-password"
          type="password"
          placeholder="password"
          v-model="state.password"
        />
        <button @click="login">Login</button>
      </fieldset>
    </div>
    <div>
      登録していない方はこちらから登録してください→
      <router-link to="/register">登録ページ</router-link>
    </div>

    <div v-if="state.errorMessage" class="error-exist error-msg">
      {{ state.errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/settings/firebase";

interface State {
  errorMessage: string;
  loggedIn: boolean;
  loginUserName: string;
  password: string;
  userEmail: string;
}

export default defineComponent({
  setup() {
    const state = reactive<State>({
      errorMessage: "",
      loggedIn: false,
      loginUserName: "",
      password: "",
      userEmail: "",
    });
    const router = useRouter();
    const route = useRoute();

    const login = () => {
      signInWithEmailAndPassword(auth, state.userEmail, state.password)
        .then(() => {
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

          if (errorCode === "auth/invalid-email") {
            state.errorMessage = "メールアドレスが誤っています。";
          } else if (errorCode === "auth/wrong-password") {
            state.errorMessage = "パスワードが誤っています。";
          } else {
            state.errorMessage = `ログイン処理中に何らかの問題が発生しました。\n${errorCode}:${errorMessage}`;
          }
        });
    };

    return { state, login };
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
fieldset {
  display: grid;
  grid-template-rows: repeat(2, $question-height) 1fr;
  grid-template-columns: 22rem 1fr;
  row-gap: 2.4rem;
  column-gap: 0.7rem;
  width: 97%;
  margin: 2rem auto;
  padding: 1.6rem 2rem;

  @include mediaquery(small-size) {
    grid-template-rows: repeat(5, $question-height);
    grid-template-columns: 1fr;
    row-gap: 1.2rem;
  }

  label {
    @include mediaquery(normal-size) {
      grid-column-start: 1;
    }
    line-height: $question-height;
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

  label {
    margin-right: 0.7rem;
    line-height: $question-height;
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
</style>
