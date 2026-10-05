# B&G Consulting — Plataforma de inversión inmobiliaria

Plataforma de captación y cualificación de inversores para oportunidades inmobiliarias de alto valor en Europa, Latinoamérica y Dubái. Producción: **[bgestateconsulting.com](https://bgestateconsulting.com)**.

El objetivo único es **captar, cualificar y convertir inversores de alta intención**, con control humano en toda decisión crítica. Las reglas de negocio están en los documentos de la raíz del repositorio (ver más abajo) y son vinculantes para cualquier cambio.

## Qué hace

- **Web pública** en español e inglés: inicio, catálogo de oportunidades validadas, fichas, guías de inversión (SEO/GEO) y contacto.
- **Brigitte**, asistente virtual de IA: conversa en el idioma del visitante, cualifica (objetivo, presupuesto, mercado, horizonte) y pasa el contacto a una persona del equipo con la conversación completa. Se presenta siempre como asistente virtual.
- **Panel `/admin`** (protegido con `ADMIN_TOKEN`): leads y conversaciones, catálogo de propiedades (solo un humano crea y publica), revisión del Agente Captador y costes de IA.
- **Agente Captador** (fase 2): cada noche lee fuentes RSS públicas aprobadas, puntúa señales de interés con IA y las deja para revisión humana. Nunca contacta a nadie por sí mismo.
- **Dossiers privados** (`/dossier/...`): fichas compartibles por enlace, sin indexar.

## Arquitectura

| Capa | Tecnología | Despliegue |
|---|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS | Vercel |
| Backend | FastAPI (Python), SQLAlchemy | Railway |
| Base de datos | PostgreSQL | Railway |
| IA | Vercel AI Gateway (`openai/gpt-4o-mini`) | — |
| Archivos (fotos, vídeos, dossiers) | Vercel Blob | Vercel |
| Correo de avisos | Zoho Mail (SMTP) | — |
| Tarea nocturna del Captador | Vercel Cron → `POST /prospecting/run` | Vercel |

```
app/          Rutas de Next.js (web pública por idioma, /admin, /dossier, /api)
components/   Componentes de la interfaz (landing, catálogo, Brigitte, panel admin…)
lib/          Clientes de API, idiomas (lib/i18n) y contenido de las guías (lib/guides)
backend/      API FastAPI: routers/, models/, schemas/, services/, scripts/ (pruebas)
public/       Imágenes y marca
```

## Documentos de referencia (vinculantes)

| Documento | Qué define |
|---|---|
| `BUSINESS_MODEL_AND_ASSISTANT_ROLE.md` | Modelo de negocio y principios no negociables (fuente de verdad) |
| `MVP_TECHNICAL_BLUEPRINT.md` | Alcance técnico del MVP: pantallas, flujos y API |
| `WEB_STRUCTURE_AND_FLOWS.md` | Estructura de la web, flujos de conversión e idiomas |
| `DATA_MODEL_AND_PERMISSIONS.md` | Entidades y qué puede hacer cada actor |
| `ASSISTANT_MASTER_PROMPT.md` | Comportamiento del asistente y persona de Brigitte |
| `AI_RUNTIME_AND_COST_GUARDRAILS.md` | Límites de coste y ejecución de la IA |
| `ERROR_HANDLING_AND_HUMAN_OVERRIDE.md` | Errores, incertidumbre y control humano |
| `DEPLOYMENT_AND_ENVIRONMENT_RULES.md` | Entornos, secretos y flujo de despliegue |
| `FASE2_AGENTE_CAPTADOR.md` | Contrato operativo del Agente Captador |
| `TASK_EXECUTION_PROTOCOL.md` / `TASK_EXECUTION_EXAMPLES.md` | Cómo pedir tareas técnicas a un asistente |

## Variables de entorno

**Frontend (Vercel)**

| Variable | Obligatoria | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Sí | URL pública del backend |
| `ADMIN_TOKEN` | Sí | Subida de archivos del panel y llamada del cron al backend |
| `CRON_SECRET` | Sí | Protege `/api/cron/prospecting` |
| `BLOB_READ_WRITE_TOKEN` | Sí | Vercel Blob (lo crea Vercel al conectar el almacenamiento) |
| `NEXT_PUBLIC_SITE_URL` | No | Dominio para SEO (por defecto `https://bgestateconsulting.com`) |

**Backend (Railway)**

| Variable | Obligatoria | Uso |
|---|---|---|
| `DATABASE_URL` | Sí | PostgreSQL |
| `ADMIN_TOKEN` | Sí | Acceso al panel y endpoints internos (mismo valor que en Vercel) |
| `AI_GATEWAY_API_KEY` | Sí | Vercel AI Gateway |
| `ZOHO_EMAIL_ADDRESS` / `ZOHO_EMAIL_APP_PASSWORD` | Recomendadas | Avisos de nuevos leads por correo |
| `ALLOWED_ORIGINS` | No | Orígenes CORS adicionales (el dominio de producción ya está permitido) |
| `AI_MONTHLY_BUDGET_USD` / `AI_BUDGET_HARD_STOP` | No | Presupuesto mensual de IA (150 USD) y pausa automática al agotarlo |
| `AI_RATE_*`, `CONTACT_RATE_*`, `PROSPECTING_*` | No | Límites anti-abuso y ajustes del Captador (ver cada módulo) |

Los secretos viven solo en variables de entorno: nunca en el código, en los prompts ni en el frontend.

## Desarrollo local

```bash
# Frontend
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm dev

# Backend (otra terminal)
cd backend
pip install -r requirements.txt
DATABASE_URL=postgresql://localhost/inversiones_db ADMIN_TOKEN=dev uvicorn main:app --reload
```

Las tablas se crean solas al arrancar el backend.

## Pruebas

Pruebas de integración sin dependencias externas (SQLite en memoria, IA simulada, sin coste):

```bash
cd backend
for t in scripts/test_*.py; do python "$t"; done
```

## Flujo de cambios

Según `DEPLOYMENT_AND_ENVIRONMENT_RULES.md`: cambio en rama → PR con preview de Vercel → revisión humana → merge → despliegue a producción. Nunca se despliega directamente a producción.
