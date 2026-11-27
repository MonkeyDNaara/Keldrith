import { describe, expect, it, vi } from 'vitest';
import { TypedEventBus } from './TypedEventBus';

type TestEvents = {
  ping: { count: number };
  pong: { text: string };
};

function createBus() {
  return new TypedEventBus<TestEvents>();
}

describe('TypedEventBus', () => {
  it('calls a listener with the payload of its event', () => {
    const bus = createBus();
    const listener = vi.fn();
    bus.on('ping', listener);

    bus.emit('ping', { count: 1 });

    expect(listener).toHaveBeenCalledExactlyOnceWith({ count: 1 });
  });

  it('does not call listeners of other events', () => {
    const bus = createBus();
    const listener = vi.fn();
    bus.on('pong', listener);

    bus.emit('ping', { count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  it('calls several listeners in the order they were registered', () => {
    const bus = createBus();
    const calls: string[] = [];
    bus.on('ping', () => calls.push('first'));
    bus.on('ping', () => calls.push('second'));

    bus.emit('ping', { count: 1 });

    expect(calls).toEqual(['first', 'second']);
  });

  it('stops calling a listener after off', () => {
    const bus = createBus();
    const listener = vi.fn();
    bus.on('ping', listener);

    bus.off('ping', listener);
    bus.emit('ping', { count: 1 });

    expect(listener).not.toHaveBeenCalled();
    expect(bus.listenerCount('ping')).toBe(0);
  });

  it('returns an unsubscribe function from on', () => {
    const bus = createBus();
    const listener = vi.fn();
    const unsubscribe = bus.on('ping', listener);

    unsubscribe();
    bus.emit('ping', { count: 1 });

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores off for a listener that was never registered', () => {
    const bus = createBus();

    expect(() => bus.off('ping', vi.fn())).not.toThrow();
  });

  it('still calls every listener when one of them unsubscribes during emit', () => {
    const bus = createBus();
    const second = vi.fn();
    const unsubscribeFirst = bus.on('ping', () => unsubscribeFirst());
    bus.on('ping', second);

    bus.emit('ping', { count: 1 });

    expect(second).toHaveBeenCalledOnce();
    expect(bus.listenerCount('ping')).toBe(1);
  });

  it('removes all listeners with clear', () => {
    const bus = createBus();
    bus.on('ping', vi.fn());
    bus.on('pong', vi.fn());

    bus.clear();

    expect(bus.listenerCount('ping')).toBe(0);
    expect(bus.listenerCount('pong')).toBe(0);
  });
});
