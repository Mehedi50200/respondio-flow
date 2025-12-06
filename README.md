# Respond.io Flow Chart Application

A comprehensive Vue 3 application for creating, editing, and managing flow chart nodes with a modern, intuitive interface. This application provides a visual canvas for building conversation flows with support for multiple node types, attachments, business hours configuration, and more.

## Technology Stack

- **Vue 3** (Composition API) - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router for Vue.js
- **Vue Flow** - Flow chart library for canvas functionality
- **TanStack Query** - Data fetching and caching with optimized configuration
- **TypeScript** - Type safety and better developer experience
- **Vitest** - Unit testing framework

## Project Structure

```
respondio-flow/
├── mock/
│   └── payload.json              # Mock node data (JSON payload)
├── docs/
│   ├── requirements.md           # Project requirements
│   └── progress.md               # Development progress tracker
├── src/
│   ├── assets/
│   │   └── icons/                # SVG icons for nodes and UI
│   ├── components/
│   │   ├── nodes/                # Node type components
│   │   │   ├── TriggerNode.vue
│   │   │   ├── SendMessageNode.vue
│   │   │   ├── AddCommentNode.vue
│   │   │   ├── BusinessHoursNode.vue
│   │   │   └── DateTimeConnectorNode.vue
│   │   ├── CreateNodeModal.vue   # Node creation modal
│   │   ├── NodeDetailsDrawer.vue  # Node details side drawer
│   │   ├── FlowCanvas.vue        # Main canvas component
│   │   ├── NodeAddButton.vue     # Add node button
│   │   └── ThemeToggle.vue       # Dark/light theme toggle
│   ├── composables/
│   │   ├── useNodesQuery.ts      # Query composables for data fetching
│   │   └── useTheme.ts           # Theme management composable
│   ├── router/
│   │   └── index.ts               # Vue Router configuration
│   ├── stores/
│   │   └── index.ts               # Pinia store for nodes management
│   ├── styles/
│   │   ├── theme.css              # Theme variables and dark mode
│   │   └── nodes.css              # Shared node component styles
│   ├── tests/
│   │   ├── components/             # Component tests
│   │   ├── composables/           # Composable tests
│   │   ├── stores/                # Store tests
│   │   └── utils/                 # Utility function tests
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── utils/
│   │   └── nodeTransform.ts       # Node transformation utilities
│   ├── views/
│   │   └── FlowChartView.vue      # Main view component
│   ├── App.vue                    # Root component
│   ├── main.ts                    # Application entry point
│   └── style.css                  # Global styles
├── package.json
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md
```

## Prerequisites

- **Node.js**: Version 18.20.8 or higher (Node 18+ required)
- **npm**: Version 10.8.2 or higher
- **nvm**: Recommended for Node.js version management

### Node.js Version Management

This project includes an `.nvmrc` file for consistent Node.js version management.

**If you have nvm installed:**
```bash
# Automatically switch to the correct Node.js version
nvm use

# Or install the version if not already installed
nvm install
```

