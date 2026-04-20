
// --- BASE DE DATOS: TABLA TIEMPO EXACTO ---
const tablaTiempoExacto = {
    año1: {
        ene: Array.from({length: 31}, (_, i) => 1 + i),
        feb: Array.from({length: 28}, (_, i) => 32 + i),
        mar: Array.from({length: 31}, (_, i) => 60 + i),
        abr: Array.from({length: 30}, (_, i) => 91 + i),
        may: Array.from({length: 31}, (_, i) => 121 + i),
        jun: Array.from({length: 30}, (_, i) => 152 + i),
        jul: Array.from({length: 31}, (_, i) => 182 + i),
        ago: Array.from({length: 31}, (_, i) => 213 + i),
        sep: Array.from({length: 30}, (_, i) => 244 + i),
        oct: Array.from({length: 31}, (_, i) => 274 + i),
        nov: Array.from({length: 30}, (_, i) => 305 + i),
        dic: Array.from({length: 31}, (_, i) => 335 + i)
    },
    año2: {
        ene: Array.from({length: 31}, (_, i) => 366 + i),
        feb: Array.from({length: 28}, (_, i) => 397 + i),
        mar: Array.from({length: 31}, (_, i) => 425 + i),
        abr: Array.from({length: 30}, (_, i) => 456 + i),
        may: Array.from({length: 31}, (_, i) => 486 + i),
        jun: Array.from({length: 30}, (_, i) => 517 + i),
        jul: Array.from({length: 31}, (_, i) => 547 + i),
        ago: Array.from({length: 31}, (_, i) => 578 + i),
        sep: Array.from({length: 30}, (_, i) => 609 + i),
        oct: Array.from({length: 31}, (_, i) => 639 + i),
        nov: Array.from({length: 30}, (_, i) => 670 + i),
        dic: Array.from({length: 31}, (_, i) => 700 + i)
    }
};

// --- CONFIGURACIÓN DE FORMULAS ---
const secciones = {
    simple: {
        titulo: "Interés Simple",
        color: "border-primary",
        formulas: {
            "I": { nombre: "Calcular Interés (I=Pit)", campos: ["P", "i", "t"] },
            "P": { nombre: "Calcular Capital (P=I/it)", campos: ["I", "i", "t"] },
            "i": { nombre: "Calcular Tasa (i=I/Pt)", campos: ["I", "P", "t"] },
            "t": { nombre: "Calcular Tiempo (t=I/Pi)", campos: ["I", "P", "i"] }
        }
    },
    monto: {
        titulo: "Interés Simple (Monto)",
        color: "border-success",
        formulas: {
            "S": { nombre: "Calcular Monto (S=P(1+it))", campos: ["P", "i", "t"] },
            "Ps": { nombre: "Calcular Capital (P=S/1+it)", campos: ["S", "i", "t"] },
            "is": { nombre: "Calcular Tasa (i=S/P-1/t)", campos: ["S", "P", "t"] },
            "ts": { nombre: "Calcular Tiempo (t=S/P-1/i)", campos: ["S", "P", "i"] }
        }
    },
    fechas: { titulo: "Cálculo de Fechas", color: "border-warning" },
    tipos: {
        titulo: "Tipos de Interés",
        color: "border-info",
        formulas: {
            "Io": { nombre: "Interés Ordinario (360)", campos: ["P", "i", "t"] },
            "Ie": { nombre: "Interés Exacto (365)", campos: ["P", "i", "t"] }
        }
    }
};

// --- RENDERIZACION CREAR CAMPOS EXTRAS ---
function renderizarCalculadora(tipo) {
    const contenedor = document.getElementById('contenedor-principal');
    const info = secciones[tipo];
    
    let htmlForm = "";

    if (tipo === 'fechas') {
        htmlForm = `
            <div class="d-flex gap-2 mb-3">
                <button class="btn btn-warning w-50 text-white" onclick="generarInputsFecha('Comercial')">Tiempo Comercial</button>
                <button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Exacto')">Tiempo Exacto</button>
            </div>
            <div id="sub-formulario"></div>`;
    } else {
        htmlForm = `
            <div class="row g-2 mb-3">
                ${Object.keys(info.formulas).map(f => `
                    <div class="col-md-6">
                        <button class="btn btn-sm btn-dark w-100" onclick="generarInputsFormula('${tipo}', '${f}')">${info.formulas[f].nombre}</button>
                    </div>
                `).join('')}
            </div>
            <div id="sub-formulario"></div>`;
    }

    contenedor.innerHTML = `
        <div class="card p-4 border-2 ${info.color} fade-in">
            <h3 class="fw-bold mb-3">${info.titulo}</h3>
            ${htmlForm}
            <div id="resultado" class="mt-3 fw-bold text-center text-primary h4"></div>
        </div>`;
}

