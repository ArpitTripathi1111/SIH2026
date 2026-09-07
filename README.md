```markdown
# 🏕️ Area-Specific Shelter for Thermal Comfort (SIH26051)

> **Smart India Hackathon 2026** | **Team Code Titans** | **Problem Statement: SIS26051**

An Engineering Decision Support System (EDSS) to design, simulate, and optimize area-specific shelters for thermal comfort across India's extreme microclimatic zones.

## 📖 Table of Contents
- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Regulatory Compliance Engine](#regulatory-compliance-engine)
- [Output Metrics](#output-metrics)
- [Getting Started](#getting-started)
- [Usage Workflow](#usage-workflow)
- [Team Members](#team-members)

## 🚀 About the Project
Conventional emergency and modular shelters rely on generic, one-size-fits-all designs that fail in extreme climates, leading to dangerous indoor overheating or severe hypothermia. This software-based model prioritizes passive building envelope interventions to reduce or eliminate fuel logistics and operational emissions.

It provides field engineers with a real-time, offline-capable computational tool to evaluate how changes in architectural parameters (roof pitch, overhang depth, wall thickness, materials) dynamically impact thermal lag, ventilation, and structural load over a 24-hour cycle. 

## ✨ Key Features
* **Parametric 2D & 3D CAD Visualizer**: Synchronous 3D solid-mesh and 2D drafting interface (Front Elevation, Top Plan, Side Cross-Sections) with live thermal flux vector modeling and dynamic sun path tracking.
* **8 Regional Archetypes**: Pre-configured geometries optimized for specific terrains: Standard Cuboid, A-Frame/Pitched, Gabled Roof Cuboid, Geodesic Dome, Cylindrical/Yurt, Hexagonal Pod, Lean-to/Sloped, and Butterfly Roof.
* **Microclimatic Telemetry Simulator**: Real-time dynamic weather synchronization for high-stress zones (e.g., Ladakh, Jaisalmer, Gangetic Basin).
* **Interactive Parametric Controls**: Continuous slider adjustments for Wall Thickness, Window-to-Wall Ratio (WWR), Roof Pitch/Height, and Chhajja Depth.
* **AI Building Physicist**: A heuristic engine providing contextual critiques on envelope U-values, Surface Area-to-Volume (SA/V) ratios, and solar heat gain coefficients.
* **Local Data Management**: Complete browser-side execution with JSON state import/export and local storage caching.

## 🛡️ Regulatory Compliance & Auto-Correction
The system continuously monitors active parameters against Indian statutory standards, including **IMAC 2014/2026**, **NBC 2016 (Parts 6 & 8)**, **ECBC 2017**, and **NDMA Guidelines**.

* **Auto-Fix All Violations**: A one-click feature that mathematically optimizes interventions to snap the design back to code compliance without breaking functional ergonomics. It automatically injects continuous thermal insulation, adjusts overhang depth to eliminate summer solar gain, caps the WWR, and sets minimum safe roof pitches for snow loads.

## 📊 Output Metrics
The platform provides highly granular engineering outputs ready for field deployment:
* **24-Hour Diurnal Thermal Performance**: Maps dynamic operative temperature against the IMAC comfort band.
* **Thermal Attenuation (%)**: Percentage of outdoor heat effectively blocked by the envelope.
* **Thermal Time Lag (Hours)**: Delay between peak outdoor and indoor temperatures.
* **Thermal Transmittance**: Real-time U-Value ($W/m^2 \cdot K$) of multi-layered assemblies.
* **Itemized Bill of Quantities (BOQ)**: Material quantity estimation, structural dead-weight tally (kg), and approximate local cost estimations (INR).

## 🛠️ Getting Started

*(Note: Adjust the commands below based on your specific package manager and framework)*

```bash
# Clone the repository
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

# Navigate into the directory
cd your-repo-name

# Install dependencies
npm install

# Start the local development server
npm run dev

```

## 💻 Usage Workflow

1. **Select Target Climate**: Choose the deployment zone (Mountain, Desert, River) to load localized meteorological telemetry.
2. **Define Base Geometry**: Select one of the 8 architectural forms based on terrain constraints.
3. **Parametric Customization**: Adjust Wall Thickness, WWR, and Roof Pitch sliders to scale the 3D model.
4. **Assign Materials**: Select wall and roof compositions based on local availability and thermal inertia requirements.
5. **Review Simulation**: Monitor the 24-Hour Thermal Performance graph and AI Physicist review to ensure indoor temperatures remain within the IMAC band.
6. **Auto-Correct Vulnerabilities**: If the compliance board flags a Critical (Red) or Warning (Amber) violation, click "Auto-Fix All Violations" to enforce statutory safety codes.
7. **Save & Export**: Save the design to local JSON storage, or click "Print Report" to generate a comprehensive PDF dossier containing CAD drawings, BOQ, and compliance certificates.

## 👥 Team Members

* Arpit Tripathi [Captain]
* Divyansh Rastogi 
* Shiv Prakash Mishra
* Anishka Mishra
* Dhananjay Kumar Yadav
* Himanshu Yadav

```

```
