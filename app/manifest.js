export default function manifest() {
  return {
    name: "Next.js PWA",
    short_name: "NextPWA",
    description: "A Progressive Web App built with Next.js",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "https://www.phpclasses.org/browse/view/image/file/118477/name/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://www.phpclasses.org/browse/view/image/file/118477/name/android-icon-192x192.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
