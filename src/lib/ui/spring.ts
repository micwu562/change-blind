import { writable } from "svelte/store";

export function spring(
  value: number,
  { stiffness = 0.15, damping = 0.8, precision = 0.01 }
) {
  const store = writable(value);

  let lastTime: number;

  let lastValue = value;
  let currentValue = value;
  let targetValue = value;

  let running = false;

  function set(newValue: number) {
    targetValue = newValue;
    if (!running) {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  function loop() {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - lastTime, 42) * 0.06;

    const delta = targetValue - currentValue;
    const velocity = (currentValue - lastValue) / deltaTime;
    const spring = stiffness * delta;
    const damper = damping * velocity;
    const acceleration = spring - damper;
    const d = (velocity + acceleration) * deltaTime;

    lastValue = currentValue;

    if (Math.abs(d) < precision && Math.abs(delta) < precision) {
      store.set((currentValue = targetValue));
      running = false;
    } else {
      store.set((currentValue = currentValue + d));
      lastTime = currentTime;
      requestAnimationFrame(loop);
    }
  }

  return {
    set,
    subscribe: store.subscribe,
  };
}
