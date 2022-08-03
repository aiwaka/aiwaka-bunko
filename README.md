# aiwaka-bunko

<a href="https://github.com/littleIkawa">@litteleIkawa</a>が作成した講義板書などの文書制作物をまとめたウェブページです。

ログインすることで文書の閲覧が可能で, 他にも文書別に修正リクエスト等を行うことができます。
アカウント作成には私からアクセスコードを聞いて入力する必要があります。

<a href="https://aiwaka-bunko.web.app">https://aiwaka-bunko.web.app</a>にデプロイしています。

## 仕様

- メールアドレスを利用して登録・ログイン（Firebase Authentication）.
- 登録にはさらにアクセスコードが必要.
- リモートストレージに置いてある PDF をダウンロードできる.
- 携帯端末でも見やすい.
- ストレージにおけるファイル名と URL を一致させるという制限で動的ルーティングを用いることでコード量の削減と保守性の向上がなされている.
- ダウンロードの動作を二種類用意することで様々な環境で閲覧できるようにしている.
- リクエスト機能により筆者に意見を送ることができる.
- リクエストの修正・削除等も簡単にできる.
- リクエストが受理されたかどうかもひと目で分かるようになっている.
- ユーザーページを追加し, 自分のリクエスト一覧を閲覧・編集できるようになった.

## ギャラリー

<p>
<img width="25%" alt="コンテンツ一覧（モバイル）" src="https://user-images.githubusercontent.com/38373453/172040212-f51934ba-b375-4a81-8674-22ecd9cd2cb1.jpg">
<img width="65%" alt="コンテンツ一覧（PC）" src="https://user-images.githubusercontent.com/38373453/172039948-60c5db65-f0b2-4092-9b8d-dd1fc45cff29.png">
<img width="95%" alt="コンテンツ" src="https://user-images.githubusercontent.com/38373453/172040144-a214a96f-9766-4bbe-a7cc-32dc6fd7f0e1.png">
<img width="95%" alt="修正リクエスト" src="https://user-images.githubusercontent.com/38373453/172040169-cc949ded-e3dc-4fb9-85a0-ad8320be6a01.png">
</p>

## 技術的概要

<table>
  <tr>
    <th>開発人数</th>
    <td>
      1人<br>
    </td>
  </tr>
  <tr>
    <th>開発期間</th>
    <td>約3日</td>
  </tr>
  <tr>
    <th>使用技術</th>
    <td>
        <ul>
        <li>Vue.js v3 (Composition API)</li>
        <li>Typescript</li>
        <li>SCSS</li>
        <li>Google Firebase (Authentication, Storage, Firestore, Hosting)</li>
        </ul>
    </td>
  </tr>
  <tr>
    <th>雑記</th>
    <td>
    <ul>
    <li>Firebase Authentication のオブザーバーを設定したことでログインを検知して動的にヘッダーの内容を変更できるようになった.</li>
    <li>Firestore のコンバーターを挟んだことで保守性が大幅に上がった（実際バグも発見した）.</li>
    </ul>
  </tr>
</table>

## テストサーバー起動方法

```
npm install
```

でセットアップ可能.

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

## メモ

- gsutil を pip で入れ, CORS 設定を行った.
