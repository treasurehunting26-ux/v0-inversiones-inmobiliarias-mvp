# DATA_MODEL_AND_PERMISSIONS.md

## PROPÓSITO DEL DOCUMENTO
Definir de forma **cerrada, explícita y no interpretable**:

- El modelo de datos lógico del sistema
- Qué entidades existen
- Qué puede leer o escribir cada actor
- Qué acciones están estrictamente prohibidas

Este documento es **vinculante para backend, frontend y asistentes IA**.

---

# PRINCIPIO DE SEGURIDAD FUNDAMENTAL

> Ningún actor puede modificar datos críticos sin autorización humana explícita.

El sistema debe **fallar por bloqueo**, nunca por permisividad.

---

## 1. ENTIDADES PRINCIPALES DEL SISTEMA

### 1.1 Property (Inmueble)

Representa una oportunidad inmobiliaria real y validada.

**Atributos obligatorios**
- id
- title
- location
- asset_type
- investment_range
- roi_estimated (opcional)
- horizon
- risk_notes
- status (draft | published | archived)
- created_by (humano)
- approved_by (humano)
- created_at
- updated_at

**Reglas**
- Solo humanos crean o modifican propiedades
- El asistente **solo puede leer**
- El status `published` requiere aprobación humana

---

### 1.2 Investor (Inversionista)

Representa un usuario interesado.

**Atributos**
- id
- name (opcional)
- email (opcional)
- budget_range
- investment_goal
- horizon
- risk_profile
- qualification_status (unqualified | qualified | high_intent)
- source
- created_at

**Reglas**
- El asistente puede crear y actualizar campos de cualificación
- El asistente NO puede eliminar inversores
- El asistente NO puede marcar cierres

---

### 1.3 Conversation (Conversación)

Historial de interacción asistente ↔ inversor.

**Atributos**
- id
- investor_id
- messages
- intent_score
- escalated_to_human (boolean)
- created_at
- updated_at

**Reglas**
- El asistente puede escribir mensajes
- El asistente puede actualizar intent_score
- El asistente puede solicitar escalado
- El cierre del escalado es humano

---

### 1.4 LeadEscalation (Escalado a Humano)

Evento crítico de negocio.

**Atributos**
- id
- investor_id
- reason
- created_at
- handled_by (humano)
- status (open | contacted | closed)

**Reglas**
- El asistente solo puede CREAR
- Nunca puede cerrar
- Nunca puede asignar humano

---

## 2. ACTORES DEL SISTEMA

### 2.1 Operador Humano
- Acceso total
- Autoridad final
- Único con capacidad de:
  - Crear / modificar propiedades
  - Publicar oportunidades
  - Cerrar operaciones
  - Modificar reglas de negocio

---

### 2.2 Asistente Inteligente (Vercel AI)

**Rol**
Asistente informativo y cualificador.

**Permisos**
- Leer propiedades publicadas
- Leer datos de mercado precargados
- Crear / actualizar inversores
- Crear conversaciones
- Calcular ROI solo con datos existentes
- Crear LeadEscalation

**Prohibiciones**
- Modificar propiedades
- Cambiar estados críticos
- Inventar datos
- Ejecutar operaciones
- Cerrar escalados

---

### 2.3 Sistema (Backend)
- Valida permisos
- Impide estados inválidos
- Rechaza cualquier acción no permitida

---

## 3. MATRIZ DE PERMISOS (RESUMEN)

| Acción | Humano | Asistente |
|------|--------|-----------|
| Crear propiedad | ✅ | ❌ |
| Editar propiedad | ✅ | ❌ |
| Publicar propiedad | ✅ | ❌ |
| Leer propiedad | ✅ | ✅ |
| Crear inversor | ✅ | ✅ |
| Actualizar perfil inversor | ✅ | ✅ |
| Calcular ROI | ✅ | ⚠️ Solo con datos |
| Crear escalado | ✅ | ✅ |
| Cerrar escalado | ✅ | ❌ |
| Cerrar operación | ✅ | ❌ |

---

## 4. VALIDACIONES OBLIGATORIAS

El backend debe:
- Validar permisos en cada request
- Rechazar acciones fuera de rol
- Loggear intentos inválidos
- No confiar en el asistente

El asistente:
- Nunca debe asumir éxito
- Debe manejar rechazos sin insistir
- Debe escalar errores a humano

---

## 5. ESTADOS INVÁLIDOS (CRÍTICOS)

Se consideran errores graves:
- Propiedades visibles sin aprobación humana
- ROI calculado con datos inexistentes
- Inversores marcados como cerrados por IA
- Conversaciones sin trazabilidad
- Escalados cerrados automáticamente

---

## 6. CRITERIO FINAL DE CORRECTITUD

El sistema es correcto si:
- Los datos reflejan solo decisiones humanas
- El asistente no puede romper el modelo
- Los estados inválidos son imposibles
- El negocio permanece protegido

Nada más importa.
