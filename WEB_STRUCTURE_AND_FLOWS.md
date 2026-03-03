# WEB_STRUCTURE_AND_FLOWS.md

## PROPÓSITO DEL DOCUMENTO
Definir de forma **exacta, cerrada y no interpretable**:

- La estructura de la web
- Las páginas permitidas
- Los flujos de usuario
- Los puntos de conversión
- Las responsabilidades del asistente inteligente

Este documento es **vinculante para frontend, backend y asistentes IA**.

---

# PRINCIPIO RECTOR

> La web existe para **captar inversionistas cualificados**.  
No para informar en exceso, no para mostrar catálogo masivo, no para branding vacío.

Cada página debe justificar su existencia en términos de conversión.

---

## 1. ESTRUCTURA GLOBAL DE LA WEB (INMUTABLE)

La web se compone **únicamente** de las siguientes áreas:

1. Landing principal
2. Catálogo de oportunidades
3. Asistente inteligente (conversacional)
4. Páginas SEO / GEO
5. Punto de contacto humano

No se permiten secciones adicionales sin aprobación explícita.

---

## 2. LANDING PRINCIPAL (HOME)

### Objetivo
- Captar atención
- Generar confianza
- Llevar al asistente inteligente

### Elementos obligatorios
- Propuesta de valor clara (inversión inmobiliaria, no lifestyle)
- Mensaje orientado a inversor
- CTA principal único:
  > **"Habla con el asistente de inversión"**

### Prohibiciones
- Formularios largos
- Registro obligatorio
- Distracciones visuales
- CTAs múltiples

---

## 3. ASISTENTE INTELIGENTE (EJE CENTRAL)

### Rol
El asistente es el **primer punto de contacto real** con el inversor.

Debe:
- Entender perfil
- Filtrar intención
- Educar
- Preparar el handoff humano

### Acceso
- Visible desde:
  - Landing
  - Catálogo
  - Páginas SEO
- Siempre accesible
- No oculto detrás de login

### Flujo de conversación obligatorio

1. **Saludo y contexto**
   > "Soy el asistente de inversión de [Nombre]. ¿Puedo ayudarte a explorar oportunidades?"

2. **Preguntas de cualificación mínima**
   - Tipo de inversión buscada
   - Rango de capital estimado
   - Preferencia de zona o tipo de activo
   - Horizonte temporal

3. **Respuesta adaptada**
   - Mostrar oportunidades relevantes
   - Explicar criterios de análisis
   - Ofrecer hablar con un asesor humano

4. **Handoff a humano**
   - Siempre disponible
   - Nunca forzado
   - Registro de contexto para continuidad

### Prohibiciones del asistente
- Dar recomendaciones de inversión
- Simular certeza sobre rentabilidad
- Cerrar ventas
- Almacenar datos sin contexto claro

---

## 4. CATÁLOGO DE OPORTUNIDADES

### Objetivo
- Mostrar propiedades validadas manualmente
- Informar sin saturar
- Redirigir al asistente para profundizar

### Contenido por propiedad
- Ubicación general (no exacta)
- Rango de precio
- Tipo de activo
- Indicadores básicos (rentabilidad estimada, ocupación, etc.)
- Estado del análisis (validado / en revisión)

### CTA por propiedad
> **"Consultar esta oportunidad con el asistente"**

### Prohibiciones
- Mostrar propiedades no validadas
- Ofrecer compra directa
- Mostrar datos financieros sensibles públicamente

---

## 5. PÁGINAS SEO / GEO

### Objetivo
- Captar tráfico orgánico cualificado
- Educar sobre mercado inmobiliario
- Redirigir al asistente o al catálogo

### Tipos permitidos
- Guías de inversión por zona
- Comparativas de mercado
- Análisis de tendencias
- Preguntas frecuentes

### Estructura obligatoria
- Título orientado a búsqueda
- Contenido útil y verificable
- CTA al asistente al final

### Prohibiciones
- Contenido generado automáticamente sin supervisión
- Promesas de rentabilidad
- Datos inventados

---

## 6. PUNTO DE CONTACTO HUMANO

### Objetivo
- Permitir escalada desde el asistente
- Ofrecer canal directo para inversores avanzados

### Formato
- Formulario breve (nombre, email, contexto)
- Alternativa: agendador de llamada

### Prohibiciones
- Ser el CTA principal
- Sustituir al asistente como primer filtro

---

## 7. FLUJOS DE USUARIO PERMITIDOS

### Flujo principal (ideal)
```
Landing → Asistente → Cualificación → Oportunidad relevante → Handoff humano
```

### Flujo alternativo (SEO)
```
Página SEO → Asistente → Cualificación → Oportunidad relevante → Handoff humano
```

### Flujo directo (inversor avanzado)
```
Catálogo → Asistente (consulta específica) → Handoff humano
```

---

## 8. MÉTRICAS DE ÉXITO (KPIs)

| Métrica | Descripción |
|--------|-------------|
| Tasa de inicio de conversación | % de visitantes que interactúan con el asistente |
| Tasa de cualificación | % de conversaciones que completan el flujo mínimo |
| Tasa de handoff | % de leads que pasan a humano |
| Calidad del lead | Evaluación post-contacto del asesor humano |
| Conversión final | % de leads que avanzan a operación |

---

## 9. REGLAS DE IMPLEMENTACIÓN TÉCNICA

### Frontend
- Asistente siempre visible (widget flotante o sección fija)
- No bloquear navegación con modales innecesarios
- Responsive obligatorio

### Backend
- API para catálogo con filtros
- API para registro de leads
- Integración con CRM opcional

### IA
- Modelo con contexto del negocio
- Memoria de conversación dentro de sesión
- Log de interacciones para auditoría

---

## 10. DOCUMENTO VINCULANTE

Este documento es **fuente de verdad** para:
- Diseño de interfaz
- Desarrollo de flujos
- Comportamiento del asistente
- Estrategia de contenido

Cualquier desviación requiere aprobación explícita del responsable del proyecto.

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** VIGENTE
