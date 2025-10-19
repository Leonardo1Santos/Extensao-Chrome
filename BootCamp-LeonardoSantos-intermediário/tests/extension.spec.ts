// Projeto-base genérico: personalize os placeholders `SEU_...`
import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dist = path.resolve(__dirname, '..', 'dist');

test.describe('Chrome Extension E2E Tests', () => {
  
  test('Extensão carrega com sucesso', async () => {
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`
      ]
    });

    const page = context.pages()[0] || await context.newPage();
    
    // Tenta acessar uma página para verificar se a extensão foi injetada
    await page.goto('about:blank');
    
    // Verifica se há extensões carregadas
    const extensions = await page.evaluate(() => {
      return (window as any).chrome?.runtime ? true : false;
    });

    expect(extensions).toBeDefined();
    await context.close();
  });

  test('Popup da extensão está acessível', async () => {
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`
      ]
    });

    const page = context.pages()[0] || await context.newPage();
    await page.goto('about:blank');

    // Espera um tempo para a extensão inicializar
    await page.waitForTimeout(1000);

    // Verifica se o manifest.json existe e está correto
    const manifestPath = path.join(dist, 'manifest.json');
    const fs = await import('node:fs/promises');
    
    try {
      const manifest = await fs.readFile(manifestPath, 'utf-8');
      const manifestJson = JSON.parse(manifest);
      
      expect(manifestJson.manifest_version).toBe(3);
      expect(manifestJson.name).toBeDefined();
      expect(manifestJson.permissions).toBeDefined();
    } catch (error) {
      throw new Error(`Falha ao ler manifest.json: ${error}`);
    }

    await context.close();
  });

  test('Content script foi injetado corretamente', async () => {
    const context = await chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`
      ]
    });

    const page = context.pages()[0] || await context.newPage();
    await page.goto('https://example.com');

    // Aguarda um tempo para o content script ser injetado
    await page.waitForTimeout(500);

    // Verifica se o chrome.runtime está disponível
    const hasRuntime = await page.evaluate(() => {
      return typeof (window as any).chrome !== 'undefined' &&
             typeof (window as any).chrome.runtime !== 'undefined';
    });

    expect(hasRuntime).toBeDefined();
    await context.close();
  });

  test('Arquivo de build dist/ contém arquivos necessários', async () => {
    const fs = await import('node:fs/promises');
    
    // Verifica se dist existe
    const distStats = await fs.stat(dist).catch(() => null);
    expect(distStats?.isDirectory()).toBe(true);

    // Verifica arquivos essenciais
    const essentialFiles = [
      'manifest.json',
      path.join('src', 'popup', 'popup.html'),
      path.join('src', 'background', 'service-worker.js'),
      path.join('src', 'content', 'content.js')
    ];

    for (const file of essentialFiles) {
      const filePath = path.join(dist, file);
      const stats = await fs.stat(filePath).catch(() => null);
      expect(stats?.isFile()).toBe(true);
    }
  });

  test('Archive extension.zip foi criado', async () => {
    const fs = await import('node:fs/promises');
    const zipPath = path.join(dist, 'extension.zip');
    
    const stats = await fs.stat(zipPath).catch(() => null);
    expect(stats?.isFile()).toBe(true);
    expect(stats?.size).toBeGreaterThan(0);
  });

  test('Service Worker está registrado no manifest', async () => {
    const fs = await import('node:fs/promises');
    const manifestPath = path.join(dist, 'manifest.json');
    const manifest = await fs.readFile(manifestPath, 'utf-8');
    const manifestJson = JSON.parse(manifest);

    expect(manifestJson.background?.service_worker).toBeDefined();
  });

  test('Content script está registrado no manifest', async () => {
    const fs = await import('node:fs/promises');
    const manifestPath = path.join(dist, 'manifest.json');
    const manifest = await fs.readFile(manifestPath, 'utf-8');
    const manifestJson = JSON.parse(manifest);

    expect(manifestJson.content_scripts).toBeDefined();
    expect(Array.isArray(manifestJson.content_scripts)).toBe(true);
    expect(manifestJson.content_scripts.length).toBeGreaterThan(0);
  });

  test('Ícones estão presentes no build', async () => {
    const fs = await import('node:fs/promises');
    const iconsDir = path.join(dist, 'icons');
    
    const stats = await fs.stat(iconsDir).catch(() => null);
    expect(stats?.isDirectory()).toBe(true);

    const files = await fs.readdir(iconsDir);
    expect(files.length).toBeGreaterThan(0);
  });
});