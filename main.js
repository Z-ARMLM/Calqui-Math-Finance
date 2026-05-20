
// --- VARIABLES GLOBALES DE ESTADO ---
let ultimoCalculo = {}; 
let cacheFraccionario = { exacto: null, practico: null }; // Memoria para comparar métodos

const tablaTiempoExacto = {
    año1: { ene: Array.from({length: 31}, (_, i) => 1 + i), feb: Array.from({length: 28}, (_, i) => 32 + i), mar: Array.from({length: 31}, (_, i) => 60 + i), abr: Array.from({length: 30}, (_, i) => 91 + i), may: Array.from({length: 31}, (_, i) => 121 + i), jun: Array.from({length: 30}, (_, i) => 152 + i), jul: Array.from({length: 31}, (_, i) => 182 + i), ago: Array.from({length: 31}, (_, i) => 213 + i), sep: Array.from({length: 30}, (_, i) => 244 + i), oct: Array.from({length: 31}, (_, i) => 274 + i), nov: Array.from({length: 30}, (_, i) => 305 + i), dic: Array.from({length: 31}, (_, i) => 335 + i) },
    año2: { ene: Array.from({length: 31}, (_, i) => 366 + i), feb: Array.from({length: 28}, (_, i) => 397 + i), mar: Array.from({length: 31}, (_, i) => 425 + i), abr: Array.from({length: 30}, (_, i) => 456 + i), may: Array.from({length: 31}, (_, i) => 486 + i), jun: Array.from({length: 30}, (_, i) => 517 + i), jul: Array.from({length: 31}, (_, i) => 547 + i), ago: Array.from({length: 31}, (_, i) => 578 + i), sep: Array.from({length: 30}, (_, i) => 609 + i), oct: Array.from({length: 31}, (_, i) => 639 + i), nov: Array.from({length: 30}, (_, i) => 670 + i), dic: Array.from({length: 31}, (_, i) => 700 + i) }
};

// --- CONFIGURACIÓN DE FORMULAS ---
const secciones = {
    simple: { titulo: "Interés Simple", color: "border-primary", formulas: { "I": { nombre: "Calcular Interés (I=Pit)", campos: ["P", "i", "t"] }, "P": { nombre: "Calcular Capital (P=I/it)", campos: ["I", "i", "t"] }, "i": { nombre: "Calcular Tasa (i=I/Pt)", campos: ["I", "P", "t"] }, "t": { nombre: "Calcular Tiempo (t=I/Pi)", campos: ["I", "P", "i"] } } },
    monto: { titulo: "Interés Simple (Monto)", color: "border-success", formulas: { "S": { nombre: "Calcular Monto (S=P(1+it))", campos: ["P", "i", "t"] }, "Ps": { nombre: "Calcular Capital (P=S/1+it)", campos: ["S", "i", "t"] }, "is": { nombre: "Calcular Tasa (i=S/P-1/t)", campos: ["S", "P", "t"] }, "ts": { nombre: "Calcular Tiempo (t=S/P-1/i)", campos: ["S", "P", "i"] } } },
    fechas: { titulo: "Cálculo de Fechas", color: "border-warning" },
    tipos: { titulo: "Tipos de Interés", color: "border-info", formulas: { "Io": { nombre: "Interés Ordinario (360)", campos: ["P", "i", "t"] }, "Ie": { nombre: "Interés Exacto (365)", campos: ["P", "i", "t"] } } },
    descuento: { titulo: "Descuento Simple", color: "border-danger", formulas: { "D": { nombre: "Calcular Descuento (D=Sdt)", campos: ["S", "d", "t"] }, "Pd": { nombre: "Calcular Valor Actual (P=S-D)", campos: ["S", "D"] }, "P_dt": { nombre: "Valor Actual (P=S(1-dt))", campos: ["S", "d", "t"] }, "S_dt": { nombre: "Calcular Monto (S=P/(1-dt))", campos: ["P", "d", "t"] }, "d_despeje": { nombre: "Calcular Tasa Desct. (d)", campos: ["S", "P", "t"] }, "t_despeje": { nombre: "Calcular Tiempo (t)", campos: ["S", "P", "d"] }, "d_equiv": { nombre: "Tasa Desct. Equiv. (d)", campos: ["i", "t"] }, "i_equiv": { nombre: "Tasa Interés Equiv. (i)", campos: ["d", "t"] } } },
    pagosParciales: { titulo: "Pagos Parciales", color: "border-secondary", formulas: { "reglaComercial": { nombre: "Regla Comercial (Artística)", campos: [] }, "reglaAmericana": { nombre: "Regla Americana", campos: [] } } },
    compuesto: {
        titulo: "Interés Compuesto", color: "border-dark",
        formulas: {
                    "S_comp": { nombre: "Monto Compuesto S=P(1+i)^n", campos: ["P", "j", "t"] },
            "P_comp": { nombre: "Valor Actual P=S(1+i)^-n", campos: ["S", "j", "t"] },
            "n_comp": { nombre: "Tiempo o n = (lnS/P)/(ln(1+i))", campos: ["S", "P", "j"] },
            "i_comp": { nombre: "Tasa por Periodo i = [((S/P)^(1/n))-1]", campos: ["S", "P", "t"] },
            "j_m": { nombre: "Tasa Nominal Equivalente j= m[((1+(j'/m')^(m'/m))-1]", campos: ["j_prima", "m_prima"] },
            "i_nominal": { nombre: "Tasa Efectiva Anual i = [((1+(j/m)^(n*m))-1)/n]", campos: ["j", "t"] },
            "j_desde_i": { nombre: "Nominal desde Efectiva j= m[((1+(i*n)^(1/n*m))-1)]", campos: ["i", "t"] },
            "S_frac": { nombre: "Monto Fraccionario S=P(1+i)^n (1+it)", campos: ["P", "j", "t"] },
            "P_frac": { nombre: "Valor Act. Fraccionario P=S(1+i)^-n (1+it)", campos: ["S", "j", "t"] }
        }
    }
};

