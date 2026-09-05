# Northfield Track & Field

A community website for Northfield High School's Nighthawks, built with HTML, CSS, and vanilla JavaScript. The site works as static files and can be hosted directly from the repository root, including GitHub Pages. There is no build step or external runtime dependency.

## Features

- Responsive navy-and-gold design, local fonts, and optimized track photography.
- Six event guides with track/field filters and keyboard-accessible dialogs.
- Pace planner with validated race times, cumulative splits, and copy support.
- Personal-best journal for races, hurdles, jumps, and throws, with CSV export and undoable removal.
- Reaction challenge for touch, pointer, and keyboard, with a device-local best.
- Persistent meet-day packing checklist, registration guidance, coach contacts, and official schedule/results links.
- Reduced-motion support, native form controls, keyboard tab navigation, and print styling for meet-day preparation.

Personal marks, packing choices, and reaction records are stored only in this browser on this device. They are not submitted to the school and do not sync across devices. Clearing browser/site data removes these records. CSV export keeps a separate copy of personal marks. Blocked or malformed storage is handled without overwriting unreadable data.

## Check the code

```sh
node --check script.js
node --test tests/track-tools.test.cjs
```

These checks verify calculations, time formatting, record validation, personal-best comparisons, and CSV output. They do not replace visual/browser testing.

## Content and assets

Official links and contacts are retained from the original site; coaching roles/emails were checked against the Northfield team page. The championship reference links to CHSAA's Northfield history. Schedules and results open the original external sources and are not copied into an invented local calendar.

See `assets/CREDITS.md` for photo and font sources. The hero is a generic track photo, not a photograph of Northfield's facility.

This is a community hub, not an official Denver Public Schools publication.
