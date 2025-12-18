// logmarOptotypes.js
// -----------------------------------------------------
// A complete LogMAR optotype renderer for Electron apps
// Generates ISO/Sloan letters using SVG, scaled by distance
// -----------------------------------------------------

// --------------- 1. Compute monitor PPI ----------------
export function getPPI(diagonalInches, widthPx, heightPx) {
    return Math.sqrt(widthPx**2 + heightPx**2) / diagonalInches;
}

// --------------- 2. Compute LogMAR stroke size ---------
export function computeStrokePx(logmar, distanceM, ppi) {
    // Base height (mm) for LogMAR 0 at given distance
    const H0_mm = distanceM * 1.454;

    // Actual letter height (mm)
    const H_mm = H0_mm * Math.pow(10, logmar);

    // Stroke width = height / 5
    const S_mm = H_mm / 5;

    // Convert mm → px
    return S_mm * (ppi / 25.4);
}

// --------------- 3. Sloan SVG Paths --------------------
export const OptotypePaths = {
    "E": "M0 0 H4 V1 H0 Z M0 2 H3 V3 H0 Z M0 4 H4 V5 H0 Z M0 0 H1 V5 H0 Z",
    "F": "M0 0 H4 V1 H0 Z M0 2 H3 V3 H0 Z M0 0 H1 V5 H0 Z",
    "H": "M0 0 H1 V5 H0 Z M3 0 H4 V5 H3 Z M1 2 H3 V3 H1 Z",
    "N": "M0 0 H1 V5 H0 Z M3 0 H4 V5 H3 Z M1 0 H2 L3 5 H2 Z",
    "P": "M0 0 H1 V5 H0 Z M1 0 H4 V3 H1 Z M1 2 H4 V1 H1 Z",
    "R": "M0 0 H1 V5 H0 Z M1 0 H4 V3 H1 Z M1 2 H4 V1 H1 Z M1 3 L4 5 H2 Z",
    "D": "M0 0 H1 V5 H0 Z M1 0 H3 V1 H1 Z M3 1 H4 V4 H3 Z M1 4 H3 V5 H1 Z",
    "U": "M0 0 H1 V4 H3 V0 H4 V5 H0 Z",
    "V": "M0 0 H1 L2 4 L3 0 H4 L2 5 Z",
    "Z": "M0 0 H4 V1 H0 Z M0 4 H4 V5 H0 Z M1 1 H2 L3 4 H2 Z"
};

// --------------- 4. Render letter into container -------
export function renderOptotype(letter, logmar, distanceM, ppi, container) {

    if (!OptotypePaths[letter]) {
        container.innerHTML = `<p>Invalid letter</p>`;
        return;
    }

    const S = computeStrokePx(logmar, distanceM, ppi);
    const path = OptotypePaths[letter];

    container.innerHTML = `
        <svg viewBox="0 0 4 5"
             width="${4*S}"
             height="${5*S}"
             style="display:block; margin:auto;">
            <path d="${path}" fill="black"/>
        </svg>
    `;
}

// --------------- 5. Optional: random letter ------------
export function randomOptotype() {
    const keys = Object.keys(OptotypePaths);
    return keys[Math.floor(Math.random() * keys.length)];
}

// --------------- 6. Optional: build full line ----------
export function renderLine(letters, logmar, distanceM, ppi, container) {
    const S = computeStrokePx(logmar, distanceM, ppi);
    const svg = letters.map(l => `
        <svg viewBox="0 0 4 5"
             width="${4*S}"
             height="${5*S}"
             style="margin-right:${4*S}px;">
            <path d="${OptotypePaths[l]}" fill="black"/>
        </svg>
    `).join("");

    container.innerHTML = `<div style="display:flex; justify-content:center;">${svg}</div>`;
}

