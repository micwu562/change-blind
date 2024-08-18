<script lang="ts">
  import randomColor from "randomcolor";
  import { onDestroy, onMount } from "svelte";
  import {
    blinking,
    cameraInitialized,
    changeOnBlink,
    changeOnClick,
  } from "./state";
  import { get } from "svelte/store";
  import { cosineWindow } from "@tensorflow/tfjs-core";

  const TICK_SPEED: number = 1000;
  const MASK_TIME: number = 100;

  let gridSize: number;
  let colors: string[];
  let maskOn: boolean;

  let thingInterval: number;

  // Initialize stuff
  resetColors(6);
  maskOn = false;

  document.addEventListener("mousedown", (e) => {
    if (get(changeOnClick)) {
      swapColor(100);
    }
  });

  blinking.subscribe((isBlinking) => {
    if (isBlinking && $cameraInitialized) {
      if (get(changeOnBlink)) {
        swapColor(0);
      }
    }
  });

  // [min, max)
  function randInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // helper wait function
  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function swapColor(delay: number = MASK_TIME) {
    const n = randInt(0, colors.length);
    const newColor = randomColor({
      count: 1,
      hue: "green",
      format: "rgbArray",
    })[0];

    // set the mask, wait, then set colors and unset mask.
    if (delay > 10) maskOn = true;
    await wait(delay);
    colors = colors.map((v, i) => (i == n ? newColor : v));
    maskOn = false;
  }

  function resetColors(size: number) {
    gridSize = size;
    colors = randomColor({
      count: size * size,
      hue: "green",
      format: "rgbArray",
    });
    console.log(colors);
  }

  onMount(() => {
    // thingInterval = setInterval(swapColor, TICK_SPEED);
  });

  onDestroy(() => {
    clearInterval(thingInterval);
  });
</script>

<div class="grid" style="grid-template-columns: repeat({gridSize}, 1fr)">
  {#each colors as color, i}
    <div
      class="color-box"
      style:--the-color={maskOn ? "#fff" : color}
      style:border-color={maskOn ? "transparent" : "rgba(0, 0, 0, 0.03)"}
    >
      .
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    gap: 8px;

    width: 36rem;
    height: 36rem;

    flex-shrink: 0;
  }

  .color-box {
    border-radius: 4px;
    color: transparent;
    border: 1px solid;

    background-color: rgb(var(--the-color));

    transition: background-color 0.08s;

    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
  }
</style>
