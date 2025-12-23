import { getNextLaunchTimestamp, setNextLaunchTimestamp, subscribeToNextLaunch } from '@/lib/rocketSchedule';

describe('rocketSchedule', () => {
  it('gets/sets and notifies subscribers', () => {
    const calls: number[] = [];
    const unsub = subscribeToNextLaunch((ts) => calls.push(ts));
    expect(getNextLaunchTimestamp()).toBeNull();

    setNextLaunchTimestamp(123);
    expect(getNextLaunchTimestamp()).toBe(123);
    expect(calls).toEqual([123]);

    setNextLaunchTimestamp(456);
    expect(calls).toEqual([123, 456]);

    unsub();
    setNextLaunchTimestamp(789);
    expect(calls).toEqual([123, 456]);
  });
});
