// --- VARIABLES GLOBALES DE ESTADO ---
let ultimoCalculo = {}; // Almacena el último cálculo para el panel secundario

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
    },
descuento: {
        titulo: "Descuento Simple y Tasas Equivalentes",
        color: "border-danger",
        formulas: {
            "D": { nombre: "Calcular Descuento (D=Sdt)", campos: ["S", "d", "t"] },
            "Pd": { nombre: "Calcular Valor Actual (P=S-D)", campos: ["S", "D"] },
            "P_dt": { nombre: "Valor Actual Directo (P=S(1-dt))", campos: ["S", "d", "t"] },
            "S_dt": { nombre: "Calcular Monto (S=P/(1-dt))", campos: ["P", "d", "t"] },
            "d_despeje": { nombre: "Calcular Tasa Desct. (d)", campos: ["S", "P", "t"] },
            "t_despeje": { nombre: "Calcular Tiempo (t)", campos: ["S", "P", "d"] },
            "d_equiv": { nombre: "Tasa Desct. Equivalente (d)", campos: ["i", "t"] },
            "i_equiv": { nombre: "Tasa Interés Equivalente (i)", campos: ["d", "t"] }
        }
    },
    pagosParciales: {
        titulo: "Pagos Parciales",
        color: "border-secondary",
        formulas: {
            "reglaComercial": { nombre: "Regla Comercial (Artística/Mercantil)", campos: ["P", "i", "t"] }, // Requiere manejar arrays en el futuro
            "reglaAmericana": { nombre: "Regla Americana (Valor de acumulación)", campos: ["P", "i", "t"] }
        }
    },
    compuesto: {
        titulo: "Interés Compuesto",
        color: "border-dark",
        formulas: {
            "S_comp": { nombre: "Monto Compuesto (S=P(1+i)^n)", campos: ["P", "i", "n"] },
            "P_comp": { nombre: "Valor Actual (P=S(1+i)^-n)", campos: ["S", "i", "n"] },
            "n_comp": { nombre: "Calcular Tiempo (n)", campos: ["S", "P", "i"] },
            "i_comp": { nombre: "Calcular Tasa (i)", campos: ["S", "P", "n"] },
            "j_m": { nombre: "Tasa Nominal Equivalente (j)", campos: ["j_prima", "m_prima", "m"] },
            "i_nominal": { nombre: "Tasa Efectiva Anual (i)", campos: ["j", "m", "n"] },
            "j_desde_i": { nombre: "Calcular Tasa Nominal (j desde i)", campos: ["i", "n", "m"] },
            // Sub-resoluciones básicas
            "j_calc": { nombre: "Calcular j (j = i * m)", campos: ["i", "m"] },
            "i_calc": { nombre: "Calcular i (i = j / m)", campos: ["j", "m"] },
            "n_calc": { nombre: "Calcular n (n = ta * m)", campos: ["ta", "m"] },
            // Periodos fraccionarios (Monto y Valor Actual)
            "S_frac_exacto": { nombre: "Monto Frac. Exacto", campos: ["P", "i", "n"] },
            "S_frac_practico": { nombre: "Monto Frac. Práctico", campos: ["P", "i", "n", "t"] },
            "P_frac_exacto": { nombre: "Valor Act. Frac. Exacto", campos: ["S", "i", "n"] },
            "P_frac_practico": { nombre: "Valor Act. Frac. Práctico", campos: ["S", "i", "n", "t"] }
        }

    }

};

// --- RENDERIZACION PRINCIPAL DEL CONTENEDOR ---
function renderizarCalculadora(tipo, botonElemento) {
    // 1. Manejo visual del Menú Principal (Mantiene la selección activa)
    const botonesMenu = document.querySelectorAll('#menu-principal-botones button');
    botonesMenu.forEach(btn => btn.classList.remove('active'));
    if (botonElemento) {
        botonElemento.classList.add('active');
    }

    const contenedor = document.getElementById('contenedor-principal');
    const info = secciones[tipo];
    
    let htmlForm = "";

    if (tipo === 'fechas') {
        htmlForm = `
            <div class="d-flex gap-2 mb-3" id="botones-fechas">
                <button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Comercial', this)">Tiempo Comercial</button>
                <button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Exacto', this)">Tiempo Exacto</button>
            </div>
            <div id="sub-formulario"></div>`;
    } else {
        htmlForm = `
            <div class="row g-2 mb-3" id="botones-formulas">
                ${Object.keys(info.formulas).map(f => `
                    <div class="col-md-6">
                        <button class="btn btn-sm btn-dark w-100" onclick="generarInputsFormula('${tipo}', '${f}', this)">${info.formulas[f].nombre}</button>
                    </div>
                `).join('')}
            </div>
            <div id="sub-formulario"></div>`;
    }

    contenedor.innerHTML = `
        <div class="card p-4 border-2 ${info.color} fade-in shadow-sm">
            <h3 class="fw-bold mb-3">${info.titulo}</h3>
            ${htmlForm}
            <div id="resultado" class="mt-3 fw-bold text-center text-primary h4"></div>
        </div>`;
}

