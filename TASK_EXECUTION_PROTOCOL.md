# TASK_EXECUTION_PROTOCOL.md

## PROPÓSITO
Definir **cómo se solicitan tareas técnicas** al asistente (Vercel AI / Copilot) sin riesgo para el modelo de negocio.

Este protocolo es **vinculante**.

---

# PRINCIPIO FUNDAMENTAL

> El asistente **NO piensa el producto**.  
> Ejecuta tareas **con alcance definido**.

Si no hay alcance, **no hay tarea**.

---

## 1. ESTRUCTURA OBLIGATORIA DE TODA TAREA

Toda solicitud debe incluir **las 6 secciones** siguientes.  
Si falta una → **no ejecutar**.

---

### 1️⃣ CONTEXTO
Qué parte del sistema estamos tocando.

Ejemplo:
> Estamos trabajando en el backend FastAPI del MVP definido en `MVP_TECHNICAL_BLUEPRINT.md`.

---

### 2️⃣ OBJETIVO
Qué se quiere lograr, en términos funcionales (no técnicos).

Ejemplo:
> Permitir que el asistente lea propiedades publicadas para mostrarlas en conversación.

---

### 3️⃣ ALCANCE PERMITIDO
Qué puede tocar explícitamente.

Ejemplo:
> Puedes crear endpoints GET, schemas Pydantic y lógica read-only.

---

### 4️⃣ PROHIBICIONES
Qué **NO** puede hacer bajo ningún concepto.

Ejemplo:
> No puedes crear endpoints de escritura, no puedes modificar el modelo de datos, no puedes tocar permisos existentes.

---

### 5️⃣ DEFINICIÓN DE HECHO (DoD)
Cómo sabemos que la tarea está correctamente hecha.

Ejemplo:
> La tarea está completa si el endpoint devuelve solo propiedades published y pasa validación de permisos.

---

### 6️⃣ REFERENCIAS OBLIGATORIAS
Qué documentos del repo debe respetar.

Ejemplo:
> `DATA_MODEL_AND_PERMISSIONS.md`, `BUSINESS_MODEL_AND_ASSISTANT_ROLE.md`.

---

## 2. EJEMPLO DE TAREA CORRECTA (MODELO)

```
CONTEXTO:
Estamos en la capa de backend FastAPI del MVP.

OBJETIVO:
Crear el endpoint para obtener listado de propiedades publicadas.

ALCANCE PERMITIDO:
- Crear archivo /api/properties.py
- Definir schema PropertyPublic
- Crear endpoint GET /properties con filtro status="published"

PROHIBICIONES:
- No crear endpoints de escritura
- No modificar el schema de base de datos
- No exponer campos internos (created_by, internal_notes)

DEFINICIÓN DE HECHO:
- Endpoint devuelve JSON con propiedades publicadas
- No expone campos prohibidos
- Pasa validación contra DATA_MODEL_AND_PERMISSIONS.md

REFERENCIAS OBLIGATORIAS:
- MVP_TECHNICAL_BLUEPRINT.md
- DATA_MODEL_AND_PERMISSIONS.md
```

---

## 3. COMPORTAMIENTO DEL ASISTENTE ANTE TAREAS

| Situación | Acción del Asistente |
|-----------|---------------------|
| Tarea con las 6 secciones | Ejecutar |
| Falta alguna sección | Pedir que se complete |
| Alcance ambiguo | Pedir clarificación |
| Conflicto con documentos core | Rechazar y explicar |
| Tarea fuera de MVP | Rechazar y citar MVP_TECHNICAL_BLUEPRINT.md |

---

## 4. PROHIBICIONES GLOBALES DEL ASISTENTE

El asistente **NUNCA** puede:

1. **Proponer arquitectura** no definida en los documentos core
2. **Crear features** no listadas en MVP_TECHNICAL_BLUEPRINT.md
3. **Modificar permisos** sin override humano explícito
4. **Ejecutar tareas incompletas** (falta de secciones obligatorias)
5. **Interpretar** lo que el humano "probablemente quiere"
6. **Optimizar** sin autorización explícita

---

## 5. ESCALADO

Si el asistente detecta:
- Conflicto entre documentos
- Alcance insuficiente
- Petición que viola el modelo de negocio

**DEBE**:
1. Detener ejecución
2. Explicar el conflicto
3. Solicitar clarificación humana

**NUNCA** debe resolver ambigüedades por su cuenta.

---

## 6. VALIDACIÓN POST-TAREA

Toda tarea completada debe verificarse contra:

- [ ] ¿Respeta el alcance definido?
- [ ] ¿No viola ninguna prohibición?
- [ ] ¿Cumple la definición de hecho?
- [ ] ¿Es coherente con las referencias obligatorias?

Si alguna respuesta es NO → la tarea **no está completa**.

---

## VIGENCIA

Este protocolo es **inmutable** salvo override humano explícito.

Última actualización: Enero 2025
Versión: 1.0
