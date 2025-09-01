<template>
  <div id="title-container">
    <div class="celestial"/>

    <div id='sketch'></div>

    <div id="title">
      <div id="title-content">
        <h1>Charlie Howlett</h1>
        <button @click="themeToggle" id="dark-theme-btn" type="button" class="btn btn-primary">Dark Theme</button>
      </div>

      <img class="mountains"/>

    </div>
  </div>
</template>

<script>
  import {cloudsSketch, setTheme} from '../javascript/background.js';
  import ImagePreloader from "../javascript/imagePreloader.js";

  export default {
    name: 'TitleContainerComponent',
    data() {
      return {
        myp5: null
      }
    },
    created() {
      const imageSources = [
          require('@/assets/mountains.svg'),
          require('@/assets/mountains-dark.svg'),
          require("@/assets/moon.webp"),
          require("@/assets/moon-dark.webp")
      ];

      ImagePreloader.preloadImages(imageSources);
    },
    mounted() {
      this.myp5 = cloudsSketch(document.getElementById('sketch'));
    },
    methods: {
      themeToggle() {
        var htmlElement = document.querySelectorAll("html")[0];
        var darkThemeEnabled = htmlElement.getAttribute('theme') == "dark";
        var nextTheme = darkThemeEnabled ? 'light' : 'dark';

        setTheme(nextTheme);
        document.querySelector('html').setAttribute('theme', nextTheme);
      },
      makeScrollSmooth(event) {
        var chevron = event.target;

        document.querySelector(chevron.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest"
        });
      }
    }
  }
</script>

<style lang="scss">
  @import "@/styles/_variables.scss";

  @media (max-width: $breakpoint-sm) {
    #content-pointer {
      display: none;
    }
  }
  @media (max-width: $breakpoint-md) {
    #dark-theme-btn {
      float: none !important;
      margin-right: 0px !important;
    }
  }
  #title-container {
    height: 100vh;
    height: 100dvh;
    background-color: var(--sky-color);
  }

  :global(body:has(#title-container)) {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  @supports not (height: 100dvh) {
    #title-container {
      height: 100vh;
    }
  }
  .mountains {
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 100% 0;
    content:var(--mountains);
  }
  #sketch {
    position: relative;
    margin: 0;
    z-index: 1;
    height: 100%;
    overflow: hidden;
  }
  canvas {
    height: 100% !important;
  }
  #title-content {
    z-index: 2;
  }
  #title {
    display: grid;
    grid-template-columns: 100%;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0 auto;
    align-items: center;
    justify-items: center;
    grid-template-rows: 80vh 20vh;
    h1 {
      font-size: calc(250% + 40px);
      font-weight: bold;
      font-family: 'Arial';
      margin: 0;
      text-align: center;
      z-index: 2;
    }
    span {
      float: right;
      padding: 0.75rem 1.5rem;
      margin-right: $margin-md;
      cursor: pointer;
    }
    div {
      text-align: center;
    }
  }
  #content-pointer {
    width: 100%;
    transition: 1.3s;
    opacity: 0.3;
    height: 100%;
    display: grid;
    align-items: center;
    z-index: 2;
    cursor: pointer;
  }
  #content-pointer:hover {
    opacity: 1;
  }
  #content-pointer svg {
    width: 100%;
    height: 5vh;
    fill: black;
  }
  .celestial {
    position: absolute;
    top: 10vh;
    right: 30%;
    height: calc(100px + 5vw);
    width: calc(100px + 5vw);
    z-index: 1 !important;
    content:var(--celestial);
  }
</style>
