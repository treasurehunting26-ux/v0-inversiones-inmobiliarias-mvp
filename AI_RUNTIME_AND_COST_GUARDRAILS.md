# AI_RUNTIME_AND_COST_GUARDRAILS.md

## PROPÓSITO DEL DOCUMENTO
Definir los **límites operativos, de coste y ejecución** de los sistemas de IA del proyecto.

Este documento existe para:
- Proteger el presupuesto
- Evitar consumo descontrolado
- Forzar foco en captación real
- Impedir decisiones técnicas que no generen negocio

Los límites aquí definidos son **POR FASE**, no absolutos.

---

# PRINCIPIO FUNDAMENTAL

> La IA es un **multiplicador de negocio**, no un centro de coste sin control.

Si no genera captación, cualificación o conversión, **no se ejecuta**.

---

## 1. FASES OPERATIVAS DEL PROYECTO

### FASE 0 — Validación Controlada (Inicial)

**Objetivo**
Validar si el asistente genera:
- Conversaciones reales
- Leads cualificados
- Intención de inversión

**Límite de coste IA**
- Presupuesto máximo: **100–150 USD**
- Periodo: validación inicial

**Restricciones**
- Contextos cortos
- Sin embeddings masivos
- Sin scraping continuo
- Sin simulaciones complejas
- Sin agentes en paralelo innecesarios

**Resultado esperado**
- Evidencia de interés real
- Métricas básicas de conversión

Si no hay señales claras → **no se escala**.

---

### FASE 1 — MVP Operativo

**Objetivo**
Operar la plataforma con flujo constante de leads.

**Límite de coste IA**
- Presupuesto mensual orientativo: **300–500 USD**

**Capacidades habilitadas**
- Asistente conversacional completo
- Cálculos de ROI bajo demanda
- Contenido GEO estratégico
- Mayor profundidad contextual

**Restricciones que se mantienen**
- Control humano obligatorio
- No autonomía del asistente
- No acciones críticas automáticas

---

### FASE 2 — Escalado

**Objetivo**
Convertir la IA en motor de crecimiento.

**Límite de coste IA**
- Variable
- Justificado por ROI
- Aprobado por Product Owner

En esta fase el coste **no se discute**, se **justifica**.

---

## 2. LÍMITES DE EJECUCIÓN (RUNTIME)

El sistema debe imponer:

- Rate limiting por usuario
- Límite de tokens por conversación
- Corte automático por loops
- Timeouts en procesos largos
- Fallback a humano en errores

La IA debe **fallar con seguridad**, no insistir.

---

## 3. COMPORTAMIENTO ESPERADO DEL ASISTENTE

El asistente debe:
- Priorizar respuestas útiles sobre largas
- Evitar razonamientos innecesarios
- No ejecutar tareas sin impacto directo
- Detenerse si el coste no está justificado

Optimizar **por valor**, no por exhaustividad.

---

## 4. PROHIBICIONES DE COSTE

Está prohibido:

- Ejecutar tareas en background sin control
- Mantener agentes "siempre activos"
- Procesar datos no utilizados
- Reintentar indefinidamente
- Escalar contexto sin límite

Toda ejecución debe tener propósito claro.

---

## 5. MÉTRICAS DE CONTROL OBLIGATORIAS

Se deben monitorear:

- Coste por conversación
- Coste por lead cualificado
- Ratio de escalado a humano
- Consumo por feature

Si una métrica empeora, **se revisa o se apaga**.

---

## 6. AUTORIDAD DE ESCALADO DE COSTE

Solo puede autorizar incremento de presupuesto:

- Product Owner
- Dirección del proyecto

Nunca:
- El asistente
- Un agente autónomo
- Una decisión técnica aislada

---

## 8. IMPLEMENTACIÓN (Octubre 2026)

- **Registro:** cada llamada al modelo (Brigitte y Agente Captador) guarda tokens y coste en USD en `ai_usage_logs`. El coste es el que informa el Vercel AI Gateway (`usage.cost`); si no viene, se estima con `AI_PRICE_INPUT_PER_MTOK` / `AI_PRICE_OUTPUT_PER_MTOK`. No se guarda ningún contenido.
- **Métricas (sección 5):** panel `/admin` → "Costes IA": coste por conversación, por inversor cualificado y por lead, ratio de paso a persona, coste del Captador por señal y por señal aprobada, gasto diario.
- **Presupuesto mensual:** `AI_MONTHLY_BUDGET_USD` (150 por defecto, Fase 0). Aviso al 80 %. Al 100 %, si `AI_BUDGET_HARD_STOP` está activo (por defecto), la IA se detiene de forma segura: Brigitte ofrece el contacto con el equipo y el Captador aplaza el análisis. Solo el Product Owner cambia estas variables (sección 6).

---

## 7. CRITERIO FINAL DE CORRECTITUD

La IA es correcta si:
- El gasto está controlado
- El valor generado es medible
- El negocio escala, no el coste
- El modelo de negocio permanece intacto

Cualquier desviación se considera **defecto crítico de producto**.
