# StreakFit 技術スタック設計

方針:**おまかせ + 長期の拡張性重視**。
定番で情報が多く、エンジニア採用がしやすく、ソーシャル/課金/スケールを見据えても破綻しない構成を選定する。

---

## 0. 結論(推奨スタック)

| レイヤー | 採用 | 理由(要約) |
|---|---|---|
| モバイル | **React Native + Expo(TypeScript)** | iOS/Android を1コードベース。エコシステム最大・JS/TS人材が豊富で採用しやすい |
| バックエンド | **Supabase(Postgres + Auth + Realtime + Edge Functions)** | リレーショナルな社会グラフ/ランキングに強く、長期の拡張性が高い |
| プッシュ通知 | **Expo Push(FCM/APNs ラッパー)+ サーバー起点は Edge Functions** | MVPは簡単、将来は専用基盤へ移行可能 |
| 動画再生 | **react-native-youtube-iframe(公式IFrameプレーヤー)** | YouTube規約準拠。DL/バックグラウンド再生はしない |
| 課金 | **RevenueCat** | iOS/Android のサブスクを一元管理。解約・トライアル計測も可能 |
| 分析 | **PostHog もしくは Amplitude** | リテンションファネル計測(D1/D7/D14)が習慣化アプリの生命線 |

> **なぜ Flutter でなく React Native か:** どちらも本番規模に耐える。RN を推す理由は
> ①JS/TS の人材プールが最大で**採用しやすい**、②Expo で開発〜配信(EAS)が高速、
> ③YouTube IFrame の実績あるライブラリが揃う。Dart 経験者が中心なら Flutter でも可。

---

## 1. フロントエンド:React Native + Expo

### コア
- **Expo(managed + Dev Client)** — EAS Build / EAS Submit / OTAアップデート(Update)で配信を高速化
- **TypeScript** 必須 — 長期保守・チーム開発・型共有のため
- **Expo Router** — ファイルベースルーティング(画面追加がスケールしやすい)

### 状態・データ
- **TanStack Query(React Query)** — サーバー状態のキャッシュ/同期
- **Zustand** — 軽量なクライアント状態(UI・一時状態)
- **MMKV または expo-sqlite** — オフラインキャッシュ(下記「オフライン設計」)

### 機能別ライブラリ
| 用途 | ライブラリ |
|---|---|
| YouTube再生 | `react-native-youtube-iframe` |
| プッシュ/ローカル通知 | `expo-notifications` |
| 共有シート受信(YouTubeから保存) | `expo-share-intent`(config plugin / Dev Build 必要) |
| 認証UI | Supabase Auth + `expo-apple-authentication` / Google |
| アニメーション(報酬演出) | `react-native-reanimated` + Lottie |

### フォルダ構成(feature-based・拡張性重視)
```
src/
  features/
    streak/      # ストリーク表示・計算呼び出し
    videos/      # 保存・再生・ライブラリ
    workout/     # 今日の1本・完了記録
    social/      # フレンド・つつく(Nudge)
    notifications/
  shared/        # UI部品・型・APIクライアント
  lib/           # supabaseクライアント等
```

---

## 2. バックエンド:Supabase

Firebase(Firestore)ではなく Supabase(Postgres)を選ぶ理由 = **リレーショナルな社会グラフ・
ランキング・ストリーク集計に強く、長期の拡張要件(SQL/JOIN/集計)に耐える**ため。拡張性重視の方針と合致。

### 使う機能
- **Auth** — Sign in with Apple(iOS必須要件)/ Google / Email。JWT ベース
- **Postgres + Row Level Security(RLS)** — ユーザーごとのデータ隔離をDBレベルで担保
- **Realtime** — リーダーボード更新・つつき(Nudge)の即時反映
- **Edge Functions(Deno/TS)** — サーバーロジック(ストリーク確定・通知送信・レート制限)
- **pg_cron** — 日次バッチ(タイムゾーン別のストリーク締め・通知トリガー)
- **Storage** — 将来のユーザー画像等(MVPでは最小)

### サーバー権威(重要・不正防止)
- **ストリーク判定はサーバー側で行う**(クライアント時計の改ざん対策)。
  ユーザーのタイムゾーンで日付境界を判定。実装は「読み取り時に遅延計算」または
  「pg_cron でタイムゾーン別に締め処理」。
- つつき(Nudge)の**レート制限**(同一相手1日1回等)は Edge Function + DB制約で担保。

---

## 3. プッシュ通知の設計

習慣化アプリの心臓部。**2系統**を使い分ける。

| 種類 | 実現方法 | 例 |
|---|---|---|
| **ローカル通知**(端末内スケジュール) | `expo-notifications` でオンデバイス予約。サーバー不要 | 毎日の「トレーニングの時間です」 |
| **リモート/ソーシャル通知**(サーバー起点) | Edge Function → Expo Push → FCM/APNs | つつき(Nudge)、「ストリークが危ない」夜通知 |

- **パーソナライズ**:名前・ストリーク日数を差し込む。文面A/Bテストの土台を用意
- **スケジューラ**:サーバー起点通知は pg_cron / Supabase Scheduled Functions で発火
- **将来のスケール**:配信量が増えたら OneSignal や専用ワーカー(キュー)へ移行可能な抽象化にしておく

