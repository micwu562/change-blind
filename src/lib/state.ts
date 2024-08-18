import { writable } from "svelte/store";

export const blinking = writable(false);

export const changePeriodically = writable(false);
export const changePeriod = writable(1000);

export const changeOnClick = writable(false);

export const cameraInitialized = writable(false);
export const changeOnBlink = writable(false);
