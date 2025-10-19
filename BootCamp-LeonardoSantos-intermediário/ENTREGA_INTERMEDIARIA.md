# 🚀 Entrega Intermediária - Containerização + CI/CD + E2E Tests

## 📋 Resumo da Entrega

Essa entrega intermediária implementa:

- ✅ **Containerização**: Dockerfile com base em Playwright + docker-compose.yml
- ✅ **Testes E2E**: Suite completa com Playwright/Chromium carregando a extensão
- ✅ **CI/CD Automatizado**: GitHub Actions com build, testes e artifacts
- ✅ **Build Reprodutível**: Script que gera `dist/` e `extension.zip`

---

## 📁 Arquivos Adicionados/Modificados

```
my-chrome-extension/
├── Dockerfile                          # Novo: Imagem Docker com Playwright
├── docker-compose.yml                  # Novo: Orquestração de containers
├── package.json                        # Modificado: Scripts atualizados
├── scripts/
│   └── build-extension.mjs             # Novo: Script de build
├── tests/
│   ├── playwright.config.ts            # Novo: Configuração Playwright
│   └── extension.spec.ts               # Novo: Suite de testes E2E
├── .github/
│   └── workflows/
│       └── ci.yml                      # Novo: Pipeline GitHub Actions
└── ENTREGA_INTERMEDIARIA.md            # Novo: Documentação desta entrega
```

---

## 🐳 Como Executar Localmente com Docker

### 1. Build e Execução com Docker Compose

```bash
# Build da imagem
docker compose build

# Executar testes E2E
docker compose run --rm e2e

# Executar com volume (para desenvolvimento)
docker compose up e2e
```

### 2. Verificar Logs

```bash
# Ver logs do container
docker compose logs -f e2e

# Inspecionar imagem
docker images | grep bootcamp

# Remover container/imagem
docker compose down
docker rmi bootcamp/ext-e2e:latest
```

### 3. Comandos Individuais sem Docker

```bash
# Instalar dependências
npm ci

# Build da extensão
npm run build

# Executar testes E2E
npm run test:e2e

# Executar com UI do Playwright
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

## 🧪 Testes E2E Implementados

A suite em `tests/extension.spec.ts` valida:

- ✅ **Extensão carrega com sucesso**
  - Verifica se chrome.runtime está disponível
  
- ✅ **Popup acessível**
  - Valida manifest.json version 3
  - Verifica presença de permissões

- ✅ **Content script injetado**
  - Confirma disponibilidade de chrome.runtime em páginas web

- ✅ **Diretório dist/ contém arquivos necessários**
  - manifest.json
  - src/popup/popup.html
  - src/background/service-worker.js
  - src/content/content.js

- ✅ **Archive extension.zip criado**
  - Verifica se ZIP foi gerado com sucesso
  - Valida tamanho > 0 bytes

- ✅ **Service Worker registrado**
  - Confirma `background.service_worker` no manifest

- ✅ **Content scripts registrados**
  - Valida `content_scripts` array no manifest

- ✅ **Ícones presentes**
  - Verifica pasta `icons/` com arquivos

---

## 🔄 Pipeline CI/CD (GitHub Actions)

### Arquivo: `.github/workflows/ci.yml`

**Triggers:**
- `push` para branches `main` e `develop`
- `pull_request` para branches `main` e `develop`

**Jobs:**

#### 1. `build-and-test` (Ubuntu Latest)
- Checkout do código
- Setup Node 20
- Instalação de deps
- Instalação do Playwright + Chromium
- Build da extensão
- Execução de testes E2E
- Upload de artifacts:
  - `playwright-report/` (relatório HTML)
  - `test-results.json` (dados de testes)
  - `dist/extension.zip` (extensão empacotada)
- Geração de resumo no GitHub Step Summary

#### 2. `build-docker-image` (depende de `build-and-test`)
- Build da imagem Docker
- Cache via GitHub Actions
- Comentário automático em PRs com links dos artifacts

---

## 📦 Script de Build

### `scripts/build-extension.mjs`

```bash
npm run build
```

**O que faz:**
1. Remove diretório `dist/` anterior
2. Cria novo `dist/`
3. Copia `manifest.json`
4. Copia recursivamente `src/` e `icons/`
5. Gera `dist/extension.zip` com compressa máxima (nível 9)

**Output:**
```
🔨 Iniciando build da extensão...
✓ Diretório anterior removido
✓ Novo diretório dist criado
✓ Copiado: manifest.json
✓ Copiado recursivamente: src
✓ Copiado recursivamente: icons
📦 Gerando arquivo ZIP...
✓ Arquivo ZIP criado: dist/extension.zip
✓ Tamanho: XX.XX KB
✅ Build concluído com sucesso!
```

---

## 🎯 Configuração Playwright

### `tests/playwright.config.ts`

**Destaques:**
- Base URL: `https://example.com`
- Reporter: `list`, `html`, `json`
- Screenshot: apenas em falhas
- Trace: `on-first-retry`
- Retries: 0 localmente, 2 no CI
- Workers: 1 (serial)

**Argumentos do Chromium:**
```
--disable-extensions-except=${distPath}
--load-extension=${distPath}
--disable-background-networking
--disable-client-side-phishing-detection
```

---

## 🐳 Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

RUN npx playwright install --with-deps chromium

COPY . .
RUN npm run build

CMD ["npm", "test"]
```

**Base:** `mcr.microsoft.com/playwright:v1.46.0-jammy`
- Inclui Node.js, npm e Chromium
- Sistema operacional: Ubuntu Jammy
- Todas as dependências do navegador pré-instaladas

---

## 🐋 Docker Compose

```yaml
services:
  e2e:
    build: .
    image: bootcamp/ext-e2e:latest
    environment:
      - CI=false
      - DEBUG=pw:api
    volumes:
      - .:/app
    shm_size: 2gb  # Evita falhas do Chromium
    command: npm run test:e2e
```

**Importantes:**
- `shm_size: 2gb` → Shared memory para o Chromium não falhar
- Volumes para desenvolvimento quente
- Variáveis de ambiente para debug

---

## 📊 Relatórios

### Playwright Report

Após rodar os testes, o relatório fica em `playwright-report/index.html`

```bash
# Visualizar relatório
npx playwright show-report

# No CI, fica disponível em Artifacts
```

---

## 🔗 Links Importantes

- **Repositório**: https://github.com/SEU_USUARIO_GITHUB/SEU_REPOSITORIO
- **Documentação Playwright**: https://playwright.dev
- **Documentação Docker Compose**: https://docs.docker.com/compose
- **GitHub Actions**: https://docs.github.com/en/actions

---

## ✅ Checklist de Entrega

- [x] Dockerfile com base Playwright
- [x] docker-compose.yml funcional
- [x] Script build-extension.mjs gera dist/ e extension.zip
- [x] tests/playwright.config.ts configurado
- [x] tests/extension.spec.ts com 8 testes
- [x] .github/workflows/ci.yml com jobs e artifacts
- [x] package.json com scripts atualizados
- [x] Documentação completa (este arquivo)
- [x] Testes passando localmente
- [x] Pipeline CI/CD verde no GitHub

---

## 🚀 Próximas Etapas

Para a **Entrega Final**, será necessário:

1. Backend com API (Node.js/Express ou similar)
2. Integração de dados via API
3. Testes de integração
4. Deploy contêinerizado (Docker + orquestração)
5. Documentação Swagger/OpenAPI
6. Testes de performance e segurança

---

## 📞 Suporte

Dúvidas?