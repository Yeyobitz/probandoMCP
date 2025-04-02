# DigiVirus - Planificación del Proyecto

## Visión General
DigiVirus es un simulador de mascotas virtuales 3D inspirado en Digimon, con gráficos low poly estilo PS1 y un fuerte componente social. Los jugadores crían, entrenan y hacen evolucionar a sus mascotas virtuales (virus digitales) a través de un sistema no lineal de evolución, combates por turnos dinámicos y la interacción con amigos.

## Arquitectura del Proyecto

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript
- **Renderizado 3D**: Three.js
- **Backend/Social**: Firebase (o backend ligero)
- **Almacenamiento**: LocalStorage/IndexedDB y almacenamiento en la nube

### Estructura de Directorios
```
/
├── index.html
├── public/
│   └── assets/
│       ├── pets/           # Modelos de mascotas
│       └── textures/       # Texturas pixeladas y patrones glitch
├── src/
│   ├── main.js             # Punto de entrada
│   ├── engine/             # Motor del juego
│   ├── game/               # Lógica del juego
│   │   └── pet.js          # Clase de mascota y comportamiento
│   ├── ui/                 # Interfaz de usuario
│   ├── network/            # Componente online
│   ├── shaders/            # Shaders personalizados
│   └── util/               # Utilidades
├── tests/                  # Pruebas unitarias
├── node_modules/           # Dependencias
├── TASK.md                 # Tareas y progreso
├── PETS.md                 # Definición de mascotas
├── PLANNING.md             # Este documento
├── package.json            # Configuración del proyecto
├── package-lock.json       # Control de versiones de dependencias
├── .eslintrc.json          # Configuración de linting
├── .prettierrc.json        # Configuración de formato
└── .gitignore              # Archivos ignorados por git
```

## Objetivos y Características

### Objetivos Principales
1. Crear una experiencia nostálgica con gráficos low poly estilo PS1
2. Desarrollar un sistema de evolución no lineal y complejo
3. Implementar un componente social robusto que fomente la interacción
4. Ofrecer un sistema de combate por turnos dinámico y estratégico
5. Lograr una estética única de "virus digital" con efectos glitch distintivos

### Características Core

#### Sistema de Mascotas
- 5 tipos base de mascotas iniciales
- Estadísticas: Salud, Ataque, Defensa, Velocidad, Inteligencia
- Necesidades: Hambre, Felicidad, Energía
- Personalidad que evoluciona según cómo el jugador interactúa con la mascota

#### Sistema de Evolución
- Sistema no lineal con más de 50 posibles evoluciones finales
- Evoluciones basadas en múltiples variables:
  - Socialización (visitas a amigos)
  - Estilo de combate
  - Alimentación
  - Nivel de felicidad
  - Tipo de entrenamiento
- Evoluciones especiales y secretas mediante combinaciones específicas

#### Sistema de Combate
- Turnos dinámicos (ATB) con barras de tiempo basadas en velocidad
- 4 tipos de acciones: Ataques básicos, Habilidades especiales, Ítems, Cambio de postura
- Ventajas/desventajas elementales: Datos, Seguridad, Red, Cifrado, Malware
- Batallas con aliados visitantes que actúan según su propia IA

#### Componente Social
- Sistema de amigos (agregar, eliminar, buscar)
- Envío de mascotas para visitar a amigos
- Beneficios de compañía en batalla (más experiencia, enemigos más fuertes, mejores recompensas)
- Intercambio de ítems y regalos

#### Mundo y Exploración
- Hogar personalizable del virus
- Múltiples zonas de batalla temáticas (Servidor, Red, Nube, Firewall, etc.)
- Zonas secretas desbloqueables
- Eventos especiales temporales

## Estilo Visual y Artístico

### Estética PS1 Low Poly
- Modelos con pocos polígonos (300-800 por modelo)
- Texturas pixeladas de baja resolución (64x64, 128x128)
- "Texture warping" y "vertex jitter" característicos de PS1
- Profundidad de color limitada (dithering)
- Sin filtrado bilineal (texturas "crudas")

### Efectos Glitch
- Distorsiones aleatorias en texturas y modelos
- Partículas de "datos" y efectos pixelados
- Corrupción visual durante evoluciones o habilidades especiales
- Paleta de colores vibrantes y contrastantes

### Diseño de Sonido
- Música chiptune/synth wave con elementos glitch
- Efectos de sonido digitales y distorsionados
- "Voces" generadas proceduralmente para las mascotas

## Restricciones y Limitaciones

### Técnicas
- Debe funcionar en navegadores modernos sin plugins
- Optimizado para mantener 60 FPS en dispositivos de gama media
- Consumo de RAM controlado (<500MB)
- Sincronización eficiente para minimizar tráfico de red

### De Diseño
- Cada mascota limitada a aprender 8 habilidades (máximo 4 activas)
- Máximo 3 mascotas enviadas a amigos simultáneamente
- Ciclo día/noche acelerado (1 día completo = 30 minutos reales)
- Balance cuidadoso de dificultad para jugadores nuevos vs. experimentados

### De Negocio
- Primera versión enfocada en retención y viralidad, no monetización
- Potencial futuro para monetización ética (cosméticos, expansiones)
- Estrategia de crecimiento orgánico basada en el componente social

## Fases de Implementación

### Fase 1: MVP (Producto Mínimo Viable)
- Un tipo de mascota base con 3 evoluciones
- Sistema básico de estadísticas y necesidades
- Combate funcional con 3-5 tipos de enemigos
- Renderizado 3D con shaders PS1 básicos

### Fase 2: Expansión Core
- 5 tipos base de mascotas con sus evoluciones primarias
- Sistema completo de combate ATB
- Elementos básicos del componente social
- 3 zonas de batalla

### Fase 3: Versión Completa
- Sistema de evolución no lineal completo
- Componente social completo con visitas
- Todas las zonas de batalla
- Eventos temporales y coleccionables

### Fase 4: Post-lanzamiento
- Nuevas líneas evolutivas
- Eventos especiales
- Mejoras basadas en feedback de usuarios
- Potenciales características multijugador avanzadas (PvP, gremios)

## KPIs y Métricas de Éxito

- **Retención D1, D7, D30**: Objetivos de 60%, 30%, 15% respectivamente
- **Sesiones por usuario**: Meta de 5+ sesiones semanales por usuario activo
- **Interacción social**: 70% de usuarios activos con al menos una interacción social semanal
- **Progresión**: 90% de jugadores alcanzan al menos una evolución en los primeros 3 días
- **Viralidad**: K-factor objetivo de 0.3 (cada 10 usuarios traen 3 nuevos)