// --- RENDERIZACION PRINCIPAL DEL CONTENEDOR ---
function renderizarCalculadora(tipo, botonElemento) {
    const botonesMenu = document.querySelectorAll('#menu-principal-botones button');
    botonesMenu.forEach(btn => btn.classList.remove('active'));
    if (botonElemento) botonElemento.classList.add('active');

    const contenedor = document.getElementById('contenedor-principal');
    const info = secciones[tipo];
    let htmlForm = "";

    if (tipo === 'fechas') {
        htmlForm = `<div class="d-flex gap-2 mb-3" id="botones-fechas"><button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Comercial', this)">Tiempo Comercial</button><button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Exacto', this)">Tiempo Exacto</button></div><div id="sub-formulario"></div>`;
    } else {
        htmlForm = `<div class="row g-2 mb-3" id="botones-formulas">${Object.keys(info.formulas).map(f => `<div class="col-md-4"><button class="btn btn-sm btn-dark w-100" onclick="generarInputsFormula('${tipo}', '${f}', this)">${info.formulas[f].nombre}</button></div>`).join('')}</div><div id="sub-formulario"></div>`;
    }
    contenedor.innerHTML = `<div class="card p-4 border-2 ${info.color} fade-in shadow-sm"><h3 class="fw-bold mb-3 text-start">${info.titulo}</h3>${htmlForm}<div id="resultado" class="mt-3 fw-bold text-center text-primary h4"></div></div>`;
}

