# StreakFit Mobile(MVP 雛形)

Expo (React Native / TypeScript) 製の MVP スケルトン。
設計は [../docs/tech-stack.md](../docs/tech-stack.md) / [../docs/feature-spec.md](../docs/feature-spec.md) を参照。

## 現状で動くもの(ローカル完結・バックエンド不要)
- ホーム:ストリーク表示 +「今日の1本」再生導線
- ライブラリ:YouTube 動画の保存(リンク)・一覧
- 動画追加:URL 貼り付け → oEmbed でメタ取得 → 保存
- プレーヤー:公式 IFrame で再生 → 完了でストリーク +1
- 設定:毎日のローカル通知(19:00 固定)、フリーズ/最長ストリーク表示
- ストリーク:連続日数・フリーズ自動消費(端末内、Zustand + AsyncStorage 永続化)

> MVP はローカル保存で動作します。Supabase 連携(クラウド同期・認証・ソーシャル)は次段階。

## セットアップ

```bash
cd mobile
npm install
# バージョン整合(Expo 推奨):
npx expo install
cp .env.example .env   # Supabase を使う場合に値を設定(未設定でもローカル動作可)
npx expo start
```

- iOS 実機/シミュレータ、Android エミュレータ、または Expo Go(※共有シートや通知の一部は Dev Build が必要)。
- 共有シートから YouTube を保存する機能(`expo-share-intent`)は **Dev Client** で有効化予定(現状は URL 貼り付けで代替)。

## ディレクトリ

```
app/                      # Expo Router(画面)
  _layout.tsx             # プロバイダ + スタック
  (tabs)/                 # ホーム / ライブラリ / 設定
  add.tsx                 # 動画追加(モーダル)
  player/[videoId].tsx    # プレーヤー
src/
  lib/                    # supabase クライアント・型
  features/
    streak/               # ストリークのロジック(store)
    videos/               # 保存・YouTube ヘルパー
    notifications/        # ローカル通知
  shared/                 # theme・共通コンポーネント
```

## 次の実装ステップ
1. Supabase 認証(Apple/Google)+ ローカル→クラウド同期
2. ストリークをサーバー権威に(タイムゾーン別締め、pg_cron)
3. 共有シート(Dev Client + expo-share-intent)
4. XP/レベル・実績演出(v2)
5. フレンド・つつく(Nudge)・リーグ(v3)
6. RevenueCat でサブスク(v2〜)

## 注意(YouTube 規約)
- 動画のダウンロード/オフライン保存/バックグラウンド再生はしない。
- 再生は公式 IFrame プレーヤーで前面表示のみ。API キーはクライアントに置かない。
