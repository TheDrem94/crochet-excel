//DOM

const UI = {
    widthInput: document.getElementById("widthInput"),
    heightInput: document.getElementById("heightInput"),
    generateBtn: document.getElementById("generateBtn"),
    grid: document.getElementById("grid"),
    topNumbers: document.querySelector(".top-numbers"),
    leftNumbers: document.querySelector(".left-numbers"),
    cellSizeSlider: document.getElementById("cellSizeSlider"),
    printBtn: document.getElementById("printBtn"),
    imageInput: document.getElementById("imageInput"),
    symbolMode: document.getElementById("symbolMode"),
    legend: document.getElementById("legend"),
    symbolsContainer: document.getElementById("symbolsContainer"),
    brickPattern: document.getElementById("brickPattern")
};


//config

// const palette = [
//     [30, 30, 30],
//     [240, 240, 240],
//     [200, 80, 80],
//     [80, 120, 200],
//     [100, 160, 100]
// ];

const palette = [
    [0,0,0],
    [255,255,255],
    [255,0,0],
    [0,255,0],
    [0,0,255],
    [255,255,0],
    [0,255,255],
    [255,0,255],
    [128,128,128],
    [200,150,100]
];

const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];


//stan początkowy

const state = {
    width: 0,
    height: 0,
    gridData: [], // przechowuje indeksy kolorów
    currentSymbol: symbols[0]
};


//utils

// pobranie rozmiaru gridu z inputów
function getGridSize() {
    return {
        width: parseInt(UI.widthInput.value) || 0,
        height: parseInt(UI.heightInput.value) || 0
    };
}

// dopasowanie koloru 
function getClosestColorIndex(r, g, b) {
    let minDistance = Infinity;
    let index = 0;

    palette.forEach(([pr, pg, pb], i) => {
        const dr = r - pr;
        const dg = g - pg;
        const db = b - pb;

        const dist = Math.sqrt(
            2 * dr * dr +
            4 * dg * dg +
            3 * db * db
        );

        if (dist < minDistance) {
            minDistance = dist;
            index = i;
        }

    });

    return index;
}

//dithering

function applyDithering(data, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const i = (y * width + x) * 4;

            const oldR = data[i];
            const oldG = data[i + 1];
            const oldB = data[i + 2];
            
            const colorIndex = getClosestColorIndex(oldR, oldG, oldB);
            const [newR, newG, newB] = palette[colorIndex];

            state.gridData[y * width + x] = colorIndex;

            const errR = oldR - newR;
            const errG = oldG - newG;
            const errB = oldB - newB;

            // Floyd–Steinberg dithering
            distributeError(data, width, height, x + 1, y,     errR, errG, errB, 7/16);
            distributeError(data, width, height, x - 1, y + 1, errR, errG, errB, 3/16);
            distributeError(data, width, height, x,     y + 1, errR, errG, errB, 5/16);
            distributeError(data, width, height, x + 1, y + 1, errR, errG, errB, 1/16);
        }
    }
}

//helper
function distributeError(data, width, height, x, y, errR, errG, errB, factor) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const i = (y * width + x) * 4;

    data[i]     += errR * factor;
    data[i + 1] += errG * factor;
    data[i + 2] += errB * factor;
}


//generowanie numerów

function renderTopNumbers() {
    UI.topNumbers.innerHTML = "";
    UI.topNumbers.style.setProperty("--cols", state.width);

    for (let i = 1; i <= state.width; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        UI.topNumbers.appendChild(div);
    }
}

function renderLeftNumbers() {
    UI.leftNumbers.innerHTML = "";
    UI.leftNumbers.style.setProperty("--rows", state.height);

    for (let i = 1; i <= state.height; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        UI.leftNumbers.prepend(div);
    }
}


//render gridu

function renderGrid() {
    UI.grid.innerHTML = "";

    UI.grid.style.gridTemplateColumns = `repeat(${state.width}, var(--cell-size))`;
    UI.grid.style.gridTemplateRows = `repeat(${state.height}, var(--cell-size))`;

    const fragment = document.createDocumentFragment();

    // state.gridData.forEach((colorIndex, i) => {
    //     const cell = document.createElement("div");
    //     cell.classList.add("cell");

    //     if (colorIndex !== null) {
    //         applyCellStyle(cell, colorIndex);
    //     }

    //     // kliknięcie komórki
    //     cell.addEventListener("click", () => {
    //         handleCellClick(i);
    //     });

    state.gridData.forEach((colorIndex, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    //brick pattern
    if (shouldSkipCell(i)) {
        cell.classList.add("empty"); // styl CSS
    } else if (colorIndex !== null) {
        applyCellStyle(cell, colorIndex);
    }

    cell.addEventListener("click", () => {
        if (!shouldSkipCell(i)) {
            handleCellClick(i);
        }
    });

        fragment.appendChild(cell);
    });

    UI.grid.appendChild(fragment);
}

