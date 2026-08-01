import { expect, test } from '@playwright/test'

test('newcomer flow, registration, connections, and admin navigation', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Find a church that feels like home.' })).toBeVisible()
  await page.screenshot({ path: '/tmp/belong-here-welcome-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Get started' }).click()
  await page.getByLabel('Email address').fill('alex@example.com')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Use my current location' }).click()
  await expect(page.getByRole('heading', { name: 'Find your church' })).toBeVisible()
  await page.getByRole('button', { name: 'View church' }).first().click()
  await page.getByRole('button', { name: 'I’m New' }).click()

  await page.getByRole('button', { name: '25–34' }).click()
  await page.getByRole('button', { name: 'Just me' }).click()
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'In-app message Private and easy to pause' }).click()
  await page.getByRole('button', { name: 'Create my next steps' }).click()
  await expect(page.getByRole('heading', { name: 'Good morning, Alex' })).toBeVisible()
  await page.screenshot({ path: '/tmp/belong-here-home-mobile.png' })

  await page.getByRole('button', { name: 'Events' }).last().click()
  await page.getByRole('button', { name: /Welcome Lunch/ }).first().click()
  await page.getByRole('button', { name: 'Register for free' }).click()
  await expect(page.getByRole('button', { name: /Registered/ })).toBeVisible()

  await page.getByRole('button', { name: 'Connections' }).last().click()
  await page.getByRole('button', { name: 'Request an introduction' }).click()
  await expect(page.getByRole('button', { name: /Request sent/ })).toBeVisible()

  await page.getByRole('button', { name: 'Profile' }).last().click()
  await page.getByRole('button', { name: 'Open admin dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('Privacy-conscious analytics')).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('desktop dashboard remains balanced at wide viewport', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.getByRole('button', { name: 'I already have an account' }).click()
  await expect(page.getByRole('heading', { name: 'Good morning, Alex' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Discover' })).toBeVisible()
  await page.screenshot({ path: '/tmp/belong-here-home-desktop.png', fullPage: true })
  expect(pageErrors).toEqual([])
})
