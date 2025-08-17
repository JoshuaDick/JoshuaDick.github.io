// ------- Data -------
const PROFILE = {
    name: "Joshua Dick",
    tag: "Computer Engineer • Embedded Systems • Circuit Designer",
    location: "",
    bio: "I design and implement both hardware and software systems, from RF circuit design to embedded microcontroller programming. My experience spans radar research, aircraft systems, automotive systems, and AI-powered hardware.",
    highlights: [
        { label: "Education", value: "B.S. Comp. Eng. '25, M.S. Comp. Sci. '26" },
        { label: "GPA", value: "3.97" },
        { label: "Currently", value: "Seeking Employment — Available May 2026" }
    ],
    skills: [
        "C++", "Python", "Java", "C", "Analog Circuit Design",
        "Digital Circuit Design", "Database Management",
        "Object-Oriented Programming", "Computer Networks",
        "Software Development", "Embedded Systems"
    ]
};

const PROJECTS = [
    {
        title: "FaceGuard",
        badge: "Hackathon Winner",
        desc: "AI-powered lock that unlocks for authorized faces using Arduino, Python, and a servo motor. Built in 24 hours — Best Hardware Hack at Hacklahoma 2023.",
        link: "https://github.com/jacksors/FaceGuard-Hacklahoma23.git",
        tags: ["Python", "Arduino", "Computer Vision", "Hardware"]
    },
    {
        title: "Moving P2P Wifi",
        badge: "Wireless Connectivity",
        desc: "Points a local Yagi antenna that is mounted to a servo motor at a moving object (with a router on it) to remain connected to the network.",
        link: "https://github.com/JoshuaDick/P2PMoving/tree/main",
        tags: ["Python", "Arduino", "GPS Triangulation"]
    },
    {
        title: "Sooner Racing Team — Telemetry",
        badge: "FSAE",
        desc: "Designed telemetry, shifting, and throttle systems for combustion race car. Integrated DAQ hardware with Python signal processing.",
        link: "https://github.com/JoshuaDick/EngineData.git",
        tags: ["Python", "DAQ", "Embedded", "Motorsport"]
    }
];

const RESUME = {
    summary: "Computer Engineer with experience in embedded systems, RF circuit design, and data acquisition. Strong academic performance with industry and research experience in defense, radar, and competitive racing applications.",
    experience: [
        {
            role: "Undergraduate Research Assistant", org: "Advanced Radar Research Center", time: "Jan 2024 – August 2025", bullets: [
                "Develop RF circuits for communication research under Dr. Hjalti Sigmarsson.",
                "Program microcontrollers for embedded RF systems."
            ]
        },
        {
            role: "Student Trainee Engineer", org: "Tinker Air Force Base — 76th Software Engineering Group", time: "Summer 2024", bullets: [
                "Rotated through multiple squadrons, working on software and hardware for aircraft systems.",
                "Gained experience with Ada, C#, and the MIL-STD-1553 serial data bus."
            ]
        },
        {
            role: "Math Tutor", org: "University of Oklahoma Math Center", time: "2022 – 2023", bullets: [
                "Tutored students in Linear Algebra, Calculus, and Differential Equations."
            ]
        }
    ],
    education: [
        { line: "M.S. in Computer Science", sub: "Expected May 2026 — University of Oklahoma" },
        { line: "B.S. in Computer Engineering", sub: "Graduated May 2025 — GPA: 3.97" },
        { line: "Relevant Graduate Coursework", sub: "Database Management Systems, Advanced Computer Architecture, Machine Learning Fundamentals, Algorithm Analysis" }
    ],
    links: [
        { label: "Download PDF Résumé", href: "./resume.pdf" },
    ]
};

// ------- Router -------
const tabs = document.querySelectorAll(".tab");
const panelTitle = document.getElementById("panelTitle");
const panelBody = document.getElementById("panelBody");

