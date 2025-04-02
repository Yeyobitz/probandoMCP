# DigiVirus - Listado de Tareas

## Sprint 1: Configuración y Prototipo Base (3 semanas)

### Semana 1: Configuración del Entorno
- [x] Crear repositorio y estructura de carpetas
- [x] Configurar entorno de desarrollo (linters, build process)
- [x] Implementar Three.js base con canvas responsive
- [x] Crear escena 3D básica (cámara, iluminación, controles)
- [x] Configurar sistema de shaders PS1 básico
  - [x] Implementar vertex jitter
  - [x] Implementar texture warping
  - [x] Añadir efecto de baja resolución

### Semana 2: Prototipo de Mascota
- [x] Modelar mascota básica (tipo DataByte)
- [x] Implementar texturizado con efecto glitch
- [x] Crear animaciones básicas (idle, caminar, dormir)
- [x] Desarrollar clase base para mascotas (atributos, estados)
- [x] Implementar sistema básico de necesidades (hambre, felicidad)

### Problemas Descubiertos y Resueltos
- [x] Corregir posicionamiento del modelo (clipping a través del suelo)
- [x] Ajustar escala del modelo para mejor visualización
- [x] Añadir debugging visual para posicionamiento del modelo
- [x] Optimizar visualización de cámara para ver la mascota correctamente
- [x] Implementar sistema de waypoints para movimiento natural
- [x] Crear visualización de caminos para debugging
- [x] Ajustar velocidad de movimiento basada en nivel de energía
- [x] Mejorar complejidad de caminos basada en nivel de felicidad
- [x] Corregir comportamiento del movimiento cuando la ventana pierde el foco

### Detalles de Implementación
- [x] Animaciones implementadas:
  - [x] Idle: Bobbing suave y rotación lenta
  - [x] Walking: Seguimiento de caminos aleatorios con waypoints
  - [x] Sleeping: Respiración mediante escalado sutil
- [x] Sistema de movimiento:
  - [x] Generación de caminos aleatorios con transiciones suaves
  - [x] Rotación para mirar en dirección del movimiento
  - [x] Cambios de velocidad dinámicos según estado
  - [x] Movimiento influenciado por necesidades (energía, felicidad)
  - [x] Control del deltaTime para prevenir saltos grandes cuando la ventana pierde foco
  - [x] Detección mejorada de waypoints para evitar que la mascota se "pase de largo"

### Semana 3: Interacción Básica
- [x] Crear interfaz de usuario mínima (HUD, menús)
  - [x] Diseño retro con fuente Press Start 2P 
  - [x] HUD de estadísticas de la mascota
  - [x] Botones de acción principal
  - [x] Sistema de notificaciones
  - [x] Menú de opciones
  - [x] Sistema de pestañas para organizar estadísticas
- [x] Implementar controles para interactuar con mascota
  - [x] Alimentación de la mascota
  - [x] Jugar con la mascota
  - [x] Descansar/dormir
  - [x] Limpiar la mascota
  - [x] Entrenar la mascota
  - [x] Socializar con la mascota
  - [x] Modo de depuración
  - [x] Corrección de lógica de interacción con estadísticas
- [x] Sistema de estadísticas ampliado
  - [x] Estadísticas básicas: Salud, Ataque, Defensa, Velocidad, Inteligencia
  - [x] Estadísticas avanzadas: Agilidad, Suerte, Resistencia, Adaptabilidad
  - [x] Necesidades primarias: Hambre, Felicidad, Energía
  - [x] Necesidades secundarias: Higiene, Social, Entrenamiento, Lealtad
  - [x] Sistema de niveles y experiencia
  - [x] Especialidades evolutivas: Datos, Seguridad, Red, Cifrado, Malware
- [x] Desarrollar sistema de cámara para diferentes vistas
  - [x] Vista por defecto 
  - [x] Vista superior
  - [x] Vista en primera persona
