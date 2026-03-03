# DEPLOYMENT_AND_ENVIRONMENT_RULES.md

## PROPÓSITO DEL DOCUMENTO
Definir reglas **estrictas e inmutables** para:

- Entornos de despliegue
- Uso de variables de entorno
- Acceso del asistente a configuración sensible
- Flujo de despliegue en Vercel

Este documento evita:
- Errores en producción
- Filtración de claves
- Estados inconsistentes entre entornos
- "Fixes rápidos" que rompen el negocio

---

# PRINCIPIO FUNDAMENTAL

> Ningún cambio técnico justifica poner en riesgo el negocio o los datos.

La estabilidad y la seguridad **prevalecen** sobre la velocidad.

---

## 1. ENTORNOS DEFINIDOS (OBLIGATORIOS)

El proyecto debe operar **mínimo** con los siguientes entornos:

### 1.1 Development (DEV)
- Uso local o preview
- Datos de prueba
- Claves de IA separadas
- Costes no críticos

### 1.2 Staging (PRE-PROD)
- Réplica funcional de producción
- Datos anonimizados
- Pruebas de flujos completos
- Validación de asistentes

### 1.3 Production (PROD)
- Entorno real
- Datos reales
- Costes reales
- Tráfico real

❌ Está prohibido mezclar datos, claves o configuraciones entre entornos.

---

## 2. VARIABLES DE ENTORNO (REGLAS DURAS)

### 2.1 Principios
- Todas las claves sensibles deben vivir en variables de entorno
- Nunca en código
- Nunca en prompts
- Nunca en logs
- Nunca en frontend

---

### 2.2 Tipos de variables

#### Variables críticas
- API keys de IA
- Credenciales de base de datos
- Tokens de terceros
- Secrets de firma

Acceso:
- Backend únicamente
- Nunca accesibles al asistente

---

#### Variables de configuración
- Límites de coste
- Flags de features
- Umbrales de escalado

Acceso:
- Backend
- Leídas, nunca modificadas por IA

---

## 3. ACCESO DEL ASISTENTE A CONFIGURACIÓN

El asistente:

- ❌ NO puede leer variables de entorno
- ❌ NO puede inferir valores de configuración
- ❌ NO puede modificar flags
- ❌ NO puede "sugerir" cambios en secretos

El asistente **opera dentro de límites ya definidos**, no los gestiona.

---

## 4. FLUJO DE DESPLIEGUE EN VERCEL

### Flujo permitido
1. Cambio en branch
2. Preview deploy automático
3. Revisión humana
4. Merge controlado
5. Deploy a producción

---

### Prohibiciones
- Deploy directo a producción
- Cambios manuales en PROD
- Hotfixes sin revisión
- Deploys disparados por IA

---

## 5. PROTECCIONES OBLIGATORIAS

El sistema debe incluir:

- Rollback rápido
- Logs de errores
- Alertas básicas
- Rate limiting activo

Sin estas protecciones, **no se despliega**.

---

## 6. RELACIÓN CON EL ASISTENTE DE VERCEL

El asistente:
- Puede proponer cambios
- Puede generar código
- Puede sugerir mejoras

Pero:
- ❌ No puede desplegar
- ❌ No puede tocar PROD
- ❌ No puede modificar configuración sensible

Toda acción final es humana.

---

## 7. INCIDENTES Y FALLAS

Ante cualquier incidente:
1. Se prioriza estabilidad
2. Se revierte
3. Se analiza
4. Se corrige
5. Se documenta

Nunca "parchear y seguir".

---

## 8. CRITERIO FINAL DE CORRECTITUD

El despliegue es correcto si:
- Los entornos están aislados
- Los secretos están protegidos
- El asistente no tiene acceso indebido
- Producción es estable

Cualquier desviación es **defecto crítico de ingeniería**.
