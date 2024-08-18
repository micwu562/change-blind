<script lang="ts">
  import BlinkDetect from "./lib/blinkDetection/BlinkDetect.svelte";
  import Switch from "./lib/ui/Switch.svelte";
  import Grid from "./lib/Grid.svelte";
  import CameraIcon from "./lib/ui/icons/CameraIcon.svelte";
  import Select from "./lib/ui/Select.svelte";
  import { changeOnBlink, changeOnClick } from "./lib/state";
</script>

<div class="top">
  <div class="scroll">
    <main class="main">
      <h1 class="bigtitle">"Change Blindness"</h1>
      <section>
        <p>
          A perceptual phenomenon that occurs when a change in a visual stimulus
          is introduced and the observer does not notice.
        </p>

        <p>
          Every time the grid flickers, one square changes color. Can you spot
          it?
        </p>

        <div class="spacer">* * *</div>

        <div class="options">
          <div class="options-title">Change something...</div>
          <!-- <div class="setting">
            <Switch />
            Periodically, every <Select />
          </div> -->
          <div class="setting">
            <Switch
              on:toggle={(e) => {
                changeOnClick.set(e.detail.value);
              }}
            />
            When I click my mouse.
          </div>
          <div class="setting">
            <Switch
              on:toggle={(e) => {
                changeOnBlink.set(e.detail.value);
              }}
            />
            Every time I blink.
            <CameraIcon />
          </div>
        </div>
        <BlinkDetect />
        <!-- <div class="options">
          <div class="options-title">Flickering</div>
          <div class="setting">Flicker duration:</div>
          <div class="setting">Placeholder color:</div>
        </div>
        <div class="options">
          <div class="options-title">Flickering</div>
          <div class="setting">Flicker duration:</div>
          <div class="setting">Placeholder color:</div>
        </div>
        <div class="options">
          <div class="options-title">Flickering</div>
          <div class="setting">Flicker duration:</div>
          <div class="setting">Placeholder color:</div>
        </div> -->
      </section>
    </main>
  </div>
  <div class="grid">
    <Grid />
  </div>
</div>

<style>
  section {
    padding-left: 8px;
  }

  p {
    margin-bottom: 24px;
  }

  .spacer {
    text-align: center;
    font-size: 1rem;
    opacity: 0;
  }

  .top {
    display: flex;
    gap: 64px;
  }

  .scroll {
    height: 100vh;
    width: 40rem;
    position: relative;
    overflow-y: scroll;
  }

  main {
    margin-right: 40px;
    text-align: left;
    /* height: 100vh; */

    padding-top: 8rem;
  }

  .setting {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .grid {
    display: flex;
    align-items: center;
  }

  .options-title {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }

  .options {
    margin-top: 12px;
  }
</style>
