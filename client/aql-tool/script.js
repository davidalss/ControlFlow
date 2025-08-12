document.addEventListener('DOMContentLoaded', () => {
    // Define AQL tables

    // Table 1: Lot Size Range to Sample Size Code (General Inspection Levels)
    const lotSizeToCode = [
        { range: [2, 8], I: 'A', II: 'B', III: 'C' },
        { range: [9, 15], I: 'B', II: 'C', III: 'D' },
        { range: [16, 25], I: 'C', II: 'D', III: 'E' },
        { range: [26, 50], I: 'D', II: 'E', III: 'F' },
        { range: [51, 90], I: 'E', II: 'F', III: 'G' },
        { range: [91, 150], I: 'F', II: 'G', III: 'H' },
        { range: [151, 280], I: 'G', II: 'H', III: 'J' },
        { range: [281, 500], I: 'H', II: 'J', III: 'K' },
        { range: [501, 1200], I: 'J', II: 'K', III: 'L' },
        { range: [1201, 3200], I: 'K', II: 'L', III: 'M' },
        { range: [3201, 10000], I: 'L', II: 'M', III: 'N' },
        { range: [10001, 35000], I: 'M', II: 'N', III: 'P' },
        { range: [35001, 150000], I: 'N', II: 'P', III: 'Q' },
        { range: [150001, 500000], I: 'P', II: 'Q', III: 'R' },
        { range: [500001, Infinity], I: 'Q', II: 'R', III: 'S' }
    ];

    // Table 2: Sample Size Code to Sample Size (n)
    const codeToSampleSize = {
        'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50,
        'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250,
        'R': 2000, 'S': 3150
    };

    // Table 3: Sample Size (n) to Ac/Re values for specific AQLs
    // Values are based on common AQL tables (e.g., MIL-STD-105E / ISO 2859-1, single sampling plan)
    const aqlData = {
        2: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
        3: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
        5: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
        8: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 0, Re: 1 }, '4.0': { Ac: 0, Re: 1 } },
        13: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 1, Re: 2 } },
        20: { '1.0': { Ac: 0, Re: 1 }, '2.5': { Ac: 1, Re: 2 }, '4.0': { Ac: 2, Re: 3 } },
        32: { '1.0': { Ac: 1, Re: 2 }, '2.5': { Ac: 2, Re: 3 }, '4.0': { Ac: 3, Re: 4 } },
        50: { '1.0': { Ac: 1, Re: 2 }, '2.5': { Ac: 3, Re: 4 }, '4.0': { Ac: 5, Re: 6 } },
        80: { '1.0': { Ac: 2, Re: 3 }, '2.5': { Ac: 5, Re: 6 }, '4.0': { Ac: 7, Re: 8 } },
        125: { '1.0': { Ac: 3, Re: 4 }, '2.5': { Ac: 7, Re: 8 }, '4.0': { Ac: 10, Re: 11 } },
        200: { '1.0': { Ac: 5, Re: 6 }, '2.5': { Ac: 10, Re: 11 }, '4.0': { Ac: 14, Re: 15 } },
        315: { '1.0': { Ac: 7, Re: 8 }, '2.5': { Ac: 14, Re: 15 }, '4.0': { Ac: 21, Re: 22 } },
        500: { '1.0': { Ac: 10, Re: 11 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
        800: { '1.0': { Ac: 14, Re: 15 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
        1250: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
        2000: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } },
        3150: { '1.0': { Ac: 21, Re: 22 }, '2.5': { Ac: 21, Re: 22 }, '4.0': { Ac: 21, Re: 22 } }
    };

    // Get DOM elements
    const lotSizeInput = document.getElementById('lotSize');
    const inspectionLevelSelect = document.getElementById('inspectionLevel');
    const aqlTableContainer = document.getElementById('aqlTableContainer');
    const actualInspectionQuantityInput = document.getElementById('actualInspectionQuantity');
    const inspectionStatusDiv = document.getElementById('inspectionStatus');

    let requiredSampleSize = 0; // To store the calculated sample size for later comparison

    /**
     * Calculates the AQL sample size and acceptance/rejection criteria
     * based on user inputs and displays them in a table.
     */
    window.calculateAQL = function() {
        const lotSize = parseInt(lotSizeInput.value);
        const inspectionLevel = inspectionLevelSelect.value;

        if (isNaN(lotSize) || lotSize <= 0) {
            alert('Por favor, insira um Tamanho do Lote válido (número inteiro positivo).');
            aqlTableContainer.innerHTML = '';
            inspectionStatusDiv.innerHTML = '';
            actualInspectionQuantityInput.value = 0;
            requiredSampleSize = 0;
            return;
        }

        // 1. Determine Sample Size Code
        let sampleSizeCode = '';
        for (const entry of lotSizeToCode) {
            if (lotSize >= entry.range[0] && lotSize <= entry.range[1]) {
                sampleSizeCode = entry[inspectionLevel];
                break;
            }
        }

        if (!sampleSizeCode) {
            aqlTableContainer.innerHTML = '<p>Não foi possível determinar o Código do Tamanho da Amostra para o Tamanho do Lote e Nível de Inspeção fornecidos.</p>';
            inspectionStatusDiv.innerHTML = '';
            actualInspectionQuantityInput.value = 0;
            requiredSampleSize = 0;
            return;
        }

        // 2. Determine Sample Size (n)
        const sampleSize = codeToSampleSize[sampleSizeCode];
        requiredSampleSize = sampleSize; // Store for inspection quantity comparison

        if (!sampleSize) {
            aqlTableContainer.innerHTML = '<p>Não foi possível determinar o Tamanho da Amostra para o Código de Tamanho da Amostra: ' + sampleSizeCode + '</p>';
            inspectionStatusDiv.innerHTML = '';
            actualInspectionQuantityInput.value = 0;
            requiredSampleSize = 0;
            return;
        }

        // 3. Get Ac/Re values for specified AQLs
        const aql1_0 = aqlData[sampleSize] ? aqlData[sampleSize]['1.0'] : { Ac: '-', Re: '-' };
        const aql2_5 = aqlData[sampleSize] ? aqlData[sampleSize]['2.5'] : { Ac: '-', Re: '-' };
        const aql4_0 = aqlData[sampleSize] ? aqlData[sampleSize]['4.0'] : { Ac: '-', Re: '-' };

        // Generate HTML table
        let tableHtml = `
            <h2>Resultados AQL</h2>
            <table id="aqlTable">
                <thead>
                    <tr>
                        <th>Tamanho da Amostra</th>
                        <th>AQL 1,0% (Críticos)</th>
                        <th>AQL 2,5% (Maiores)</th>
                        <th>AQL 4,0% (Menores)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${sampleSize}</td>
                        <td>Ac: ${aql1_0.Ac} / Re: ${aql1_0.Re}</td>
                        <td>Ac: ${aql2_5.Ac} / Re: ${aql2_5.Re}</td>
                        <td>Ac: ${aql4_0.Ac} / Re: ${aql4_0.Re}</td>
                    </tr>
                </tbody>
            </table>
        `;
        aqlTableContainer.innerHTML = tableHtml;

        // Reset and update inspection quantity status
        actualInspectionQuantityInput.value = 0; // Reset for new calculation
        updateInspectionStatus();
    };

    /**
     * Updates the inspection status based on the actual quantity entered
     * and the required sample size.
     */
    function updateInspectionStatus() {
        const actualQuantity = parseInt(actualInspectionQuantityInput.value);

        inspectionStatusDiv.className = 'inspection-status'; // Reset classes

        if (requiredSampleSize === 0) {
            inspectionStatusDiv.innerHTML = 'Calcule o AQL primeiro.';
            return;
        }

        if (isNaN(actualQuantity) || actualQuantity < 0) {
            inspectionStatusDiv.innerHTML = 'Por favor, insira uma quantidade válida.';
            return;
        }

        if (actualQuantity === requiredSampleSize) {
            inspectionStatusDiv.classList.add('status-green');
            inspectionStatusDiv.innerHTML = `Quantidade inspecionada (${actualQuantity}) é igual ao tamanho da amostra (${requiredSampleSize}). OK!`;
        } else if (actualQuantity < requiredSampleSize) {
            inspectionStatusDiv.classList.add('status-red');
            inspectionStatusDiv.innerHTML = `Quantidade inspecionada (${actualQuantity}) é MENOR que o tamanho da amostra (${requiredSampleSize}).`;
            // Prompt for confirmation if less
            if (confirm(`A quantidade inspecionada (${actualQuantity}) é menor que o tamanho da amostra (${requiredSampleSize}). Tem certeza que deseja continuar?`)) {
                // User confirmed to proceed
                inspectionStatusDiv.innerHTML += ' Usuário confirmou continuar.';
            } else {
                // User cancelled, reset input
                actualInspectionQuantityInput.value = requiredSampleSize;
                updateInspectionStatus(); // Recalculate status
            }
        } else { // actualQuantity > requiredSampleSize
            inspectionStatusDiv.classList.add('status-green'); // Still considered OK, but might be over-inspection
            inspectionStatusDiv.innerHTML = `Quantidade inspecionada (${actualQuantity}) é MAIOR que o tamanho da amostra (${requiredSampleSize}). OK!`;
        }
    }

    // Add event listener for dynamic updates on inspection quantity input
    actualInspectionQuantityInput.addEventListener('input', updateInspectionStatus);

    // Initial calculation on page load (optional, but good for showing initial state)
    calculateAQL();
});