- [x] Añadir sistema de guardado local básico
- [x] Testing del prototipo y ajustes iniciales
  - [x] Corrección de z-index para visibilidad de UI
  - [x] Ajustes del comportamiento basado en necesidades
  - [x] Mensajes de notificación en español

## Sprint 2: Sistema de Combate (4 semanas)

### Semana 4: Core de Batalla
- [ ] Diseñar sistema ATB (Active Time Battle)
- [ ] Implementar clase BattleSystem
- [ ] Crear barra de tiempo y turnos
- [ ] Desarrollar enemigo básico con IA simple
- [ ] Implementar escena de batalla

### Semana 5: Mecánicas de Combate
- [ ] Implementar acciones básicas (atacar, defender)
- [ ] Desarrollar sistema de habilidades especiales
- [ ] Crear efectos visuales para ataques
- [ ] Implementar sistema de daño y ventajas elementales
- [ ] Añadir feedback visual durante combate

### Semana 6: Progresión de Combate
- [ ] Implementar sistema de experiencia y niveles
- [ ] Desarrollar subida de estadísticas al subir nivel
- [ ] Crear sistema de recompensas (items, exp)
- [ ] Implementar diferentes zonas de batalla
- [ ] Diseñar dificultad progresiva de enemigos

### Semana 7: Battle UI y Polishing
- [ ] Diseñar interfaz completa de batalla
- [ ] Implementar selección de objetivos
- [ ] Añadir sistema de items durante batalla
- [ ] Implementar tutoriales para sistema de combate
- [ ] Testing y balance inicial

## Sprint 3: Sistema de Evolución (4 semanas)

### Semana 8: Framework de Evolución
- [ ] Diseñar sistema de evolución no lineal
- [ ] Implementar clase EvolutionSystem
- [ ] Crear seguimiento de variables para evolución
- [ ] Desarrollar condiciones base para evolucionar
- [ ] Implementar primera línea evolutiva completa

### Semana 9: Modelos y Animaciones
- [ ] Modelar primeras evoluciones (5 tipos base)
- [ ] Crear texturas para cada evolución
- [ ] Implementar animaciones específicas por tipo
- [ ] Desarrollar transiciones de evolución
- [ ] Añadir efectos glitch durante evolución

### Semana 10: Sistema Completo
- [ ] Implementar matriz de evolución con condiciones
- [ ] Desarrollar sistema de notificación de evolución
- [ ] Crear pantalla de información de evoluciones
- [ ] Implementar evento de celebración post-evolución
- [ ] Testing del sistema completo

### Semana 11: Evoluciones Especiales
- [ ] Diseñar evoluciones especiales/secretas
- [ ] Implementar condiciones complejas
- [ ] Añadir pistas en el juego sobre evoluciones secretas
- [ ] Crear modelos y animaciones para evoluciones especiales
- [ ] Testing y balance del sistema

## Sprint 4: Componente Social (3 semanas)

### Semana 12: Infraestructura Social
- [ ] Configurar Firebase/backend para componente social
- [ ] Implementar sistema de usuarios y autenticación
- [ ] Desarrollar gestión de amigos (añadir, eliminar)
- [ ] Crear base de datos para sincronización
- [ ] Implementar sistema básico de notificaciones

### Semana 13: Sistema de Visitas
- [ ] Desarrollar envío de mascotas a amigos
- [ ] Implementar recepción de mascotas visitantes
- [ ] Crear IA para mascotas visitantes
- [ ] Añadir beneficios de compañía
- [ ] Desarrollar sistema de duración de visitas

### Semana 14: Social UI y Features
- [ ] Diseñar interfaz para componente social
- [ ] Implementar búsqueda de amigos
- [ ] Crear sistema de regalos y recompensas
- [ ] Añadir estadísticas sociales
- [ ] Testing del componente social completo

## Sprint 5: Contenido y Mundo (3 semanas)

