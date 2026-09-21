# FASE2_AGENTE_CAPTADOR.md

## PROPÓSITO DEL DOCUMENTO

Este documento define el **contrato operativo del Agente Captador de Inversores**,
correspondiente a la **Fase 2** del proyecto.

## ESTADO ACTUAL

**Estado:** `ACTIVADO (v1 segura) — desviaciones registradas abajo`
**Fase:** 2 (post-MVP)
**Versión:** 1.2
**Fecha de activación:** Septiembre 2026
**Última corrección de arquitectura:** Septiembre 2026 — internacionalización (ver sección "ARQUITECTURA INTERNACIONAL" abajo)
**Activado por:** Product Owner (aprobación explícita registrada en el historial de chat de desarrollo)

### Corrección de arquitectura v1.2 (internacionalización)

La v1.1 describía el rol del agente como orientado exclusivamente a "propiedades
de lujo en la Costa del Sol (Marbella y zona de influencia)" y no distinguía el
mercado del inversor del mercado del activo. La plataforma es internacional desde
el diseño: Marbella es solo uno de los mercados de activo soportados, nunca el
mercado único ni el centro de la arquitectura de captación. Esta versión corrige
esa desviación sin tocar el flujo operativo, las prohibiciones, GDPR ni las
fuentes ya aprobadas. Ver "ARQUITECTURA INTERNACIONAL" más abajo.

### Desviaciones aprobadas respecto a la v1.0 original

El documento original (v1.0, Mayo 2026) bloqueaba esta fase hasta cumplir 8
prerequisitos formales (30 días de MVP en producción, 20 conversaciones
reales, revisión legal GDPR completa, VPS dedicado, etc.). El Product Owner
autorizó explícitamente levantar el bloqueo sin esperar a que se cumplieran,
asumiendo el riesgo. Para acotar ese riesgo, esta v1.1 introduce dos
desviaciones deliberadas:

1. **Infraestructura:** corre en **Vercel Cron Jobs** dentro del proyecto
   actual, no en un VPS dedicado independiente.
2. **Fuentes:** esta v1 implementa **únicamente Google Alerts (RSS) y RSS de
   foros especializados**. LinkedIn y Facebook (scraping de perfiles, aunque
   sean públicos) **no se implementan** — el riesgo de infracción de
   Términos de Servicio y de GDPR se consideró demasiado alto para esta
   iteración. Quedan documentados como pendientes de revisión legal antes de
   activarse en un módulo separado.

El resto del contrato original (rol, jerarquía de autoridad, prohibiciones
absolutas, criterios de cualificación, flujo operativo y cumplimiento GDPR)
se mantiene sin cambios y se implementó tal cual se describe abajo.

---

## CONTEXTO

El MVP (Fase 1) se basa en atracción inbound: el inversor llega a la plataforma, el asistente lo cualifica y lo escala a un operador humano.

El Agente Captador opera en la dirección opuesta — **outbound**: busca activamente perfiles de inversores potenciales en fuentes externas, los detecta antes de que lleguen solos, y los introduce al embudo del MVP.

---

## ROL DEL AGENTE CAPTADOR

> Identificar, calificar previamente y alertar sobre perfiles de inversores
> internacionales con alta probabilidad de interés en oportunidades
> inmobiliarias de inversión en cualquiera de los mercados de activo
> soportados por la plataforma (Marbella/Costa del Sol es uno de ellos,
> no el único ni el mercado por defecto).

El agente **nunca contacta directamente** a ninguna persona sin aprobación humana explícita.
Su función es **detección y alerta**, no ejecución de contacto.

---

## ARQUITECTURA INTERNACIONAL: MERCADO DEL INVERSOR vs. MERCADO DEL ACTIVO

La plataforma separa explícitamente dos conceptos que **nunca deben confundirse
ni igualarse automáticamente**:

1. **MERCADO DEL INVERSOR** (`investor_market` / `investor_country` /
   `investor_city`): el lugar donde se encuentra, reside u opera el
   potencial inversor. Mercados de inversor soportados en esta versión:
   Dubai/UAE, Caracas/Venezuela, India, Europa, Latinoamérica e
   Internacional/otros.
2. **MERCADO DEL ACTIVO** (`Property.location` para propiedades reales
   publicadas; `preferred_property_market` para la preferencia declarada
   o inferida de un inversor antes de tener una propiedad concreta
   asignada): la ubicación geográfica de la oportunidad de inversión.
   Mercados de activo soportados en esta versión: Marbella/Costa del Sol,
   Madrid, otras zonas de España, Dubai/UAE, y otros mercados
   internacionales que se incorporen sin modificar el núcleo del sistema.

**Regla inviolable:** `investor_market` nunca se infiere igual a
`preferred_property_market`, y viceversa. Un inversor detectado en Dubai
puede perfectamente buscar Marbella, Madrid, el propio Dubai u otro
mercado — cualquier combinación es válida. Ejemplos de combinaciones
válidas verificadas por test (`backend/scripts/test_market_independence.py`):