// --- GENERADOR DE INPUTS PARA FÓRMULAS ---
function generarInputsFormula(cat, formKey) {
    const contenedor = document.getElementById('sub-formulario');
    const formula = secciones[cat].formulas[formKey];
    
    contenedor.innerHTML = `
        <div class="bg-light p-3 rounded">
            ${formula.campos.map(c => `
                <div class="mb-2">
                    <label class="form-label small">Ingrese ${c}:</label>
                    <input type="number" id="val-${c}" class="form-control form-control-sm">
                </div>
            `).join('')}
            <button class="btn btn-primary w-100 mt-2" onclick="procesarCalculo('${formKey}')">Calcular</button>
        </div>`;
}

// --- LÓGICA DE CÁLCULO DE FECHAS ---
function generarInputsFormula(cat, formKey) {
    const contenedor = document.getElementById('sub-formulario');
    const formula = secciones[cat].formulas[formKey];
    
    let htmlInputs = formula.campos.map(c => {
        // Lógica especial para la Tasa (i)
        if (c === 'i' || c === 'is') {
            return `
                <div class="mb-3">
                    <label class="form-label small fw-bold">Tasa de Interés (%)</label>
                    <div class="input-group">
                        <input type="number" id="val-${c}" class="form-control" placeholder="Ej: 5" oninput="actualizarDecimal('${c}')">
                        <span class="input-group-text">Decimal:</span>
                        <input type="text" id="res-decimal-${c}" class="form-control bg-light" readonly placeholder="0.00">
                    </div>
                </div>`;
        }
        
        // Lógica especial para el Tiempo (t)
        if (c === 't' || c === 'ts') {
            return `
                <div class="mb-3">
                    <label class="form-label small fw-bold">Tiempo</label>
                    <div class="input-group">
                        <input type="number" id="val-${c}" class="form-control" placeholder="Cantidad" oninput="actualizarTiempo('${c}')">
                        <select id="unidad-${c}" class="form-select" onchange="actualizarTiempo('${c}')">
                            <option value="anios">Años</option>
                            <option value="meses">Meses</option>
                        </select>
                        <span class="input-group-text">En Años:</span>
                        <input type="text" id="res-tiempo-${c}" class="form-control bg-light" readonly placeholder="0.00">
                    </div>
                </div>`;
        }

        // Campos normales (P, I, S)
        return `
            <div class="mb-2">
                <label class="form-label small fw-bold">Ingrese ${c}:</label>
                <input type="number" id="val-${c}" class="form-control">
            </div>`;
    }).join('');

    contenedor.innerHTML = `
        <div class="bg-light p-3 rounded shadow-sm fade-in">
            ${htmlInputs}
            <button class="btn btn-primary w-100 mt-2 fw-bold" onclick="procesarCalculo('${formKey}')">REALIZAR CÁLCULO</button>
        </div>`;
}
// Actualiza el campo de representación decimal de la tasa
function actualizarDecimal(id) {
    const valor = parseFloat(document.getElementById(`val-${id}`).value);
    const campoDestino = document.getElementById(`res-decimal-${id}`);
    if (!isNaN(valor)) {
        campoDestino.value = (valor / 100).toFixed(4);
    } else {
        campoDestino.value = "";
    }
}

// Actualiza el campo de tiempo convertido a años
function actualizarTiempo(id) {
    const valor = parseFloat(document.getElementById(`val-${id}`).value);
    const unidad = document.getElementById(`unidad-${id}`).value;
    const campoDestino = document.getElementById(`res-tiempo-${id}`);
    
    if (!isNaN(valor)) {
        if (unidad === "meses") {
            campoDestino.value = (valor / 12).toFixed(4);
        } else {
            campoDestino.value = valor.toFixed(2);
        }
    } else {
        campoDestino.value = "";
    }
}

function calcularFechas(modo) {
    const res = document.getElementById('resultado');
    const fI = { d: parseInt(document.getElementById('ini-d').value), m: document.getElementById('ini-m').value, a: parseInt(document.getElementById('ini-a').value) };
    const fF = { d: parseInt(document.getElementById('fin-d').value), m: document.getElementById('fin-m').value, a: parseInt(document.getElementById('fin-a').value) };

    if (modo === 'Exacto') {
        // Uso de la tabla 
        const tablaUso = (fF.a > fI.a) ? 'año2' : 'año1';
        const vI = tablaTiempoExacto.año1[fI.m][fI.d - 1];
        const vF = tablaTiempoExacto[tablaUso][fF.m][fF.d - 1];
        res.innerText = `Resultado: ${vF - vI} días (Exactos)`;
    } else {
        // Tiempo Comercial (Resta con préstamo)
        let dF = fF.d, mF = document.getElementById('fin-m').selectedIndex + 1, aF = fF.a;
        let dI = fI.d, mI = document.getElementById('ini-m').selectedIndex + 1, aI = fI.a;

        if (dF < dI) { dF += 30; mF -= 1; }
        if (mF < mI) { mF += 12; aF -= 1; }
        
        const total = ((aF - aI) * 360) + ((mF - mI) * 30) + (dF - dI);
        res.innerText = `Resultado: ${total} días (Comerciales)`;
    }
}

