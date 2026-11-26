/** A function that receives the payload of one event. */
export type Listener<Payload> = (payload: Payload) => void;

/**
 * Small publish / subscribe bus with typed events (observer pattern).
 *
 * `Events` maps every event name to its payload type, e.g.
 * `{ 'scene-ready': { sceneKey: string } }`. The compiler then checks every `on` and `emit`:
 * a typo in the event name or a wrong payload is a type error, not a silent bug.
 *
 * It has no Phaser or React import, so both sides can share it and it is unit-tested in Node.
 * One bus belongs to one game instance and is cleared when the game is destroyed.
 */
export class TypedEventBus<Events extends object> {
  private readonly listeners = new Map<keyof Events, Set<Listener<Events[keyof Events]>>>();

  /** Registers a listener. Returns a function that removes it again (handy for effect cleanup). */
  on<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<Events[keyof Events]>);
    return () => this.off(event, listener);
  }

  /** Removes one listener. Removing a listener that is not registered does nothing. */
  off<Name extends keyof Events>(event: Name, listener: Listener<Events[Name]>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(listener as Listener<Events[keyof Events]>);
    if (set.size === 0) this.listeners.delete(event);
  }

  /** Calls every listener of the event with the payload, in the order they were registered. */
  emit<Name extends keyof Events>(event: Name, payload: Events[Name]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    // Iterate over a copy: a listener may call `off` (or `on`) while we are still looping.
    for (const listener of [...set]) {
      (listener as Listener<Events[Name]>)(payload);
    }
  }

  /** Number of listeners for one event (used by tests and to spot leaks). */
  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /** Removes all listeners of all events. Called when the owning game is destroyed. */
  clear(): void {
    this.listeners.clear();
  }
}
