import type { Condition } from '../schema/types';

export function evalCondition(cond: Condition | undefined, state: Record<string, unknown>): boolean {
  if (!cond) return true;
  if ('and' in cond) return cond.and.every((c) => evalCondition(c, state));
  if ('or' in cond) return cond.or.some((c) => evalCondition(c, state));
  if ('equals' in cond) return state[cond.state] === cond.equals;
  if ('notEquals' in cond) return state[cond.state] !== cond.notEquals;
  return true;
}
