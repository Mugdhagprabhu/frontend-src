# DIStrack Design Direction

## Three initial approaches

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| Clinical Cartography | A light, data-native healthcare control room that treats the supply network like a carefully annotated map. Calm spatial hierarchy, strong lines, and purposeful blue accents make national coordination tangible. | 0.07 |
| Civic Operations Ledger | A formal institutional interface inspired by public health reporting and contemporary data journalism. It would use crisp rules, quiet surfaces, and ledger-like detail modules to convey accountability. | 0.03 |
| Supply Continuum | An operational workspace structured around the journey of medicine from warehouse to patient. Directional movement, timeline logic, and subtle route geometry turn the system narrative into navigation. | 0.09 |

## Selected approach: Clinical Cartography

### Design Movement

**Information-rich institutional modernism**, informed by healthcare wayfinding systems, Swiss editorial grids, and contemporary emergency operations centers. It avoids the familiar consumer-SaaS card wall in favor of a measured command surface built from depth, routes, and clearly ranked information.

### Core Principles

1. **Operational clarity before decoration.** Every line, color, label, and chart has a practical interpretive purpose.
2. **Spatial hierarchy.** The application is composed as an information landscape, with a persistent navigation spine, a compact command bar, and content areas that guide attention through scale and alignment.
3. **Trust through restraint.** Borders, tonal shifts, tabular numerals, and explicit states communicate rigor without visual noise.
4. **Progressive disclosure.** The overview shows the operational signal; drawers and details reveal the record behind it.

### Color Philosophy

The palette is based on **deep institutional navy**, clear medical blues, and nearly-white blue-gray work surfaces. Navy anchors critical navigation and important headings, blue denotes active coordination and reliable flow, pale blue is used as a low-noise substrate for analytical information, and green, amber, or red are reserved for specific health states. The signature blue is never used as decoration alone; it signifies a selected route, current focus, or healthy system flow.

### Layout Paradigm

The desktop shell is a **navigation spine plus operations canvas**, not a centered dashboard. A dark, 248-pixel sidebar anchors the system. A thin upper command band carries search, facility context, data state, and identity. The main canvas uses offset visual regions: a broad left analytical field and a narrower right operational rail. On compact screens, the spine becomes a mobile drawer while task controls move into a condensed command bar.

### Signature Elements

1. **Route lines and node dots.** Fine blue connecting lines and small status nodes recur in timeline, network, and activity surfaces.
2. **Topographic status strip.** Compact segmented availability bars communicate system health without turning every metric into a card.
3. **Data-ruler details.** Fine horizontal rules, small uppercase labels, tabular figures, and restrained metadata create a reliable ledger texture.

### Interaction Philosophy

Interactions should feel like moving through a well-run control room. Navigation is immediate and obvious. Hover states clarify ownership of interactive regions. Selectors, filters, and drawers provide contextual refinement rather than redirecting users away from their current operational question. Any changeable status uses clear wording, iconography, confirmation, and non-intrusive feedback.

### Animation

Motion is limited to navigation transitions, a 180 to 240 ms drawer slide, initial chart reveals, finite KPI count-ups, and slow shipment particles in the network visualization. Transitions use a decisive ease-out curve. Route lines may draw once when their panel enters view. There is no looping decorative motion. All non-essential animation is removed under `prefers-reduced-motion`.

### Typography System

**IBM Plex Sans** is the primary family because of its high legibility and systems-oriented character. Headings use 600 and 700 weights with compact tracking; body text is 400 to 500; labels use 600, 10 to 12px, uppercase, and widened tracking. Quantitative UI uses tabular numerals to support rapid comparison. The type scale remains compact and operational: page headings around 26 to 30px, panel titles around 15 to 18px, body around 13 to 14px.

### Brand Essence

**DIStrack is the operational command layer for public-health teams coordinating medicine availability from state warehouse to care facility.** It is reliable, precise, and composed.

### Brand Voice

The voice is direct, informed, and action-oriented. Headlines identify the operational condition; CTAs state the next responsible action. It avoids hype, personification, and generic welcome language.

Example lines: “Availability remains above threshold across 118 facilities.” and “Review redistribution plan.”

### Wordmark & Logo

The mark is a **medical supply-route monogram**: three squared, connected blue modules suggest state warehouse, district warehouse, and care site, with a white negative-space cross at the network junction. The DIStrack wordmark uses a deliberately spaced IBM Plex Sans semi-bold treatment, with “DIS” in navy and “track” in medical blue.

### Signature Brand Color

**Route Blue `#1769AA`** is the ownable signal color for active navigation, supply routes, primary actions, and healthy coordinated flow.

## Style Decisions

- The DIStrack shell always maintains a visible full-height deep-navy navigation spine on desktop; compact screens retain this hierarchy in a dedicated mobile drawer.
- Route Blue `#1769AA` is limited to active navigation, supply-route geometry, primary operational actions, and healthy coordinated flow rather than generic visual decoration.
- Every primary operational page includes a built-in Clinical Cartography signature: route geometry, a segmented status strip, or ledger-rule texture integrated into its working surface.