// --- GENERADOR DE FORMULARIOS ---
function generarInputsFormula(cat, formKey, botonElemento) {
    // Al abrir un nuevo formulario, borramos la memoria para evitar cruces
    cacheFraccionario = { exacto: null, practico: null }; 

    const botonesFormulas = document.querySelectorAll('#botones-formulas button');
    botonesFormulas.forEach(btn => { btn.classList.remove('btn-primary'); btn.classList.add('btn-dark'); });
    if (botonElemento) { botonElemento.classList.remove('btn-dark'); botonElemento.classList.add('btn-primary'); }

    const contenedor = document.getElementById('sub-formulario');
    const formula = secciones[cat].formulas[formKey];

    // ==========================================
    // 1. PAGOS PARCIALES
    // ==========================================
    if (formKey === 'reglaComercial' || formKey === 'reglaAmericana') {
        const titulo = formKey === 'reglaComercial' ? 'Ecuación de Valor (Regla Comercial)' : 'Pagos Parciales (Regla Americana)';
        const btnAccion = formKey === 'reglaComercial' ? 'procesarReglaComercial()' : 'procesarReglaAmericana()';
        
        let htmlPagos = `
            <div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in">
                <h5 class="text-secondary border-bottom pb-2 mb-4 text-start fw-bold">${titulo}</h5>
                <div class="mb-3 text-start border-bottom pb-3">
                    <label class="form-label small fw-bold text-primary"><i class="bi bi-clock-history"></i> Configuración General</label>
                    <div class="row g-2">
                        <div class="col-6"><label class="small text-muted">Unidad Global</label><select id="unidad-pagos" class="form-select form-select-sm"><option value="anios">Años</option><option value="meses">Meses</option><option value="dias">Días (Base 360)</option></select></div>
                        <div class="col-6"><label class="small text-muted">Tasa Interés (%)</label><input type="number" id="i-pagos" class="form-control form-control-sm" placeholder="Ej: 5"></div>
                        ${formKey === 'reglaComercial' ? `<div class="col-12 mt-2"><label class="small text-muted">Fecha Focal (t)</label><input type="number" id="t-focal" class="form-control form-control-sm" placeholder="Ej: 12"></div>` : ''}
                    </div>
                </div>
                <div class="mb-3 text-start border-bottom pb-3">
                    <label class="form-label small fw-bold text-danger">Deuda Principal (El Préstamo)</label>
                    <div class="row g-2">
                        <div class="col-6"><label class="small text-muted">Monto Original ($)</label><input type="number" id="monto-deuda" class="form-control form-control-sm" placeholder="Ej: 10000"></div>
                        <div class="col-6"><label class="small text-muted">Ubicación (Tiempo)</label><input type="number" id="t-deuda" class="form-control form-control-sm" placeholder="Ej: 0" ${formKey === 'reglaAmericana' ? 'value="0"' : ''}></div>
                    </div>
                </div>
                <div class="mb-3 text-start border-bottom pb-3 bg-light p-2 rounded border">
                    <label class="form-label small fw-bold text-success">Incógnita: Pago Final (X)</label>
                    <div class="row g-2"><div class="col-12"><label class="small text-muted">¿En qué tiempo se liquida?</label><input type="number" id="t-x" class="form-control form-control-sm border-success"></div></div>
                </div>
                <div class="mb-3 text-start">
                    <label class="form-label small fw-bold text-info">Pagos Parciales Acordados</label>
                    <select id="cantidad-pagos" class="form-select form-select-sm mb-3 border-info" onchange="generarCamposPagos()">
                        <option value="0">0 Pagos</option><option value="1">1 Pago</option><option value="2">2 Pagos</option><option value="3">3 Pagos</option><option value="4">4 Pagos</option>
                    </select>
                    <div id="contenedor-pagos-dinamicos"></div>
                </div>
                <button class="btn btn-dark w-100 mt-2 fw-bold shadow-sm" onclick="${btnAccion}">CALCULAR LIQUIDACIÓN</button>
            </div>`;
        contenedor.innerHTML = htmlPagos;
        return;
    }

    // ==========================================
    // 2. DISEÑO EXCLUSIVO PARA INTERÉS COMPUESTO (Incluye Lógica Fraccionaria)
    // ==========================================
    if (cat === 'compuesto') {
        const c = formula.campos;
        let isFraccionario = (formKey === 'S_frac' || formKey === 'P_frac');
        
        let html = `<div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-dark border-top-0 border-end-0 border-bottom-0 border-5">`;
        
        // TÍTULOS Y SELECTOR DE MÉTODO (EXACTO VS PRÁCTICO)
        if (isFraccionario) {
            let fEx = formKey === 'S_frac' ? 'S = P(1+i)^n' : 'P = S(1+i)^-n';
            let fPr = formKey === 'S_frac' ? 'S = P(1+i)^n * (1+it)' : 'P = S(1+i)^-n * (1+it)';
            html += `
            <h5 class="text-dark border-bottom pb-2 mb-3 fw-bold" id="titulo-formula">Fórmula: ${fEx}</h5>
            <div class="mb-4 pb-3 border-bottom border-secondary">
                <label class="fw-bold small text-dark d-block mb-2">SELECCIONE EL MÉTODO A UTILIZAR</label>
                <div class="form-check form-check-inline">
                    <input class="form-check-input border-dark" type="radio" name="metodoFrac" id="mf-exacto" value="exacto" checked onchange="toggleMetodoFraccionario('${fEx}', '${fPr}')">
                    <label class="form-check-label fw-bold text-success">Método Exacto</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input border-dark" type="radio" name="metodoFrac" id="mf-practico" value="practico" onchange="toggleMetodoFraccionario('${fEx}', '${fPr}')">
                    <label class="form-check-label fw-bold text-info">Método Práctico</label>
                </div>
            </div>`;
        } else {
            html += `<h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Fórmula: ${formula.nombre}</h5>`;
        }

        // Frecuencia de Conversión
        html += `
            <div class="mb-3">
                <label class="fw-bold small text-dark">FRECUENCIA DE CONVERSIÓN (m)</label>
                <select id="val-m" class="form-select border-dark border-2" onchange="actualizarCompuestoEnVivo()">
                    <option value="1">Anual (1)</option><option value="2">Semestral (2)</option><option value="3">Cuatrimestral (3)</option>
                    <option value="4">Trimestral (4)</option><option value="6">Bimestral (6)</option><option value="12">Mensual (12)</option>
                </select>
            </div>`;

        if (c.includes('m_prima')) {
            html += `<div class="mb-3"><label class="fw-bold small text-dark">FRECUENCIA CONOCIDA (m')</label><select id="val-m_prima" class="form-select border-dark border-2"><option value="1">Anual</option><option value="2">Semestral</option><option value="4">Trimestral</option><option value="12">Mensual</option></select></div>`;
        }

        if (c.includes('P')) html += `<div class="mb-3"><label class="fw-bold small text-dark">CAPITAL (P)</label><input type="number" id="val-P" class="form-control border-dark border-2"></div>`;
        if (c.includes('S')) html += `<div class="mb-3"><label class="fw-bold small text-dark">MONTO (S)</label><input type="number" id="val-S" class="form-control border-dark border-2"></div>`;

        // Tasas
        if (c.includes('j') || c.includes('j_prima')) {
            let labelJ = c.includes('j_prima') ? "TASA NOMINAL CONOCIDA (j')" : "TASA NOMINAL (j)";
            html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">${labelJ}</label>
                    <div class="input-group">
                        <input type="number" id="val-j" class="form-control border-dark border-2" placeholder="Porcentaje (%)" oninput="actualizarCompuestoEnVivo()">
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-j" class="form-control bg-light border-dark border-2" readonly placeholder="0.00">
                    </div>
                </div>`;
        } else if (c.includes('i')) { 
            html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">TASA EFECTIVA (i)</label>
                    <div class="input-group">
                        <input type="number" id="val-i-manual" class="form-control border-dark border-2" placeholder="Porcentaje (%)" oninput="document.getElementById('dec-i-manual').value = (this.value/100).toFixed(4)">
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-i-manual" class="form-control bg-light border-dark border-2" readonly placeholder="0.00">
                    </div>
                </div>`;
        }

        // Tiempo (Tu Selector Dinámico)
        if (c.includes('t')) {
            html += `
            <div class="mb-3 p-3 bg-light border border-dark border-2 rounded">
                <label class="fw-bold small text-dark mb-2">TIEMPO</label>
                <div class="mb-3 pb-2 border-bottom border-secondary">
                    <div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-fechas" value="fechas" checked onchange="toggleModoTiempoComp()"><label class="form-check-label fw-bold text-danger">Entre fechas</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-anios" value="anios" onchange="toggleModoTiempoComp()"><label class="form-check-label fw-bold text-warning">Años</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-am" value="am" onchange="toggleModoTiempoComp()"><label class="form-check-label fw-bold text-success">Años y meses</label></div>
                </div>

                <div id="ct-fechas" class="row g-2 mb-2">
                    <div class="col-6"><label class="small text-muted fw-bold">Fecha Inicial</label><input type="date" id="t-f1" class="form-control border-dark border-2" onchange="actualizarCompuestoEnVivo()"></div>
                    <div class="col-6"><label class="small text-muted fw-bold">Fecha Final</label><input type="date" id="t-f2" class="form-control border-dark border-2" onchange="actualizarCompuestoEnVivo()"></div>
                </div>
                <div id="ct-anios" class="row g-2 mb-2 d-none">
                    <div class="col-12"><label class="small text-muted fw-bold">Años</label><input type="number" id="t-a1" class="form-control border-dark border-2" oninput="actualizarCompuestoEnVivo()"></div>
                </div>
                <div id="ct-am" class="row g-2 mb-2 d-none">
                    <div class="col-6"><label class="small text-muted fw-bold">Años</label><input type="number" id="t-a2" class="form-control border-dark border-2" oninput="actualizarCompuestoEnVivo()"></div>
                    <div class="col-6"><label class="small text-muted fw-bold">Meses</label><input type="number" id="t-m2" class="form-control border-dark border-2" oninput="actualizarCompuestoEnVivo()"></div>
                </div>
            </div>`;
        }

        // Variables Internas
        if (c.includes('t') || c.includes('n')) {
            let readonlyState = c.includes('t') ? 'readonly' : ''; 
            let hint = c.includes('t') ? 'Se calculará automáticamente' : 'Ingrese los periodos';
            html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">NÚMERO DE PERIODOS (n)</label>
                    <input type="text" id="val-n" class="form-control border-dark border-2 fw-bold text-primary bg-white" placeholder="${hint}" ${readonlyState}>
                </div>`;
        }

        if (c.includes('j') || c.includes('j_prima')) {
            html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">TASA i (i = J / M)</label>
                    <div class="input-group">
                        <input type="text" id="calc-i" class="form-control border-dark border-2 fw-bold text-success bg-white" placeholder="Porcentaje" readonly>
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-i" class="form-control bg-light border-dark border-2 fw-bold text-success" readonly placeholder="0.00">
                    </div>
                </div>`;
        }

        // --- SECCIÓN EXCLUSIVA INTERÉS SIMPLE (MÉTODO PRÁCTICO) ---
        if (isFraccionario) {
            html += `
            <div id="seccion-metodo-practico" class="d-none mt-4 p-3 bg-light border border-info border-2 rounded">
                <h6 class="text-info fw-bold border-bottom border-info pb-2 mb-3"><i class="bi bi-plus-slash-minus"></i> SECCIÓN INTERÉS SIMPLE</h6>
                <div class="row g-2">
                    <div class="col-4">
                        <label class="small fw-bold text-dark">Tasa (i) heredada</label>
                        <input type="text" id="comp-frac-i" class="form-control border-info bg-white" readonly>
                    </div>
                    <div class="col-4">
                        <label class="small fw-bold text-dark">Meses Restantes</label>
                        <input type="number" id="comp-frac-meses" class="form-control border-info fw-bold bg-white" readonly>
                    </div>
                    <div class="col-4">
                        <label class="small fw-bold text-dark">Meses del Periodo</label>
                        <input type="number" id="comp-frac-base" class="form-control border-info bg-white" readonly>
                    </div>
                </div>
                <div class="mt-2 text-muted small text-center">
                    <strong>Fórmula Simple:</strong> (1 + i * (Meses Restantes / Meses Periodo))
                </div>
            </div>`;
        }

        html += `<button class="btn btn-dark w-100 mt-4 py-2 fw-bold fs-5" onclick="procesarCalculoCompuesto('${formKey}')">REALIZAR CÁLCULO</button></div>`;
        contenedor.innerHTML = html;
        return;
    }

    // ==========================================
    // 3. FLUJO ESTÁNDAR (Simple, Descuento, etc)
    // ==========================================
    let htmlInputs = formula.campos.map(c => {
        if (c === 'i' || c === 'is' || c === 'd' || c === 'desct') {
            return `<div class="mb-3 text-start"><label class="form-label small fw-bold">Porcentaje / Tasa (%)</label><div class="input-group"><input type="number" id="val-${c}" class="form-control border-dark" oninput="actualizarDecimal('${c}')"><span class="input-group-text bg-light border-dark">Dec:</span><input type="text" id="res-decimal-${c}" class="form-control bg-light border-dark" readonly></div></div>`;
        }
        if (c === 't' || c === 'ts') {
            const permiteFechas = ['descuento', 'tipos'].includes(cat);
            let htmlOpciones = ''; let htmlFechas = '';
            if (permiteFechas) {
                htmlOpciones = `<div class="mb-3 border-bottom pb-2"><div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="mt-${c}" id="rt-aprox-${c}" value="aprox" checked onchange="toggleModoTiempo('${c}')"><label class="small fw-bold">Tiempo Aproximado</label></div><div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="mt-${c}" id="rt-exacto-${c}" value="exacto" onchange="toggleModoTiempo('${c}')"><label class="small fw-bold">Tiempo Exacto</label></div></div>`;
                htmlFechas = `<div id="cont-exacto-${c}" class="d-none bg-light p-3 border border-warning rounded mb-2"><div class="row g-2"><div class="col-6"><label class="small text-muted fw-bold">D/M Inicial</label><div class="input-group input-group-sm"><input type="number" id="dia-ini-${c}" class="form-control" placeholder="Día" oninput="actualizarTiempoFechas('${c}')"><select id="mes-ini-${c}" class="form-select" onchange="actualizarTiempoFechas('${c}')"><option value="ene">Ene</option><option value="feb">Feb</option><option value="mar">Mar</option><option value="abr">Abr</option><option value="may">May</option><option value="jun">Jun</option><option value="jul">Jul</option><option value="ago">Ago</option><option value="sep">Sep</option><option value="oct">Oct</option><option value="nov">Nov</option><option value="dic">Dic</option></select></div></div><div class="col-6"><label class="small text-muted fw-bold">D/M Final</label><div class="input-group input-group-sm"><input type="number" id="dia-fin-${c}" class="form-control" placeholder="Día" oninput="actualizarTiempoFechas('${c}')"><select id="mes-fin-${c}" class="form-select" onchange="actualizarTiempoFechas('${c}')"><option value="ene">Ene</option><option value="feb">Feb</option><option value="mar">Mar</option><option value="abr">Abr</option><option value="may">May</option><option value="jun">Jun</option><option value="jul">Jul</option><option value="ago">Ago</option><option value="sep">Sep</option><option value="oct">Oct</option><option value="nov">Nov</option><option value="dic">Dic</option></select></div></div></div></div>`;
            }
            return `<div class="mb-3 text-start"><label class="form-label small fw-bold">Tiempo</label>${htmlOpciones}<div id="cont-aprox-${c}"><div class="input-group mb-2"><input type="number" id="val-${c}" class="form-control border-dark" oninput="actualizarTiempo('${c}')"><input type="number" id="val-${c}-meses" class="form-control border-dark" placeholder="Meses" oninput="actualizarTiempo('${c}')"><select id="unidad-${c}" class="form-select border-dark" onchange="alternarBaseDias('${c}'); actualizarTiempo('${c}');"><option value="anios_meses">Años y Meses</option><option value="dias">Solo Días</option></select></div><div id="base-dias-container-${c}" class="mt-2 d-none"><label class="small text-muted fw-bold">Base:</label><select id="base-${c}" class="form-select form-select-sm" onchange="actualizarTiempo('${c}')"><option value="360">Comercial (360)</option><option value="365">Exacto (365)</option></select></div></div>${htmlFechas}<div class="input-group mt-2"><span class="input-group-text bg-warning-subtle text-dark fw-bold">Tiempo (t):</span><input type="text" id="res-tiempo-${c}" class="form-control bg-light fw-bold" readonly></div></div>`;
        }
        const eti = { 'P': 'Capital Inicial (P)', 'S': 'Monto (S)', 'D': 'Descuento (D)', 'I': 'Interés (I)' };
        return `<div class="mb-3 text-start"><label class="form-label small fw-bold">${eti[c] || c}</label><input type="number" id="val-${c}" class="form-control border-dark"></div>`;
    }).join('');

    contenedor.innerHTML = `<div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-dark border-top-0 border-end-0 border-bottom-0 border-5"><h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Formulario: ${formula.nombre}</h5>${htmlInputs}<button class="btn btn-dark w-100 mt-3 py-2 fw-bold" onclick="procesarCalculoSimple('${formKey}')">REALIZAR CÁLCULO</button></div>`;
}