// --- GENERAR INPUTS DINÁMICOS CON TÍTULO Y CONVERSOR ---
function generarInputsFormula(cat, formKey, botonElemento) {
    // 1. Manejo visual de los botones de fórmulas (Mantiene la selección)
    const botonesFormulas = document.querySelectorAll('#botones-formulas button');
    botonesFormulas.forEach(btn => btn.classList.remove('btn-primary'));
    botonesFormulas.forEach(btn => btn.classList.add('btn-dark'));
    if (botonElemento) {
        botonElemento.classList.remove('btn-dark');
        botonElemento.classList.add('btn-primary'); // Se resalta en azul al seleccionarse
    }

    const contenedor = document.getElementById('sub-formulario');
    const formula = secciones[cat].formulas[formKey];
    
    let htmlInputs = formula.campos.map(c => {
        // Lógica especial para la Tasa (i)
        if (c === 'i' || c === 'is' || c === 'd' || c === 'desct' || c === 'j' || c === 'j_prima') {
            return `
                <div class="mb-3 text-start">
                    <label class="form-label small fw-bold">Tasa / Porcentaje (%)</label>
                    <div class="input-group">
                        <input type="number" id="val-${c}" class="form-control" placeholder="Ej: 5" oninput="actualizarDecimal('${c}')">
                        <span class="input-group-text bg-info-subtle">Representación Decimal:</span>
                        <input type="text" id="res-decimal-${c}" class="form-control bg-light" readonly placeholder="0.00">
                    </div>
                </div>`;
        }
        
        // Lógica especial para el Tiempo (t)
        if (c === 't' || c === 'ts') {
            return `
                <div class="mb-3 text-start">
                    <label class="form-label small fw-bold">Tiempo</label>
                    <div class="input-group">
                        <input type="number" id="val-${c}" class="form-control" placeholder="Cantidad" oninput="actualizarTiempo('${c}')">
                        <select id="unidad-${c}" class="form-select" onchange="actualizarTiempo('${c}')">
                            <option value="anios">Años</option>
                            <option value="meses">Meses</option>
                        </select>
                        <span class="input-group-text bg-warning-subtle">Tiempo en Años:</span>
                        <input type="text" id="res-tiempo-${c}" class="form-control bg-light" readonly placeholder="0.00">
                    </div>
                </div>`;
        }

        // Campos normales estructurados (P, I, S)
        const etiquetas = { 
            'P': 'Capital Inicial (P)', 
            'I': 'Interés Neto (I)', 
            'S': 'Monto Acumulado (S)', 
            'D': 'Monto del Descuento (D)',
            'n': 'Número de Periodos (n)',
            'm': 'Frecuencia de Capitalización (m)',
            'ta': 'Tiempo en Años Totales (ta)',
            'j_prima': 'Tasa Nominal Conocida (j\')',
            'm_prima': 'Frecuencia Conocida (m\')' };
        return `
            <div class="mb-3 text-start">
                <label class="form-label small fw-bold">${etiquetas[c] || 'Ingrese ' + c}</label>
                <input type="number" id="val-${c}" class="form-control" placeholder="Monto en $">
            </div>`;
    }).join('');

    // Renderizamos los campos agregando arriba el Título Dinámico de la fórmula
    contenedor.innerHTML = `
        <div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in">
            <h5 class="text-primary border-bottom pb-2 mb-4 text-start fw-bold">
                Formulario: ${formula.nombre}
            </h5>
            ${htmlInputs}
            <button class="btn btn-primary w-100 mt-2 fw-bold shadow-sm" onclick="procesarCalculo('${formKey}')">REALIZAR CÁLCULO</button>
        </div>`;
}

