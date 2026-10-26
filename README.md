# SENTINEL // SOC - Live Cyber Attack Map

> A real-time simulation of a Security Operations Center (SOC) dashboard.

SENTINEL is a front-end portfolio project that recreates the look and feel of a modern
Security Operations Center. It visualizes simulated cyber attacks on an interactive world
map and presents live-style telemetry in a focused, dark-themed dashboard — all running
entirely in the browser.

## Overview

The dashboard is designed to demonstrate how live security events can be presented
clearly: an interactive map at the center, with supporting metrics and event information
that update as the simulation runs. Everything is client-side, with no backend, database,
or external security feed required.

## Features

- Interactive world map powered by Leaflet.js
- Simulated cyber attack events plotted as they occur
- SOC-style dashboard with live counters and status panels
- Dark, modern interface built for at-a-glance monitoring
- Fully responsive layout for desktop and mobile
- No build step — open the page and the simulation runs

## Tech Stack

| Technology | Role |
| --- | --- |
| **HTML5** | Semantic page structure and dashboard layout |
| **CSS3** | Dark SOC theme, responsive layout, and animations |
| **Vanilla JavaScript** | Simulation logic, DOM updates, and map interaction |
| **Leaflet.js** | Interactive world map and geographic visualization |

## Getting Started

No installation or build step is required.

1. Clone the repository:

   ```bash
   git clone https://github.com/aminemouhamedamine2000-star/cyber-attack-map.git
   cd cyber-attack-map
   ```

2. Open `index.html` in your browser.

   For the best experience, you can also serve the folder with any static file server:

   ```bash
   npx serve .
   ```

## Project Structure

```text
cyber-attack-map/
├── index.html    # Dashboard markup and layout
├── style.css     # SOC theme and responsive styling
├── script.js     # Simulation and map behaviour
├── docs/         # Supporting project documentation
└── README.md
```

## Disclaimer

> **Educational simulation only.**
>
> SENTINEL is a demonstration project. All cyber attack events, locations, IP addresses,
> statistics, and other activity shown in the dashboard are simulated or hard-coded for
> illustrative purposes. This project does **not** capture, monitor, or display real
> network traffic, and it is **not** intended for operational security monitoring.
>
> No real-world attack data is collected or used.

## Acknowledgements

- [Leaflet.js](https://leafletjs.com/) for the interactive mapping library.
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map data.

---

Built as a portfolio project to explore front-end data visualization and SOC interface design.