// --- LOGICA UI INTERÉS COMPUESTO ---

// FUNCION NUEVA: Limpia campos y oculta panel al cambiar de método
function toggleMetodoFraccionario(fEx, fPr) {
    const modo = document.querySelector('input[name="metodoFrac"]:checked').value;
    const titulo = document.getElementById('titulo-formula');
    const seccionPractico = document.getElementById('seccion-metodo-practico');
    
    // 1. Limpiar todos los inputs introducidos por el usuario
    const inputs = document.querySelectorAll('#sub-formulario input[type="number"], #sub-formulario input[type="date"]');
    inputs.forEach(inp => inp.value = '');
    
    // 2. Limpiar todos los valores calculados readonly
    const blockeds = ['dec-j', 'dec-i-manual', 'calc-i', 'dec-i', 'val-n', 'comp-frac-i', 'comp-frac-meses', 'comp-frac-base'];
    blockeds.forEach(id => {
        if (document.getElementById(id)) document.getElementById(id).value = '';
    });

    // 3. Limpiar pantalla de resultados
    document.getElementById('resultado').innerHTML = '';
    
    if (modo === 'exacto') {
        titulo.innerHTML = `Fórmula: ${fEx}`;
        seccionPractico.classList.add('d-none');
    } else {
        titulo.innerHTML = `Fórmula: ${fPr}`;
        seccionPractico.classList.remove('d-none');
    }
    actualizarCompuestoEnVivo(); 
}

