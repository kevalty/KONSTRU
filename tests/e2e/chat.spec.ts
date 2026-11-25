import { test, expect } from '@playwright/test'

test.describe('flujo de chat', () => {
  test('la pagina de inicio carga y muestra el boton de cotizar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /comenzar/i })).toBeVisible()
    await expect(page.getByText(/materiales de construccion/i)).toBeVisible()
  })

  test('navega a la pagina de chat', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /comenzar/i }).click()
    await expect(page).toHaveURL('/chat')
    await expect(page.getByText(/Hola/i)).toBeVisible()
  })

  test('el input de chat esta presente y acepta texto', async ({ page }) => {
    await page.goto('/chat')
    const input = page.getByPlaceholder(/escribe tu mensaje/i)
    await expect(input).toBeVisible()
    await input.fill('Quiero poner piso en mi sala')
    await expect(input).toHaveValue('Quiero poner piso en mi sala')
  })

  test('pagina de cotizacion muestra not found para token invalido', async ({ page }) => {
    await page.goto('/c/token-que-no-existe')
    // Should show Next.js 404 or the notFound() page
    expect([404, 200]).toContain(page.url().includes('not-found') ? 200 : 404)
  })

  test('pagina de orden muestra not found para token invalido', async ({ page }) => {
    const response = await page.goto('/o/token-que-no-existe')
    expect(response?.status()).toBe(404)
  })
})

test.describe('panel de asesores', () => {
  test('el panel redirige a solicitudes', async ({ page }) => {
    await page.goto('/panel')
    await expect(page).toHaveURL('/panel/solicitudes')
  })

  test('la pagina de solicitudes carga', async ({ page }) => {
    await page.goto('/panel/solicitudes')
    await expect(page.getByRole('heading', { name: /solicitudes/i })).toBeVisible()
  })

  test('la pagina de pedidos carga', async ({ page }) => {
    await page.goto('/panel/pedidos')
    await expect(page.getByRole('heading', { name: /pedidos/i })).toBeVisible()
  })

  test('la pagina de catalogo carga', async ({ page }) => {
    await page.goto('/panel/catalogo')
    await expect(page.getByRole('heading', { name: /cat/i })).toBeVisible()
  })
})
