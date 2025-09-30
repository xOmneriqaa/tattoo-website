// Font preload component to eliminate 659ms blocking time
export default function FontPreload() {
  return (
    <>
      <link
        rel="preload"
        href="/_next/static/media/92eeb95d069020cc-s.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  )
}