// --- GENERAR INPUTS PARA CÁLCULO DE FECHAS ---
function generarInputsFecha(modo, botonElemento) {
    const botonesFechas = document.querySelectorAll('#botones-fechas button');
    botonesFechas.forEach(btn => btn.classList.remove('active'));
    if (botonElemento) {
        botonElemento.classList.add('active');
    }

    const contenedor = document.getElementById('sub-formulario');
    const campos = (label, id) => `
        <div class="col-md-6 mb-3 text-start">
            <label class="small fw-bold">${label}</label>
            <div class="input-group">
                <input type="number" id="${id}-d" class="form-control" placeholder="Día" min="1" max="31">
                <select id="${id}-m" class="form-select">
                    <option value="ene">Ene</option><option value="feb">Feb</option>
                    <option value="mar">Mar</option><option value="abr">Abr</option>
                    <option value="may">May</option><option value="jun">Jun</option>
                    <option value="jul">Jul</option><option value="ago">Ago</option>
                    <option value="sep">Sep</option><option value="oct">Oct</option>
                    <option value="nov">Nov</option><option value="dic">Dic</option>
                </select>
                <input type="number" id="${id}-a" class="form-control" placeholder="Año">
            </div>
        </div>`;

    contenedor.innerHTML = `
        <div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in">
            <h5 class="text-warning border-bottom pb-2 mb-4 text-start fw-bold">Cálculo de Tiempo (${modo})</h5>
            <div class="row">
                ${campos("Fecha Inicial", "ini")}
                ${campos("Fecha Final", "fin")}
                <div class="col-12 mt-2">
                    <button class="btn btn-warning w-100 text-white fw-bold shadow-sm" onclick="calcularFechas('${modo}')">CALCULAR DIFERENCIA</button>
                </div>
            </div>
        </div>`;
}

// --- LÓGICA DE ACTUALIZACIÓN EN TIEMPO REAL ---
function actualizarDecimal(id) {
    const valor = parseFloat(document.getElementById(`val-${id}`).value);
    const campoDestino = document.getElementById(`res-decimal-${id}`);
    if (!isNaN(valor)) {
        campoDestino.value = (valor / 100).toFixed(4);
    } else {
        campoDestino.value = "";
    }
}

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

// --- CALCULAR DIFERENCIA DE DIAS ---
function calcularFechas(modo) {
    const res = document.getElementById('resultado');
    const fI = { d: parseInt(document.getElementById('ini-d').value), m: document.getElementById('ini-m').value, a: parseInt(document.getElementById('ini-a').value) };
    const fF = { d: parseInt(document.getElementById('fin-d').value), m: document.getElementById('fin-m').value, a: parseInt(document.getElementById('fin-a').value) };

    if (isNaN(fI.d) || isNaN(fF.d) || isNaN(fI.a) || isNaN(fF.a)) {
        res.innerHTML = `<div class="alert alert-danger mt-3 small">Complete las fechas de forma válida.</div>`;
        return;
    }

    if (modo === 'Exacto') {
        const tablaUso = (fF.a > fI.a) ? 'año2' : 'año1';
        const vI = tablaTiempoExacto.año1[fI.m][fI.d - 1];
        const vF = tablaTiempoExacto[tablaUso][fF.m][fF.d - 1];
        res.innerText = `Resultado: ${vF - vI} días (Exactos)`;
    } else {
        let dF = fF.d, mF = document.getElementById('fin-m').selectedIndex + 1, aF = fF.a;
        let dI = fI.d, mI = document.getElementById('ini-m').selectedIndex + 1, aI = fI.a;

        if (dF < dI) { dF += 30; mF -= 1; }
        if (mF < mI) { mF += 12; aF -= 1; }
        
        const total = ((aF - aI) * 360) + ((mF - mI) * 30) + (dF - dI);
        res.innerText = `Resultado: ${total} días (Comerciales)`;
    }
}

