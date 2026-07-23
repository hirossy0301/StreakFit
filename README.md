# StreakFit(仮称)

Duolingo の継続メカニクスを応用した、**筋トレ習慣化アプリ**。

自分で YouTube から見つけたトレーニング動画をアプリに保存し、毎日再生して鍛える。
ストリーク・損失回避・XP・通知など、人間の心理にアプローチする仕組みで「毎日続く」を実現する。

## ドキュメント

- [機能仕様書](./docs/feature-spec.md) — MVP を含む全機能の設計
- [技術スタック設計](./docs/tech-stack.md) — フレームワーク・バックエンド・インフラ選定
- [ディープリサーチ](./docs/market-research.md) — 競合・行動科学・YouTube規約・収益化
- [Duolingo リサーチ](./docs/duolingo-research.md) — 継続メカニクスの調査結果

## コンセプト

> 「今日、動画を1本再生する」だけでいい。
> でも、その1本を途切れさせたくなくなる。

## リポジトリ構成

```
docs/        企画・設計・リサーチ
mobile/      Expo (React Native/TS) アプリ MVP 雛形 → mobile/README.md
supabase/    DB マイグレーション(RLS 込み)
```

## 開発(MVP 雛形)

```bash
cd mobile
npm install && npx expo install
npx expo start
```

現状の雛形はローカル完結で動作(ホーム/ライブラリ/動画追加/再生→ストリーク/通知)。
詳細は [mobile/README.md](./mobile/README.md)。

## ステータス

設計完了 → MVP 雛形を実装中。次段階は Supabase 認証・クラウド同期。
