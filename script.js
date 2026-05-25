const researchData = {
  updated: "May 2026",
  highlights: [
    {
      number: "2024",
      title: "First boys team state title",
      detail: "Northfield won the 4A boys championship with 72 team points.",
      source: "CHSAA"
    },
    {
      number: "51",
      title: "2026 5A boys points",
      detail: "Northfield finished third in the 5A boys state standings.",
      source: "CHSAA"
    },
    {
      number: "20",
      title: "2026 state athletes",
      detail: "CHSAA listed 13 boys and 7 girls for Northfield at the state meet.",
      source: "CHSAA"
    },
    {
      number: "24",
      title: "CHSAA-certified sports",
      detail: "Northfield athletics lists 24 certified athletic options for students.",
      source: "Northfield Athletics"
    }
  ],
  timeline: [
    {
      year: "2016",
      title: "Inaugural track season era",
      detail: "Co-Head Coach Wayne Vaden has served as a Northfield head track coach since the program’s inaugural track season."
    },
    {
      year: "2024",
      title: "Boys 4A state champions",
      detail: "The Nighthawks captured the program’s first-ever boys team title and added a record-setting hurdle performance."
    },
    {
      year: "2025",
      title: "4×800 state champions",
      detail: "Northfield’s men’s 4×800 was listed among Coach Bender’s state-champion events."
    },
    {
      year: "2026",
      title: "5A podium presence",
      detail: "Northfield placed third in the 5A boys state team standings and brought 20 athletes to the CHSAA state meet."
    }
  ],
  standings: [
    { rank: 1, school: "Fort Collins", points: 99 },
    { rank: 2, school: "Cherokee Trail", points: 59 },
    { rank: 3, school: "Northfield", points: 51 }
  ],
  coaches: [
    {
      name: "Joey Bender",
      role: "Co-Head Coach",
      initials: "JB",
      email: "joseph_bender@dpsk12.net",
      bullets: [
        "Official team page lists 2025–26 as his fifth year leading Northfield’s men’s and women’s track team.",
        "Named DPS Coach of the Year five times across an eight-season span, including track & field recognition.",
        "Eleven years of cross country and track coaching experience, including Adams State University experience."
      ]
    },
    {
      name: "Wayne Vaden",
      role: "Co-Head Coach",
      initials: "WV",
      email: "wayne_vaden@dpsk12.net",
      bullets: [
        "Has served as a Northfield head track coach since the 2016 inaugural track season.",
        "Has coached high school track since 1997.",
        "Official team page credits him with four Colorado State Team Championships and numerous state and national champions."
      ]
    }
  ],
  eventGroups: [
    {
      type: "sprints",
      title: "Sprints",
      description: "Speed, power, reaction time, and race execution for 100m, 200m, and 400m athletes.",
      tags: ["100m", "200m", "400m", "blocks"]
    },
    {
      type: "hurdles",
      title: "Hurdles",
      description: "Rhythm, mobility, acceleration, and composure for short and long hurdle races.",
      tags: ["110H", "100H", "300H", "technique"]
    },
    {
      type: "distance",
      title: "Distance",
      description: "Aerobic strength, smart pacing, and team running for 800m through 3200m athletes.",
      tags: ["800m", "1600m", "3200m", "XC bridge"]
    },
    {
      type: "relays",
      title: "Relays",
      description: "High-energy team events where baton work, trust, and race-day focus matter.",
      tags: ["4×100", "4×200", "4×400", "4×800"]
    },
    {
      type: "jumps",
      title: "Jumps",
      description: "Runway consistency, explosiveness, and technical takeoff work for horizontal and vertical jumps.",
      tags: ["long jump", "triple jump", "high jump", "pole vault"]
    },
    {
      type: "throws",
      title: "Throws",
      description: "Strength, footwork, and precision for athletes who compete in shot put and discus.",
      tags: ["shot put", "discus", "power", "balance"]
    }
  ],
  sources: [
    {
      title: "Northfield High School official home page",
      description: "School identity, mission language, address, office hours, phone, and communications email.",
      url: "https://northfield.dpsk12.org/"
    },
    {
      title: "Official track & field program page",
      description: "Co-head coach biographies, coach emails, program history, and state-level achievement notes.",
      url: "https://northfield.dpsk12.org/athletics/athletic-programs/track-and-field-mens-and-womens/"
    },
    {
      title: "Northfield athletic programs page",
      description: "CHSAA-certified athletic options and student-athlete participation requirements.",
      url: "https://northfield.dpsk12.org/athletics/athletic-programs/"
    },
    {
      title: "CHSAA 2024 state championship article",
      description: "Northfield boys’ first-ever team state championship and 72-point team total.",
      url: "https://chsaanow.com/news/2024/5/18/4a-boys-track-and-field-northfield-wins-first-ever-state-title.aspx"
    },
    {
      title: "CHSAA 2026 5A boys results hub",
      description: "Final 5A boys team standings showing Northfield third with 51 points.",
      url: "https://chsaa.co/track-and-field/2026/boys/5A"
    },
    {
      title: "CHSAA Northfield 2026 team page",
      description: "Northfield’s 2026 state-meet athlete list and event entries.",
      url: "https://chsaa.co/track-and-field/2026/teams/northfield"
    },
    {
      title: "Northfield Nighthawk Invite 2026 on MileSplit",
      description: "Hosted-meet information for the Northfield Nighthawk Invite at All-City Stadium.",
      url: "https://co.milesplit.com/meets/723893-northfield-nighthawk-invite-2026/info"
    }
  ]
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function renderHighlights() {
  const grid = $("#highlightGrid");
  if (!grid) return;

  grid.innerHTML = researchData.highlights
    .map(
      (item) => `
        <article class="stat-card reveal">
          <p class="stat-number">${item.number}</p>
          <h3>${item.title}</h3>
          <p>${item.detail}</p>
          <span class="stat-source">${item.source}</span>
        </article>
      `
    )
    .join("");
}

function renderTimeline() {
  const list = $("#timelineList");
  if (!list) return;

  list.innerHTML = researchData.timeline
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-year">${item.year}</div>
          <div>
            <h3>${item.title}</h3>
            <p>${item.detail}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderStandings() {
  const list = $("#standingsList");
  if (!list) return;

  const maxPoints = Math.max(...researchData.standings.map((team) => team.points));

  list.innerHTML = researchData.standings
    .map((team) => {
      const width = Math.round((team.points / maxPoints) * 100);
      const highlight = team.school === "Northfield" ? " aria-label='Northfield ranking highlight'" : "";
      return `
        <div class="standing-row"${highlight}>
          <div class="standing-top">
            <span class="standing-school"><span class="rank-pill">${team.rank}</span>${team.school}</span>
            <span>${team.points} pts</span>
          </div>
          <div class="points-bar" aria-hidden="true"><span style="--score-width: ${width}%"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderCoaches() {
  const grid = $("#coachGrid");
  if (!grid) return;

  grid.innerHTML = researchData.coaches
    .map(
      (coach) => `
        <article class="coach-card reveal">
          <div class="coach-card-header">
            <div class="avatar" aria-hidden="true">${coach.initials}</div>
            <div>
              <h3>${coach.name}</h3>
              <p>${coach.role}</p>
            </div>
          </div>
          <div class="coach-card-body">
            <ul>
              ${coach.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
            </ul>
            <div class="coach-actions">
              <a class="button button-navy" href="mailto:${coach.email}">Email ${coach.name.split(" ")[0]}</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderEventFilters() {
  const filters = $("#eventFilters");
  if (!filters) return;

  const filterLabels = [
    { value: "all", label: "All" },
    ...researchData.eventGroups.map((group) => ({ value: group.type, label: group.title }))
  ];

  filters.innerHTML = filterLabels
    .map(
      (filter, index) => `
        <button class="filter-button" type="button" data-filter="${filter.value}" aria-pressed="${index === 0}">
          ${filter.label}
        </button>
      `
    )
    .join("");
}

function renderEvents(activeFilter = "all") {
  const grid = $("#eventGrid");
  if (!grid) return;

  const groups = activeFilter === "all"
    ? researchData.eventGroups
    : researchData.eventGroups.filter((group) => group.type === activeFilter);

  grid.innerHTML = groups
    .map(
      (group) => `
        <article class="event-card reveal is-visible" data-event-type="${group.type}">
          <h3>${group.title}</h3>
          <p>${group.description}</p>
          <div class="event-tags" aria-label="Example events">
            ${group.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function setupEventFilters() {
  const filters = $("#eventFilters");
  if (!filters) return;

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    const activeFilter = button.dataset.filter;
    $$("[data-filter]", filters).forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });
    renderEvents(activeFilter);
  });
}

function renderSources() {
  const list = $("#sourceList");
  if (!list) return;

  list.innerHTML = researchData.sources
    .map(
      (source) => `
        <article class="source-card reveal">
          <h3>${source.title}</h3>
          <p>${source.description}</p>
          <a href="${source.url}" target="_blank" rel="noopener">Open source</a>
        </article>
      `
    )
    .join("");
}

function setupNavigation() {
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");
  const header = $("[data-header]");

  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupCopyContact() {
  const button = $("[data-copy-contact]");
  const status = $("[data-copy-status]");
  if (!button || !status) return;

  const contactText = "Northfield High School\n5500 Central Park Blvd.\nDenver, CO 80238\nMain Line: 720-423-8000\nEmail: nhscommunications@dpsk12.org";

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(contactText);
      status.textContent = "Contact info copied.";
    } catch (error) {
      status.textContent = "Copy failed. Select and copy the contact text manually.";
    }

    window.setTimeout(() => {
      status.textContent = "";
    }, 3500);
  });
}

function setupRevealAnimation() {
  const elements = $$(".reveal");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((element) => observer.observe(element));
}

function setFooterMeta() {
  const year = $("#year");
  const researchDate = $("#researchDate");
  if (year) year.textContent = new Date().getFullYear();
  if (researchDate) researchDate.textContent = researchData.updated;
}

function init() {
  renderHighlights();
  renderTimeline();
  renderStandings();
  renderCoaches();
  renderEventFilters();
  renderEvents();
  renderSources();
  setupNavigation();
  setupEventFilters();
  setupCopyContact();
  setFooterMeta();
  setupRevealAnimation();
}

document.addEventListener("DOMContentLoaded", init);