// --- PROCESAMIENTO MAESTRO DE INTERESES ---
function procesarCalculo(key) {
    const res = document.getElementById('resultado');
    
    const obtenerValor = (id) => {
        const inputOriginal = document.getElementById(`val-${id}`);
        const inputDecimal = document.getElementById(`res-decimal-${id}`);
        const inputTiempo = document.getElementById(`res-tiempo-${id}`);
        const d = obtenerValor('d') || obtenerValor('desct'); 
        const n = obtenerValor('n');
        const j = obtenerValor('j');
        const m = obtenerValor('m');
        const ta = obtenerValor('ta'); // Tiempo en años
        const j_prima = obtenerValor('j_prima');
        const m_prima = obtenerValor('m_prima');

        if (!inputOriginal) return 0;
        if (inputDecimal && inputDecimal.value !== "") return parseFloat(inputDecimal.value);
        if (inputTiempo && inputTiempo.value !== "") return parseFloat(inputTiempo.value);
        
        return parseFloat(inputOriginal.value) || 0;
    };

    const P = obtenerValor('P');
    const I = obtenerValor('I');
    const S = obtenerValor('S');
    const i = obtenerValor('i') || obtenerValor('is');
    const t = obtenerValor('t') || obtenerValor('ts');

    let resultadoFinal = 0;
    let etiqueta = "";

    switch(key) {
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
            resultadoFinal = (I / (P * t)) * 100; 
            etiqueta = "Tasa de Interés (i)";
            ultimoCalculo = { P, i: resultadoFinal/100, t, I, S: P + I };
            break;
        case 't':
            resultadoFinal = I / (P * i);
            etiqueta = "Tiempo (t en años)";
            ultimoCalculo = { P, i, t: resultadoFinal, I, S: P + I };
            break;
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
        case 'Io':
            resultadoFinal = (P * i * (t * 360)) / 360; 
            etiqueta = "Interés Ordinario (Io)";
            ultimoCalculo = { P, i, t, I: resultadoFinal, S: P + resultadoFinal };
            break;
        case 'Ie':
            resultadoFinal = (P * i * (t * 365)) / 365;
            etiqueta = "Interés Exacto (Ie)";
            ultimoCalculo = { P, i, t, I: resultadoFinal, S: P + resultadoFinal };
            break;

// --- DESCUENTO SIMPLE ---
        case 'D':
            resultadoFinal = S * d * t;
            etiqueta = "Descuento (D)";
            break;
        case 'Pd':
            resultadoFinal = S - I; // Usa el campo 'I' o un campo genérico de descuento ingresado en la interfaz
            etiqueta = "Valor Actual (P)";
            break;
        case 'P_dt':
            resultadoFinal = S * (1 - (d * t));
            etiqueta = "Valor Actual (P)";
            break;
        case 'S_dt':
            resultadoFinal = P / (1 - (d * t));
            etiqueta = "Monto Final (S)";
            break;
        case 'd_despeje':
            // Corregido matemáticamente según la fórmula financiera estándar d = (1 - P/S) / t
            resultadoFinal = ((1 - (P / S)) / t) * 100;
            etiqueta = "Tasa de Descuento (d)";
            break;
        case 't_despeje':
            // t = (1 - P/S) / d
            resultadoFinal = (1 - (P / S)) / d;
            etiqueta = "Tiempo (t en años)";
            break;
        case 'd_equiv':
            resultadoFinal = (i / (1 + (i * t))) * 100;
            etiqueta = "Tasa Desct. Equivalente (d)";
            break;
        case 'i_equiv':
            resultadoFinal = (d / (1 - (d * t))) * 100;
            etiqueta = "Tasa Interés Equivalente (i)";
            break;

        // --- PAGOS PARCIALES (INTERFAZ BASE) ---
        case 'reglaComercial':
            resultadoFinal = P * (1 + (i * t)); // Base inicial, la liquidación requiere tabla de eventos
            etiqueta = "Monto Final aproximado (Regla Comercial)";
            break;
        case 'reglaAmericana':
            resultadoFinal = P * Math.pow((1 + i), t);
            etiqueta = "Monto Acumulado aproximado (Regla Americana)";
            break;

        // --- INTERÉS COMPUESTO ---
        case 'S_comp':
            resultadoFinal = P * Math.pow((1 + i), n);
            etiqueta = "Monto Compuesto (S)";
            break;
        case 'P_comp':
            resultadoFinal = S * Math.pow((1 + i), -n);
            etiqueta = "Valor Actual Compuesto (P)";
            break;
        case 'n_comp':
            // n = ln(S/P) / ln(1+i)
            resultadoFinal = Math.log(S / P) / Math.log(1 + i);
            etiqueta = "Número de Periodos (n)";
            break;
        case 'i_comp':
            // i = (S/P)^(1/n) - 1
            resultadoFinal = (Math.pow((S / P), (1 / n)) - 1) * 100;
            etiqueta = "Tasa de Interés Compuesta (i)";
            break;
        case 'j_m':
            // j = m * [(1 + (j'/m'))^(m'/m) - 1]
            resultadoFinal = m * (Math.pow((1 + (j_prima / m_prima)), (m_prima / m)) - 1) * 100;
            etiqueta = "Tasa Nominal Equivalente (j)";
            break;
        case 'i_nominal':
            // i = [(1 + j/m)^(n*m) - 1] / n
            resultadoFinal = ((Math.pow((1 + (j / m)), (n * m)) - 1) / n) * 100;
            etiqueta = "Tasa Efectiva (i)";
            break;
        case 'j_desde_i':
            // j = m * [(1 + i*n)^(1/(n*m)) - 1]
            resultadoFinal = m * (Math.pow((1 + (i * n)), (1 / (n * m))) - 1) * 100;
            etiqueta = "Tasa Nominal Encontrada (j)";
            break;

        // --- SUB-RESOLUCIONES COMPUESTAS ---
        case 'j_calc':
            resultadoFinal = (i * m) * 100;
            etiqueta = "Tasa Nominal (j)";
            break;
        case 'i_calc':
            resultadoFinal = (j / m) * 100;
            etiqueta = "Tasa por Periodo (i)";
            break;
        case 'n_calc':
            resultadoFinal = ta * m;
            etiqueta = "Número Total de Periodos (n)";
            break;

        // --- PERIODOS FRACCIONARIOS ---
        case 'S_frac_exacto':
            resultadoFinal = P * Math.pow((1 + i), n);
            etiqueta = "Monto Fraccionario Exacto (S)";
            break;
        case 'S_frac_practico':
            // S = P * (1+i)^n * (1+it)
            resultadoFinal = P * Math.pow((1 + i), n) * (1 + (i * t));
            etiqueta = "Monto Fraccionario Práctico (S)";
            break;
        case 'P_frac_exacto':
            resultadoFinal = S * Math.pow((1 + i), -n);
            etiqueta = "Valor Actual Fraccionario Exacto (P)";
            break;
        case 'P_frac_practico':
            // P = S * (1+i)^-n * (1+it)
            resultadoFinal = S * Math.pow((1 + i), -n) * (1 + (i * t));
            etiqueta = "Valor Actual Fraccionario Práctico (P)";
            break;

    }

    if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
        res.innerHTML = `<div class="alert alert-danger mt-3 small">Por favor, complete todos los campos correctamente.</div>`;
    } else {
        // Determinamos el formato de salida si es tasa (%) o capital ($)
        const sufijo = (key === 'i' || key === 'is') ? "%" : "";
        const prefijo = (key !== 'i' && key !== 'is' && key !== 't' && key !== 'ts') ? "$" : "";
        
        res.innerHTML = `
            <div class="alert alert-success mt-3 fade-in shadow-sm">
                <small class="text-uppercase fw-bold text-secondary">Resultado Encontrado</small>
                <div class="h2 mb-0 mt-1">${etiqueta}: <strong>${prefijo}${resultadoFinal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}${sufijo}</strong></div>
                <hr>
                <button class="btn btn-sm btn-success fw-bold" onclick="mostrarResultadosSecundarios()">
                    🔍 VER RESULTADOS CON LAS DEMÁS FÓRMULAS
                </button>
            </div>
            <div id="panel-secundario"></div>`;
    }
}

