# Respond.io Flow Chart Application

A Vue 3 application for creating, editing, and managing flow chart nodes.

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router for Vue.js
- **Vue Flow** - Flow chart library
- **TanStack Query** - Data fetching and caching

## Project Structure

```
respondio-flow/
├── assets/
│   └── payload.json          # Initial node data
├── src/
│   ├── components/           # Vue components
│   ├── composables/          # Composable functions
│   ├── router/               # Vue Router configuration
│   ├── stores/               # Pinia stores
│   ├── utils/                # Utility functions
│   ├── views/                # Page components
│   ├── App.vue               # Root component
│   ├── main.js               # Application entry point
│   └── style.css             # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Development Guidelines

- Follow Vue 3 Composition API best practices
- Use Pinia for state management
- Use Vue Router for navigation
- Write unit tests for components and utilities
- Keep code well-organized and documented

## Design Decisions

- Using Composition API for better code organization
- Pinia for centralized state management
- Vue Flow for canvas functionality
- TanStack Query for data fetching with specified configuration

## License

MIT

