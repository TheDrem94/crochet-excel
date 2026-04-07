// Pobranie elementów
const widthInput = document.getElementById("widthInput");       // szerokość gridu
const heightInput = document.getElementById("heightInput");     // wysokość gridu
const generateBtn = document.getElementById("generateBtn");     // przycisk generuj
const grid = document.getElementById("grid");                   // właściwy grid
const topNumbersContainer = document.querySelector(".top-numbers");  // liczby u góry
const leftNumbersContainer = document.querySelector(".left-numbers"); // liczby po lewej
const cellSizeSlider = document.getElementById("cellSizeSlider");     // suwak rozmiaru
const printBtn = document.getElementById("printBtn");           //przycisk importuj
const imageInput = document.getElementById("imageInput");         // input do wczytywania obrazka
const symbolModeCheckbox = document.getElementById("symbolMode"); //chceckbox symboli
const legendDiv = document.getElementById("legend"); //legenda
const symbolsContainer = document.getElementById("symbolsContainer"); //color picker
// const alternateCols = document.getElementById("alternateCols");

//paleta kolorów twarde

// const palette = [
//     [0, 0, 0],
//     [255, 255, 255],
//     [255, 0, 0],
//     [0, 0, 255],
//     [0, 255, 0]
// ]

//paleta kolorów miękkie
const palette = [
    [30, 30, 30],     // miękka czerń
    [240, 240, 240],  // off-white
    [200, 80, 80],    // przygaszona czerwień
    [80, 120, 200],   // denimowy niebieski
    [100, 160, 100]   // oliwkowa zieleń
];

//symbole palety
const symbols = ["A", "B", "C", "D", "E"];

let currentColor = symbols[0];

palette.forEach(([r, g, b], index) => {
    const symbol = symbols[index];
    const btn = document.createElement("button");
    btn.innerHTML = symbol;
    btn.style.backgroundColor = `rgb(${r},${g},${b})`;
    btn.style.color = "white";
    btn.style.marginRight = "5px";
    btn.style.width = "30px";
    btn.style.height = "30px";
    btn.style.border = "1px solid #000";

    btn.addEventListener("click", () => {
        currentSymbol = symbol; // ustawiamy aktualny symbol
        // opcjonalnie: oznaczyć aktywny przycisk
        document.querySelectorAll("#symbolsContainer button").forEach(b => b.style.outline = "none");
        btn.style.outline = "2px solid black";
    });

    symbolsContainer.appendChild(btn);
});



//legenda

    palette.forEach(([r, g, b], index) => {
        const symbol = symbols[index];
        const item = document.createElement("div");

        // każdy element legendy: symbol + kolor
        item.innerHTML = `
            <span style="
                display:inline-block;
                width:20px; 
                height:20px; 
                background-color: rgb(${r},${g},${b});
                border:1px solid #000;
                margin-right:5px;
                vertical-align:middle;"></span>
            ${symbol}
        `;

        legendDiv.appendChild(item);
    });


//przypisanie koloru z palety

