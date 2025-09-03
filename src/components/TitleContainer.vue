<template>
  <div id="title-container">
    <div class="celestial"/>

    <button @click="themeToggle" class="theme-toggle" id="theme-toggle" title="Toggles light & dark theme" aria-label="Toggle theme" aria-live="polite">
      <svg class="half-circle-toggle" aria-hidden="true" width="24" height="24" viewBox="0 0 32 32">
        <path d="M16 .5C7.4.5.5 7.4.5 16S7.4 31.5 16 31.5 31.5 24.6 31.5 16 24.6.5 16 .5zm0 28.1V3.4C23 3.4 28.6 9 28.6 16S23 28.6 16 28.6z" fill="currentColor" />
      </svg>
    </button>

    <div id='sketch'></div>

    <div id="title">
      <div id="title-content">
        <h1>Charlie Howlett</h1>
        <p class="subtitle">Software engineer building distributed systems and real-time messaging platforms. I lead DevOps initiatives, advocate for automation, and build things</p>
        <div class="social-icons">
          <a href="https://www.linkedin.com/in/charles-howlett-383b26155/" target="_blank" rel="noopener noreferrer" class="social-link">
            <img class="social-icon linkedin"/>
          </a>
          <a href="https://github.com/mrchazaaa" target="_blank" rel="noopener noreferrer" class="social-link">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="social-icon github">
              <circle cx="12" cy="12.297" r="11.5" fill="white"/>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
        </div>
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
          require("@/assets/moon-light.svg"),
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

        // Toggle rotation state
        var toggleButton = document.getElementById('theme-toggle');
        if (nextTheme === 'dark') {
          toggleButton.classList.add('rotated');
        } else {
          toggleButton.classList.remove('rotated');
        }

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
  .theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    border: none;
    background-color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 1);
    }

    &:focus {
      outline: none;
    }
  }

  .half-circle-toggle {
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  .theme-toggle.rotated .half-circle-toggle {
    transform: rotate(180deg);
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
    .subtitle {
      font-size: 1rem;
      font-weight: 300;
      margin: 20px 0 0 0;
      text-align: center;
      max-width: 600px;
      line-height: 1.6;
      opacity: 0.9;
      z-index: 2;
    }
    .social-icons {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 25px;
      z-index: 2;
    }
    .social-link {
      display: inline-block;
      transition: transform 0.2s ease, opacity 0.2s ease;

      &:hover {
        transform: scale(1.1);
        opacity: 1;
      }
    }
    .social-icon {
      width: 28px;
      height: 28px;
      fill: currentColor;

      &.github {
        color: var(--text-color, #333);
      }
    }
    .linkedin {
      content: var(--linkedin);
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
