# Shed Builder

An interactive web application for designing custom sheds, estimating materials and costs, and generating detailed build plans. Visualize your design in 2D and 3D, then export a comprehensive PDF with materials lists, cut lists, and step-by-step build instructions.

**[Live Demo](https://kevindowling.github.io/shed_builder/)**

## Features

- **Custom shed design** — configure dimensions, roof style (gable, lean-to, gambrel, hip), foundation type, siding material, and framing options
- **Wall openings** — add and position doors, windows, and loft doors on any wall
- **3D preview** — interactive Three.js scene with orbit controls, shadows, and optional framing visualization
- **2D editor** — top-down Konva canvas with grid overlay, dimension labels, and drag-to-place openings
- **Materials calculator** — automatic lumber, sheathing, siding, roofing, and fastener estimates based on your design
- **Cut list generator** — piece-by-piece cutting instructions for every component
- **Cost estimation** — real-time totals with fully editable material pricing
- **Build instructions** — step-by-step construction guide
- **PDF export** — full build plan document including a 3D render, materials list, cut list, costs, and instructions
- **Save/load designs** — persist multiple designs to browser localStorage
- **Undo/redo** — 50-state history for design changes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript |
| Build | Vite 7 |
| 3D rendering | Three.js, React Three Fiber, Drei |
| 2D canvas | Konva, React Konva |
| State management | Zustand, Zundo (undo/redo) |
| Styling | Tailwind CSS v4 |
| PDF generation | jsPDF, jspdf-autotable |

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** (comes with Node.js)

### Install and run

```bash
# Clone the repository
git clone https://github.com/KevinDowling/shed_builder.git
cd shed_builder

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173/shed_builder/`.

### Other scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check with TypeScript then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── App.tsx                 # Root component and view routing
├── components/
│   ├── layout/             # App shell, toolbar, view toggle
│   ├── sidebar/            # Design config panels (dimensions, roof, materials, openings, framing)
│   ├── buildplan/          # Build plan view (materials, costs, instructions, cut list)
│   ├── preview3d/          # 3D scene (shed model, walls, floor, roof)
│   └── editor2d/           # 2D canvas editor
├── store/
│   ├── useShedStore.ts     # Shed design state with undo/redo
│   ├── useUIStore.ts       # UI state (view mode, selections, modals)
│   └── usePriceStore.ts    # Editable material pricing
├── engine/
│   ├── calculator/         # Material, cost, cut list, and instruction calculations
│   ├── geometry/           # 3D mesh generation for walls, roof, textures
│   └── pdf/                # PDF export logic
├── types/                  # TypeScript interfaces (shed, buildPlan, materials)
├── hooks/                  # Custom hooks (undo/redo, localStorage)
├── constants/              # Defaults, material pricing data, roof style definitions
└── utils/                  # Formatting and validation helpers
```

## Contributing

1. Fork the repo and create a feature branch from `master`
2. Install dependencies with `npm install`
3. Run `npm run dev` to start the dev server
4. Make your changes — the app hot-reloads automatically
5. Run `npm run lint` and `npm run build` to check for issues before committing
6. Open a pull request against `master`

### Architecture notes

- **State** lives in Zustand stores under `src/store/`. Design state supports undo/redo via Zundo.
- **Calculation logic** is isolated in `src/engine/calculator/` — each file handles one concern (framing, roofing, siding, etc.).
- **3D geometry** generation is in `src/engine/geometry/`, separate from the React components that render it.
- **Components** are organized by feature area, not by type.

## Deployment

The project auto-deploys to GitHub Pages on every push to `master` via `.github/workflows/deploy.yml`. The Vite base path is set to `/shed_builder/` in `vite.config.ts`.

## License

This project does not currently specify a license. Contact the repository owner for usage terms.
