# スマホだけで StreakFit をインストールする(EAS Build)

PC なし・スマホのみで、StreakFit を **standalone アプリ(APK)** としてインストールする手順。
Expo のクラウドでビルドし、できあがった APK を Android スマホに直接入れる。通知も動作する。

> 対象は **Android**。iPhone は Apple の署名の都合で、スマホのみでの直接インストールは難しい
> (TestFlight や有料の Apple Developer 登録が必要)。

## 全体像
1. Expo アカウントを作る(無料・スマホのブラウザでOK)
2. Expo に GitHub リポジトリ(StreakFit)を連携
3. Expo のダッシュボードから **ビルドを実行**(クラウドで数分〜十数分)
4. できあがった **APK をスマホでダウンロード → インストール**

## 手順

### 1. Expo アカウント作成
- スマホのブラウザで https://expo.dev を開き、無料登録(GitHub アカウントでログイン可)。
- 登録後の **ユーザー名(owner)** を控える。

### 2. プロジェクトを作成して projectId を取得
- expo.dev のダッシュボードで「Create a Project」→ 名前は `streakfit` など。
- 作成後のプロジェクトページに表示される **Project ID**(`xxxxxxxx-xxxx-...` 形式)を控える。

> この「ユーザー名」と「Project ID」を教えてもらえれば、こちらで `app.json` に書き込んで
> push します(スマホでのコード編集は不要)。

### 3. GitHub 連携でビルド
- expo.dev のプロジェクト →「Builds」→「Build from GitHub」。
- Expo の GitHub App をインストールし、リポジトリ `hirossy0301/StreakFit` を選択。
- **Base directory** を `mobile` に設定(このアプリは `mobile/` 配下にあるため)。
- **Build profile** に `preview` を選んで実行。

### 4. インストール
- ビルド完了後、ダッシュボードに **QR / ダウンロードリンク**が出る。
- スマホで開いて **APK をダウンロード** → タップしてインストール
  (「提供元不明のアプリを許可」を求められたら許可)。
- これで StreakFit が普通のアプリとして起動。**通知も動作**する。

## メモ
- `preview` プロファイル = 直接インストールできる APK(dev サーバー不要・単体で動く)。
- コードを更新したら、expo.dev で再度ビルド → 新しい APK を入れ直す。
- ビルド設定は [`mobile/eas.json`](../mobile/eas.json)。
