import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import packager from '@electron/packager'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const releaseDirectory = path.join(projectRoot, 'release')

await rm(releaseDirectory, { recursive: true, force: true })

const appPaths = await packager({
  dir: projectRoot,
  out: releaseDirectory,
  name: 'Bread & Light',
  platform: process.platform,
  arch: process.arch,
  asar: true,
  prune: true,
  overwrite: true,
  ignore: [
    /^\/release($|\/)/,
    /^\/artifacts($|\/)/,
    /^\/\.git($|\/)/,
    /^\/PRODUCT\.md$/,
    /^\/DESIGN\.md$/,
    /^\/src($|\/)/,
  ],
})

console.log(`Packaged Bread & Light:\n${appPaths.join('\n')}`)
