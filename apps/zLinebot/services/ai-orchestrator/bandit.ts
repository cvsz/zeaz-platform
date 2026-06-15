export type Arm = 'cheap' | 'smart'

type BanditStats = Record<Arm, { reward: number; count: number }>

const stats: BanditStats = {
  cheap: { reward: 0, count: 1 },
  smart: { reward: 0, count: 1 }
}

function totalCount(): number {
  return stats.cheap.count + stats.smart.count
}

function ucb(arm: Arm): number {
  return stats[arm].reward / stats[arm].count + Math.sqrt((2 * Math.log(totalCount())) / stats[arm].count)
}

export function selectArm(): Arm {
  return ucb('cheap') >= ucb('smart') ? 'cheap' : 'smart'
}

export function observeReward(arm: Arm, reward: number): void {
  stats[arm].count += 1
  stats[arm].reward += reward
}
