import {
    getPPI,
    renderOptotype,
    randomOptotype
} from "./logmarOptotypes.js";

// Example monitor values
const diagonalInches = 24;
const ppi = getPPI(diagonalInches, screen.width, screen.height);

// Example settings
const letter = randomOptotype(); // random Sloan letter
const logmar = 0.2;
const distanceM = 3;

const container = document.getElementById("chart");

renderOptotype(letter, logmar, distanceM, ppi, container);