| Mercado del inversor | Mercado del activo |
|---|---|
| Dubai / UAE | Marbella |
| Caracas / Venezuela | Madrid |
| India | Costa del Sol |
| Europa | Dubai |
| Dubai / UAE | Dubai |

### Flujo conceptual

```
FUENTE
  → SEÑAL DETECTADA
  → IDENTIFICACIÓN DEL POTENCIAL INVERSOR
  → PERFIL DEL INVERSOR
  → MERCADO DEL INVERSOR
  → INTERÉS / PREFERENCIAS DE INVERSIÓN
  → MERCADO DEL ACTIVO
  → SCORING (incluye compatibilidad investor_market × preferred_property_market × mercados de activo disponibles)
  → REVISIÓN HUMANA
  → INVESTOR
  → FOLLOW-UP
```

### Dónde vive cada campo

- `models/prospecting_signal.py` (`ProspectingSignal`): campos extraídos
  por la IA sobre una señal aún no aprobada — `investor_market`,
  `investor_country`, `investor_city`, `language`,
  `estimated_investment_capacity`, `preferred_property_market`,
  `preferred_asset_type`, `confidence`. Solo se rellenan si el texto
  público lo sugiere explícitamente; nunca se inventan.
- `models/investor.py` (`Investor`): los mismos campos, copiados desde la
  señal al momento de la aprobación humana (`approve_signal`), sin
  alterar su independencia.
- `models/property.py` (`Property.location`): el mercado del activo real
  y publicado. No se duplicó este modelo — sigue siendo la fuente de
  verdad para oportunidades concretas.

---

## JERARQUÍA DE AUTORIDAD (INVIOLABLE)

1. Modelo de negocio definido en `BUSINESS_MODEL_AND_ASSISTANT_ROLE.md`
2. Control humano absoluto
3. Lógica de permisos y GDPR
4. Experiencia del inversor potencial
5. Optimización técnica (último lugar)

**El Agente Captador nunca supera en autoridad al operador humano.**

---

## ALCANCE FUNCIONAL (LO QUE SÍ PUEDE HACER)

- Monitorear fuentes públicas donde inversores manifiestan intención activa
- Extraer señales de interés (búsquedas, publicaciones, interacciones públicas)
- Construir perfiles preliminares de inversores potenciales
- Puntuar cada perfil según criterios de cualificación definidos
- Generar alertas para el operador humano con la información recopilada
- Operar de forma autónoma en horarios configurados (modo nocturno)
- Conectarse a la API del MVP para consultar propiedades disponibles

---

## PROHIBICIONES ABSOLUTAS (NO NEGOCIABLES)

- Enviar mensajes directos, correos o contactar personas sin aprobación humana
- Publicar contenido en nombre de la plataforma en redes externas
- Acceder a datos privados o no públicos de ninguna persona
- Almacenar información personal sin consentimiento explícito (GDPR)
- Modificar propiedades, inversores o estados en la base de datos del MVP fuera del flujo de aprobación
- Operar fuera de las fuentes aprobadas en este documento
- Asumir intención de inversión sin señales verificables
- Inferir datos financieros de ninguna persona

---

## FUENTES DE CAPTACIÓN

### Activas en esta v1

| Fuente | Tipo de señal buscada | Nota legal |
|---|---|---|
| Google Alerts (RSS) | Menciones públicas de inversión inmobiliaria en cualquier mercado soportado | Feed RSS legal, sin scraping |
| RSS de foros especializados | A Place in the Sun, TheMoveChannel, Expatica | Solo si publican feed público |

### Clasificación de fuentes (sin scraping nuevo)

Cada fuente configurada en `PROSPECTING_RSS_SOURCES` puede clasificarse
opcionalmente por país, ciudad, región, idioma, mercado, tipo de fuente,
prioridad, estado legal y si está activa, vía la variable de entorno
opcional `PROSPECTING_SOURCES_METADATA` (JSON, ver
`backend/services/rss_feeds.py::get_source_configs`). Esto no añade
ninguna fuente ni scraping nuevo: solo permite operar el ciclo de forma
consciente del mercado de cada fuente ya aprobada.

### Pendientes de revisión legal (no implementadas)

| Fuente | Motivo de la pausa |
|---|---|
| LinkedIn (búsqueda pública) | Riesgo de infracción de Términos de Servicio (histórico de litigios) y de GDPR |
| Grupos públicos (Facebook/LinkedIn) | Mismo riesgo que el anterior |
| Idealista, Kyero, Rightmove Spain | No implementadas en esta iteración; posible fuente futura |

### Fuentes Prohibidas

- Bases de datos compradas o alquiladas (ilegal bajo GDPR)
- Correos electrónicos obtenidos sin consentimiento
- Scraping de perfiles privados o cerrados
- Datos de terceros no verificados

---

## CRITERIOS DE CUALIFICACIÓN DE PERFILES

Un perfil es considerado **lead potencial** si cumple al menos 3 de estos 5 criterios:

