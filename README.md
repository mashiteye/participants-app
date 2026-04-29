# MEL CoP Participant Registration

Participant registration app for the **Mastercard Foundation Ghana MEL CoP Convening**.

Built for METSS LBG to register, track, and export participants across the A2F portfolio programs.

## Features

- Register participants with name, organization, role, program, phone, email, region, gender, and notes
- Program affiliations: AYAW, FIRST+II, BIA, FILMA, MCF, Other
- Live participant count and breakdown by program
- Search/filter across name, org, program, and role
- Export to CSV (timestamped filename)
- Remove individual participants or clear all
- Data persists in browser localStorage

## Usage

Open `index.html` directly in a browser — no build step or server required.

For hosted use, deploy to GitHub Pages or any static host.

## Deploy to GitHub Pages

1. Go to **Settings → Pages**
2. Source: `main` branch, `/ (root)`
3. App will be live at `https://mashiteye.github.io/mel-cop-registration/`

## File Structure

```
index.html   — markup and layout
style.css    — all styles
app.js       — registration logic, localStorage, CSV export
README.md    — this file
```

## Programs

| Code | Full Name |
|------|-----------|
| AYAW | Agribusiness Youth Accelerator for Women |
| FIRST+II | Financial Inclusion for Rural Smallholders + II |
| BIA | BRIDGE-in-Agriculture |
| FILMA | Financial Inclusion for Marginalized Areas |
| MCF | Mastercard Foundation |
