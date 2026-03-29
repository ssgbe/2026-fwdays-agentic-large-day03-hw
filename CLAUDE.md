# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Excalidraw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library published to npm as `@excalidraw/excalidraw`; entry point: `index.tsx`
- **`excalidraw-app/`** - Full-featured web application (excalidraw.com) that uses the library; entry point: `App.tsx`
- **`packages/common/`** - Shared constants, event bus, type helpers (`@excalidraw/common`)
- **`packages/element/`** - Element types, manipulation, binding, bounds, collision (`@excalidraw/element`)
- **`packages/math/`** - Strongly typed geometry primitives (`@excalidraw/math`)
- **`packages/utils/`** - Utility functions (`@excalidraw/utils`)
- **`examples/`** - Integration examples (NextJS, browser script)

## Development Commands

```bash
yarn start               # Start the excalidraw-app dev server
yarn test:typecheck      # TypeScript type checking
yarn test:update         # Run all tests with snapshot updates (run before committing)
yarn test:app            # Run vitest (main test runner)
yarn fix                 # Auto-fix formatting and linting issues
yarn build:packages      # Build all core packages (common → math → element → excalidraw)
yarn build:app           # Build the web application
```

### Running a single test file

```bash
yarn vitest packages/excalidraw/clipboard.test.ts
yarn vitest packages/math/tests/point.test.ts
```

## Architecture

### State Management

Uses **Jotai** (atom-based) for state:
- `editorJotaiStore` in `packages/excalidraw/` — editor state atoms
- `appJotaiStore` in `excalidraw-app/` — app-level atoms (collab, offline status)
- Access via `useAtom`, `useAtomValue`, `useSetAtom` hooks
- Context providers: `EditorJotaiProvider`, `ExcalidrawAPIProvider`

### Element Type System

Elements use **branded discriminated unions** defined in `packages/element/src/types.ts`:
- Base: `_ExcalidrawElementBase` (id, x, y, dimensions, styling, `version`, `versionNonce` for collaboration, `index` for fractional indexing)
- Specific: `ExcalidrawRectangleElement`, `ExcalidrawArrowElement`, `ExcalidrawTextElement`, etc.

### Math Library

`packages/math/src/types.ts` defines branded geometric types. Always use these — never raw `{x, y}` objects:
- `GlobalPoint`, `LocalPoint`, `GlobalCoord`, `LocalCoord`
- `Vector`, `Line`, `LineSegment`, `Triangle`, `Rectangle`, `Polygon`, `Curve`, `Ellipse`

### Testing Setup

- Framework: Vitest + React Testing Library + jsdom
- `setupTests.ts` mocks canvas (`vitest-canvas-mock`), fonts, IndexedDB (`fake-indexeddb`), pointer capture, and RAF throttling
- Coverage thresholds: 60% lines/statements, 63% functions, 70% branches

### Package System

- Yarn workspaces monorepo; internal packages use path aliases (see `vitest.config.mts`)
- Build: esbuild for packages, Vite for the app
- TypeScript strict mode throughout

## Coding Standards

### TypeScript
- Prefer performant solutions; trade RAM for fewer CPU cycles where sensible
- Prefer immutable data (`const`, `readonly`)
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Always include `packages/math/src/types.ts` context when writing math-related code

### React
- Functional components with hooks only (no class components)
- CSS modules for component styling
- Keep components small and focused

### Naming
- PascalCase: component names, interfaces, type aliases
- camelCase: variables, functions, methods
- ALL_CAPS: constants
