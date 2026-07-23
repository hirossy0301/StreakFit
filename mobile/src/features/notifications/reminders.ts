import * as Notifications from 'expo-notifications';

// MVP: 端末内でスケジュールする「毎日のリマインダー」。
// ソーシャル通知(つつく/Nudge)はサーバー起点なので v3・Edge Function で実装する。

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 毎日 指定時刻 にローカル通知を予約(既存の同種を置き換え)。
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
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
}
