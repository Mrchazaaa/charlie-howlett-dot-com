class ImagePreloader {
  constructor() {
  }

  preloadImages(images) {
    const promises = images.map(src => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          resolve(src);
        };

        img.onerror = () => {
          // Resolve anyway to not block the loading screen
          resolve(src);
        };

        // Also add preload link for browser optimization
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);

        // Start loading the image
        img.src = src;
      });
    });

    return Promise.all(promises);
  }
}

// Create a singleton instance
const imagePreloader = new ImagePreloader()

export default imagePreloader