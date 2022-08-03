<template>
  <header id="website-header">
    <div id="website-header__title-block">
      <h1 id="website-header__title">
        <router-link to="/">あいわか文庫</router-link>
      </h1>
    </div>
    <nav>
      <div class="nav-link-wrapper">
        <page-link-vue :link-to="'/'">TOP</page-link-vue>
        <template v-if="loggedIn">
          <page-link-vue :link-to="'/contents'">CONTENTS</page-link-vue>
          <page-link-vue :link-to="'/my-page'">MYPAGE</page-link-vue>
        </template>
        <template v-else>
          <page-link-vue :link-to="'/login'">LOGIN</page-link-vue>
          <page-link-vue :link-to="'/register'">REGISTER</page-link-vue>
        </template>
      </div>
    </nav>
  </header>
</template>

<script lang="ts">
import { auth } from "@/settings/firebase";
import { onAuthStateChanged } from "@firebase/auth";
import { defineComponent, reactive, toRefs } from "vue";
import PageLinkVue from "./PageLink.vue";

interface State {
  loggedIn: boolean;
}

export default defineComponent({
  components: { PageLinkVue },

  setup() {
    const { loggedIn } = toRefs(reactive<State>({ loggedIn: false }));

    onAuthStateChanged(auth, (user) => {
      loggedIn.value = !!user;
    });

    return { loggedIn };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/mixins.scss";

#website-header {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  height: $header-height;
  left: 0;
  right: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.3);

  @include mediaquery(small-size) {
    flex-direction: column;
    position: fixed;
    height: $header-height + 3rem;
    border-bottom: 2px solid #888;
    z-index: 500;
  }

  $title-height: $header-height - 3rem;

  &__title-block {
    display: flex;
    margin: 0.2rem 2rem;
  }
  &__logo {
    object-fit: scale-down;
    height: $title-height;
    width: 5rem;
    margin: 1.5rem 2.1rem;
    @include mediaquery(small-size) {
      height: $title-height;
    }
  }
  &__title {
    font-family: "Noto Serif JP", serif;
    font-size: $title-height;
    line-height: $header-height;
  }
}

nav {
  @include mediaquery(small-size) {
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
  .nav-link-wrapper {
    display: flex;
    justify-content: space-between;
    margin: 0 1.4rem;
    width: fit-content;

    @include mediaquery(small-size) {
      position: absolute;
      top: $header-height;
      height: 3rem;
    }
  }
}
</style>