**Without nvm:**
Make sure you have Node.js 18.20.8 or higher installed. You can download it from [nodejs.org](https://nodejs.org/).

## Setup Instructions

1. **Switch to correct Node.js version (if using nvm):**
   ```bash
   nvm use
   ```

2. **Install dependencies:**
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

## Features

### Core Functionality
- ✅ **Flow Chart Canvas** - Interactive canvas with Vue Flow for node visualization
- ✅ **Node Management** - Create, edit, and delete nodes with different types
- ✅ **Draggable Nodes** - Move nodes across the canvas with smooth animations
- ✅ **Node Details Drawer** - Side drawer for viewing and editing node properties
- ✅ **URL-based Navigation** - Access nodes via URL with node ID parameter
- ✅ **Theme Support** - Light and dark mode with system preference detection

### Node Types
1. **Trigger Node** - Conversation opened/message received triggers
2. **Send Message Node** - Text messages with image attachments support
3. **Add Comment Node** - Internal comments for documentation
4. **Business Hours Node** - Time-based conditions with timezone support
5. **DateTime Connector** - Success/failure branches (display only)

### Advanced Features
- ✅ **Attachments Management** - Upload, preview, and remove image attachments
- ✅ **Business Hours Configuration** - Weekly schedule with time pickers
- ✅ **Form Validations** - Comprehensive validation with real-time feedback
- ✅ **Edge Labels** - Styled success/failure labels on edges
- ✅ **Node Position Preservation** - Maintains layout when adding new nodes
- ✅ **Edge Preservation** - Connectors properly maintained in node hierarchy

## Setup Instructions

### Prerequisites

- **Node.js**: Version 18.20.8 or higher (Node 18+ required)
- **npm**: Version 10.8.2 or higher
- **nvm**: Recommended for Node.js version management

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd respondio-flow
   ```

2. **Switch to correct Node.js version (if using nvm):**
   ```bash
   nvm use
   # Or install the version if not already installed
   nvm install
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

7. **Run tests:**
   ```bash
   npm test
   ```

8. **Run tests with UI:**
   ```bash
   npm run test:ui
   ```

9. **Type checking:**
   ```bash
   npm run type-check
   ```

## Testing

The project includes comprehensive unit tests using Vitest:

- **Component Tests** - Test Vue components with Vue Test Utils
- **Composable Tests** - Test composable functions and hooks
- **Store Tests** - Test Pinia store actions and state management
- **Utility Tests** - Test transformation and helper functions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
src/tests/
├── components/          # Component tests
│   ├── CreateNodeModal.test.ts
│   └── NodeDetailsDrawer.test.ts
├── composables/         # Composable tests
│   ├── useNodesQuery.test.ts
│   └── useTheme.test.ts
├── stores/             # Store tests
│   └── nodes.test.ts
└── utils/              # Utility tests
    └── nodeTransform.test.ts
```

## Design Decisions

### Architecture

1. **Composition API** - Used throughout for better code organization and reusability
2. **Pinia Store** - Centralized state management for nodes and edges
3. **Vue Router** - URL-based navigation for node details drawer
4. **TanStack Query** - Data fetching with optimized configuration:
   - `refetchOnWindowFocus: false` - Prevents unnecessary refetches
   - `networkMode: 'always'` - Ensures network requests
   - `staleTime: Infinity` - Data never considered stale
   - `gcTime: 60 * 60 * 1000` - 1 hour garbage collection

### State Management

- **Pinia Store** manages nodes, edges, and selected node state
- **TanStack Query** handles data fetching and mutations
- **Local Storage** persists theme preference

### Styling Approach

- **CSS Variables** for theming (light/dark mode)
- **Scoped Styles** for component-specific styles
- **Shared Styles** for common node components
- **Responsive Design** with mobile-friendly layouts

### Node Transformation

- **Payload Format** - Original JSON structure from `mock/payload.json`
- **Vue Flow Format** - Transformed structure for Vue Flow library
- **Bidirectional Conversion** - Transform between formats as needed
- **Position Calculation** - Smart positioning for new nodes

### Form Validation

- **Real-time Validation** - Immediate feedback on user input
- **Field-level Errors** - Specific error messages per field
- **Character Counters** - Visual feedback for text length
- **File Validation** - Type and size validation for uploads

## Key Components

### FlowCanvas
Main canvas component that displays the flow chart using Vue Flow. Handles:
- Node rendering and selection
- Edge display with labels
- Node dragging
- Navigation to node details

### NodeDetailsDrawer
Side drawer component for viewing and editing node properties. Features:
- Editable title and description
- Type-specific configuration forms
- Attachment management (for Send Message nodes)
- Business hours configuration (for Business Hours nodes)
- Delete functionality with confirmation

### CreateNodeModal
Modal component for creating new nodes. Includes:
- Form validation
- Node type selection
- Title and description fields
- Parent node selection

## API Reference

### Composables

#### `useNodesQuery()`
Fetches nodes from mock/payload.json and transforms them to Vue Flow format.

```typescript
const { data, isLoading, isError } = useNodesQuery()
```

#### `useCreateNodeMutation()`
Creates a new node with the specified data.

```typescript
const mutation = useCreateNodeMutation()
await mutation.mutateAsync({
  type: 'sendMessage',
  title: 'Node Title',
  description: 'Node Description',
  parentId: 'parent-node-id'
})
```

#### `useUpdateNodeMutation()`
Updates an existing node.

```typescript
const mutation = useUpdateNodeMutation()
await mutation.mutateAsync({
  nodeId: 'node-id',
  updates: {
    data: { label: 'Updated Label' }
  }
})
```

#### `useDeleteNodeMutation()`
Deletes a node and its children recursively.

```typescript
const mutation = useDeleteNodeMutation()
await mutation.mutateAsync('node-id')
```

#### `useTheme()`
Manages application theme (light/dark mode).

```typescript
const { theme, toggleTheme, setTheme, initTheme } = useTheme()
```

### Store Methods

#### `useNodesStore()`
Pinia store for node management.

```typescript
const store = useNodesStore()

// Methods
store.setNodes(nodes)
store.setEdges(edges)
store.addNode(node)
store.updateNode(nodeId, updates)
store.deleteNode(nodeId)
store.getNodeById(nodeId)
store.getChildrenNodes(parentId)
store.updateNodePosition(nodeId, position)
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Production Build:**
   The project uses Vite, which generates optimized production builds automatically.

### Environment Variables

No environment variables are required for basic functionality. The application uses local JSON data.

### Build Configuration

The project is configured for Vercel deployment with:
- Automatic build detection
- Optimized production builds
- Static asset handling

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow Vue 3 Composition API best practices
- Use Pinia for state management
- Use Vue Router for navigation
- Write unit tests for components and utilities
- Keep code well-organized and documented

### Git Workflow

- Use conventional commit messages (feat:, fix:, docs:, test:, etc.)
- Create feature branches for new features
- Write tests before implementing features (TDD approach)
- Keep commits focused and atomic

### Best Practices

1. **Component Organization** - Keep components focused and reusable
2. **State Management** - Use Pinia for global state, props for local state
3. **Type Safety** - Leverage TypeScript for better code quality
4. **Testing** - Write tests for critical functionality
5. **Performance** - Use computed properties and watchEffect appropriately
6. **Accessibility** - Include ARIA labels and keyboard navigation

## Troubleshooting

### Common Issues

1. **Node positions reset after adding new node**
   - Solution: Position preservation is implemented. Ensure you're using the latest version.

2. **Edges not showing**
   - Solution: Check that connectors are properly stored in `originalData`.

3. **Theme not persisting**
   - Solution: Check browser localStorage permissions.

4. **Tests failing**
   - Solution: Ensure all dependencies are installed and Node.js version is correct.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Submit a pull request

## License

MIT

## Acknowledgments

- Vue Flow for excellent canvas functionality
- TanStack Query for powerful data fetching
- Vue.js team for the amazing framework

