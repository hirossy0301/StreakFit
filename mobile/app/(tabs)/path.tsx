import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useXpStore, CHEST_EVERY } from '@/features/streak/xpStore';
import { colors, radius, spacing } from '@/shared/theme';

// Duolingo 風の蛇行パス。完了した本数ぶんノードが埋まり、
// CHEST_EVERY 本ごとに宝箱ノードが挟まる。現在地の次がハイライトされる。

type Node =
  | { type: 'workout'; index: number; status: 'done' | 'current' | 'locked' }
  | { type: 'chest'; index: number; status: 'opened' | 'open' | 'locked' };

function buildNodes(totalWorkouts: number, openedChests: number): Node[] {
  const nodes: Node[] = [];
  const AHEAD = 6; // 先の未開放ノードをいくつ見せるか
  const upto = totalWorkouts + AHEAD;
  for (let i = 1; i <= upto; i++) {
    const status =
      i <= totalWorkouts ? 'done' : i === totalWorkouts + 1 ? 'current' : 'locked';
    nodes.push({ type: 'workout', index: i, status });
    // i 本目の直後に宝箱(i が CHEST_EVERY の倍数のとき)
    if (i % CHEST_EVERY === 0) {
      const chestNo = i / CHEST_EVERY;
      const cstatus =
        chestNo <= openedChests ? 'opened' : i <= totalWorkouts ? 'open' : 'locked';
      nodes.push({ type: 'chest', index: chestNo, status: cstatus });
    }
  }
  return nodes;
}

// 蛇行のための横オフセット(サインカーブ風)。
const OFFSETS = [0, 46, 70, 46, 0, -46, -70, -46];

export default function PathScreen() {
  const router = useRouter();
  const totalWorkouts = useXpStore((s) => s.totalWorkouts);
  const openedChests = useXpStore((s) => s.openedChests);
  const chestsAvailable = useXpStore((s) => s.chestsAvailable());

  const nodes = buildNodes(totalWorkouts, openedChests);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>あなたの道のり</Text>
      <Text style={styles.sub}>
        累計 {totalWorkouts} 本 ・ 開けた宝箱 {openedChests}
        {chestsAvailable > 0 ? ` ・ 未開封 ${chestsAvailable}!` : ''}
      </Text>

      <View style={styles.path}>
        {nodes.map((node, i) => {
          const offset = OFFSETS[i % OFFSETS.length];
          if (node.type === 'chest') {
            return (
              <View key={`c${node.index}`} style={[styles.row, { marginLeft: offset }]}>
                <Text
                  style={[styles.chest, node.status === 'locked' && styles.dim]}
                  onPress={() => node.status === 'open' && router.push('/chest')}
                >
                  {node.status === 'opened' ? '📭' : node.status === 'open' ? '🎁' : '🔒'}
                </Text>
              </View>
            );
          }
          const isCurrent = node.status === 'current';
          return (
            <View key={`w${node.index}`} style={[styles.row, { marginLeft: offset }]}>
              {isCurrent ? <Text style={styles.startLabel}>START</Text> : null}
              <View
                style={[
                  styles.node,
                  node.status === 'done' && styles.nodeDone,
                  isCurrent && styles.nodeCurrent,
                  node.status === 'locked' && styles.nodeLocked,
                ]}
              >
                <Text style={styles.nodeIcon}>
                  {node.status === 'done' ? '✓' : isCurrent ? '★' : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const NODE = 60;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, alignItems: 'center', paddingBottom: spacing.xl },
  header: { color: colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: spacing.lg },
  path: { alignItems: 'center' },
  row: { height: NODE + spacing.md, alignItems: 'center', justifyContent: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 3,
    borderColor: colors.border,
  },
  nodeDone: { backgroundColor: colors.success, borderColor: '#26a35f' },
  nodeCurrent: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  nodeLocked: { opacity: 0.35 },
  nodeIcon: { fontSize: 26, color: '#fff', fontWeight: '800' },
  startLabel: {
    position: 'absolute',
    top: -14,
    backgroundColor: colors.surface,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    zIndex: 2,
  },
  chest: { fontSize: 52 },
  dim: { opacity: 0.35 },
});
