# EventFlow — Smart Crowd Management for NMS

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://studio-5460981965-b6a76.web.app/)
[![Watch the Demo Video](https://img.shields.io/badge/Watch_Demo-Video-red?style=for-the-badge&logo=youtube)](https://youtube.com/your-demo-link-here)


![EventFlow Architecture](public/icon.svg)




## Problem Statement
Managing a crowd of 132,000 people at a venue like the Narendra Modi Stadium (NMS) presents overwhelming logistical challenges. Massive sudden surges during entry, exit, or intermission lead to dangerous bottlenecks, anxiety-inducing wait times, and extreme strain on ground staff. Traditional PA announcements and static signages fail because they lag behind real-time shifts in density and often incite panic by directing massive uncoordinated swarms toward singular "optimal" choke-points. The fundamental physical event experience is heavily degraded by unpredictable crowding.

## Screenshots

### Attendee Portal (Fan PWA)
![Attendee Portal](public/screenshots/attendee.png)
*Personalized match plan with live zone status*

### Staff Panel (Ground Steward)  
![Staff Panel](public/screenshots/staff.png)
*One-tap zone reporting with instant control room sync*

### Control Room (Command Center)
![Control Room](public/screenshots/control.png)
*Live NMS schematic with crowd density simulation*

## Our Vertical
**Physical Event Experience** — Narendra Modi Stadium, Ahmedabad (132,000 capacity cricket venue)

## The Core Insight
Existing crowd control solutions dictate behavior uniformly—blasting "Use Gate C" to 50,000 people at once, which merely shifts the bottleneck rather than solving it. 
**Our trust-first approach** fundamentally shifts paradigm: we do not command the crowd; we transparently surface hyper-local realities. By giving subsets of users slightly divergent, personally optimized data based on live density variables, we establish deep trust. Users make self-interested decisions that naturally map to systemic equilibrium. 

## Biomimicry Approach  
We sought answers from nature, leveraging evolutionary algorithms of swarm intelligence:
* **Ant Pheromone Logic**: Like ants follow the strongest trail, EventFlow dynamically degrades the digital signal (UI routing prominence) of crowded paths and reinforces clear ones. 
* **Fish School Coordination**: Like fish seamlessly maintaining distance while moving as a macro-unit, EventFlow latently coordinates groups of similar size and destination together—distributing the load organically.
* **Waggle Dance Pre-Planning**: Much like bees reporting the best nectar sources to prepare the hive, our pre-match attendee intake allows us to model intended flow loads before fans even reach the perimeter.

## Solution Architecture
EventFlow operates concurrently across a highly-resilient, three-panel topology:

1. **Attendee Portal (`/`)**
   A mobile-first, Progressive Web App (PWA) designed for fans. It provides personalized arrival plans, live route guidance (optimized away from surges), smart contextual nudges (e.g., "Grab food now, N2 queue is 2 mins"), SOS functionalities, and instant translation across 5 native languages. Works offline via Service Worker caching.
2. **Staff Panel (`/staff`)**
   An ultra-fast, one-handed mobile reporting UI deployed to ground stewards. It enables rapid status updates (Clear vs. Crowded), quick-emoji incident reporting, and real-time receipt/acknowledgment of commands issued by the central command.
3. **Control Room (`/control`)**
   A data-dense, desktop-first command center featuring a live interactive SVG simulation of the NMS schematic. It acts as the algorithmic brain, pulling ground-truth from stewards, projecting density heatmaps, and allowing dispatchers to push targeted instructions or "Zero-Friction Nudges."

## Google Services Used
- **Firebase Realtime Database** — Enables the lightning-fast, tridirectional live sync between Attendee, Staff, and Control panels via WebSocket listeners.
- **Firebase Hosting** — Deployment pipeline for the edge-cached frontend.
- **Google Maps JavaScript API** — Drives the localized attendee venue representations and navigational waypointing.
   - Map centered on NMS: lat 23.0925, lng 72.5952
   - SVG fallback map included for offline/no-key usage
- **Google Translate API** — Empowers our underlying dynamically loaded `i18n` matrix, seamlessly scaling across 5 languages (English, Hindi, Gujarati, Tamil, Telugu) synchronously.

## How It Works
1. **Pre-Event (Waggle Dance)**: Ticket holders receive SMS links to the Attendee portal, completing a 15-second intake (origin, group size, special needs). The algorithm provisions their optimal entry gate.
2. **Arrival**: As fans approach, their plan dynamically re-evaluates. If their recommended gate swells, they are intelligently nudged toward an adjacent, underutilized gate.
3. **During Event**: The Control Room monitors live density (simulated/reported). If the South Stand food courts get saturated, targeted "Smart Nudges" are pushed strictly to fans in adjacent zones offering them incentives to visit under-loaded vendors elsewhere.
4. **Exit Flow**: Rather than a simultaneous 132,000-person exit, attendees are offered tiered exit recommendations (Leave Now, Wait 15 Mins, Stay for Post-Game Ceremony) to sequentially bleed pressure off Metro lines.
5. **Post-Event**: Attendees file a $<10$ second visual feedback form to tune the ML model for the next match.

## Assumptions Made
- **Simulation**: Live crowd flow data in this prototype is simulated (driven by the Control Room scrubber modeling a 500-attendee test load).
- **Positioning**: Indoor positioning is assumed via zone-based proxy (user self-selection/ticket zone) rather than highly granular hardware GPS/Beacon triangulation.
- **Hardware**: We assume ground staff (stewards) carry moderately modern smartphones capable of running a modern web browser.
- **Infrastructure**: Firebase's Spark (free) tier is assumed mathematically sufficient to handle the bandwidth of this localized prototype demonstration.

## Demo Instructions
*(Ensure your testing environment permits multiple browser windows)*

1. **Attendee**: Open exactly one mobile-sized viewport to `https://studio-5460981965-b6a76.web.app/` (or `localhost:3000/`)
2. **Staff**: Open a mobile-sized viewport to `https://studio-5460981965-b6a76.web.app/staff`
3. **Control Room**: Open a large desktop maximized window to `https://studio-5460981965-b6a76.web.app/control`
4. **Demo Flow (5-Minute Path)**:
   * **(Control)**: Scrub the simulation timeline forward to trigger a "Crowded" red alert in Zone N3.
   * **(Staff)**: Login as Staff ID: \`123\`, Zone: \`N3 North\`. Notice the density overlay turns red.
   * **(Control)**: Click the flashing N3 zone and dispatch a custom instruction: *"Redirect crowd to Gate 11"*.
   * **(Staff)**: Verify the instruction pops up immediately. Click `✓ Acknowledged`. Watch the Control Room dynamically register the acknowledgment checkmark.
   * **(Staff)**: Tap the massive "🔴 MY ZONE IS CROWDED" toggle. 
   * **(Attendee)**: Complete the intake flow to reach your personalized plan. Push the global language toggle to exactly swap between English and Hindi mid-session, verifying instant i18n triggers without tearing the UI.

## Local Setup

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/chparam612/Event_flow.git
   cd Event_flow
   \`\`\`
2. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
3. **Google Maps Setup**:
   In `index.html`, the Google Maps API is 
   pre-configured for the live demo. For local 
   development, replace the Maps API key in 
   `index.html` with your own key from 
   [Google Cloud Console](https://console.cloud.google.com).
   The app includes a built-in SVG venue map 
   as fallback — it works without this step.
4. **Run Local Server**:
   \`\`\`bash
   node server.js
   \`\`\`
   Access the app securely at \`http://localhost:3000\`.

## Future Roadmap
- **Optical AI Integration**: Wire physical high-Vantage CCTV camera feeds directly into Google Cloud Vision API to derive objective frame-by-frame density heatmaps, replacing steward polling.
- **Hardware Beacons (BLE)**: Layer rigorous Bluetooth Low-Energy beacons across NMS for precise micro-positioning within massive dense concrete shells where GPS drops.
- **AR Wayfinding**: Transition the 2D escort paths into Augmented Reality step-by-step guides using device gyroscope data.
- **Language Expansion**: Sub-dialect scaling for localized vernaculars using Google Vertex AI.
## Running Tests
`ash
npm test
``n
## Accessibility
- WCAG 2.1 AA compliant color contrast
- Screen reader compatible with ARIA labels
- Keyboard navigable
- 5 language support for diverse users