function toggleModoTiempoComp() {
    const modo = document.querySelector(`input[name="modoTiempo"]:checked`).value;
    document.getElementById('ct-fechas').classList.add('d-none');
    document.getElementById('ct-anios').classList.add('d-none');
    document.getElementById('ct-am').classList.add('d-none');
    
    if (modo === 'fechas') document.getElementById('ct-fechas').classList.remove('d-none');
    if (modo === 'anios') document.getElementById('ct-anios').classList.remove('d-none');
    if (modo === 'am') document.getElementById('ct-am').classList.remove('d-none');
    actualizarCompuestoEnVivo();
}

function actualizarCompuestoEnVivo() {
    const m = parseFloat(document.getElementById('val-m')?.value) || 1;
    
    // Calcular J y actualizar I
    const jInput = document.getElementById('val-j');
    let j_dec = 0;
    if (jInput) {
        let j_val = parseFloat(jInput.value) || 0;
        j_dec = j_val / 100;
        document.getElementById('dec-j').value = j_dec.toFixed(4);
        
        let i_calc = j_dec / m;
        document.getElementById('calc-i').value = (i_calc * 100).toFixed(4) + "%";
        document.getElementById('dec-i').value = i_calc.toFixed(6);
    }

    // Calcular N
    let n = 0;
    const modoRadio = document.querySelector(`input[name="modoTiempo"]:checked`);
    if (modoRadio) {
        const modo = modoRadio.value;
        if (modo === 'fechas') {
            const f1 = new Date(document.getElementById('t-f1').value);
            const f2 = new Date(document.getElementById('t-f2').value);
            if (!isNaN(f1) && !isNaN(f2) && f2 > f1) {
                let y = f2.getFullYear() - f1.getFullYear();
                let m_diff = f2.getMonth() - f1.getMonth();
                let d_diff = f2.getDate() - f1.getDate();
                if (d_diff < 0) { m_diff--; d_diff += 30; } 
                if (m_diff < 0) { y--; m_diff += 12; }
                n = (y * m) + (m_diff * (m/12)) + (d_diff * (m/360));
            }
        } else if (modo === 'anios') {
            n = (parseFloat(document.getElementById('t-a1').value) || 0) * m;
        } else if (modo === 'am') {
            let a = parseFloat(document.getElementById('t-a2').value) || 0;
            let mes = parseFloat(document.getElementById('t-m2').value) || 0;
            n = (a * m) + (mes * (m/12));
        }
        
        // Manejo Visual de N según si es Método Fraccionario
        const resN = document.getElementById('val-n');
        if (resN) {
            let modoFrac = document.querySelector('input[name="metodoFrac"]:checked')?.value;
            if (modoFrac === 'practico') {
                let n_entero = Math.floor(n);
                resN.value = n > 0 ? `${n_entero} periodos enteros` : "";
                
                // Autollenar Sección Simple Interés
                let n_frac = n - n_entero;
                let meses_base = 12 / m;
                document.getElementById('comp-frac-i').value = document.getElementById('dec-i').value;
                document.getElementById('comp-frac-base').value = meses_base;
                document.getElementById('comp-frac-meses').value = Math.round((n_frac * meses_base) * 100) / 100;
            } else {
                resN.value = n > 0 ? `${n.toFixed(4)} periodos` : "";
            }
        }
    }
}

