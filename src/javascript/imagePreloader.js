class ImagePreloader {
  constructor() {
  }

  preloadImages(images) {
    console.log(`Adding preload links`);

    images.forEach(
        src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
        console.log(`Added preload link for: ${src}`);
    });
  }
}

// Create a singleton instance
const imagePreloader = new ImagePreloader()

export default imagePreloader