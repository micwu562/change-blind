<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { spring } from "./spring";

  export let flipped: boolean = false;

  const dispatch = createEventDispatcher();

  const xPos = spring(0, {
    stiffness: 0.25,
    damping: 0.8,
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="switch"
  style:background-color={flipped ? "rgb(119, 198, 49)" : "#fff"}
  on:click={() => {
    flipped = !flipped;
    xPos.set(flipped ? 20 : 0);
    dispatch("toggle", {
      value: flipped,
    });
  }}
>
  <div class="switcher" style:transform="translateX({$xPos}px)"></div>
</div>

<style>
  .switch {
    width: 40px;
    height: 20px;
    border-radius: 20px;
    border: 1px solid #444;

    transition: background-color 0.1s ease-in-out;

    display: inline-block;
    position: relative;
  }

  .switcher {
    position: absolute;
    top: 2px;
    left: 2px;

    background-color: white;

    height: 14px;
    width: 14px;
    border-radius: 100%;
    border: 1px solid #444;
  }
</style>
