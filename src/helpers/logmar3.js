// logmar3.js - LogMAR Chart Generation Logic
// Separated from HTML for better organization

// --- Constants ---
export const ETDRS_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];
export const SNELLEN_LETTERS = ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z'];
export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const LOCAL_STORAGE_KEY = 'logmarChartSettings';

// --- Utility Functions ---
export function logMarToSnellen(logMAR, distance) {
    const twentyFootEquivalentDenominator = 20 * Math.pow(10, logMAR);
    const distanceDenominator = Math.round(distance * Math.pow(10, logMAR));

    const primarySnellen = `${distance}/${distanceDenominator}`;
    const secondarySnellen = `(20/${Math.round(twentyFootEquivalentDenominator)})`;

    if (distanceDenominator > 600) return `${distance}/>600`;

    return `${primarySnellen} ${secondarySnellen}`;
}

export function calculateFontSize(logMAR, distance, scalingFactor) {
    const angleRadians = (5 / 60) * (Math.PI / 180);
    const letterHeightMeters = distance * Math.tan(angleRadians) * Math.pow(10, logMAR);
    const metersToPoints = 39.3701 * 72;
    const letterHeightPoints = letterHeightMeters * metersToPoints;
    return letterHeightPoints * scalingFactor;
}

export function calculateLetterHeightMm(logMAR, distance) {
    const angleRadians = (5 / 60) * (Math.PI / 180);
    const letterHeightMeters = distance * Math.tan(angleRadians) * Math.pow(10, logMAR);
    return letterHeightMeters * 1000;
}

export function getTargetCalibrationHeightMm(distance) {
    return calculateLetterHeightMm(0.0, distance);
}

export function getCharacterSet(letterSetKey, customLettersValue) {
    switch (letterSetKey) {
        case 'ETDRS': return ETDRS_LETTERS;
        case 'Snellen': return SNELLEN_LETTERS;
        case 'Numbers': return NUMBERS;
        case 'Custom':
            return customLettersValue.split(',')
                .map(s => s.trim().toUpperCase())
                .filter(s => s && s.length === 1);
        default:
            console.warn(`Unknown letter set: ${letterSetKey}`);
            return ETDRS_LETTERS;
    }
}

export function getContrastColor(hexcolor) {
    hexcolor = hexcolor.replace('#', '');
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(hex => hex + hex).join('');
    }
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// --- Chart Generation ---
export function generateRow(logMAR, distance, characters, scalingFactor, letterColor, backgroundColor, labelColor, distribution, nextRowFontSize) {
    const row = document.createElement('div');
    row.classList.add('logmar-row');
    row.style.backgroundColor = backgroundColor;

    // Acuity Label
    const labelDiv = document.createElement('div');
    labelDiv.classList.add('acuity-label');
    labelDiv.style.borderRightColor = labelColor;

    const snellenSpan = document.createElement('span');
    snellenSpan.classList.add('snellen-value');
    snellenSpan.textContent = logMarToSnellen(logMAR, distance);
    snellenSpan.style.color = labelColor;

    const logmarSpan = document.createElement('span');
    logmarSpan.classList.add('logmar-value');
    logmarSpan.textContent = `LogMAR: ${logMAR.toFixed(1)}`;
    logmarSpan.style.color = labelColor;

    labelDiv.appendChild(snellenSpan);
    labelDiv.appendChild(logmarSpan);

    // Letters Container
    const lettersContainer = document.createElement('div');
    lettersContainer.classList.add('letters-container');

    const fontSize = calculateFontSize(logMAR, distance, scalingFactor);

    if (nextRowFontSize) {
        const rowSpacing = nextRowFontSize * 0.75;
        row.style.marginTop = `${rowSpacing}pt`;
    }

    let lettersPerRow;
    if (distribution === 'snellen') {
        if (logMAR >= 0.8) lettersPerRow = 1;
        else if (logMAR >= 0.6) lettersPerRow = 2;
        else if (logMAR >= 0.4) lettersPerRow = 3;
        else if (logMAR >= 0.2) lettersPerRow = 4;
        else lettersPerRow = 5;
    } else if (distribution === 'etdrs') {
        lettersPerRow = 5;
    } else if (distribution === 'linear') {
        lettersPerRow = Math.max(1, Math.round((1.0 - logMAR) * 5) + 1);
        lettersPerRow = Math.min(lettersPerRow, 6);
    } else {
        lettersPerRow = 5;
    }

    const shuffledChars = shuffleArray([...characters]);
    const charsForRow = [];
    for (let i = 0; i < lettersPerRow; i++) {
        charsForRow.push(shuffledChars[i % shuffledChars.length]);
    }

    charsForRow.forEach(char => {
        const letterSpan = document.createElement('span');
        letterSpan.classList.add('logmar-letter');
        letterSpan.style.fontSize = `${fontSize.toFixed(2)}pt`;
        letterSpan.style.color = letterColor;
        letterSpan.textContent = char;
        lettersContainer.appendChild(letterSpan);
    });

    row.appendChild(labelDiv);
    row.appendChild(lettersContainer);
    return row;
}

export function generateChart(settings, chartContainer) {
    chartContainer.innerHTML = '';

    const {
        distance,
        letterSetKey,
        customLettersValue,
        scalingFactor,
        letterColor,
        backgroundColor,
        distribution,
        selectedRows
    } = settings;

    // Validation
    if (isNaN(distance) || distance <= 0) {
        return { error: "Please enter a valid testing distance greater than 0." };
    }
    if (isNaN(scalingFactor) || scalingFactor <= 0) {
        return { error: "Please enter a valid scaling factor greater than 0." };
    }

    const characters = getCharacterSet(letterSetKey, customLettersValue);
    if (letterSetKey === 'Custom' && characters.length === 0) {
        return { error: "Please enter valid custom characters." };
    }

    chartContainer.style.backgroundColor = backgroundColor;

    if (!selectedRows || selectedRows.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">No rows selected.</p>';
        return { error: null };
    }

    const sortedRows = [...selectedRows].sort((a, b) => b - a);
    const fontSizes = sortedRows.map(logMAR => calculateFontSize(logMAR, distance, scalingFactor));
    const labelColor = getContrastColor(backgroundColor);

    sortedRows.forEach((logMAR, index) => {
        const nextRowFontSize = index + 1 < fontSizes.length ? fontSizes[index + 1] : null;
        const rowElement = generateRow(logMAR, distance, characters, scalingFactor, letterColor, backgroundColor, labelColor, distribution, nextRowFontSize);
        chartContainer.appendChild(rowElement);
    });

    return { error: null };
}

// --- Settings Persistence ---
export function saveSettings(settings) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
        return { success: true, message: "Settings saved successfully!" };
    } catch (error) {
        console.error("Error saving settings:", error);
        return { success: false, message: "Could not save settings." };
    }
}

export function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSettings) {
            return { success: true, settings: JSON.parse(savedSettings) };
        }
        return { success: false, message: "No saved settings found." };
    } catch (error) {
        console.error("Error loading settings:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return { success: false, message: "Could not load settings." };
    }
}