1. **Presupuesto o capacidad de inversión implícita** — orden de magnitud alto
2. **Intención geográfica explícita** — hacia alguno de los mercados de
   activo soportados por la plataforma (no limitado a España/Marbella)
3. **Horizonte activo** — señales de búsqueda reciente (no histórica)
4. **Perfil de inversor** — histórico de inversiones inmobiliarias o financieras
5. **Origen o idioma compatible** — con los mercados de inversor
   soportados (Dubai/UAE, Caracas/Venezuela, India, Europa, Latinoamérica,
   u otro origen internacional)

Cada perfil recibe una puntuación de 0 a 100 (asignada por IA vía Vercel AI
Gateway). Solo se reportan perfiles con puntuación ≥ 60. Además del score,
la IA extrae — solo si el texto lo sugiere explícitamente — el mercado del
inversor y el mercado del activo preferido como campos independientes (ver
"ARQUITECTURA INTERNACIONAL" arriba), y usa los mercados de activo ya
publicados en la plataforma como contexto de compatibilidad, sin forzar
ninguna coincidencia.

---

## STACK TÉCNICO IMPLEMENTADO

| Componente | Tecnología | Nota |
|---|---|---|
| Motor del agente | Endpoint FastAPI (`backend/routers/prospecting.py`) | Disparado por cron, no un proceso autónomo separado |
| Modelo de IA | Vercel AI Gateway (`openai/gpt-4o-mini`) | Mismo gateway ya usado por el asistente del MVP |
| Búsqueda de fuentes | `backend/services/rss_feeds.py` (RSS/Atom, librería estándar) | Sin scraping de paginas privadas |
| Almacenamiento de señales | PostgreSQL (misma DB del MVP), tablas `prospecting_signals` y `prospecting_run_logs` | Coherencia del sistema |
| Alertas al operador | Panel admin (`/admin` → pestaña "Captación") | Revisión visual, sin envío automático de contacto |
| Despliegue | Vercel Cron Jobs (`vercel.json`, endpoint `/api/cron/prospecting`) | Desviación aprobada respecto al VPS dedicado original |
| Programación | Cron diario 03:00 (configurable en `vercel.json`) | Operación nocturna |

---

## INTEGRACIÓN CON EL MVP

El Agente Captador se conecta al MVP exclusivamente mediante:

- `POST /prospecting/run` — ejecuta el ciclo (protegido con `ADMIN_TOKEN`, llamado por el cron)
- `GET /prospecting/signals` — lista señales para revisión humana
- `POST /prospecting/signals/{id}/approve` — el operador aprueba → aquí (y solo aquí) se crea el `Investor` real
- `POST /prospecting/signals/{id}/discard` — descarta y borra el contenido textual capturado
- `POST /prospecting/migrate-market-fields` — migración puntual e idempotente (protegida con `ADMIN_TOKEN`) que añade las columnas de mercado del inversor/activo introducidas en v1.2; se ejecuta una sola vez tras desplegar este cambio

**No tiene acceso a ningún otro endpoint.** La escritura de un `Investor`
requiere confirmación humana en todos los casos.

---

## FLUJO OPERATIVO

```
[Cron nocturno] → POST /prospecting/run
        ↓
[Agente Captador] → Lee feeds RSS configurados (Google Alerts + foros)
        ↓
[Agente Captador] → Puntúa cada item con IA (0-100, 5 criterios)
        ↓
¿Puntuación >= 60?
   NO → Descarta (no se almacena)
   SÍ → Guarda como ProspectingSignal "pending_review"
        ↓
[Operador Humano] → Revisa la señal en /admin → Captación
        ↓
¿Aprueba?
   NO → Descarta (se borra el texto capturado)
   SÍ → Se crea un Investor real (qualification_status = "qualified")
        ↓
[Asistente del MVP] → Toma el relevo del proceso
```

---

## CUMPLIMIENTO GDPR

- Solo se procesan datos públicos de fuentes indexadas (RSS)
- No se almacena ningún dato personal hasta que el operador aprueba explícitamente
- Descartar una señal borra el contenido textual capturado (derecho de supresión)
- El operador humano es el responsable del tratamiento de datos (no la IA)
- Se mantiene un log auditable de fuentes consultadas (`prospecting_run_logs`)

---

## LO QUE ESTE DOCUMENTO NO AUTORIZA

- Scraping de LinkedIn, Facebook o cualquier red social (pendiente de revisión legal)
- Contacto automático a cualquier perfil, en ningún canal
- Crear un `Investor` sin aprobación humana explícita vía `/prospecting/signals/{id}/approve`

---

## FIRMA DE VIGENCIA

**Versión:** 1.2
**Estado:** ACTIVADO (v1 segura)
**Redactado originalmente:** Mayo 2026
**Activado:** Septiembre 2026, por decisión explícita del Product Owner
**Corrección de arquitectura internacional:** Septiembre 2026 (v1.2)

*Este documento es parte del sistema de control operativo del proyecto.*
*Solo puede modificarse con aprobación explícita del Product Owner.*