//redukcja kolorów

function reducePalette(data, width, height, maxColors = 8) {
    const buckets = {};

    for (let i = 0; i < width * height; i++) {
        const r = Math.round(data[i * 4] / 32) * 32;
        const g = Math.round(data[i * 4 + 1] / 32) * 32;
        const b = Math.round(data[i * 4 + 2] / 32) * 32;

        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] || 0) + 1;
    }

    return Object.entries(buckets)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxColors)
        .map(([key]) => key.split(",").map(Number));
}




//logika komóeki

//zmiana na symbole

function handleCellClick(index) {
    const symbolIndex = symbols.indexOf(state.currentSymbol);

    state.gridData[index] = symbolIndex;

    renderGrid(); // odśwież
}

function applyCellStyle(cell, index) {
    if (UI.symbolMode.checked) {
        cell.textContent = symbols[index];
        cell.style.backgroundColor = "white";
        cell.style.color = "black";
    } else {
        const [r, g, b] = palette[index];
        cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        cell.textContent = "";
    }
}

//brick pattern

function shouldSkipCell(index) {
    if (!UI.brickPattern.checked) return false;

    const col = index % state.width;
    const row = Math.floor(index / state.width);

    const isOffsetRow = row % 2 === 1;

    return (col + (isOffsetRow ? 1 : 0)) % 2 === 1;
}


//generowanie gridu

function generateGrid() {
    const { width, height } = getGridSize();

    state.width = width;
    state.height = height;
    state.gridData = new Array(width * height).fill(null);

    renderTopNumbers();
    renderLeftNumbers();
    renderGrid();
}


//import obrazu

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();

    img.onload = () => {
        const max = 60;
        let cols = img.width;
        let rows = img.height;

        // skalowanie
        const scale = Math.min(90 / cols, 90 / rows, 1);
        cols = Math.round(cols * scale);
        rows = Math.round(rows * scale);

        UI.widthInput.value = cols;
        UI.heightInput.value = rows;

        generateGrid();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = cols;
        canvas.height = rows;

        ctx.imageSmoothingEnabled = true;
        ctx.filter = "blur(0.7px)";
        ctx.drawImage(img, 0, 0, cols, rows);
        ctx.filter = "none";

        // ctx.drawImage(img, 0, 0, cols, rows);

        const data = ctx.getImageData(0, 0, cols, rows).data;

        const newPalette = reducePalette(data, cols, rows, 6);

        palette.length = 0;
        newPalette.forEach(c => palette.push(c));

        for (let i = 0; i < cols * rows; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];

            const index = getClosestColorIndex(r, g, b);
            state.gridData[i] = index;
        }
        renderGrid();
    };

    img.src = URL.createObjectURL(file);
}

function smoothGrid() {
    const copy = [...state.gridData];

    for (let i = 0; i <getComputedStyle.length; i++) {
        const neighbors = [];

        const x = i % state.widthl
        const y = Math.floor(i / state.width);

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < state.width && ny >= 0 && ny <state.height) {
                    neighbors.push(copy[ny * state.width + nx]);
                }
            }
        }

        const counts = {};
        neighbors.forEach(n => {
            counts[n] = (counts[n] || 0) + 1;
        });

        const mostCommon = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])[0][0];

        state.gridData[i] = Number(mostCommon);
    }
}

//paleta i colorPicker

function initPalette() {
    palette.forEach(([r, g, b], i) => {
        const btn = document.createElement("button");

        btn.textContent = symbols[i];
        btn.style.backgroundColor = `rgb(${r},${g},${b})`;

        btn.addEventListener("click", () => {
            state.currentSymbol = symbols[i];
        });

        UI.symbolsContainer.appendChild(btn);
    });

    
}


//legenda

function initLegend() {
    palette.forEach(([r, g, b], i) => {
        const div = document.createElement("div");

        div.innerHTML = `
            <span style="
                display:inline-block;
                width:20px;
                height:20px;
                background:rgb(${r},${g},${b});
                border:1px solid black;
            "></span>
            ${symbols[i]}
        `;

        UI.legend.appendChild(div);
    });
}


//eventy

UI.generateBtn.addEventListener("click", generateGrid);

UI.printBtn.addEventListener("click", () => window.print());

UI.imageInput.addEventListener("change", handleImageUpload);

UI.symbolMode.addEventListener("change", renderGrid);

UI.brickPattern.addEventListener("change", renderGrid);

UI.cellSizeSlider.addEventListener("input", () => {
    document.documentElement.style.setProperty(
        "--cell-size",
        UI.cellSizeSlider.value + "px"
    );
    renderGrid();
});


//start

initPalette();
initLegend();
generateGrid();
smoothGrid();