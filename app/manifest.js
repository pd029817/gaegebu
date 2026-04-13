export default function manifest() {
  return {
    name: '가계부',
    short_name: '가계부',
    description: '수입과 지출을 기록하는 가계부',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f4f8',
    theme_color: '#3182ce',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