// --- RENDERIZAR PANEL DE DERIVADOS ---
function mostrarResultadosSecundarios() {
    const panel = document.getElementById('panel-secundario');
    const { P, i, t, I, S } = ultimoCalculo;

    panel.innerHTML = `
        <div class="card bg-dark text-white p-3 mt-3 shadow-sm text-start fade-in">
            <h6 class="border-bottom border-secondary pb-2 mb-3 text-info fw-bold text-uppercase small">Resultados Derivados de la Operación</h6>
            <div class="row small">
                <div class="col-6 mb-2">
                    <span class="text-muted">Monto Total (S):</span><br>
                    <strong>$${S.toLocaleString(undefined, {minimumFractionDigits:2})}</strong>
                </div>
                <div class="col-6 mb-2">
                    <span class="text-muted">Interés Diario (Año Com.):</span><br>
                    <strong>$${t > 0 ? (I / (t * 360)).toFixed(2) : "0.00"}</strong>
                </div>
                <div class="col-6 mb-2">
                    <span class="text-muted">Tasa Mensual Equiv.:</span><br>
                    <strong>${(i * 100 / 12).toFixed(2)}%</strong>
                </div>
                <div class="col-6 mb-2">
                    <span class="text-muted">Interés Exacto Equiv. (Ie):</span><br>
                    <strong>$${(P * i * t * (365 / 360)).toFixed(2)}</strong>
                </div>
            </div>
        </div>`;
}