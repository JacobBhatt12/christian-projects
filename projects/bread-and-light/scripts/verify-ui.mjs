import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const artifactDirectory = path.join(projectRoot, 'artifacts')
const baseUrl = 'http://127.0.0.1:4173'
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
})

async function waitForPreview() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Vite preview did not start on port 4173.')
}

async function verify() {
  await mkdir(artifactDirectory, { recursive: true })
  await waitForPreview()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(baseUrl)
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.keyboard.press('Tab')
  if (!(await page.locator('.skip-link').evaluate((element) => element === document.activeElement))) {
    throw new Error('Skip link did not receive first keyboard focus.')
  }

  await page.getByRole('button', { name: /15 minutes/ }).click()
  const firstTitle = await page.locator('#idea-heading').textContent()
  await page.getByRole('button', { name: 'Show me another idea' }).click()
  const secondTitle = await page.locator('#idea-heading').textContent()
  if (firstTitle === secondTitle) throw new Error('Show another immediately repeated an idea.')

  await page.getByRole('button', { name: 'Choose a different amount of time' }).click()
  await page.getByRole('button', { name: /15 minutes/ }).click()
  const thirdTitle = await page.locator('#idea-heading').textContent()
  if (secondTitle === thirdTitle) throw new Error('Choosing the same time immediately repeated its last idea.')

  await page.getByRole('button', { name: 'I’ll do this' }).click()
  await page.getByLabel('What happened?').fill('I listened, helped with the task, and stayed present.\nThe conversation was quiet and honest.')
  await page.getByLabel('What did you learn?').fill('Small help feels different when I ask first and do not rush.')
  await page.getByRole('button', { name: 'Save reflection' }).click()
  await page.getByRole('heading', { name: 'Past Reflections' }).waitFor()
  const savedTitle = await page.locator('.reflection-entry').first().getByRole('heading', { level: 2 }).textContent()
  if (savedTitle !== thirdTitle) throw new Error('Saved reflection did not appear first.')

  await page.reload()
  await page.getByRole('link', { name: /Past Reflections/ }).first().click()
  await page.locator('.reflection-entry').first().waitFor()
  if ((await page.locator('.reflection-entry').count()) !== 1) throw new Error('Reflection did not persist after reload.')

  await page.waitForTimeout(250)
  await page.screenshot({ path: path.join(artifactDirectory, 'desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('link', { name: 'Today' }).last().click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: path.join(artifactDirectory, 'mobile.png'), fullPage: true })
  if (!(await page.locator('.mobile-dock').isVisible())) throw new Error('Mobile navigation dock is not visible.')

  await page.evaluate(() => localStorage.setItem('bread-and-light:reflections:v1', '{malformed'))
  await page.reload()
  await page.getByRole('heading', { name: 'How much time do you have today?' }).waitFor()

  await browser.close()
  console.log('UI verification passed: random selection, no-repeat behavior, persistence, malformed storage recovery, keyboard skip link, and responsive dock.')
}

try {
  await verify()
} finally {
  preview.kill('SIGTERM')
}
