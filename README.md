# Respond.io Flow Chart Application

A Vue 3 application for creating, editing, and managing flow chart nodes with a visual canvas interface.

## Technology Stack

- Vue 3 (Composition API)
- Vite
- Pinia
- Vue Router
- Vue Flow
- TanStack Query
- TypeScript
- Vitest

## Prerequisites

- Node.js 18.20.8 or higher
- npm 10.8.2 or higher

## Setup

1. **Install Node.js version:**
   ```bash
   nvm use
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Type check:**
   ```bash
   npm run type-check
   ```

## Features

### Flow Chart Canvas
- Display nodes from `mock/payload.json` using Vue Flow
- Draggable nodes for repositioning

### Create Node
- Create nodes with Title, Description, and Type
- Node types: Send Message, Add Comment, Business Hours

### Node View
- Display node icon, title, and truncated description

### Node Details Drawer
- Accessible via URL with node ID
- Editable title and description
- Delete node functionality
- Type-specific features:
  - **Send Message**: Attachment management, text editing
  - **Add Comment**: Comment editing
  - **Business Hours**: Time picker for weekly schedule, timezone selection

## Project Structure

```
respondio-flow/
├── mock/
│   └── payload.json
├── src/
│   ├── components/
│   │   ├── nodes/
│   │   ├── FlowCanvas.vue
│   │   ├── NodeDetailsDrawer.vue
│   │   └── CreateNodeModal.vue
│   ├── composables/
│   ├── stores/
│   ├── utils/
│   └── tests/
└── package.json
```

## Testing

Tests are located in `src/tests/`:
- Composable tests
- Store tests
- Utility tests

Run tests:
```bash
npm test
```

## Deployment

Deploy to Vercel:
```bash
npm i -g vercel
vercel
```