### Semana 15: Hogar del Virus
- [ ] Diseñar entorno principal del hogar
- [ ] Implementar personalización básica
- [ ] Crear objetos interactivos
- [ ] Desarrollar ciclo día/noche
- [ ] Añadir efectos ambientales

### Semana 16: Zonas de Batalla
- [ ] Diseñar y modelar 5 zonas principales de batalla
- [ ] Implementar transiciones entre zonas
- [ ] Crear enemigos específicos por zona
- [ ] Añadir elementos interactivos en zonas
- [ ] Desarrollar zonas secretas/desbloqueables

### Semana 17: Contenido Adicional
- [ ] Implementar sistema de tienda
- [ ] Crear variedades de comida y juguetes
- [ ] Desarrollar coleccionables
- [ ] Añadir desafíos y logros
- [ ] Implementar eventos temporales básicos

## Sprint 6: Pulido y Optimización (3 semanas)

### Semana 18: UI/UX Final
- [ ] Pulir toda la interfaz de usuario
- [ ] Implementar tutoriales completos
- [ ] Crear animaciones de UI
- [ ] Mejorar feedback visual general
- [ ] Testing de usabilidad

### Semana 19: Optimización
- [ ] Optimizar rendimiento de renderizado
- [ ] Mejorar carga de recursos (lazy loading)
- [ ] Optimizar sincronización de red
- [ ] Reducir consumo de memoria
- [ ] Testing en diferentes dispositivos

### Semana 20: Testing y Lanzamiento
- [ ] Testing completo del juego
- [ ] Corregir bugs finales
- [ ] Implementar telemetría y analytics
- [ ] Preparar materiales para lanzamiento
- [ ] Lanzamiento de versión 1.0

## Tareas Continuas (Durante todo el desarrollo)
- [ ] Reuniones semanales de revisión y planificación
- [ ] Documentación del código y sistemas
- [ ] Control de versiones y branching
- [ ] Testing continuo de componentes
- [ ] Balance de juego

## Backlog (Post-lanzamiento)
- [ ] Implementar sistema PvP
- [ ] Desarrollar eventos temporales complejos
- [ ] Añadir más líneas evolutivas
- [ ] Crear sistema de gremios/clanes
- [ ] Implementar minijuegos para entrenar mascotas
- [ ] Desarrollar sistema de torneos
- [ ] Añadir logros y leaderboards globales
- [ ] Crear editor de apariencia para mascotas
- [ ] Implementar sistema de comercio entre jugadores
- [ ] Desarrollar funcionalidades para streaming/compartir

- [x] Implementar sistema para organizar estadísticas en tabs
  - [x] Pestaña de Necesidades
  - [x] Pestaña de Atributos
  - [x] Pestaña de Progreso
- [x] Limpiar el pet
- [x] Socializar con el pet
- [x] Sistema de estadísticas expandido
  - [x] Atributos básicos (Salud, Ataque, Defensa, Velocidad, Inteligencia)
  - [x] Atributos avanzados (Agilidad, Suerte, Resistencia, Adaptabilidad)
  - [x] Necesidades primarias (Hambre, Felicidad, Energía)
  - [x] Necesidades secundarias (Higiene, Social, Lealtad)
- [x] Sistema de niveles y experiencia
- [x] Eliminar sistema de entrenamiento
- [ ] Implementar sistema de distribución de puntos de estadísticas
  - [ ] Interfaz para asignar 5 puntos al subir de nivel
  - [ ] Permitir asignar puntos a diferentes atributos
  - [ ] Mostrar puntos disponibles
  - [ ] Botón para confirmar la asignación
- [ ] Implementar escena de batalla
  - [ ] Diseñar sistema ATB (Active Time Battle)
  - [ ] Crear clase BattleSystem
  - [ ] Implementar interfaz de batalla
  - [ ] Desarrollar enemigos básicos
  - [ ] Sistema de recompensas (EXP, drops)
  - [ ] Implementar primera zona de batalla temática (Servidor)