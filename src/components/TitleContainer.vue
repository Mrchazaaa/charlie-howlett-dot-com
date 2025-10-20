<template>
  <div id="title-container">
    <div class="celestial"/>

    <div class="controls-icons icons-container">
      <button @click="themeToggle" class="icon theme-toggle btn btn-light rounded-circle shadow-sm" id="theme-toggle" title="Toggles light & dark theme" aria-label="Toggle theme" aria-live="polite">
        <img src="@/assets/dark-theme.svg" class="half-circle-toggle" aria-hidden="true" width="24" height="24" alt="Theme toggle" />
      </button>
    </div>

    <div id='sketch'></div>

    <div id="title">
      <div id="title-content" class="text-center">
        <h1 class="fw-bold mb-3">Charlie Howlett</h1>
        <p class="subtitle fw-light">Software engineer building distributed systems to support real-time messaging. I lead DevOps initiatives, advocate for automation, and build things</p>
        <div class="icons-container d-flex justify-content-center gap-3 mt-4">
          <a href="https://www.linkedin.com/in/charles-howlett-383b26155/" target="_blank" rel="noopener noreferrer" class="social-link icon">
            <img class="social-icon linkedin"/>
          </a>
          <a href="https://github.com/mrchazaaa" target="_blank" rel="noopener noreferrer" class="social-link icon">
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
  import {cloudsSketch, setTheme as setSketchTheme} from '../javascript/background.js';
  import ImagePreloader from "../javascript/imagePreloader.js";

  export default {
    name: 'TitleContainerComponent',
    data() {
      return {
        myp5: null
      }
    },
    async created() {
      const imageSources = [
          require('@/assets/mountains.svg'),
          require('@/assets/mountains-dark.svg'),
          require("@/assets/moon-light.svg"),
          require("@/assets/moon-dark.webp")
      ];

      await ImagePreloader.preloadImages(imageSources);
      this.$emit('images-loaded');
    },
    mounted() {
      this.myp5 = cloudsSketch(document.getElementById('sketch'));
      var theme = this.determineInitialTheme()
      this.setTheme(theme)
    },
    methods: {
      determineInitialTheme() {
        // Dark theme from 6 PM (18:00) to 6 AM (6:00)
        const hour = new Date().getHours();
        if (hour >= 18 || hour < 6) {
          return 'dark';
        } else {
          return 'light';
        }
      },
      getCurrentTheme() {
        var htmlElement = document.querySelector("html");
        var theme = htmlElement.getAttribute('theme');

        if (theme == 'dark' || theme == 'light') {
          return theme;
        }
        else {
          return 'light';
        }
      },
      setTheme(targetTheme) {
        var htmlElement = document.querySelector("html");
        setSketchTheme(targetTheme);
        htmlElement.setAttribute('theme', targetTheme);
      },
      themeToggle() {
        var darkThemeEnabled = this.getCurrentTheme() == "dark";
        var nextTheme = darkThemeEnabled ? 'light' : 'dark';

        this.setTheme(nextTheme);
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

  .icon {
    &:hover {
      transform: scale(1.1);
      opacity: 1;
    }

    transition: transform 0.2s ease, opacity 0.2s ease;

    z-index: 2;
    gap: 20px; // Fallback for Bootstrap gap-3

    & svg, & img {
      width: 28px;
      height: 28px;
    }
  }


  .controls-icons {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
  }

  .icons-container {
    display: flex;
    gap: 10px;
  }

  .theme-toggle {
    // transition: all 0.3s ease;
    padding: 8px;
  }

  .analytics-link {
    display: inline-block;
    // transition: all 0.3s ease;
    text-decoration: none;
    padding: 8px;
  }

  .half-circle-toggle {
    transform-origin: center;
    transition: transform 0.3s ease;
  }

  html[theme="dark"] .half-circle-toggle {
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
      font-family: 'Arial';
      z-index: 2;
    }

    .subtitle {
      font-size: 1rem;
      max-width: 600px;
      line-height: 1.6;
      opacity: 0.9;
      z-index: 2;
    }

    .social-link {
      display: inline-block;
    //   transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .github {
        color: var(--text-color, #333);
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

  @media (max-width: $breakpoint-md) {
    .controls-container {
      top: 15px;
      left: 15px;
      gap: 8px;
    }

    .theme-toggle, .analytics-link {
      padding: 6px;
    }

    #title {
      padding: 0 30px;
    //   grid-template-rows: 85vh 15vh;

      h1 {
        font-size: calc(150% + 40px);
        // font-size: calc(125% - 15px);
        line-height: 1.1;
      }

      .subtitle {
        font-size: 0.4rem;
        // margin: 15px 0 0 0;
        max-width: 70%;
        // line-height: 1.3;
        display: none;
      }
    }

    .celestial {
      top: 5vh;
      right: 10%;
      height: calc(80px + 3vw);
      width: calc(80px + 3vw);
    }
  }
</style>
