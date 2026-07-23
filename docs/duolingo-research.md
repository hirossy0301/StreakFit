# Duolingo 継続メカニクス リサーチ

Duolingo が「毎日続く」を実現している仕組みを、心理原則ごとに整理したもの。
本アプリ(筋トレ習慣化)の設計根拠として参照する。

## 数字で見る効果

- DAU の月次リテンション **約 55%**(教育アプリ業界で圧倒的)
- 2019 年以降、DAU を **10 倍以上**に成長
- ストリーク・ウェイジャー提示で **14 日目リテンション +14%**

## 1. 全体思想:Hook Model(フックモデル)

Nir Eyal「Hooked」の4ステップループを **毎日** 回させる。

| ステップ | Duolingo | 本アプリでの対応 |
|---|---|---|
| トリガー | プッシュ通知 / ホームのストリーク数字 | 「今日のトレーニング」通知 |
| アクション(低摩擦) | レッスン1回(数分) | 保存動画を1本再生する |
| 変動報酬 | XP・宝箱・リーグ順位 | 完了で貯まる XP・ご褒美 |
| 投資 | ストリーク・XP・順位の蓄積 | 継続日数・記録の積み上げ |

**核心:アクションの摩擦を極限まで下げる。** 本アプリの「動画1本を再生するだけ」は
この原則に非常に合致している。

## 2. ストリーク × 損失回避(最重要)

- 人は「得る喜び」より「失う痛み」を **約2倍** 強く感じる(損失回避バイアス)
- 180 日続けた人は「181 日にしたい」のではなく「180 日を失いたくない」から続ける
- **初期ストリーク形成(0→7→14→30 日)が決定的**。特に **7 日目付近で損失回避が効き始め**、離脱率が急落する
- 100 日を超えると、失う苦痛が報酬期待を上回り、より強く復帰行動を生む

## 3. ストリークフリーズ(守る保険)

- ストリークを守る保険(1〜2 日分)を用意すると、**かえって長期リテンションが上がる**
- 理由:ストリーク不安を減らしつつ、損失回避のコア体験は維持できる
- 完璧主義による燃え尽き・完全離脱を防ぐ
- **筋トレは病気・出張・怪我で必ず休む日が出る**ため、この考え方は特に重要

## 4. XP・レベル・ジェム(進捗の可視化と報酬)

- XP はあらゆる行動で貯まる「共通通貨」。レベル・リーグ・チャレンジを繋ぐ
- 可視化された進捗が「積み上げた投資」を実感させ、離脱コストを高める
- ポイント・レベル・報酬の三本柱で常にモチベーションを供給

## 5. 社会的な力

- **リーグ**:週次で XP を競う 7 日間の競争。10 段階ティア制。競争心・社会的比較を刺激
- **フレンドストリーク**:2人共有のストリーク。相互アカウンタビリティ(「自分のせいで途切れさせたくない」)
- **セルフイメージの一貫性**:「自分は毎日続ける人間だ」というアイデンティティ。損失回避よりさらに強く持続的

## 6. 通知(リマインダー)設計

- 文面を常に A/B テスト(「守ろう!」vs「失いそうです!」など)
- プレッシャーをかけすぎず戻ってくる文面を最適化
- タイミングは行動パターンからパーソナライズ
- マスコット Duo(フクロウ)のキャラクター性で「愛される催促」に昇華

## 出典

- [Duolingo Gamification Strategy: A Full Case Study (2026) — Trophy](https://trophy.so/blog/duolingo-gamification-case-study)
- [Duolingo gamification explained — StriveCloud](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [The Psychology Behind Duolingo's Streak Feature — Just Another PM](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature)
- [Duolingo — Streak System Detailed Breakdown & Design — Medium](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [Duolingo's Habit-Forming Reminders: A UX Breakdown — Digia](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/)
- [Duolingo's Customer Retention Strategy — Propel](https://www.trypropel.ai/resources/blogs/duolingo-customer-retention-strategy)
- [How Duolingo Gamified Monthly Active Users — The PM Repo](https://www.thepmrepo.com/articles/how-duolingo-gamified-monthly-active-users-lessons-in-habit-formation)
