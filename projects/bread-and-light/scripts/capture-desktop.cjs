const { mkdir } = require('node:fs/promises')
const path = require('node:path')
const { _electron: electron } = require('@playwright/test')

async function capture() {
  const projectRoot = path.resolve(__dirname, '..')
  const artifactDirectory = path.join(projectRoot, 'artifacts')
  await mkdir(artifactDirectory, { recursive: true })

  const electronApp = await electron.launch({ args: [projectRoot] })
  const window = await electronApp.firstWindow()
  await window.waitForSelector('h1')
  await window.screenshot({
    path: path.join(artifactDirectory, 'bread-and-light-electron.png'),
    fullPage: true,
  })
  await electronApp.close()
}

capture().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
