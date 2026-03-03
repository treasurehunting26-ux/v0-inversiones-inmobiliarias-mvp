# TASK_EXECUTION_EXAMPLES.md

> SOURCE OF TRUTH — Ejemplos de tareas correctas e incorrectas  
> Complemento obligatorio de TASK_EXECUTION_PROTOCOL.md

---

## 1. EJEMPLO DE TAREA CORRECTA (FRONTEND)

**Contexto:**  
El MVP está en desarrollo activo. Se requiere mostrar propiedades al usuario.

**Objetivo:**  
Crear el componente `PropertyCard` para catálogo.

**Alcance:**
- Crear archivo `components/PropertyCard.tsx`
- Props: `title`, `location`, `price`, `imageUrl`, `slug`
- Estilo con Tailwind, responsive
- Botón "Ver detalles" que navega a `/propiedades/[slug]`

**Prohibiciones:**
- No crear lógica de carga de datos
- No añadir filtros ni ordenación
- No acceder a API

**Definition of Done:**
- Componente renderiza correctamente con props simulados
- Navegación funcional
- No errores de TypeScript

**Referencias:**
- `WEB_STRUCTURE_AND_FLOWS.md` → Sección Catálogo
- `MVP_TECHNICAL_BLUEPRINT.md` → Pantalla 3

---

## 2. EJEMPLO DE TAREA CORRECTA (BACKEND)

**Contexto:**  
API REST en FastAPI. Se necesita endpoint de listado de propiedades.

**Objetivo:**  
Crear endpoint `GET /api/properties` con paginación.

**Alcance:**
- Archivo: `app/api/properties.py`
- Query params: `page`, `limit`
- Retorno: lista de propiedades con campos públicos
- Sin filtros avanzados

**Prohibiciones:**
- No crear endpoints adicionales
- No implementar autenticación
- No acceder a campos internos de Property

**Definition of Done:**
- Endpoint responde 200 con JSON válido
- Paginación funcional
- Tests unitarios pasan

**Referencias:**
- `DATA_MODEL_AND_PERMISSIONS.md` → Entidad Property
- `MVP_TECHNICAL_BLUEPRINT.md` → API 2

---

## 3. EJEMPLO DE TAREA INCORRECTA (PROHIBIDA)

**Nunca pedir esto:**
> "Haz el backend de propiedades"
> "Optimiza este flujo"
> "Arregla lo que veas raro"
> "Mejora el rendimiento"
> "Hazlo más simple"

Estas frases **rompen el producto**.

---

## 4. REGLA DE ORO: UNA TAREA = UN CAMBIO

- Una tarea
- Un objetivo
- Un output

Nada de tareas "grandes" o "difusas".

---

## 5. MANEJO DE DUDAS DEL ASISTENTE

Si el asistente pregunta:
- Se responde aclarando alcance
- No se amplía objetivo
- No se improvisa

Si hay duda de producto → **se detiene la tarea**.

---

## 6. AUTORIDAD FINAL

El asistente:
- Propone
- Implementa
- Explica

El humano:
- Decide
- Aprueba
- Despliega

Siempre.

---

## 7. CRITERIO FINAL DE TAREA CORRECTA

Una tarea es correcta si:
- Respeta el modelo de negocio
- No introduce estados inválidos
- No amplía alcance
- Es revisable y reversible

Todo lo demás se rechaza.
