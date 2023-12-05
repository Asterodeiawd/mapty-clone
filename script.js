"use strict";

const options = {
  enableHighAccuracy: true,
  timeout: 1000,
  maximumAge: 0,
};
navigator.geolocation.getCurrentPosition(
  position => console.log(position),
  () => console.log("failed to get geolocation"),
  options
);

const BINGMAPKEY =
  "As0RhxAvW8aRwrUazRj9Xu4x1q_piBSdhJgKhTWOG3BFDww373peTLdm-GZRyfq4";
