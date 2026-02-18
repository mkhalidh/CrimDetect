# 🗺️ Karachi Crime Analytics: System Walkthrough

This document explains how the **Maps**, **Analytics Charts**, and **Backend Area Detection** work in this project. Everything is broken down into simple steps.

---

## 1. Backend: The "Brain" (Auto-Detection)

When an admin approves a complaint with GPS coordinates (Latitude/Longitude), the system automatically detects which Karachi Town it belongs to.

### How it works:
- **Source of Truth**: We use `karachi_full_districts.json` which contains the geographical boundaries (polygons) of all 18 Karachi Towns.
- **The Intelligence (`geoUtils.js`)**: 
  - We use a library called `@turf/turf`.
  - It takes the user's GPS point and checks: *"Is this point inside this Town's polygon?"*
  - This is called a **Point-in-Polygon (PIP)** check.
- **Normalization**: To keep things clean, the backend converts every area name to "Title Case" (e.g., `jamshaid town` becomes `Jamshaid Town`). This prevents duplicate entries like "JAMSHAID" and "jamshed".

---

## 2. Frontend: The "Visuals" (Analytics Dashboard)

The dashboard is built using **React Leaflet** (for maps) and **Recharts** (for graphs).

### 📍 The Heatmap (How colors appear on the Map)
The map colors change based on how many crimes are in an area. This is done through a function called `getColor`.

**The Logic:**
- **0 Crimes**: Transparent (No color)
- **1-2 Crimes**: Pale Yellow (`#fef08a`) - *Low Intensity*
- **3-5 Crimes**: Orange (`#f97316`) - *Medium Intensity*
- **6-10 Crimes**: Red (`#ef4444`) - *High Intensity*
- **10+ Crimes**: Dark Red (`#7f1d1d`) - *Critical Intensity*

#### 💡 Detail:
In React, we use the `style` prop of the `<GeoJSON />` component. For every town on the map, it asks: *"What is the crime count for this town?"* and then applies the color from the logic above.

---

### 📊 The Charts (Pie & Bar)
We use `recharts` to show the statistics visually.

- **Pie Chart (Crimes by Category)**:
  - Takes the total count of each category (Theft, Snatching, etc.) and calculates the percentage.
  - It helps you see which crime type is most common across Karachi.
  
- **Stacked Bar Chart (Area-wise Distribution)**:
  - Shows each Town on the Y-Axis.
  - The bar is "stacked" with different colors representing different crime categories.
  - **Dynamic Filter**: If you select "Theft" from the dropdown, the bars will shrink to only show the "Theft" portion for each town.

---

## 3. The Lifecycle of a Complaint

1. **Submission**: User submits a complaint and selects an area from the **official dropdown** (which we added to prevent spelling mistakes).
2. **Review**: Admin reviews the complaint in the Admin Panel.
3. **Approval & Auto-Sync**:
   - Once Approved, the Backend calculates the exact Town using Coordinates.
   - The `area_category_stats` table in the database is updated (+1 count).
4. **Instant Update**: The Dashboard fetches these new stats.
   - The **Map** highlights the town with a darker color.
   - The **Graphs** reflect the new crime immediately.
   - **Tooltips**: When you hover over the map, you see the exact crime breakdown (e.g., "Theft: 2, Snatching: 1").

---

## 🛠 Tech Used
- **Map**: `leaflet`, `react-leaflet` (OpenStreetMap).
- **Geometry**: `@turf/turf` (Point calculation).
- **Charts**: `recharts` (Responsive SVG charts).
- **Database**: `MySQL` (Storing aggregated counts for speed).
