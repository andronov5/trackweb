# Northfield Track & Field + Cross Country

A community website for Northfield High School's track & field and cross country Nighthawks, built with HTML, CSS, and vanilla JavaScript. The site works as static files and can be hosted directly from the repository root, including GitHub Pages. There is no build step or external runtime dependency.

## Features

- Responsive navy-and-gold design, local fonts, and the owner-supplied hero photograph.
- Major news from both sports, with dates and linked reporting.
- Combined, dated team accomplishments with linked results.
- Pace planner with validated race times, cumulative splits, and copy support, including 5K cross country and kilometer splits.
- Personal-best journal for track races, cross country 5K, hurdles, jumps, and throws, with CSV export and undoable removal.
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

Official links and contacts are retained from the original site; coaching roles are checked against the Northfield track and cross country pages. Selected news and accomplishments were checked September 5, 2026. Each item links to the report or meet results supporting it. Classification, gender, and year are explicit; individual national performances are distinguished from school team championships. News is curated static content, not an automatically refreshed feed.

Cross country 5K marks are saved separately from track races. Courses and conditions vary, so the page does not treat equal distances on different courses as equivalent performances. Existing browser-storage keys are preserved to retain previously saved marks, packing selections, and reaction records.

See `assets/CREDITS.md` for photo and font sources. The hero uses the image supplied by the owner. See `CONTENT_SOURCES.md` for the news, result, and team-page references.

This is a community hub, not an official Denver Public Schools publication.
