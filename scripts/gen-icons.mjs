// One-off icon generator, not part of the app build. Re-run with
// `npm install --no-save sharp && node scripts/gen-icons.mjs` if you ever
// need to regenerate public/icon*.png from the SVG mark below.
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#111111"/>
  <g stroke="#ffffff" stroke-width="34" stroke-linecap="round">
    <line x1="120" y1="256" x2="392" y2="256"/>
    <line x1="120" y1="196" x2="120" y2="316"/>
    <line x1="392" y1="196" x2="392" y2="316"/>
    <line x1="72" y1="216" x2="72" y2="296"/>
    <line x1="440" y1="216" x2="440" y2="296"/>
  </g>
</svg>
`

mkdirSync('public', { recursive: true })
writeFileSync('public/icon.svg', svg.trim())

const targets = [
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/favicon-32.png', size: 32 },
]

for (const t of targets) {
  await sharp(Buffer.from(svg)).resize(t.size, t.size).png().toFile(t.file)
  console.log('wrote', t.file)
}
