# Comiacapay

同人誌即売会用のレジアプリです．[Kiradopay](https://github.com/takemar/kiradopay) および [Kiradopay2](https://github.com/cm-ayf/kiradopay2) を原型としています．

以下の説明は開発者向けです．[利用者向けの説明はこちら](docs/index.md)．

## コントリビュートする前に

現在，このリポジトリには [`@TypeChangeBot[bot]`](https://github.com/apps/typechangebot) という GitHub App が導入されています．この GitHub App はコミッターによる変更を観察し，その変更を何故行ったかを尋ねて記録します．  
もし現時点以降の記録を望まないのであれば `@TypeChangeBot[bot] OPTOUT` と，もし今までの全ての記録を削除したいのであれば `@TypeChangeBot[bot] REMOVE` を，それぞれコメントしてください．

詳しくは，[開発者による説明](https://cse-rdyer-05.unl.edu/tcbot/)を参照してください．

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
  - 「[環境変数](#環境変数)」を参照して`.env`を作成してください．
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

なお，[Prisma スキーマ](prisma/schema.prisma)などを変更することで，他のデータベースでも動作すると考えられます．スキーマは Supabase 向けに調整されていることに注意してください．

以下の環境変数を設定してください：

- `POSTGRES_PRISMA_URL`・`POSTGRES_URL_NON_POOLING`：データベースに接続する URL です．
  - Production 環境では Supabase の Integration が自動で設定します．
  - Development 環境ではどちらも `postgres://$(whoami)@localhost:5432/comiacapay` などとしてください．
- `POSTGRES_CA_URL`：データベースとの暗号化通信において信頼するルート証明書の URL です．
  - Supabase においては`https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt`です．
  - Production 環境・Preview 環境に手動で設定する必要があります．
  - Development 環境では不要です．

#### マイグレーション

マイグレーションは自動化されていません．適宜`npm run migrate:deploy`を実行してください．詳しくは[公式ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-migrate)を参照してください．

### 認証

認証には[Discord](https://discord.com/)を利用します．  
通常の Discord ボットとは異なり，Client ID と Client Secret を利用して OAuth2 認証を行います．  
[Discord Developer Portal](https://discord.com/developers/applications)でアプリケーションを用意してください．

以下の環境変数を設定してください：

- `DISCORD_OAUTH2_ORIGIN`：OAuth2 認証に利用するホスト名です．スキーマとホスト名を含んでください．
  - Vercel 上では，Production 環境では Vercel のホスト名を，Development 環境では`http://localhost:5173`を指定してください．
- `DISCORD_CLIENT_ID`：Discord の OAuth2 認証に利用します．
- `DISCORD_CLIENT_SECRET`：Discord の OAuth2 認証に利用します．

また，コンソール上で以下の2つをリダイレクト URL として設定する必要があります．

- `${DISCORD_OAUTH2_ORIGIN}/auth/callback`
- `${DISCORD_OAUTH2_ORIGIN}/setup/callback`

<details>
<summary>Preview 環境を使用するための追加設定</summary>

Discord は Production 環境以外にリダイレクトできないため，上の設定だけでは Preview 環境で OAuth2 認証ができません．  
Comiacapay ではトランポリンという機構を利用して Preview 環境で OAuth2 認証を行うことができます．トランポリンでは，Production 環境が一度認可コードを受け取り，それを暗号化して Preview 環境に送信します．

トランポリンを利用するためには，以下の設定が必要です：

- Preview 環境の `DISCORD_OAUTH2_ORIGIN` に **Production** 環境のホスト名を設定する
- 全環境共通で `DISCORD_OAUTH2_TRAMPOLINE_KEY` に AES 鍵を設定する
  - `./scripts/generateTrampolineKey.mjs` で生成できます．

トランポリンは `/setup/callback` では利用できないため，Preview 環境でサーバー設定を行うことはできません．

</details>

## 環境変数

Vercel 上で設定し，[Vercel CLI](https://vercel.com/docs/cli)でダウンロードすることを想定しています．設定項目は「[デプロイ](#デプロイ)」を参照してください．

### ダウンロードする

- `vercel login`が完了していることを確認してください．
- `vercel link`を実行してください．
- `vercel env pull .env`を実行してください．

## ライセンス

[MIT License](LICENSE)