---

## 4. YouTube 連携(規約準拠)

> 詳細は [market-research.md](./market-research.md) の③参照。**DL・オフライン保存・バックグラウンド再生は不可。**

| 処理 | 実装 |
|---|---|
| URL受け取り | 共有シート(`expo-share-intent`)/ アプリ内貼り付け |
| videoId 抽出 | URLパース |
| メタデータ取得 | **YouTube Data API v3 の `videos.list`(1ユニット/件)** または **oEmbed**。`search`(100ユニット)は多用しない |
| 再生 | `react-native-youtube-iframe`(公式プレーヤー・前面表示のみ) |

- **Data API クォータ**:デフォルト 1日 10,000 ユニット。`videos.list` は安価、`search` は高コスト。
  → 保存時に `videos.list` か oEmbed で取得しDBにキャッシュ、以後はAPIを叩かない設計に。
- **APIキーはサーバー(Edge Function)側で保持**。クライアントに埋め込まない(規約・漏洩対策)。

---

## 5. オフライン設計

- 「今日の1本」の情報(videoId・タイトル・サムネURL)は**ローカルにキャッシュ**し、
  オフラインでもホームが表示される(※動画再生自体はネット必須)。
- 完了記録は**オフラインでも受け付け、オンライン時に同期**(楽観的更新 + キュー)。
- 実装:TanStack Query の永続キャッシュ + MMKV/SQLite。

---

## 6. 課金・分析

- **RevenueCat**:iOS/Android の App内課金/サブスクを一元化。トライアル・解約・LTV計測。
  → [market-research.md](./market-research.md) の④「フリーミアム+長い無料体験→年払い」戦略と整合。
- **分析(PostHog/Amplitude)**:リサーチが示す通り **最初の14日のセッション頻度**が最重要指標。
  D1/D7/D14 リテンション、初回完了までの時間、ストリーク分布、つつき→復帰率 を計測。

---

## 7. CI/CD・運用

- **EAS Build / EAS Submit** — クラウドビルド & ストア提出
- **EAS Update** — JS層のOTA配信(審査なしで軽微修正を反映)
- **GitHub Actions** — Lint/型チェック/テスト、EAS連携
- **Sentry** — クラッシュ/エラー監視
- テスト:Jest(ロジック)+ Detox もしくは Maestro(E2E)

---

## 8. フェーズ別インフラ

| フェーズ | 構成 |
|---|---|
| **MVP** | Expo + Supabase(Free/Pro)+ ローカル通知中心 + `videos.list`/oEmbed。課金/リーグは未実装 |
| **v2** | Edge Functions でサーバー通知本格化、RevenueCatでサブスク、PostHogで分析強化 |
| **v3** | ソーシャル(フレンド/つつく/リーグ)を Realtime + RLS で。配信量に応じ通知基盤を分離 |

---

## 9. データモデル(Postgres 概略)

```sql
-- 認証は Supabase auth.users を利用
profiles        (id PK=auth.uid, name, timezone, reminder_time, created_at)
videos          (id, user_id FK, video_id, title, thumbnail_url, channel_name, duration_sec, tags[], added_at)
workout_logs    (id, user_id FK, date, video_id, completed_at, xp_earned)
streaks         (user_id PK, current, longest, last_completed_date, freeze_count)
xp_state        (user_id PK, total_xp, level)               -- v2
playlists       (id, user_id FK, name, video_ids[])          -- v2
badges          (id, user_id FK, type, unlocked_at)          -- v2
friendships     (id, user_id FK, friend_user_id FK, status, created_at)   -- v3
nudges          (id, from_user_id FK, to_user_id FK, type, sent_at, seen_at, responded_at)  -- v3
```
- 全テーブルに **RLS** を設定(自分のデータ + 友達に許可した範囲のみ参照可)。
- `nudges` はレート制限用に `(from_user_id, to_user_id, sent_at::date)` にユニーク/カウント制約。

---

## 10. 主要な決定と代替案

| 決定 | 代替 | 判断根拠 |
|---|---|---|
| React Native + Expo | Flutter / ネイティブ | 採用性・エコシステム・開発速度。Dart中心なら Flutter も可 |
| Supabase(Postgres) | Firebase(Firestore) | 社会グラフ/集計にSQLが有利。長期拡張性重視の方針に合致 |
| Expo Push | OneSignal / 直接FCM+APNs | MVPは簡単。スケール時に差し替え可能な抽象化を用意 |
| RevenueCat | 自前IAP実装 | クロスプラットフォーム課金の実装/計測コストを大幅削減 |

---

## 11. 未決事項(次に決める)

- **Expo managed vs Dev Client**:共有シート(share extension)は Dev Client(config plugin)が必要 → 実質 Dev Client 前提で進めるのが無難。
- **通知スケジューラ**:pg_cron で足りるか、専用ワーカー(キュー)を初期から入れるか。
- **サインイン方式**:Apple/Google を最初から入れるか、MVPはメール/匿名認証で開始するか。
- **リージョン**:Supabase のリージョン選定(日本ユーザー中心なら近接リージョン)。