// Función maestra para procesar cálculos de interés
function procesarCalculo(key) {
    const res = document.getElementById('resultado');
    
    // Función auxiliar para obtener valores ya procesados (decimales y años)
    const obtenerValor = (id) => {
        const inputOriginal = document.getElementById(`val-${id}`);
        const inputDecimal = document.getElementById(`res-decimal-${id}`);
        const inputTiempo = document.getElementById(`res-tiempo-${id}`);
        
        // 1. Si el input no existe en el DOM para esta fórmula, devolvemos 0 o null
        if (!inputOriginal) return 0;

        // 2. Si existe el campo espejo decimal (para la tasa i), usamos ese valor
        if (inputDecimal && inputDecimal.value !== "") return parseFloat(inputDecimal.value);
        
        // 3. Si existe el campo espejo de tiempo (para t), usamos ese valor
        if (inputTiempo && inputTiempo.value !== "") return parseFloat(inputTiempo.value);
        
        // 4. Si no hay campos espejo, usamos el valor del input original
        return parseFloat(inputOriginal.value) || 0;
    };

    // Ahora extraemos todas las variables posibles usando la función de arriba
    const P = obtenerValor('P');
    const I = obtenerValor('I');
    const S = obtenerValor('S');
    const i = obtenerValor('i') || obtenerValor('is'); // busca en ambas versiones de tasa
    const t = obtenerValor('t') || obtenerValor('ts'); // busca en ambas versiones de tiempo

    let resultadoFinal = 0;
    let etiqueta = "";
    // --------------------------------------

   // --- LÓGICA PARA TODAS LAS FÓRMULAS ---
    switch(key) {
        // INTERÉS SIMPLE
        case 'I': 
            resultadoFinal = P * i * t; 
            etiqueta = "Interés (I)";
            ultimoCalculo = { P, i, t, I: resultadoFinal, S: P + resultadoFinal };
            break;
        case 'P':
            resultadoFinal = I / (i * t);
            etiqueta = "Capital Inicial (P)";
            ultimoCalculo = { P: resultadoFinal, i, t, I, S: resultadoFinal + I };
            break;
        case 'i':
            resultadoFinal = (I / (P * t)) * 100; // Multiplicamos por 100 para mostrar porcentaje
            etiqueta = "Tasa de Interés (i)";
            ultimoCalculo = { P, i: resultadoFinal/100, t, I, S: P + I };
            break;
        case 't':
            resultadoFinal = I / (P * i);
            etiqueta = "Tiempo (t en años)";
            ultimoCalculo = { P, i, t: resultadoFinal, I, S: P + I };
            break;

        // MONTO SIMPLE
        case 'S':
            resultadoFinal = P * (1 + (i * t));
            etiqueta = "Monto Final (S)";
            ultimoCalculo = { P, i, t, S: resultadoFinal, I: resultadoFinal - P };
            break;
        case 'Ps':
            resultadoFinal = S / (1 + (i * t));
            etiqueta = "Capital (P)";
            ultimoCalculo = { P: resultadoFinal, i, t, S, I: S - resultadoFinal };
            break;
        case 'is':
            resultadoFinal = ((S / P) - 1) / t * 100;
            etiqueta = "Tasa (i)";
            ultimoCalculo = { P, i: resultadoFinal/100, t, S, I: S - P };
            break;
        case 'ts':
            resultadoFinal = ((S / P) - 1) / i;
            etiqueta = "Tiempo (t en años)";
            ultimoCalculo = { P, i, t: resultadoFinal, S, I: S - P };
            break;

        // TIPOS DE INTERÉS (ORDINARIO Y EXACTO)
        case 'Io':
            // Pit / 360 (Aquí t se toma como días si viene de esta sección)
            // Si el usuario usó el conversor de tiempo, 't' ya está ajustado
            resultadoFinal = (P * i * (t * 360)) / 360; 
            etiqueta = "Interés Ordinario (Io)";
            ultimoCalculo = { P, i, t, I: resultadoFinal, S: P + resultadoFinal };
            break;
        case 'Ie':
            // Pit / 365
            resultadoFinal = (P * i * (t * 365)) / 365;
            etiqueta = "Interés Exacto (Ie)";
            ultimoCalculo = { P, i, t, I: resultadoFinal, S: P + resultadoFinal };
            break;
    }

    // --- RENDERIZADO DEL RESULTADO ---
    if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
        res.innerHTML = `<div class="alert alert-danger mt-3">Por favor, complete todos los campos correctamente.</div>`;
    } else {
        res.innerHTML = `
            <div class="alert alert-success mt-3 fade-in">
                <small class="text-uppercase fw-bold">Resultado:</small>
                <div class="h2 mb-0">${etiqueta}: <strong>${resultadoFinal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</strong></div>
                <hr>
                <button class="btn btn-sm btn-success fw-bold" onclick="mostrarResultadosSecundarios()">
                    🔍 VER RESULTADOS CON LAS DEMÁS FÓRMULAS
                </button>
            </div>
            <div id="panel-secundario"></div>
        `;
    }
}