# SpotiTools

Toolbox for Spotify, with things I find useful.

## Features

- [ ] Selecting random album from your collection
- [ ] Selecting random song from your collection
- [ ] Ranking albums from your collection
- [ ] Saving all of artist's songs on a dedicated playlist

## Live Preview

TBD

## Setup

### Prerequisites

- [Bun](https://bun.sh) v1.4 (package manager and runtime)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spoti-tools
```

2. Install dependencies:
```bash
bun install
```

3. Copy `.env.example`, rename it to `.env.local` and fill it with proper environment variables.

4. Run the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Package manager**: Bun
- **Build**: Next.js (Turbopack)
- **Linter/formatter**: Biome
- **Framework**: Next.js (App Router)
- **UI library**: React
- **Styling**: Tailwind