// --- PROCESAMIENTO MATEMATICO EXCLUSIVO DE INTERÉS COMPUESTO ---
function procesarCalculoCompuesto(key) {
    const res = document.getElementById('resultado');
    
    const P = parseFloat(document.getElementById('val-P')?.value) || 0;
    const S = parseFloat(document.getElementById('val-S')?.value) || 0;
    const m = parseFloat(document.getElementById('val-m')?.value) || 1;
    const m_prima = parseFloat(document.getElementById('val-m_prima')?.value) || 1;
    
    let j_dec = (parseFloat(document.getElementById('val-j')?.value) || 0) / 100;
    let i_manual = (parseFloat(document.getElementById('val-i-manual')?.value) || 0) / 100;
    let i = i_manual > 0 ? i_manual : (j_dec / m);
    
    // Extracción limpia de n
    let n = 0;
    const nStr = document.getElementById('val-n')?.value || "";
    if (nStr.includes("enteros")) {
        let n_ent = parseFloat(nStr.split(' ')[0]) || 0;
        let m_rest = parseFloat(document.getElementById('comp-frac-meses').value) || 0;
        let m_base = parseFloat(document.getElementById('comp-frac-base').value) || 1;
        n = n_ent + (m_rest / m_base);
    } else {
        n = parseFloat(nStr.split(' ')[0]) || parseFloat(document.getElementById('val-n')?.value) || 0;
    }

    let resultadoFinal = 0;
    let etiqueta = "";
    let esPorcentaje = false;

    switch(key) {
        case 'S_comp': resultadoFinal = P * Math.pow((1 + i), n); etiqueta = "Monto Compuesto (S)"; break;
        case 'P_comp': resultadoFinal = S * Math.pow((1 + i), -n); etiqueta = "Valor Actual (P)"; break;
        case 'n_comp': resultadoFinal = Math.log(S / P) / Math.log(1 + i); etiqueta = "Número de Periodos (n)"; break;
        case 'i_comp': resultadoFinal = (Math.pow((S / P), (1 / n)) - 1) * 100; etiqueta = "Tasa Efectiva por Periodo (i)"; esPorcentaje = true; break;
        case 'j_m': resultadoFinal = m * (Math.pow((1 + (j_dec / m_prima)), (m_prima / m)) - 1) * 100; etiqueta = "Tasa Nominal Eq. (j)"; esPorcentaje = true; break;
        case 'i_nominal': resultadoFinal = ((Math.pow((1 + (j_dec / m)), (n * m)) - 1) / n) * 100; etiqueta = "Tasa Efectiva Anual (i)"; esPorcentaje = true; break;
        case 'j_desde_i': resultadoFinal = m * (Math.pow((1 + (i_manual * n)), (1 / (n * m))) - 1) * 100; etiqueta = "Nominal desde Efectiva (j)"; esPorcentaje = true; break;
            
        case 'S_frac':
        case 'P_frac':
            let modoFrac = document.querySelector('input[name="metodoFrac"]:checked').value;
            
            if (modoFrac === 'exacto') {
                resultadoFinal = key === 'S_frac' ? P * Math.pow((1 + i), n) : S * Math.pow((1 + i), -n);
                etiqueta = key === 'S_frac' ? "Monto Frac. (Exacto)" : "Valor Actual Frac. (Exacto)";
                cacheFraccionario.exacto = resultadoFinal;
            } else {
                let n_ent = Math.floor(n);
                let m_rest = parseFloat(document.getElementById('comp-frac-meses').value) || 0;
                let m_base = parseFloat(document.getElementById('comp-frac-base').value) || 1;
                let factorSimple = 1 + (i * (m_rest / m_base));
                
                resultadoFinal = key === 'S_frac' ? P * Math.pow((1 + i), n_ent) * factorSimple : S * Math.pow((1 + i), -n_ent) * factorSimple;
                etiqueta = key === 'S_frac' ? "Monto Frac. (Práctico)" : "Valor Actual Frac. (Práctico)";
                cacheFraccionario.practico = resultadoFinal;
            }

            // Muestra los dos solo si ambos existen (porque guardaste uno antes)
            if (cacheFraccionario.exacto !== null && cacheFraccionario.practico !== null) {
                res.innerHTML = `
                    <div class="alert alert-success mt-3 shadow-sm text-start border-success border-2 fade-in">
                        <h5 class="fw-bold border-bottom pb-2"><i class="bi bi-layout-split"></i> Comparación de Métodos</h5>
                        <p class="small text-muted mb-3">Resultados guardados en memoria para ambos cálculos:</p>
                        <div class="row g-2">
                            <div class="col-md-6">
                                <div class="p-3 bg-white border border-success rounded">
                                    <strong class="text-success d-block mb-1">MÉTODO EXACTO</strong>
                                    <span class="fs-5 fw-bold text-dark">$${cacheFraccionario.exacto.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 bg-white border border-info rounded">
                                    <strong class="text-info d-block mb-1">MÉTODO PRÁCTICO</strong>
                                    <span class="fs-5 fw-bold text-dark">$${cacheFraccionario.practico.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                return; // Corta la función para que no imprima el resultado simple abajo
            }
            break;
    }

    if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
        res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">Por favor, revise los datos ingresados.</div>`;
    } else {
        const suf = esPorcentaje ? "%" : "";
        const pref = (esPorcentaje || key === 'n_comp') ? "" : "$";
        res.innerHTML = `
            <div class="alert alert-success mt-3 shadow-sm text-center border-success border-2">
                <span class="d-block small text-muted text-uppercase fw-bold">${etiqueta}</span>
                <span class="fs-3 fw-bold text-dark">${pref}${resultadoFinal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}${suf}</span>
            </div>`;
    }
}

// --- CONTROLES Y MATEMATICAS ESTÁNDAR (Simple y Descuento) ---
function alternarBaseDias(id) { const u = document.getElementById(`unidad-${id}`).value; const c = document.getElementById(`base-dias-container-${id}`); const i = document.getElementById(`val-${id}-meses`); if (c) { if (u === "dias") { c.classList.remove("d-none"); if(i) i.classList.add("d-none"); } else { c.classList.add("d-none"); if(i) i.classList.remove("d-none"); } } }
function actualizarTiempo(id) { const iA = document.getElementById(`val-${id}`); const iM = document.getElementById(`val-${id}-meses`); const u = document.getElementById(`unidad-${id}`).value; const cD = document.getElementById(`res-tiempo-${id}`); let v1 = parseFloat(iA.value) || 0; let v2 = iM ? parseFloat(iM.value) || 0 : 0; if (u === "anios_meses") { cD.value = (v1 + (v2 / 12)).toFixed(4); } else if (u === "dias") { const base = document.getElementById(`base-${id}`) ? parseFloat(document.getElementById(`base-${id}`).value) || 360 : 360; cD.value = (v1 / base).toFixed(4); } }
function toggleModoTiempo(id) { const isE = document.getElementById(`radio-exacto-${id}`).checked; const cA = document.getElementById(`cont-aprox-${id}`); const cE = document.getElementById(`cont-exacto-${id}`); document.getElementById(`res-tiempo-${id}`).value = ""; if (isE) { cA.classList.add("d-none"); cE.classList.remove("d-none"); actualizarTiempoFechas(id); } else { cE.classList.add("d-none"); cA.classList.remove("d-none"); actualizarTiempo(id); } }
function actualizarTiempoFechas(id) { const dI = parseInt(document.getElementById(`dia-ini-${id}`).value); const mI = document.getElementById(`mes-ini-${id}`).value; const dF = parseInt(document.getElementById(`dia-fin-${id}`).value); const mF = document.getElementById(`mes-fin-${id}`).value; const cD = document.getElementById(`res-tiempo-${id}`); if (!isNaN(dI) && !isNaN(dF)) { try { let vI = tablaTiempoExacto.año1[mI][dI - 1]; let vF = tablaTiempoExacto.año1[mF][dF - 1]; if (vF < vI) vF += 365; cD.value = ((vF - vI) / 360).toFixed(4); } catch(e) {} } }
function actualizarDecimal(id) { const valor = parseFloat(document.getElementById(`val-${id}`).value); document.getElementById(`res-decimal-${id}`).value = !isNaN(valor) ? (valor / 100).toFixed(4) : ""; }

function procesarCalculoSimple(key) {
    const res = document.getElementById('resultado');
    const getV = (id) => parseFloat(document.getElementById(`val-${id}`)?.value) || 0;
    let P = getV('P'); let S = getV('S'); let I = getV('I'); let D = getV('D');
    let i = getV('i')/100 || getV('is')/100; let d = getV('d')/100 || getV('desct')/100;
    const idT = document.getElementById('val-t') ? 't' : 'ts';
    let t = document.getElementById(`res-tiempo-${idT}`) ? parseFloat(document.getElementById(`res-tiempo-${idT}`).value) || 0 : 0;

    let resultadoFinal = 0; let etiqueta = ""; let esPorcentaje = false;

    switch(key) {
        case 'I': resultadoFinal = P * i * t; etiqueta = "Interés (I)"; break;
        case 'P': resultadoFinal = I / (i * t); etiqueta = "Capital (P)"; break;
        case 'i': resultadoFinal = (I / (P * t)) * 100; etiqueta = "Tasa (i)"; esPorcentaje = true; break;
        case 't': resultadoFinal = I / (P * i); etiqueta = "Tiempo (t)"; break;
        case 'S': resultadoFinal = P * (1 + (i * t)); etiqueta = "Monto (S)"; break;
        case 'Ps': resultadoFinal = S / (1 + (i * t)); etiqueta = "Capital (P)"; break;
        case 'is': resultadoFinal = ((S / P) - 1) / t * 100; etiqueta = "Tasa (i)"; esPorcentaje = true; break;
        case 'ts': resultadoFinal = ((S / P) - 1) / i; etiqueta = "Tiempo (t)"; break;
        case 'D': resultadoFinal = S * d * t; etiqueta = "Descuento (D)"; break;
        case 'Pd': resultadoFinal = S - D; etiqueta = "Valor Actual (P)"; break;
        case 'P_dt': resultadoFinal = S * (1 - (d * t)); etiqueta = "Valor Actual (P)"; break;
        case 'S_dt': resultadoFinal = P / (1 - (d * t)); etiqueta = "Valor Nominal (S)"; break;
        case 'd_despeje': resultadoFinal = ((1 - (P / S)) / t) * 100; etiqueta = "Tasa Desct. (d)"; esPorcentaje = true; break;
        case 't_despeje': resultadoFinal = (1 - (P / S)) / d; etiqueta = "Tiempo (t)"; break;
        case 'd_equiv': resultadoFinal = (i / (1 + (i * t))) * 100; etiqueta = "Tasa Eq. (d)"; esPorcentaje = true; break;
        case 'i_equiv': resultadoFinal = (d / (1 - (d * t))) * 100; etiqueta = "Tasa Eq. (i)"; esPorcentaje = true; break;
    }

    if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
        res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">Revise los datos.</div>`;
    } else {
        const pref = (esPorcentaje || key === 't' || key === 'ts' || key === 't_despeje') ? "" : "$";
        res.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2"><span class="d-block small text-muted text-uppercase fw-bold">${etiqueta}</span><span class="fs-3 fw-bold text-dark">${pref}${resultadoFinal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 4})}${esPorcentaje?"%":""}</span></div>`;
    }
}

