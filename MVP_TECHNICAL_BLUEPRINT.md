# MVP_TECHNICAL_BLUEPRINT.md

## PROPÓSITO DEL DOCUMENTO
Definir el **alcance técnico exacto del MVP**, incluyendo:

- Pantallas (UI)
- Flujos funcionales
- APIs necesarias
- Endpoints permitidos
- Responsabilidades de cada capa

Este blueprint es **vinculante**.  
Nada fuera de aquí se construye en el MVP.

---

# 1. STACK TECNOLÓGICO (CERRADO)

## Frontend
- Next.js 14
- App Router
- Server Components por defecto
- Client Components solo cuando sea imprescindible
- SEO + GEO desde el diseño

## Backend
- FastAPI (Python)
- Arquitectura modular
- Validación estricta de permisos
- API-first

## Base de Datos
- PostgreSQL
- Esquema definido en `DATA_MODEL_AND_PERMISSIONS.md`

## IA
- Vercel AI SDK + Copilot SDK
- Modelos LLM vía API
- Sin agentes autónomos persistentes

---

# 2. PANTALLAS DEL MVP (UI)

## 2.1 Landing Page (`/`)

**Objetivo**
- Captación
- Confianza
- Derivación al asistente

**Componentes**
- Hero con propuesta de valor
- CTA único: "Habla con el asistente de inversión"
- Acceso directo al chat

---

## 2.2 Asistente Inteligente (Overlay / Página)

**Rutas**
- `/assistant`
- Widget embebido en landing y catálogo

**Funciones**
- Conversación
- Cualificación
- Presentación de oportunidades
- Escalado a humano

---

## 2.3 Catálogo de Oportunidades (`/opportunities`)

**Objetivo**
- Mostrar activos reales
- Derivar conversación

**Componentes**
- Lista limitada
- Cards simples
- CTA hacia asistente o asesor

---

## 2.4 Detalle de Oportunidad (`/opportunities/[id]`)

**Objetivo**
- Informar
- Contextualizar
- Preparar conversión

**Componentes**
- Datos estructurados
- Riesgos
- ROI (si existe)
- CTA asistente / humano

---

## 2.5 Páginas SEO / GEO (`/guides/*`)

**Objetivo**
- Captación orgánica
- Ser citables por IA

**Contenido**
- Guías
- FAQs
- Análisis generales

---

# 3. FLUJOS FUNCIONALES DEL MVP

## 3.1 Flujo Canónico de Captación

1. Usuario entra (SEO / directo / IA)
2. Landing → CTA
3. Asistente inicia conversación
4. Se crea Investor + Conversation
5. Asistente cualifica
6. Presenta oportunidades existentes
7. Usuario muestra intención
8. Se crea LeadEscalation
9. Humano toma control

Este flujo **no se altera**.

---

# 4. APIs DEL BACKEND (FASTAPI)

## 4.1 Auth (mínimo)
Autenticación solo para operadores humanos.

- `POST /auth/login`
- `POST /auth/logout`

El inversor **no requiere login** en MVP.

---

## 4.2 Properties API

### Endpoints
- `GET /properties`
- `GET /properties/{id}`

### Reglas
- Solo propiedades `published`
- Read-only para asistentes
- Escritura solo humana (fuera de MVP público)

---

## 4.3 Investors API

### Endpoints
- `POST /investors`
- `PATCH /investors/{id}`
- `GET /investors/{id}` (humano)

### Uso
- Creación automática desde asistente
- Actualización de perfil de inversión

---

## 4.4 Conversations API

### Endpoints
- `POST /conversations`
- `POST /conversations/{id}/messages`
- `GET /conversations/{id}` (humano)

---

## 4.5 Lead Escalation API

### Endpoints
- `POST /lead-escalations`
- `GET /lead-escalations` (humano)
- `PATCH /lead-escalations/{id}` (humano)

El asistente **solo puede crear**.

---

## 4.6 AI Interaction API

### Endpoint
- `POST /ai/assistant`

### Responsabilidad
- Orquestar conversación
- Aplicar guardrails
- Validar permisos
- Gestionar costes

---

# 5. RESPONSABILIDADES POR CAPA

## Frontend
- UI
- UX
- Rendering
- Captación

## Backend
- Validación
- Seguridad
- Estados válidos
- Permisos

## Asistente IA
- Conversar
- Explicar
- Cualificar
- Escalar

Nunca:
- Decidir
- Ejecutar
- Modificar estados críticos

---

# 6. SEGURIDAD Y VALIDACIONES

Obligatorio:
- Validación de input
- Rate limiting
- Logs de errores
- Rechazo explícito de acciones inválidas

---

# 7. FUERA DE ALCANCE DEL MVP (EXPLÍCITO)

No se incluye:
- Pagos
- Firma de contratos
- Dashboards complejos
- Automatización de cierres
- Scraping
- Machine learning propio

Todo eso es **fase posterior**.

---

# 8. CRITERIO FINAL DE MVP CORRECTO

El MVP es correcto si:
- Capta inversores
- El asistente funciona bajo control
- El humano mantiene autoridad
- El modelo de negocio no se rompe

Nada más importa.
