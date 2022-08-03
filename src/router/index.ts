import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { getCurrentUser } from "@/settings/firebase";
import { setTitle, setDescription } from "@/composables/set-title-description";
import Home from "../views/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Home", desc: "板書書庫" },
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutPage.vue"),
    meta: { title: "About", desc: "説明ページ" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginPage.vue"),
    meta: { title: "Login", desc: "ログインページ" },
    beforeEnter: async (_to, _from, next) => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        next({
          path: "/my-page",
        });
      } else {
        next();
      }
    },
  },
  {
    // pathを/:userId等にして他の人の情報の一部も見られるようにすると面白いかもしれない
    path: "/my-page",
    name: "MyPage",
    component: () => import("../views/UserMyPage.vue"),
    meta: { title: "MyPage", desc: "ユーザー個人ページ", requiresAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterPage.vue"),
    meta: { title: "Register", desc: "登録ページ" },
    beforeEnter: async (_to, _from, next) => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        next({
          path: "/my-page",
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/contents",
    name: "Contents Home",
    component: () => import("../views/ContentsHomePage.vue"),
    meta: {
      requiresAuth: true,
      title: "Contents",
      desc: "コンテンツ一覧ページ",
    },
  },
  // 動的なコンテンツURL
  {
    path: "/contents/:urlStr",
    component: () => import("../views/DocumentsView.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const currentUser = await getCurrentUser();
  setTitle(to.meta.title as string);
  setDescription(to.meta.desc as string);
  if (requiresAuth && !currentUser) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