// --- PAGOS PARCIALES ---
function generarCamposPagos() { const c = parseInt(document.getElementById('cantidad-pagos').value); const cont = document.getElementById('contenedor-pagos-dinamicos'); let h = ''; for(let k=1; k<=c; k++) h+=`<div class="row g-2 mb-2 p-2 bg-white rounded border border-start border-info border-3"><div class="col-12 fw-bold small text-info">Pago ${k}</div><div class="col-6"><input type="number" id="monto-p-${k}" class="form-control form-control-sm" placeholder="Monto $"></div><div class="col-6"><input type="number" id="t-p-${k}" class="form-control form-control-sm" placeholder="Tiempo"></div></div>`; cont.innerHTML = h; }
function procesarReglaComercial() {
    const r = document.getElementById('resultado'); const u = document.getElementById('unidad-pagos').value; const i = (parseFloat(document.getElementById('i-pagos').value)||0)/100; const tF = parseFloat(document.getElementById('t-focal').value)||0;
    const mD = parseFloat(document.getElementById('monto-deuda').value)||0; const tD = parseFloat(document.getElementById('t-deuda').value)||0; const tX = parseFloat(document.getElementById('t-x').value)||0;
    const mAF = (monto, tiempo) => { let dF = tF - tiempo; if (u === 'meses') dF /= 12; if (u === 'dias') dF /= 360; return dF >= 0 ? monto * (1 + (i * dF)) : monto / (1 + (i * Math.abs(dF))); };
    let pE = 0; for (let k=1; k<=(parseInt(document.getElementById('cantidad-pagos').value)||0); k++) pE += mAF(parseFloat(document.getElementById(`monto-p-${k}`).value)||0, parseFloat(document.getElementById(`t-p-${k}`).value)||0);
    const X = (mAF(mD, tD) - pE) / mAF(1, tX);
    r.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2"><span class="text-uppercase small">El valor del pago X es:</span><h3 class="mb-0 fw-bold">$${X.toLocaleString('en-US', {minimumFractionDigits: 2})}</h3></div>`;
}
function procesarReglaAmericana() {
    const r = document.getElementById('resultado'); const u = document.getElementById('unidad-pagos-am').value; const i = (parseFloat(document.getElementById('i-pagos-am').value)||0)/100;
    let s = parseFloat(document.getElementById('monto-deuda-am').value)||0; let tA = parseFloat(document.getElementById('t-ini-am').value)||0; const tF = parseFloat(document.getElementById('t-fin-am').value)||0;
    let p = []; for (let k=1; k<=(parseInt(document.getElementById('cantidad-pagos').value)||0); k++) p.push({ m: parseFloat(document.getElementById(`monto-p-${k}`).value)||0, t: parseFloat(document.getElementById(`t-p-${k}`).value)||0 });
    p.sort((a,b)=>a.t-b.t).forEach(x => { if (x.t <= tA || x.t >= tF) return; let dF = x.t - tA; if (u === 'meses') dF /= 12; if (u === 'dias') dF /= 360; s = (s + (s * i * dF)) - x.m; tA = x.t; });
    let dF = tF - tA; if (u === 'meses') dF /= 12; if (u === 'dias') dF /= 360;
    r.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2"><span class="text-uppercase small">El Pago Final a liquidar (X) es:</span><h3 class="mb-0 fw-bold">$${(s + (s * i * dF)).toLocaleString('en-US', {minimumFractionDigits: 2})}</h3></div>`;
}

