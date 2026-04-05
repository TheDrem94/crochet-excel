
    const widthInput = document.getElementById("width");
    const heightInput = document.getElementById("height");
    const button = document.getElementById("generate");
    const gridContainer = document.getElementById("grid");
    const topNumbersContainer = document.getElementById("topNumbers");

    gridContainer.innerHTML = "";
    gridContainer.style.display = "grid";
    gridContainer.style.gridTemplateColumns = `repeat(${width}, 50px)`;

    button.addEventListener("click", () => {
        generateTopNumbers();
        generateGrid();
    });

    function generateTopNumbers() {
    const width = parseInt(widthInput.value) || 0;

    topNumbersContainer.innerHTML = "";             // czyścimy poprzednie numerki
    topNumbersContainer.style.setProperty("--cols", width); // ustawiamy liczbę kolumn

    for (let i = 0; i < width; i++) {
        const numberDiv = document.createElement("div");
        numberDiv.textContent = i + 1;                // numeracja od 1
        topNumbersContainer.appendChild(numberDiv);
    }
    }

    function generateGrid() {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);

        gridContainer.innerHTML = "";
        gridContainer.style.display = "grid";
        gridContainer.style.gridTemplateColumns = `repeat(${width}, 25px)`;
        gridContainer.classList.add("grid");

        for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        cell.addEventListener("click", () => {
            if (cell.textContent === "X") {
                cell.textContent = "";
            } else {
                cell.textContent = "X";
            }
        });
        gridContainer.appendChild(cell);
    }
    }