function route(e) {
    if (e) e.preventDefault();
    const hash = location.hash || "#/about";
    const page = hash.replace("#/", "");

    tabs.forEach(t => t.classList.remove("active"));
    const activeTab = document.querySelector(`.tab[data-route='${page}']`);
    if (activeTab) activeTab.classList.add("active");

    if (page === "about") showAbout();
    if (page === "projects") showProjects();
    if (page === "resume") showResume();
}

function showAbout() {
    panelTitle.textContent = "ABOUT";
    panelBody.innerHTML = `
    <div class="hero">
      <div class="hero-card">
        <h1 class="typed-name"></h1>
        <div class="mono">${PROFILE.tag}</div>
        <p>${PROFILE.bio}</p>
        <p class="mono">${PROFILE.location}</p>
        <p class="mono" id="visitorLocation">Visitor Location: Loading...</p>
        <p class="mono" id="visitorIP">Visitor IP: Loading...</p>
      </div>
      <div class="sub-card">
        <h3>Highlights</h3>
        <ul>
          ${PROFILE.highlights.map(h => `<li><strong>${h.label}:</strong> ${h.value}</li>`).join("")}
        </ul>
        <h3>Skills</h3>
        <div class="tags">${PROFILE.skills.map(s => `<span class="badge">${s}</span>`).join("")}</div>
      </div>
    </div>
  `;

    // Typing effect for the name
    const nameContainer = document.querySelector('.typed-name');
    const name = PROFILE.name;
    let i = 0;
    nameContainer.innerHTML = '<span class="blink"></span>';
    const cursor = nameContainer.querySelector('.blink');

    function typeName() {
        if (i < name.length) {
            cursor.insertAdjacentText('beforebegin', name[i]);
            i++;
            setTimeout(typeName, 150);
        }
    }
    typeName();

    // Fetch visitor IP and location
    fetch('https://ipwhois.app/json/')
        .then(res => res.json())
        .then(data => {
            if (data.success === false) throw new Error(data.message);
            const city = data.city || "Unknown city";
            const region = data.region || "Unknown region";
            const country = data.country || "Unknown country";
            const ip = data.ip || "Unknown IP";

            document.getElementById('visitorLocation').textContent =
                `Visitor Location: ${city}, ${region}, ${country}`;
            document.getElementById('visitorIP').textContent = `Visitor IP: ${ip}`;
        })
        .catch(err => {
            console.error(err);
            document.getElementById('visitorLocation').textContent = 'Visitor Location: Unable to determine';
            document.getElementById('visitorIP').textContent = 'Visitor IP: Unable to determine';
        });
}



function showProjects() {
    panelTitle.textContent = "PROJECTS";
    panelBody.innerHTML = `
    <div class="projects-grid">
      ${PROJECTS.map(p => `
        <article class="card">
          <div class="mono">${p.badge}</div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="tags">${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
          <p><a class="btn" href="${p.link}" target="_blank">Open Repository</a></p>
        </article>
      `).join("")}
    </div>
  `;
}

function showResume() {
    panelTitle.textContent = "RÉSUMÉ";
    panelBody.innerHTML = `
    <h3>Summary</h3>
    <p>${RESUME.summary}</p>

    <h3>Experience</h3>
    ${RESUME.experience.map(exp => `
      <div class="timeline">
        <div class="t-item">
          <div class="mono">${exp.time}</div>
          <strong>${exp.role} — ${exp.org}</strong>
          <ul>${exp.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
        </div>
      </div>
    `).join("")}

    <h3>Education</h3>
    ${RESUME.education.map(ed => `
      <div class="timeline">
        <div class="t-item">
          <strong>${ed.line}</strong>
          <div class="mono">${ed.sub}</div>
        </div>
      </div>
    `).join("")}

    <h3>Download</h3>
    <ul>${RESUME.links.map(l => `<li><a class="btn" href="${l.href}" target="_blank">${l.label}</a></li>`).join("")}</ul>
  `;
}


window.addEventListener("hashchange", route);
route();