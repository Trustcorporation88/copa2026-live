# Copa 2026 – Placares ao Vivo

Site de placares da Copa 2026 em tempo real. **Roda sem Replit.**

## Requisitos

- Node.js 20+ (recomendado 22)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Setup local (Windows)

```powershell
cd C:\COPA2026\copa2026-live
copy env.example .env
# Edite .env com suas API keys
pnpm install
pnpm dev
```

Arquivo de referência na raiz do repo: `env.example` (ou `.env.example` — mesmo conteúdo).

- **Site:** http://localhost:5173  
- **API:** http://localhost:5000/api/copa2026/scores  

## Produção (um servidor só)

```powershell
pnpm build
pnpm start
```

Abre tudo em http://localhost:5000 (API + site buildado).

## Deploy sem Replit

### Opção A — VPS / Docker (recomendado)

```bash
docker build -t copa2026 .
docker run -p 5000:5000 --env-file .env copa2026
```

Aponte `seligaaqui.online` para o IP do servidor (porta 5000 ou nginx na frente).

### Opção B — Railway (recomendado)

**Importante:** este repo é um monorepo. O Railway pode criar 8 serviços automaticamente — isso **falha**. Use **apenas 1 serviço**.

1. Crie um **Empty Project** no Railway (não use “import monorepo”)
2. **+ New** → **GitHub Repo** → `Trustcorporation88/copa2026-live`
3. Branch: `Trustcorporation88/córtex`
4. **Settings** do serviço:
   - **Root Directory:** vazio (raiz `/`)
   - O `railway.toml` + `Dockerfile` na raiz fazem o build
5. **Variables** (copie de `env.example` na raiz do repo):
   - `NODE_ENV` = `production`
   - `FOOTBALL_DATA_API_KEY` = sua chave
   - `API_FOOTBALL_KEY` = sua chave Pro (api-sports.io)
   - `API_FOOTBALL_LEAGUE_ID` = `1`
   - `API_FOOTBALL_SEASON` = `2026`
   - `THESPORTSDB_API_KEYS` = `123,3`
6. **Networking** → **Generate Domain**
7. Teste: `https://SEU-DOMINIO.up.railway.app/api/healthz`

Se já criou 8 serviços por engano: apague todos e repita os passos acima com 1 serviço só.

### Opção C — Manter domínio atual

No painel DNS de `seligaaqui.online`, troque o destino do Replit para seu novo servidor.

## API keys necessárias

| Variável | Obrigatória | Onde obter |
|----------|-------------|------------|
| `FOOTBALL_DATA_API_KEY` | Sim | [football-data.org](https://www.football-data.org/) |
| `API_FOOTBALL_KEY` | Sim (stats ao vivo) | [api-football.com](https://www.api-football.com/) |
| `API_FOOTBALL_LEAGUE_ID` | Não (padrão `1`) | ID da liga World Cup na API-Football |
| `API_FOOTBALL_SEASON` | Não (padrão `2026`) | Temporada Copa |
| `THESPORTSDB_API_KEYS` | Não (padrão `123,3`) | [TheSportsDB](https://www.thesportsdb.com/) — keys públicas |

Modelo completo: `env.example` na raiz do repositório.

## Estrutura

- `artifacts/api-server` — backend Express
- `artifacts/copa2026` — frontend Vite + React
- `lib/api-client-react` — hooks gerados da API
