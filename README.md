# Comiacapay

同人誌即売会用のレジアプリです．[Kiradopay](https://github.com/takemar/kiradopay) および [Kiradopay2](https://github.com/cm-ayf/kiradopay2) を原型としています．

以下の説明は開発者向けです．[利用者向けの説明はこちら](docs/index.md)．

## 技術スタック

- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)：フロントエンドおよびバックエンド
- [React](https://reactjs.org/)：フロントエンド
- [MUI](https://mui.com/)：UI フレームワーク
- [Prisma](https://www.prisma.io/)：ORM

## 開発

- 準備
  - Node.js をインストールしてください．
  - `npm install`を実行してください．
  - [環境変数の項](#環境変数)を参照して`.env`を作成してください．
- 実行：`npm run dev`を実行してください．

## デプロイ

### ホスティング

ホスティングには[Vercel](https://vercel.com/)を利用することを想定しています．  
デプロイ方法については[公式ドキュメント](https://vercel.com/docs/concepts/deployments/overview)を参照してください．

また，React Router が動作する他のプラットフォームでも動作すると考えられます．

### データベース

データベースには[Supabase](https://supabase.com/)を利用することを想定しています．なお，データベース以外の機能は利用しません．  
デプロイするには，プロジェクトを作成し，[Prismaで利用するための公式のガイド](https://supabase.com/partners/integrations/prisma)を参照してください．

また，[VercelとのIntegration](https://vercel.com/integrations/supabase)が公式に提供されています．

なお，[Prisma スキーマ](prisma/schema.prisma)を変更することで，他のデータベースでも動作すると考えられます．スキーマは Supabase 向けに調整されていることに注意してください．

#### マイグレーション

マイグレーションは自動化されていません．適宜`npm run migrate:deploy`を実行してください．詳しくは[公式ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-migrate)を参照してください．

### 認証

認証には[Discord](https://discord.com/)を利用します．  
通常の Discord ボットとは異なり，Client ID と Client Secret を利用して OAuth2 認証を行います．  
[Discord Developer Portal](https://discord.com/developers/applications)でアプリケーションを用意してください．

## 環境変数

Vercel 上で設定し，[Vercel CLI](https://vercel.com/docs/cli)でダウンロードすることを想定しています．

データベースの接続情報は，Production向けにはVercelとSupabaseとのIntegrationにより自動的に設定されます．Development向けには，Vercel上で設定するか，ダウンロードした後に手動で設定してください．

### 設定する

- `DISCORD_OAUTH2_ORIGIN`：OAuth2 認証に利用するホスト名です．スキーマとホスト名を含んでください．
  - Vercel 上では，Production および Preview 環境では Vercel のホスト名を，Development 環境では`http://localhost:3000`を指定してください．
- `DISCORD_OAUTH2_TRAMPOLINE_KEY`：プレビュー環境で OAuth2 を動作させるために必要なシークレットです．`./scripts/generateTrampolineKey.mjs` で生成してください．
- `DISCORD_CLIENT_ID`：Discord の OAuth2 認証に利用します．
- `DISCORD_CLIENT_SECRET`：Discord の OAuth2 認証に利用します．

### ダウンロードする

- `vercel login`が完了していることを確認してください．
- `vercel link`を実行してください．
- `vercel env pull .env`を実行してください．

## ライセンス

[MIT License](LICENSE)
