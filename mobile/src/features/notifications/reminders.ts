import Constants from 'expo-constants';

// Expo Go では SDK 53 以降 通知機能が削除されているため、
// expo-notifications を静的 import せず、Expo Go 以外(開発/本番ビルド)でのみ
// 動的に読み込んで使う。これで Expo Go 実行時のエラーを回避する。
export const isExpoGo = Constants.appOwnership === 'expo';

let handlerSet = false;

async function getNotifications() {
  const Notifications = await import('expo-notifications');
  if (!handlerSet) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  }
  return Notifications;
}

// 通知の許可を要求。Expo Go では常に false(利用不可)。
export async function requestPermission(): Promise<boolean> {
  if (isExpoGo) return false;
  try {
    const Notifications = await getNotifications();
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

// 毎日 指定時刻 にローカル通知を予約(既存の同種を置き換え)。
// 成功したら true。Expo Go / 失敗時は false。
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (isExpoGo) return false;
  try {
    const Notifications = await getNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 今日のトレーニングの時間です',
        body: 'ストリークを守ろう。動画を1本、今すぐ再生!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  } catch {
    return false;
  }
}