function getClosestColorIndex(r, g, b) {
    let closestIndex = 0;
    let minDistance = Infinity;

    palette.forEach(([pr, pg, pb], index) => {
        const distance =
            (r - pr) ** 2 +
            (g - pg) ** 2 +
            (b - pb) ** 2;

        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}


// Funkcja generująca liczby u góry
function generateTopNumbers() {
    const width = parseInt(widthInput.value) || 0;
    topNumbersContainer.innerHTML = "";                 // czyścimy poprzednie liczby
    topNumbersContainer.style.setProperty("--cols", width); // ustawiamy CSS zmienną dla kolumn

    for (let i = 1; i <= width; i++) {                 // tworzymy liczby od 1 do width
        const numberDiv = document.createElement("div");
        numberDiv.textContent = i;
        topNumbersContainer.appendChild(numberDiv);   // dodajemy do kontenera
    }
}

// Funkcja generująca liczby po lewej od dołu
function generateLeftNumbers() {
    const height = parseInt(heightInput.value) || 0;
    leftNumbersContainer.innerHTML = "";               // czyścimy poprzednie liczby
    leftNumbersContainer.style.setProperty("--rows", height); // ustawiamy CSS zmienną dla wierszy

    for (let i = 1; i <= height; i++) {               // od 1 do height
        const numberDiv = document.createElement("div");
        numberDiv.textContent = i;
        leftNumbersContainer.prepend(numberDiv);      // wstawiamy na początek, żeby rosnęło od dołu
    }
}

// Funkcja generująca właściwy grid
function generateGrid() {
    const width = parseInt(widthInput.value) || 0;
    const height = parseInt(heightInput.value) || 0;

    grid.innerHTML = "";                              // czyścimy poprzedni grid
    grid.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`; // dynamiczne kolumny
    grid.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;   // dynamiczne wiersze

    for (let i = 0; i < width * height; i++) {       // tworzymy wszystkie komórki
        const cell = document.createElement("div");
        cell.classList.add("cell");

        cell.addEventListener("click", () => {
    if (symbolMode) {
        // ustawiamy symbol wybrany w pickerze
        cell.textContent = currentSymbol;
        // opcjonalnie ustaw kolor tła odpowiadający symbolowi
        const index = symbols.indexOf(currentSymbol);
        const [r,g,b] = palette[index];
        cell.style.backgroundColor = `rgb(${r},${g},${b})`;
    } else {
        // stary tryb „klik toggle o”
        if (cell.textContent === "o") {
            cell.textContent = "";
        } else {
            cell.textContent = "o";
        }
    }
});

        grid.appendChild(cell);
    }
}

// Funkcja wywołująca wszystkie trzy generacje
function generateAll() {
    generateTopNumbers();
    generateLeftNumbers();
    generateGrid();
}

//funkcja do importu do PDF
function printPDF() {
    window.print();
}

// Obsługa przycisku generuj
generateBtn.addEventListener("click", generateAll);

// Obsługa przycisku importuj
printBtn.addEventListener("click", printPDF)



// Obsługa suwaka zmieniającego rozmiar komórek
cellSizeSlider.addEventListener("input", () => {
    const newSize = cellSizeSlider.value + "px";       // pobieramy nową wartość
    document.documentElement.style.setProperty("--cell-size", newSize); // aktualizujemy zmienną CSS

    // Aktualizujemy grid, żeby kolumny/wiersze były dopasowane do nowego rozmiaru
    const width = parseInt(widthInput.value) || 0;
    const height = parseInt(heightInput.value) || 0;
    grid.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
    grid.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;
    topNumbersContainer.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
    leftNumbersContainer.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;
});

//ograniczenie kolorów 1a

// function quantizeColor(r, g, b, levels = 5) {
//     const step = 255 / (levels - 1);

//     return [
//         Math.round(r / step) * step,
//         Math.round(g / step) * step,
//         Math.round(b / step) * step
//     ]
// }

//funkcja ładująca obraz

imageInput.addEventListener("change", handleImageAutoGrid);

function handleImageAutoGrid(e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        const maxCells = 90; // maksymalna liczba komórek w jednej osi 

        // obliczamy proporcje obrazu
        let cols = img.width;
        let rows = img.height;

        if (cols > rows) {
            if (cols > maxCells) {
                const scale = maxCells / cols;
                cols = maxCells;
                rows = Math.round(rows * scale);
            }
        } else {
            if (rows > maxCells) {
                const scale = maxCells / rows;
                rows = maxCells;
                cols = Math.round(cols * scale);
            }
        }

        // ustawiamy inputy width i height automatycznie
        widthInput.value = cols;
        heightInput.value = rows;

        // generujemy grid o wymiarach obrazu
        generateAll();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = cols;
        canvas.height = rows;

        // skalujemy obraz do wymiarów gridu
        ctx.drawImage(img, 0, 0, cols, rows);

        const imageData = ctx.getImageData(0, 0, cols, rows);
        const data = imageData.data;

        const cells = document.querySelectorAll("#grid .cell");

        // czyszczenie poprzednich kolorów
        cells.forEach(cell => cell.style.backgroundColor = "");

        //odczyt checkboxa////////////////////////////////////////////////////
        const brickPattern = document.getElementById("brickPattern").checked;
        

        for (let i = 0; i < cols * rows; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            //PATTERN CEGIEŁKOWY
            if (brickPattern) {
                const isOffsetRow = row % 2 === 1;
                if ((col + (isOffsetRow ? 1 : 0)) % 2 === 1) {
                    continue; // pomijamy komórkę
                }
            }

            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];

            //ograniczenie kolorów
            const colorIndex = getClosestColorIndex(r, g, b);
            const [nr, ng, nb] = palette[colorIndex];

            cells[i].dataset.colorIndex = colorIndex;
            cells[i].style.backgroundColor = `rgb(${nr}, ${ng}, ${nb})`;
            cells[i].textContent = "";

            //1a
            // cells[i].style.backgroundColor = `rgb(${nr}, ${ng}, ${nb})`;

            //mmniejsze ograniczenie kolorów 1a
            // const [nr, ng, nb] = quantizeColor(r, g, b, 5);
            // cells[i].style.backgroundColor = `rgb(${nr}, ${ng}, ${nb})`;


        }
    };

    img.src = URL.createObjectURL(file);

    //checkbox dla symboli

    symbolModeCheckbox.addEventListener("change", () => {
        const cells = document.querySelectorAll("#grid .cell");

        cells.forEach(cell => {
            const index = cell.dataset.colorIndex;

            if (index === undefined) return;

            if (symbolModeCheckbox.checked) {
                cell.textContent = symbols[index];
                cell.style.backgroundColor = "white";
                cell.style.color = "black";
            } else {
                const [r, g, b] = palette[index];
                cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                cell.textContent = "";
            }
        });
    });

generateAll();
generateLegend();

}