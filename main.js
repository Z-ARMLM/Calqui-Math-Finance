// --- VARIABLES GLOBALES DE ESTADO ---
let ultimoCalculo = {};
let cacheFraccionario = { exacto: null, practico: null };

// --- CAJA VISUAL ESTANDARIZADA ---
const generarCajaFormula = (html) => `
    <div class="mt-4 p-3 bg-white border border-secondary rounded shadow-sm font-monospace text-dark text-start" style="font-size: 1.1rem; overflow-x: auto;">
        <span class="d-block small text-muted mb-2 fw-bold text-uppercase border-bottom pb-1"><i class="bi bi-eye"></i> Valores en la fórmula:</span>
        <div class="text-center mt-2" style="white-space: nowrap;">
            ${html}
        </div>
    </div>`;

// --- GENERADOR DE LÍNEA DE TIEMPO  ---
const generarLineaTiempo = (datos) => {
  // Verificación de seguridad para evitar el error de toLocaleString
  if (!datos || !datos.deuda || !Array.isArray(datos.pagos)) return "";

  let tiempos = [datos.deuda.t, datos.focal.t, ...datos.pagos.map((p) => p.t)];
  let t_min = Math.min(...tiempos);
  let t_max = Math.max(...tiempos);
  let span = t_max - t_min;
  if (span === 0) span = 1;

  const getPos = (t) => ((t - t_min) / span) * 100;
  let marcadoresHtml = "";

  // Deuda (Flecha arriba)
  let montoDeuda = datos.deuda.monto || 0;
  marcadoresHtml += `
        <div style="position: absolute; left: ${getPos(datos.deuda.t)}%; top: -45px; transform: translateX(-50%); text-align: center;">
            <span class="badge bg-danger mb-1 shadow-sm">$${montoDeuda.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div style="width: 2px; height: 25px; background-color: #dc3545; margin: 0 auto; position: relative;">
                <div style="position: absolute; bottom: -5px; left: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #dc3545;"></div>
            </div>
            <div class="fw-bold small text-muted mt-2">t=${datos.deuda.t}</div>
        </div>`;

  // Pagos (Flecha abajo)
  datos.pagos.forEach((p) => {
    let montoPago = p.monto || 0;
    marcadoresHtml += `
            <div style="position: absolute; left: ${getPos(p.t)}%; bottom: -45px; transform: translateX(-50%); text-align: center;">
                <div class="fw-bold small text-muted mb-2">t=${p.t}</div>
                <div style="width: 2px; height: 25px; background-color: #198754; margin: 0 auto; position: relative;">
                    <div style="position: absolute; top: -5px; left: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 5px solid #198754;"></div>
                </div>
                <span class="badge bg-success mt-1 shadow-sm">$${montoPago.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>`;
  });

  // Fecha Focal
  if (datos.focal.esIncognita) {
    marcadoresHtml += `
            <div style="position: absolute; left: ${getPos(datos.focal.t)}%; bottom: -45px; transform: translateX(-50%); text-align: center; z-index: 10;">
                <div class="fw-bold small text-muted mb-2">t=${datos.focal.t}</div>
                <div style="width: 3px; height: 25px; background-color: #0d6efd; margin: 0 auto; position: relative; border-left: 2px dashed #0d6efd;">
                    <div style="position: absolute; top: -5px; left: -5px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid #0d6efd;"></div>
                </div>
                <span class="badge bg-primary mt-1 shadow-lg text-white border border-light">X (Incógnita)</span>
            </div>`;
  }

  return `
        <div class="mt-4 p-4 bg-white border border-secondary rounded shadow-sm">
            <h6 class="fw-bold text-center mb-5 text-secondary"><i class="bi bi-graph-up"></i> Línea de Tiempo (${datos.u})</h6>
            <div class="position-relative" style="height: 100px; padding: 0 40px; margin: 40px 0;">
                <div class="w-100 bg-dark" style="height: 4px; position: absolute; top: 50%; left: 0; transform: translateY(-50%); border-radius: 2px;"></div>
                ${marcadoresHtml}
            </div>
            <div class="text-center mt-5 small text-muted d-flex justify-content-center gap-3">
                <span><span class="badge bg-danger">&nbsp;</span> Deuda</span>
                <span><span class="badge bg-success">&nbsp;</span> Pagos</span>
                <span><span class="badge bg-primary">&nbsp;</span> Incógnita (X)</span>
            </div>
        </div>
    `;
};
const tablaTiempoExacto = {
  año1: {
    ene: Array.from({ length: 31 }, (_, i) => 1 + i),
    feb: Array.from({ length: 28 }, (_, i) => 32 + i),
    mar: Array.from({ length: 31 }, (_, i) => 60 + i),
    abr: Array.from({ length: 30 }, (_, i) => 91 + i),
    may: Array.from({ length: 31 }, (_, i) => 121 + i),
    jun: Array.from({ length: 30 }, (_, i) => 152 + i),
    jul: Array.from({ length: 31 }, (_, i) => 182 + i),
    ago: Array.from({ length: 31 }, (_, i) => 213 + i),
    sep: Array.from({ length: 30 }, (_, i) => 244 + i),
    oct: Array.from({ length: 31 }, (_, i) => 274 + i),
    nov: Array.from({ length: 30 }, (_, i) => 305 + i),
    dic: Array.from({ length: 31 }, (_, i) => 335 + i),
  },
  año2: {
    ene: Array.from({ length: 31 }, (_, i) => 366 + i),
    feb: Array.from({ length: 28 }, (_, i) => 397 + i),
    mar: Array.from({ length: 31 }, (_, i) => 425 + i),
    abr: Array.from({ length: 30 }, (_, i) => 456 + i),
    may: Array.from({ length: 31 }, (_, i) => 486 + i),
    jun: Array.from({ length: 30 }, (_, i) => 517 + i),
    jul: Array.from({ length: 31 }, (_, i) => 547 + i),
    ago: Array.from({ length: 31 }, (_, i) => 578 + i),
    sep: Array.from({ length: 30 }, (_, i) => 609 + i),
    oct: Array.from({ length: 31 }, (_, i) => 639 + i),
    nov: Array.from({ length: 30 }, (_, i) => 670 + i),
    dic: Array.from({ length: 31 }, (_, i) => 700 + i),
  },
};

// --- CONFIGURACIÓN DE FORMULAS ---
const secciones = {
  simple: {
    titulo: "Interés Simple",
    color: "border-primary",
    formulas: {
      I: { nombre: "Calcular Interés (I=Pit)", campos: ["P", "i", "t"] },
      P: { nombre: "Calcular Capital (P=I/it)", campos: ["I", "i", "t"] },
      i: { nombre: "Calcular Tasa (i=I/Pt)", campos: ["I", "P", "t"] },
      t: { nombre: "Calcular Tiempo (t=I/Pi)", campos: ["I", "P", "i"] },
    },
  },
  monto: {
    titulo: "Interés Simple (Monto)",
    color: "border-success",
    formulas: {
      S: { nombre: "Calcular Monto (S=P(1+it))", campos: ["P", "i", "t"] },
      Ps: { nombre: "Calcular Capital (P=S/1+it)", campos: ["S", "i", "t"] },
      is: { nombre: "Calcular Tasa (i=S/P-1/t)", campos: ["S", "P", "t"] },
      ts: { nombre: "Calcular Tiempo (t=S/P-1/i)", campos: ["S", "P", "i"] },
    },
  },
  fechas: { titulo: "Cálculo de Fechas", color: "border-warning" },
  tipos: {
    titulo: "Tipos de Interés",
    color: "border-info",
    formulas: {
      Io: {
        nombre: "Interés Ordinario (Io= Pit/360)",
        campos: ["P", "i", "t"],
      },
      Ie: { nombre: "Interés Exacto (Ie= Pit/365)", campos: ["P", "i", "t"] },
    },
  },
  descuento: {
    titulo: "Descuento Simple",
    color: "border-danger",
    formulas: {
      D: { nombre: "Calcular Descuento (D=Sdt)", campos: ["S", "d", "t"] },
      Pd: { nombre: "Calcular Valor Actual (P=S-D)", campos: ["S", "D"] },
      P_dt: { nombre: "Valor Actual (P=S(1-dt))", campos: ["S", "d", "t"] },
      S_dt: { nombre: "Calcular Monto (S=P/(1-dt))", campos: ["P", "d", "t"] },
      d_despeje: {
        nombre: "Calcular Tasa Desct. (d)",
        campos: ["S", "P", "t"],
      },
      t_despeje: { nombre: "Calcular Tiempo (t)", campos: ["S", "P", "d"] },
      d_equiv: {
        nombre: "Tasa Desct. Equiv. (d = i/(1+it))",
        campos: ["i", "t"],
      },
      i_equiv: {
        nombre: "Tasa Interés Equiv. (i = d/(1+dt))",
        campos: ["d", "t"],
      },
    },
  },
  pagosParciales: {
    titulo: "Pagos Parciales",
    color: "border-secondary",
    formulas: {
      reglaComercial: { nombre: "Regla Comercial", campos: [] },
      reglaAmericana: { nombre: "Regla Americana", campos: [] },
    },
  },
  compuesto: {
    titulo: "Interés Compuesto",
    color: "border-dark",
    formulas: {
      S_comp: {
        nombre: "Monto Compuesto (S=P(1+i)^n)",
        campos: ["P", "j", "t"],
      },
      P_comp: { nombre: "Valor Actual (P=S(1+i)^-n)", campos: ["S", "j", "t"] },
      n_comp: {
        nombre: "Tiempo o (n = (lnS/P)/(ln(1+i)))",
        campos: ["S", "P", "j"],
      },
      i_comp: {
        nombre: "Tasa por Periodo (i = [((S/P)^(1/n))-1])",
        campos: ["S", "P", "t"],
      },
      j_m: {
        nombre: "Tasa Nominal Equivalente (j= m[((1+(j'/m')^(m'/m))-1)])",
        campos: ["j_prima", "m_prima"],
      },
      i_nominal: {
        nombre: "Tasa Efectiva Anual (i = [((1+(j/m)^(n*m))-1)/n])",
        campos: ["j", "t"],
      },
      j_desde_i: {
        nombre: "Nominal desde Efectiva (j= m[((1+(i*n)^(1/n*m))-1)])",
        campos: ["i", "t"],
      },
      S_frac: {
        nombre: "Monto Fraccionario (S=P(1+i)^n (1+it))",
        campos: ["P", "j", "t"],
      },
      P_frac: {
        nombre: "Valor Act. Fraccionario (P=S(1+i)^-n (1+it))",
        campos: ["S", "j", "t"],
      },
    },
  },
};

// --- RENDERIZACION PRINCIPAL DEL CONTENEDOR ---
function renderizarCalculadora(tipo, botonElemento) {
  const botonesMenu = document.querySelectorAll(
    "#menu-principal-botones button",
  );
  botonesMenu.forEach((btn) => btn.classList.remove("active"));
  if (botonElemento) botonElemento.classList.add("active");

  const contenedor = document.getElementById("contenedor-principal");
  const info = secciones[tipo];
  let htmlForm = "";

  if (tipo === "fechas") {
    htmlForm = `<div class="d-flex gap-2 mb-3" id="botones-fechas"><button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Comercial', this)">Método Comercial</button><button class="btn btn-outline-warning w-50" onclick="generarInputsFecha('Exacto', this)">Tiempo Exacto</button></div><div id="sub-formulario"></div>`;
  } else {
    htmlForm = `<div class="row g-2 mb-3" id="botones-formulas">${Object.keys(
      info.formulas,
    )
      .map(
        (f) =>
          `<div class="col-md-4"><button class="btn btn-sm btn-dark w-100" onclick="generarInputsFormula('${tipo}', '${f}', this)">${info.formulas[f].nombre}</button></div>`,
      )
      .join("")}</div><div id="sub-formulario"></div>`;
  }
  contenedor.innerHTML = `<div class="card p-4 border-2 ${info.color} fade-in shadow-sm"><h3 class="fw-bold mb-3 text-start">${info.titulo}</h3>${htmlForm}<div id="resultado" class="mt-3 fw-bold text-center text-primary h4"></div></div>`;
}

// --- GENERADOR DE FORMULARIOS ÚNICO ---
function generarInputsFormula(cat, formKey, botonElemento) {
  cacheFraccionario = { exacto: null, practico: null };

  const botonesFormulas = document.querySelectorAll("#botones-formulas button");
  botonesFormulas.forEach((btn) => {
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-dark");
  });
  if (botonElemento) {
    botonElemento.classList.remove("btn-dark");
    botonElemento.classList.add("btn-primary");
  }

  const contenedor = document.getElementById("sub-formulario");
  const formula = secciones[cat].formulas[formKey];

  // ==========================================
  // 0. TIPOS DE INTERÉS
  // ==========================================
  if (cat === "tipos") {
    let isOrdinario = formKey === "Io";
    let btn1 = isOrdinario ? "Iota" : "Ieta";
    let btn2 = isOrdinario ? "Iote" : "Iete";
    let denom = isOrdinario ? 360 : 365;
    let t_nom = isOrdinario ? "Interés Ordinario" : "Interés Exacto";

    let htmlTipos = `
            <div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-info border-top-0 border-end-0 border-bottom-0 border-5">
                <h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Modo: ${t_nom} (Denominador: ${denom})</h5>
                <div class="row g-3 mb-4"><div class="col-md-6"><label class="fw-bold small text-dark">CAPITAL (P)</label><input type="number" id="val-P" class="form-control border-dark border-2" placeholder="Monto"></div><div class="col-md-6"><label class="fw-bold small text-dark">TASA DE INTERÉS (%)</label><div class="input-group"><input type="number" id="val-i" class="form-control border-dark border-2" placeholder="%" oninput="actualizarDecimal('i')"><span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span><input type="text" id="res-decimal-i" class="form-control bg-light border-dark border-2" readonly placeholder="0.000000"></div></div></div>
                <div class="mb-4 p-3 bg-light border border-info rounded text-start shadow-sm"><label class="fw-bold text-info mb-3 d-block border-bottom border-info pb-2"><i class="bi bi-calendar-range"></i> TIEMPO (Rango de Fechas)</label><div class="row g-3"><div class="col-md-6"><label class="small text-muted fw-bold">Fecha Inicial</label><input type="date" id="fecha-ini-tipos" class="form-control border-dark border-2"></div><div class="col-md-6"><label class="small text-muted fw-bold">Fecha Final</label><input type="date" id="fecha-fin-tipos" class="form-control border-dark border-2"></div></div><small class="text-muted d-block mt-3">* El sistema calculará automáticamente los días aproximados y exactos a partir de estas fechas.</small></div>
                <div class="row g-2"><div class="col-md-6"><button class="btn btn-warning w-100 py-3 fw-bold fs-6 text-dark shadow-sm" onclick="procesarTiposInteres('${btn1}', ${denom})">Calcular mediante ${btn1}</button></div><div class="col-md-6"><button class="btn btn-info w-100 py-3 fw-bold fs-6 text-white shadow-sm" onclick="procesarTiposInteres('${btn2}', ${denom})">Calcular mediante ${btn2}</button></div></div>
            </div>`;
    contenedor.innerHTML = htmlTipos;
    return;
  }

  // ==========================================
  // 1. PAGOS PARCIALES
  // ==========================================
  if (formKey === "reglaComercial" || formKey === "reglaAmericana") {
    const titulo =
      formKey === "reglaComercial"
        ? "Ecuación de Valor (Regla Comercial)"
        : "Pagos Parciales (Regla Americana)";
    const btnAccion =
      formKey === "reglaComercial"
        ? "procesarReglaComercial()"
        : "procesarReglaAmericana()";

    let htmlPagos = `
            <div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in">
                <h5 class="text-secondary border-bottom pb-2 mb-4 text-start fw-bold">${titulo}</h5>
                <div class="mb-3 text-start border-bottom pb-3"><label class="form-label small fw-bold text-primary"><i class="bi bi-clock-history"></i> Configuración General</label><div class="row g-2"><div class="col-6"><label class="small text-muted">Unidad Global</label><select id="unidad-pagos" class="form-select form-select-sm"><option value="anios">Años</option><option value="meses">Meses</option><option value="dias">Días (Base 360)</option></select></div><div class="col-6"><label class="small text-muted">Tasa Interés (%)</label><input type="number" id="i-pagos" class="form-control form-control-sm" placeholder="Ej: 5"></div>${formKey === "reglaComercial" ? `<div class="col-12 mt-2"><label class="small text-muted">Fecha Focal (t)</label><input type="number" id="t-focal" class="form-control form-control-sm" placeholder="Ej: 12"></div>` : ""}</div></div>
                <div class="mb-3 text-start border-bottom pb-3"><label class="form-label small fw-bold text-danger">Deuda Principal (El Préstamo)</label><div class="row g-2"><div class="col-6"><label class="small text-muted">Monto Original ($)</label><input type="number" id="monto-deuda" class="form-control form-control-sm" placeholder="Ej: 10000"></div><div class="col-6"><label class="small text-muted">Ubicación (Tiempo)</label><input type="number" id="t-deuda" class="form-control form-control-sm" placeholder="Ej: 0" ${formKey === "reglaAmericana" ? 'value="0"' : ""}></div></div></div>
                <div class="mb-3 text-start border-bottom pb-3 bg-light p-2 rounded border"><label class="form-label small fw-bold text-success">Incógnita: Pago Final (X)</label><div class="row g-2"><div class="col-12"><label class="small text-muted">¿En qué tiempo se liquida?</label><input type="number" id="t-x" class="form-control form-control-sm border-success"></div></div></div>
                <div class="mb-3 text-start"><label class="form-label small fw-bold text-info">Pagos Parciales Acordados</label><select id="cantidad-pagos" class="form-select form-select-sm mb-3 border-info" onchange="generarCamposPagos()"><option value="0">0 Pagos</option><option value="1">1 Pago</option><option value="2">2 Pagos</option><option value="3">3 Pagos</option><option value="4">4 Pagos</option></select><div id="contenedor-pagos-dinamicos"></div></div>
                <button class="btn btn-dark w-100 mt-2 fw-bold shadow-sm" onclick="${btnAccion}">CALCULAR LIQUIDACIÓN</button>
            </div>`;
    contenedor.innerHTML = htmlPagos;
    return;
  }

  // ==========================================
  // 2. INTERÉS COMPUESTO
  // ==========================================
  if (cat === "compuesto") {
    const c = formula.campos;
    let isFraccionario = formKey === "S_frac" || formKey === "P_frac";

    let html = `<div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-dark border-top-0 border-end-0 border-bottom-0 border-5">`;

    if (isFraccionario) {
      let fEx = formKey === "S_frac" ? "S = P(1+i)^n" : "P = S(1+i)^-n";
      let fPr =
        formKey === "S_frac"
          ? "S = P(1+i)^n * (1+it)"
          : "P = S(1+i)^-n * (1+it)";
      html += `
            <h5 class="text-dark border-bottom pb-2 mb-3 fw-bold" id="titulo-formula">Fórmula: ${fEx}</h5>
            <div class="mb-4 pb-3 border-bottom border-secondary">
                <label class="fw-bold small text-dark d-block mb-2">SELECCIONE EL MÉTODO A UTILIZAR</label>
                <div class="form-check form-check-inline">
                    <input class="form-check-input border-dark" type="radio" name="metodoFrac" id="mf-exacto" value="exacto" checked onchange="toggleMetodoFraccionario('${fEx}', '${fPr}')">
                    <label class="form-check-label fw-bold text-success" for="mf-exacto" style="cursor:pointer;">Método Exacto</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input border-dark" type="radio" name="metodoFrac" id="mf-practico" value="practico" onchange="toggleMetodoFraccionario('${fEx}', '${fPr}')">
                    <label class="form-check-label fw-bold text-info" for="mf-practico" style="cursor:pointer;">Método Práctico</label>
                </div>
            </div>`;
    } else {
      html += `<h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Fórmula: ${formula.nombre}</h5>`;
    }

    html += `
            <div class="mb-3">
                <label class="fw-bold small text-dark">FRECUENCIA DE CONVERSIÓN (m)</label>
                <select id="val-m" class="form-select border-dark border-2" onchange="actualizarCompuestoEnVivo()">
                    <option value="1">Anual (1)</option><option value="2">Semestral (2)</option><option value="3">Cuatrimestral (3)</option>
                    <option value="4">Trimestral (4)</option><option value="6">Bimestral (6)</option><option value="12">Mensual (12)</option>
                </select>
            </div>`;

    if (c.includes("m_prima")) {
      html += `<div class="mb-3"><label class="fw-bold small text-dark">FRECUENCIA CONOCIDA (m')</label><select id="val-m_prima" class="form-select border-dark border-2"><option value="1">Anual</option><option value="2">Semestral</option><option value="4">Trimestral</option><option value="12">Mensual</option></select></div>`;
    }

    if (c.includes("P"))
      html += `<div class="mb-3"><label class="fw-bold small text-dark">CAPITAL (P)</label><input type="number" id="val-P" class="form-control border-dark border-2"></div>`;
    if (c.includes("S"))
      html += `<div class="mb-3"><label class="fw-bold small text-dark">MONTO (S)</label><input type="number" id="val-S" class="form-control border-dark border-2"></div>`;

    if (c.includes("j") || c.includes("j_prima")) {
      let labelJ = c.includes("j_prima")
        ? "TASA NOMINAL CONOCIDA (j')"
        : "TASA NOMINAL (j)";
      html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">${labelJ}</label>
                    <div class="input-group">
                        <input type="number" id="val-j" class="form-control border-dark border-2" placeholder="Porcentaje (%)" oninput="actualizarCompuestoEnVivo()">
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-j" class="form-control bg-light border-dark border-2" readonly placeholder="0.000000">
                    </div>
                </div>`;
    } else if (c.includes("i")) {
      html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">TASA EFECTIVA (i)</label>
                    <div class="input-group">
                        <input type="number" id="val-i-manual" class="form-control border-dark border-2" placeholder="Porcentaje (%)" oninput="document.getElementById('dec-i-manual').value = (this.value/100).toFixed(6)">
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-i-manual" class="form-control bg-light border-dark border-2" readonly placeholder="0.000000">
                    </div>
                </div>`;
    }

    if (c.includes("t")) {
      html += `
            <div class="mb-3 p-3 bg-light border border-dark border-2 rounded">
                <label class="fw-bold small text-dark mb-2">TIEMPO</label>
                <div class="mb-3 pb-2 border-bottom border-secondary">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-fechas" value="fechas" checked onchange="toggleModoTiempoComp()">
                        <label class="form-check-label fw-bold text-danger" for="rt-fechas" style="cursor:pointer;">Entre fechas</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-anios" value="anios" onchange="toggleModoTiempoComp()">
                        <label class="form-check-label fw-bold text-warning" for="rt-anios" style="cursor:pointer;">Años</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input border-dark" type="radio" name="modoTiempo" id="rt-am" value="am" onchange="toggleModoTiempoComp()">
                        <label class="form-check-label fw-bold text-success" for="rt-am" style="cursor:pointer;">Años y meses</label>
                    </div>
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

    if (c.includes("t") || c.includes("n")) {
      let readonlyState = c.includes("t") ? "readonly" : "";
      let hint = c.includes("t")
        ? "Se calculará automáticamente"
        : "Ingrese los periodos";
      html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">NÚMERO DE PERIODOS (n)</label>
                    <input type="text" id="val-n" class="form-control border-dark border-2 fw-bold text-primary bg-white" placeholder="${hint}" ${readonlyState}>
                </div>`;
    }

    if (c.includes("j") || c.includes("j_prima")) {
      html += `
                <div class="mb-3">
                    <label class="fw-bold small text-dark">TASA i (i = J / M)</label>
                    <div class="input-group">
                        <input type="text" id="calc-i" class="form-control border-dark border-2 fw-bold text-success bg-white" placeholder="Porcentaje" readonly>
                        <span class="input-group-text bg-light text-dark fw-bold border-dark border-2">Dec:</span>
                        <input type="text" id="dec-i" class="form-control bg-light border-dark border-2 fw-bold text-success" readonly placeholder="0.000000">
                    </div>
                </div>`;
    }

    if (isFraccionario) {
      html += `
            <div id="seccion-metodo-practico" class="d-none mt-4 p-3 bg-light border border-info border-2 rounded">
                <h6 class="text-info fw-bold border-bottom border-info pb-2 mb-3"><i class="bi bi-plus-slash-minus"></i> SECCIÓN INTERÉS SIMPLE</h6>
                <div class="row g-2">
                    <div class="col-4"><label class="small fw-bold text-dark">Tasa (i) heredada</label><input type="text" id="comp-frac-i" class="form-control border-info bg-white" readonly></div>
                    <div class="col-4"><label class="small fw-bold text-dark">Meses Restantes</label><input type="number" id="comp-frac-meses" class="form-control border-info fw-bold bg-white" readonly></div>
                    <div class="col-4"><label class="small fw-bold text-dark">Meses del Periodo</label><input type="number" id="comp-frac-base" class="form-control border-info bg-white" readonly></div>
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
  let htmlInputs = formula.campos
    .map((c) => {
      if (c === "i" || c === "is" || c === "d" || c === "desct") {
        let rateDropdown =
          c === "i" || c === "is"
            ? `<select id="unidad-tasa-${c}" class="form-select border-dark bg-white" style="max-width: 140px;" onchange="actualizarDecimal('${c}')"><option value="1" selected>Anual</option><option value="2">Semestral</option><option value="3">Cuatrimestral</option><option value="4">Trimestral</option><option value="6">Bimestral</option><option value="12">Mensual</option></select>`
            : "";
        return `<div class="mb-3 text-start"><label class="form-label small fw-bold">Porcentaje / Tasa (%)</label><div class="input-group"><input type="number" id="val-${c}" class="form-control border-dark" placeholder="Ej: 18" oninput="actualizarDecimal('${c}')">${rateDropdown}<span class="input-group-text bg-light border-dark fw-bold">Dec:</span><input type="text" id="res-decimal-${c}" class="form-control bg-light border-dark text-success fw-bold" readonly placeholder="0.000000"></div></div>`;
      }

      if (c === "t" || c === "ts") {
        const permiteFechas = ["descuento"].includes(cat);
        let htmlOpciones = "";
        let htmlFechas = "";
        if (permiteFechas) {
          htmlOpciones = `
                <div class="mb-3 border-bottom pb-2">
                    <div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="mt-${c}" id="rt-aprox-${c}" value="aprox" checked onchange="toggleModoTiempo('${c}')"><label class="small fw-bold" for="rt-aprox-${c}" style="cursor:pointer;">Tiempo Aproximado</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="mt-${c}" id="rt-exacto-${c}" value="exacto" onchange="toggleModoTiempo('${c}')"><label class="small fw-bold" for="rt-exacto-${c}" style="cursor:pointer;">Tiempo Exacto</label></div>
                </div>`;
          htmlFechas = `<div id="cont-exacto-${c}" class="d-none bg-light p-3 border border-warning rounded mb-2"><div class="row g-2"><div class="col-6"><label class="small text-muted fw-bold">D/M/A Inicial</label><div class="input-group input-group-sm"><input type="number" id="dia-ini-${c}" class="form-control" placeholder="DD" oninput="actualizarTiempoFechas('${c}')"><select id="mes-ini-${c}" class="form-select" onchange="actualizarTiempoFechas('${c}')"><option value="ene">Ene</option><option value="feb">Feb</option><option value="mar">Mar</option><option value="abr">Abr</option><option value="may">May</option><option value="jun">Jun</option><option value="jul">Jul</option><option value="ago">Ago</option><option value="sep">Sep</option><option value="oct">Oct</option><option value="nov">Nov</option><option value="dic">Dic</option></select><input type="number" id="anio-ini-${c}" class="form-control" placeholder="YYYY" oninput="actualizarTiempoFechas('${c}')"></div></div><div class="col-6"><label class="small text-muted fw-bold">D/M/A Final</label><div class="input-group input-group-sm"><input type="number" id="dia-fin-${c}" class="form-control" placeholder="DD" oninput="actualizarTiempoFechas('${c}')"><select id="mes-fin-${c}" class="form-select" onchange="actualizarTiempoFechas('${c}')"><option value="ene">Ene</option><option value="feb">Feb</option><option value="mar">Mar</option><option value="abr">Abr</option><option value="may">May</option><option value="jun">Jun</option><option value="jul">Jul</option><option value="ago">Ago</option><option value="sep">Sep</option><option value="oct">Oct</option><option value="nov">Nov</option><option value="dic">Dic</option></select><input type="number" id="anio-fin-${c}" class="form-control" placeholder="YYYY" oninput="actualizarTiempoFechas('${c}')"></div></div></div></div>`;
        }
        return `
                <div class="mb-3 text-start">
                    <label class="form-label small fw-bold">Tiempo (t en años)</label>
                    ${htmlOpciones}
                    <div id="cont-aprox-${c}">
                        <div class="input-group mb-1">
                            <input type="number" id="val-${c}" class="form-control border-dark" placeholder="Cantidad" oninput="actualizarTiempo('${c}')">
                            <input type="number" id="val-${c}-meses" class="form-control border-dark" placeholder="Meses" oninput="actualizarTiempo('${c}')">
                            <select id="unidad-${c}" class="form-select border-dark" onchange="alternarBaseDias('${c}'); actualizarTiempo('${c}');"><option value="anios_meses">Años y Meses</option><option value="semestres">Semestres (÷2)</option><option value="cuatrimestres">Cuatrimestres (÷3)</option><option value="trimestres">Trimestres (÷4)</option><option value="bimestres">Bimestres (÷6)</option><option value="meses">Meses (÷12)</option><option value="dias">Solo Días</option></select>
                        </div>
                        <div id="base-dias-container-${c}" class="mt-2 d-none"><label class="small text-muted fw-bold">Base:</label><select id="base-${c}" class="form-select form-select-sm" onchange="actualizarTiempo('${c}')"><option value="360">Comercial (360)</option><option value="365">Exacto (365)</option></select></div>
                    </div>
                    ${htmlFechas}
                    <div class="input-group mt-2"><span class="input-group-text bg-warning-subtle text-dark fw-bold">Tiempo (t):</span><input type="text" id="res-tiempo-${c}" class="form-control bg-light fw-bold text-dark" readonly></div>
                </div>`;
      }
      const eti = {
        P: "Capital Inicial (P)",
        S: "Monto (S)",
        D: "Descuento (D)",
      };
      return `<div class="mb-3 text-start"><label class="form-label small fw-bold">${eti[c] || c}</label><input type="number" id="val-${c}" class="form-control border-dark"></div>`;
    })
    .join("");

  contenedor.innerHTML = `<div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-dark border-top-0 border-end-0 border-bottom-0 border-5"><h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Formulario: ${formula.nombre}</h5>${htmlInputs}<button class="btn btn-dark w-100 mt-3 py-2 fw-bold" onclick="procesarCalculoSimple('${formKey}')">REALIZAR CÁLCULO</button></div>`;
}

// ==========================================
// CÁLCULO DE FECHAS ESTÁNDAR
// ==========================================
function generarInputsFecha(tipo, botonElemento) {
  const botonesFechas = document.querySelectorAll("#botones-fechas button");
  botonesFechas.forEach((btn) => {
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-outline-warning");
  });
  if (botonElemento) {
    botonElemento.classList.remove("btn-outline-warning");
    botonElemento.classList.add("btn-warning");
  }

  const contenedor = document.getElementById("sub-formulario");
  document.getElementById("resultado").innerHTML = "";

  let html = `<div class="bg-white p-4 rounded shadow-sm border mt-2 fade-in text-start border-warning border-top-0 border-end-0 border-bottom-0 border-5"><h5 class="text-dark border-bottom pb-2 mb-4 fw-bold">Modo: Tiempo ${tipo}</h5>`;

  if (tipo === "Comercial") {
    html += `<div class="row g-3 mb-3"><div class="col-md-6"><label class="fw-bold small text-dark">Fecha Inicial</label><input type="date" id="fecha-ini-com" class="form-control border-dark border-2"></div><div class="col-md-6"><label class="fw-bold small text-dark">Fecha Final</label><input type="date" id="fecha-fin-com" class="form-control border-dark border-2"></div></div><button class="btn btn-dark w-100 mt-2 py-2 fw-bold fs-5" onclick="procesarFechasComercial()">CALCULAR DÍAS (COMERCIAL)</button>`;
  } else if (tipo === "Exacto") {
    html += `<div class="mb-3 pb-3 border-bottom border-secondary"><label class="fw-bold small text-dark d-block mb-2">TIPO DE RANGO (Opcional, autodetectado)</label><div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoExacto" id="me-mismo" value="mismo" checked><label class="form-check-label fw-bold small" for="me-mismo" style="cursor:pointer;">Mismo Año</label></div><div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoExacto" id="me-cons" value="consecutivos"><label class="form-check-label fw-bold small" for="me-cons" style="cursor:pointer;">Años Consecutivos</label></div><div class="form-check form-check-inline"><input class="form-check-input border-dark" type="radio" name="modoExacto" id="me-rango" value="rango"><label class="form-check-label fw-bold small" for="me-rango" style="cursor:pointer;">Rango de Fechas (>2 años)</label></div></div><div class="row g-3 mb-3"><div class="col-md-6"><label class="fw-bold small text-dark">Fecha Inicial</label><input type="date" id="fecha-ini-ex" class="form-control border-dark border-2"></div><div class="col-md-6"><label class="fw-bold small text-dark">Fecha Final</label><input type="date" id="fecha-fin-ex" class="form-control border-dark border-2"></div></div><button class="btn btn-dark w-100 mt-2 py-2 fw-bold fs-5" onclick="procesarFechasExacto()">CALCULAR DÍAS (EXACTO)</button>`;
  }
  html += `</div>`;
  contenedor.innerHTML = html;
}

function procesarFechasComercial() {
  const f1 = document.getElementById("fecha-ini-com").value;
  const f2 = document.getElementById("fecha-fin-com").value;
  const res = document.getElementById("resultado");
  if (!f1 || !f2) {
    res.innerHTML = `<div class="alert alert-danger mt-3">Ingrese ambas fechas.</div>`;
    return;
  }
  const [yI, mI, dI] = f1.split("-").map(Number);
  const [yF, mF, dF] = f2.split("-").map(Number);
  let c_dF = dF,
    c_mF = mF,
    c_yF = yF;
  let prestaDia = false,
    prestaMes = false;
  if (c_dF < dI) {
    c_dF += 30;
    c_mF -= 1;
    prestaDia = true;
  }
  if (c_mF < mI) {
    c_mF += 12;
    c_yF -= 1;
    prestaMes = true;
  }
  const resD = c_dF - dI;
  const resM = c_mF - mI;
  const resY = c_yF - yI;
  const totalDias = resY * 360 + resM * 30 + resD;
  let htmlVisual = `Días = (${resY} años × 360) + (${resM} meses × 30) + ${resD} días`;
  res.innerHTML = `<div class="alert alert-success mt-4 text-start border-success border-2 shadow-sm fade-in"><h5 class="fw-bold border-bottom border-success pb-2 text-success"><i class="bi bi-calculator"></i> Resta Tradicional (Comercial)</h5><div class="text-center mt-2 bg-success text-white p-3 rounded shadow-sm"><span class="d-block fw-bold text-uppercase">TOTAL DÍAS COMERCIALES:</span><span class="fs-1 fw-bold">${totalDias}</span></div>${generarCajaFormula(htmlVisual)}</div>`;
}

function procesarFechasExacto() {
  const f1 = document.getElementById("fecha-ini-ex").value;
  const f2 = document.getElementById("fecha-fin-ex").value;
  const res = document.getElementById("resultado");
  if (!f1 || !f2) {
    res.innerHTML = `<div class="alert alert-danger mt-3">Ingrese ambas fechas.</div>`;
    return;
  }
  const [yI, mI, dI] = f1.split("-").map(Number);
  const [yF, mF, dF] = f2.split("-").map(Number);
  let dateI = new Date(yI, mI - 1, dI);
  let dateF = new Date(yF, mF - 1, dF);
  if (dateF < dateI) {
    res.innerHTML = `<div class="alert alert-danger mt-3">La fecha final debe ser mayor.</div>`;
    return;
  }
  const mkI = Object.keys(tablaTiempoExacto.año1)[mI - 1];
  const mkF = Object.keys(tablaTiempoExacto.año1)[mF - 1];
  let vI = tablaTiempoExacto.año1[mkI][dI - 1];
  let vF_a1 = tablaTiempoExacto.año1[mkF][dF - 1];
  let vF_a2 = tablaTiempoExacto.año2[mkF][dF - 1];
  if (vI === undefined || vF_a1 === undefined) {
    res.innerHTML = `<div class="alert alert-danger mt-3">Fecha inválida.</div>`;
    return;
  }
  const esBisiesto = (y) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  let countB = 0;
  let listaB = [];
  for (let y = yI; y <= yF; y++) {
    if (esBisiesto(y)) {
      let iRango = y === yI ? new Date(yI, mI - 1, dI) : new Date(y, 0, 1);
      let fRango = y === yF ? new Date(yF, mF - 1, dF) : new Date(y, 11, 31);
      let feb29 = new Date(y, 1, 29);
      if (feb29 >= iRango && feb29 <= fRango) {
        countB++;
        listaB.push(y);
      }
    }
  }
  let totalDias = 0;
  let modoReal = yI === yF ? "mismo" : yF - yI === 1 ? "consecutivos" : "rango";
  let htmlVisual = "";
  if (modoReal === "mismo") {
    let diff = vF_a1 - vI;
    totalDias = diff + countB;
    htmlVisual = `Días = ${vF_a1} (Tabla Final) - ${vI} (Tabla Inicial) + ${countB} (Bisiestos)`;
  } else if (modoReal === "consecutivos") {
    let diff = vF_a2 - vI;
    totalDias = diff + countB;
    htmlVisual = `Días = ${vF_a2} (Tabla Año 2) - ${vI} (Tabla Inicial) + ${countB} (Bisiestos)`;
  } else if (modoReal === "rango") {
    let yFocal = yF - 1;
    let aniosEnteros = yFocal - yI;
    let diasAniosEnteros = aniosEnteros * 365;
    let diffConsecutivo = vF_a2 - vI;
    totalDias = diasAniosEnteros + diffConsecutivo + countB;
    htmlVisual = `Días = (${aniosEnteros} años × 365) + (${vF_a2} - ${vI}) [Tabla Rango] + ${countB} (Bisiestos)`;
  }
  res.innerHTML = `<div class="alert alert-success mt-4 text-start border-success border-2 shadow-sm fade-in"><h5 class="fw-bold border-bottom border-success pb-2 text-success"><i class="bi bi-calendar3"></i> Desglose de Tiempo Exacto</h5><div class="text-center mt-2 bg-success text-white p-3 rounded shadow-sm"><span class="d-block fw-bold text-uppercase">TOTAL DÍAS EXACTOS:</span><span class="fs-1 fw-bold">${totalDias}</span></div>${generarCajaFormula(htmlVisual)}</div>`;
}

// ==========================================
// FUNCIONES LÓGICAS TIPOS DE INTERÉS
// ==========================================
function procesarTiposInteres(tipoCalculo, denominador) {
  const P = parseFloat(document.getElementById("val-P").value) || 0;
  const i_str = document.getElementById("res-decimal-i").value;
  const i = i_str
    ? parseFloat(i_str)
    : (parseFloat(document.getElementById("val-i").value) || 0) / 100;
  const f1 = document.getElementById("fecha-ini-tipos").value;
  const f2 = document.getElementById("fecha-fin-tipos").value;
  const res = document.getElementById("resultado");

  if (!f1 || !f2 || P <= 0 || i <= 0) {
    res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">Por favor, complete Capital, Tasa y Fechas.</div>`;
    return;
  }

  const [yI, mI, dI] = f1.split("-").map(Number);
  const [yF, mF, dF] = f2.split("-").map(Number);
  let c_dF = dF,
    c_mF = mF,
    c_yF = yF;
  if (c_dF < dI) {
    c_dF += 30;
    c_mF -= 1;
  }
  if (c_mF < mI) {
    c_mF += 12;
    c_yF -= 1;
  }
  let diasAprox = (c_yF - yI) * 360 + (c_mF - mI) * 30 + (c_dF - dI);

  let dateI = new Date(yI, mI - 1, dI);
  let dateF = new Date(yF, mF - 1, dF);
  let diasExactos = Math.round((dateF - dateI) / (1000 * 60 * 60 * 24));

  if (diasExactos < 0 || diasAprox < 0) {
    res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">La fecha final debe ser posterior.</div>`;
    return;
  }

  let diasUso =
    tipoCalculo === "Iota" || tipoCalculo === "Ieta" ? diasAprox : diasExactos;
  let resultadoFinal = P * i * (diasUso / denominador);
  let htmlVisual = `I = ${P.toLocaleString("en-US")} × ${i.toFixed(6)} × (${diasUso} / ${denominador})`;

  res.innerHTML = `<div class="alert alert-success mt-4 text-start border-success border-2 shadow-sm fade-in"><h5 class="fw-bold border-bottom border-success pb-2 text-success"><i class="bi bi-receipt"></i> Resultado: ${tipoCalculo}</h5><div class="text-center mt-3 bg-success text-white p-3 rounded shadow-sm"><span class="d-block fw-bold text-uppercase" style="letter-spacing: 1px;">INTERÉS GENERADO</span><span class="fs-1 fw-bold">$${resultadoFinal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span></div>${generarCajaFormula(htmlVisual)}</div>`;
}

// ==========================================
// MATEMATICAS ESTÁNDAR Y COMPUESTO
// ==========================================
function actualizarDecimal(id) {
  const valor = parseFloat(document.getElementById(`val-${id}`).value);
  const unidadTasa = document.getElementById(`unidad-tasa-${id}`);
  const resDecimal = document.getElementById(`res-decimal-${id}`);
  if (!isNaN(valor)) {
    let decimal = valor / 100;
    if (unidadTasa) {
      let m = parseFloat(unidadTasa.value) || 1;
      decimal = decimal / m;
    }
    resDecimal.value = decimal.toFixed(6);
  } else {
    resDecimal.value = "";
  }
}
function alternarBaseDias(id) {
  const u = document.getElementById(`unidad-${id}`).value;
  const c = document.getElementById(`base-dias-container-${id}`);
  const i = document.getElementById(`val-${id}-meses`);
  if (c) {
    if (u === "dias") {
      c.classList.remove("d-none");
    } else {
      c.classList.add("d-none");
    }
  }
  if (i) {
    if (u === "anios_meses") {
      i.classList.remove("d-none");
    } else {
      i.classList.add("d-none");
      i.value = "";
    }
  }
}
function actualizarTiempo(id) {
  const iA = document.getElementById(`val-${id}`);
  const iM = document.getElementById(`val-${id}-meses`);
  const u = document.getElementById(`unidad-${id}`).value;
  const cD = document.getElementById(`res-tiempo-${id}`);
  let v1 = parseFloat(iA.value) || 0;
  let v2 =
    iM && !iM.classList.contains("d-none") ? parseFloat(iM.value) || 0 : 0;
  if (u === "anios_meses") {
    cD.value = (v1 + v2 / 12).toFixed(4);
  } else if (u === "semestres") {
    cD.value = (v1 / 2).toFixed(4);
  } else if (u === "cuatrimestres") {
    cD.value = (v1 / 3).toFixed(4);
  } else if (u === "trimestres") {
    cD.value = (v1 / 4).toFixed(4);
  } else if (u === "bimestres") {
    cD.value = (v1 / 6).toFixed(4);
  } else if (u === "meses") {
    cD.value = (v1 / 12).toFixed(4);
  } else if (u === "dias") {
    const base = document.getElementById(`base-${id}`)
      ? parseFloat(document.getElementById(`base-${id}`).value) || 360
      : 360;
    cD.value = (v1 / base).toFixed(4);
  }
}
function toggleModoTiempo(id) {
  const isE = document.getElementById(`radio-exacto-${id}`).checked;
  const cA = document.getElementById(`cont-aprox-${id}`);
  const cE = document.getElementById(`cont-exacto-${id}`);
  document.getElementById(`res-tiempo-${id}`).value = "";
  if (isE) {
    cA.classList.add("d-none");
    cE.classList.remove("d-none");
    actualizarTiempoFechas(id);
  } else {
    cE.classList.add("d-none");
    cA.classList.remove("d-none");
    actualizarTiempo(id);
  }
}
function actualizarTiempoFechas(id) {
  const dI = parseInt(document.getElementById(`dia-ini-${id}`).value);
  const mI = document.getElementById(`mes-ini-${id}`).value;
  const aI = parseInt(document.getElementById(`anio-ini-${id}`).value) || 0;
  const dF = parseInt(document.getElementById(`dia-fin-${id}`).value);
  const mF = document.getElementById(`mes-fin-${id}`).value;
  const aF = parseInt(document.getElementById(`anio-fin-${id}`).value) || 0;
  const cD = document.getElementById(`res-tiempo-${id}`);
  if (!isNaN(dI) && !isNaN(dF) && aI > 0 && aF > 0) {
    try {
      let vI = tablaTiempoExacto.año1[mI][dI - 1];
      let vF = tablaTiempoExacto.año1[mF][dF - 1];
      if (vI === undefined || vF === undefined) return;
      let anioDif = aF - aI;
      let diasTotales = 0;
      if (anioDif === 0) {
        diasTotales = vF - vI;
      } else if (anioDif === 1) {
        vF = tablaTiempoExacto.año2[mF][dF - 1];
        diasTotales = vF - vI;
      } else {
        let diasAniosEnteros = (anioDif - 1) * 365;
        vF = tablaTiempoExacto.año2[mF][dF - 1];
        diasTotales = diasAniosEnteros + (vF - vI);
      }
      const esBisiesto = (y) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
      let numM1 = Object.keys(tablaTiempoExacto.año1).indexOf(mI);
      let numM2 = Object.keys(tablaTiempoExacto.año1).indexOf(mF);
      for (let y = aI; y <= aF; y++) {
        if (esBisiesto(y)) {
          let iRango = y === aI ? new Date(aI, numM1, dI) : new Date(y, 0, 1);
          let fRango = y === aF ? new Date(aF, numM2, dF) : new Date(y, 11, 31);
          let feb29 = new Date(y, 1, 29);
          if (feb29 >= iRango && feb29 <= fRango) {
            diasTotales++;
          }
        }
      }
      cD.value = (diasTotales / 360).toFixed(4);
    } catch (e) {}
  }
}

function procesarCalculoSimple(key) {
  const res = document.getElementById("resultado");
  const getV = (id) =>
    parseFloat(document.getElementById(`val-${id}`)?.value) || 0;

  let P = getV("P");
  let S = getV("S");
  let I = getV("I");
  let D = getV("D");
  let i_str =
    document.getElementById("res-decimal-i")?.value ||
    document.getElementById("res-decimal-is")?.value;
  let d_str =
    document.getElementById("res-decimal-d")?.value ||
    document.getElementById("res-decimal-desct")?.value;
  let i = i_str ? parseFloat(i_str) : getV("i") / 100 || getV("is") / 100;
  let d = d_str ? parseFloat(d_str) : getV("d") / 100 || getV("desct") / 100;
  const idT = document.getElementById("val-t") ? "t" : "ts";
  let t = document.getElementById(`res-tiempo-${idT}`)
    ? parseFloat(document.getElementById(`res-tiempo-${idT}`).value) || 0
    : 0;

  let resultadoFinal = 0;
  let etiqueta = "";
  let esPorcentaje = false;
  let htmlVisual = "";

  switch (key) {
    case "I":
      resultadoFinal = P * i * t;
      etiqueta = "Interés (I)";
      htmlVisual = `I = ${P} × ${i.toFixed(6)} × ${t.toFixed(4)}`;
      break;
    case "P":
      resultadoFinal = I / (i * t);
      etiqueta = "Capital (P)";
      htmlVisual = `P = ${I} / (${i.toFixed(6)} × ${t.toFixed(4)})`;
      break;
    case "i":
      resultadoFinal = (I / (P * t)) * 100;
      etiqueta = "Tasa (i)";
      esPorcentaje = true;
      htmlVisual = `i = [ ${I} / (${P} × ${t.toFixed(4)}) ] × 100`;
      break;
    case "t":
      resultadoFinal = I / (P * i);
      etiqueta = "Tiempo (t)";
      htmlVisual = `t = ${I} / (${P} × ${i.toFixed(6)})`;
      break;
    case "S":
      resultadoFinal = P * (1 + i * t);
      etiqueta = "Monto (S)";
      htmlVisual = `S = ${P} × [ 1 + (${i.toFixed(6)} × ${t.toFixed(4)}) ]`;
      break;
    case "Ps":
      resultadoFinal = S / (1 + i * t);
      etiqueta = "Capital (P)";
      htmlVisual = `P = ${S} / [ 1 + (${i.toFixed(6)} × ${t.toFixed(4)}) ]`;
      break;
    case "is":
      resultadoFinal = ((S / P - 1) / t) * 100;
      etiqueta = "Tasa (i)";
      esPorcentaje = true;
      htmlVisual = `i = [ (${S} / ${P} - 1) / ${t.toFixed(4)} ] × 100`;
      break;
    case "ts":
      resultadoFinal = (S / P - 1) / i;
      etiqueta = "Tiempo (t)";
      htmlVisual = `t = (${S} / ${P} - 1) / ${i.toFixed(6)}`;
      break;
    case "D":
      resultadoFinal = S * d * t;
      etiqueta = "Descuento (D)";
      htmlVisual = `D = ${S} × ${d.toFixed(6)} × ${t.toFixed(4)}`;
      break;
    case "Pd":
      resultadoFinal = S - D;
      etiqueta = "Valor Actual (P)";
      htmlVisual = `P = ${S} - ${D}`;
      break;
    case "P_dt":
      resultadoFinal = S * (1 - d * t);
      etiqueta = "Valor Actual (P)";
      htmlVisual = `P = ${S} × [ 1 - (${d.toFixed(6)} × ${t.toFixed(4)}) ]`;
      break;
    case "S_dt":
      resultadoFinal = P / (1 - d * t);
      etiqueta = "Valor Nominal (S)";
      htmlVisual = `S = ${P} / [ 1 - (${d.toFixed(6)} × ${t.toFixed(4)}) ]`;
      break;
    case "d_despeje":
      resultadoFinal = ((1 - P / S) / t) * 100;
      etiqueta = "Tasa Desct. (d)";
      esPorcentaje = true;
      htmlVisual = `d = [ (1 - ${P}/${S}) / ${t.toFixed(4)} ] × 100`;
      break;
    case "t_despeje":
      resultadoFinal = (1 - P / S) / d;
      etiqueta = "Tiempo (t)";
      htmlVisual = `t = (1 - ${P}/${S}) / ${d.toFixed(6)}`;
      break;
    case "d_equiv":
      resultadoFinal = (i / (1 + i * t)) * 100;
      etiqueta = "Tasa Eq. (d)";
      esPorcentaje = true;
      htmlVisual = `d = [ ${i.toFixed(6)} / (1 + ${i.toFixed(6)} × ${t.toFixed(4)}) ] × 100`;
      break;
    case "i_equiv":
      resultadoFinal = (d / (1 - d * t)) * 100;
      etiqueta = "Tasa Eq. (i)";
      esPorcentaje = true;
      htmlVisual = `i = [ ${d.toFixed(6)} / (1 - ${d.toFixed(6)} × ${t.toFixed(4)}) ] × 100`;
      break;
  }

  if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
    res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">Revise los datos.</div>`;
  } else {
    let minDec = esPorcentaje ? 6 : 2;
    let maxDec = esPorcentaje ? 6 : 4;
    const pref =
      esPorcentaje || key === "t" || key === "ts" || key === "t_despeje"
        ? ""
        : "$";
    res.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2 shadow-sm fade-in"><span class="d-block small text-muted text-uppercase fw-bold">${etiqueta}</span><span class="fs-3 fw-bold text-dark">${pref}${resultadoFinal.toLocaleString("en-US", { minimumFractionDigits: minDec, maximumFractionDigits: maxDec })}${esPorcentaje ? "%" : ""}</span>${generarCajaFormula(htmlVisual)}</div>`;
  }
}

function toggleModoTiempoComp() {
  const modoRadio = document.querySelector('input[name="modoTiempo"]:checked');
  if (!modoRadio) return;
  const modo = modoRadio.value;
  document.getElementById("ct-fechas").classList.add("d-none");
  document.getElementById("ct-anios").classList.add("d-none");
  document.getElementById("ct-am").classList.add("d-none");

  if (modo === "fechas")
    document.getElementById("ct-fechas").classList.remove("d-none");
  if (modo === "anios")
    document.getElementById("ct-anios").classList.remove("d-none");
  if (modo === "am")
    document.getElementById("ct-am").classList.remove("d-none");
  actualizarCompuestoEnVivo();
}

function actualizarCompuestoEnVivo() {
  const m = parseFloat(document.getElementById("val-m")?.value) || 1;
  const jInput = document.getElementById("val-j");
  let j_dec = 0;
  if (jInput) {
    let j_val = parseFloat(jInput.value) || 0;
    j_dec = j_val / 100;
    document.getElementById("dec-j").value = j_dec.toFixed(6);
    let i_calc = j_dec / m;
    document.getElementById("calc-i").value = (i_calc * 100).toFixed(6) + "%";
    document.getElementById("dec-i").value = i_calc.toFixed(6);
  }

  let n = 0;
  let t = 0;
  const modoRadio = document.querySelector(`input[name="modoTiempo"]:checked`);
  if (modoRadio) {
    const modo = modoRadio.value;
    if (modo === "fechas") {
      const f1 = new Date(document.getElementById("t-f1").value);
      const f2 = new Date(document.getElementById("t-f2").value);
      if (!isNaN(f1) && !isNaN(f2) && f2 > f1) {
        let y = f2.getFullYear() - f1.getFullYear();
        let m_diff = f2.getMonth() - f1.getMonth();
        let d_diff = f2.getDate() - f1.getDate();
        if (d_diff < 0) {
          m_diff--;
          d_diff += 30;
        }
        if (m_diff < 0) {
          y--;
          m_diff += 12;
        }
        t = y + m_diff / 12 + d_diff / 360;
        n = t * m;
      }
    } else if (modo === "anios") {
      t = parseFloat(document.getElementById("t-a1").value) || 0;
      n = t * m;
    } else if (modo === "am") {
      let a = parseFloat(document.getElementById("t-a2").value) || 0;
      let mes = parseFloat(document.getElementById("t-m2").value) || 0;
      t = a + mes / 12;
      n = a * m + mes * (m / 12);
    }

    let hiddenT = document.getElementById("hidden-t-t");
    if (!hiddenT) {
      hiddenT = document.createElement("input");
      hiddenT.type = "hidden";
      hiddenT.id = "hidden-t-t";
      document.getElementById("sub-formulario").appendChild(hiddenT);
    }
    hiddenT.value = t;

    const resN = document.getElementById("val-n");
    if (resN) {
      let modoFrac = document.querySelector(
        'input[name="metodoFrac"]:checked',
      )?.value;
      if (modoFrac === "practico") {
        let n_entero = Math.floor(n);
        resN.value = n > 0 ? `${n_entero} periodos enteros` : "";
        let n_frac = n - n_entero;
        let meses_base = 12 / m;
        document.getElementById("comp-frac-i").value =
          document.getElementById("dec-i").value;
        document.getElementById("comp-frac-base").value = meses_base;
        document.getElementById("comp-frac-meses").value =
          Math.round(n_frac * meses_base * 100) / 100;
      } else {
        resN.value = n > 0 ? `${n.toFixed(4)} periodos` : "";
      }
    }
  }
}

function procesarCalculoCompuesto(key) {
  const res = document.getElementById("resultado");
  const P = parseFloat(document.getElementById("val-P")?.value) || 0;
  const S = parseFloat(document.getElementById("val-S")?.value) || 0;
  const m = parseFloat(document.getElementById("val-m")?.value) || 1;
  const m_prima =
    parseFloat(document.getElementById("val-m_prima")?.value) || 1;
  let j_dec = (parseFloat(document.getElementById("val-j")?.value) || 0) / 100;
  let i_manual =
    (parseFloat(document.getElementById("val-i-manual")?.value) || 0) / 100;
  let i = i_manual > 0 ? i_manual : j_dec / m;

  let n = 0;
  let t_anios = 0;
  const nStr = document.getElementById("val-n")?.value || "";
  if (nStr.includes("enteros")) {
    let n_ent = parseFloat(nStr.split(" ")[0]) || 0;
    let m_rest =
      parseFloat(document.getElementById("comp-frac-meses").value) || 0;
    let m_base =
      parseFloat(document.getElementById("comp-frac-base").value) || 1;
    n = n_ent + m_rest / m_base;
  } else {
    n =
      parseFloat(nStr.split(" ")[0]) ||
      parseFloat(document.getElementById("val-n")?.value) ||
      0;
  }

  t_anios = parseFloat(document.getElementById("hidden-t-t")?.value) || n / m;

  let resultadoFinal = 0;
  let etiqueta = "";
  let esPorcentaje = false;
  let htmlVisual = "";

  switch (key) {
    case "S_comp":
      resultadoFinal = P * Math.pow(1 + i, n);
      etiqueta = "Monto Compuesto (S)";
      htmlVisual = `S = ${P} × (1 + ${i.toFixed(6)})<sup>${n.toFixed(4)}</sup>`;
      break;
    case "P_comp":
      resultadoFinal = S * Math.pow(1 + i, -n);
      etiqueta = "Valor Actual (P)";
      htmlVisual = `P = ${S} × (1 + ${i.toFixed(6)})<sup>-${n.toFixed(4)}</sup>`;
      break;
    case "n_comp":
      resultadoFinal = Math.log(S / P) / Math.log(1 + i);
      etiqueta = "Número de Periodos (n)";
      htmlVisual = `n = ln(${S} / ${P}) / ln(1 + ${i.toFixed(6)})`;
      break;
    case "i_comp":
      resultadoFinal = (Math.pow(S / P, 1 / n) - 1) * 100;
      etiqueta = "Tasa Efectiva por Periodo (i)";
      esPorcentaje = true;
      htmlVisual = `i = [ (${S} / ${P})<sup>1 / ${n.toFixed(4)}</sup> - 1 ] × 100`;
      break;
    case "j_m":
      resultadoFinal =
        m * (Math.pow(1 + j_dec / m_prima, m_prima / m) - 1) * 100;
      etiqueta = "Tasa Nominal Eq. (j)";
      esPorcentaje = true;
      htmlVisual = `j = ${m} × [ (1 + ${j_dec.toFixed(6)} / ${m_prima})<sup>${m_prima} / ${m}</sup> - 1 ] × 100`;
      break;
    case "i_nominal":
      resultadoFinal =
        ((Math.pow(1 + j_dec / m, t_anios * m) - 1) / t_anios) * 100;
      etiqueta = "Tasa Efectiva Anual (i)";
      esPorcentaje = true;
      htmlVisual = `i = [ (1 + ${j_dec.toFixed(6)}/${m})<sup>${t_anios.toFixed(4)} × ${m}</sup> - 1 ] / ${t_anios.toFixed(4)}`;
      break;
    case "j_desde_i":
      resultadoFinal =
        m * (Math.pow(1 + i_manual * t_anios, 1 / (t_anios * m)) - 1) * 100;
      etiqueta = "Nominal desde Efectiva (j)";
      esPorcentaje = true;
      htmlVisual = `j = ${m} × [ (1 + ${i_manual.toFixed(6)} × ${t_anios.toFixed(4)})<sup>1 / (${t_anios.toFixed(4)} × ${m})</sup> - 1 ]`;
      break;

    case "S_frac":
    case "P_frac":
      let modoFrac =
        document.querySelector('input[name="metodoFrac"]:checked')?.value ||
        "exacto";
      if (modoFrac === "exacto") {
        resultadoFinal =
          key === "S_frac" ? P * Math.pow(1 + i, n) : S * Math.pow(1 + i, -n);
        etiqueta =
          key === "S_frac"
            ? "Monto Frac. (Exacto)"
            : "Valor Actual Frac. (Exacto)";
        cacheFraccionario.exacto = resultadoFinal;
        htmlVisual =
          key === "S_frac"
            ? `S = ${P} × (1 + ${i.toFixed(6)})<sup>${n.toFixed(4)}</sup>`
            : `P = ${S} × (1 + ${i.toFixed(6)})<sup>-${n.toFixed(4)}</sup>`;
      } else {
        let n_ent = Math.floor(n);
        let m_rest =
          parseFloat(document.getElementById("comp-frac-meses").value) || 0;
        let m_base =
          parseFloat(document.getElementById("comp-frac-base").value) || 1;
        let factorSimple = 1 + i * (m_rest / m_base);
        resultadoFinal =
          key === "S_frac"
            ? P * Math.pow(1 + i, n_ent) * factorSimple
            : S * Math.pow(1 + i, -n_ent) * factorSimple;
        etiqueta =
          key === "S_frac"
            ? "Monto Frac. (Práctico)"
            : "Valor Actual Frac. (Práctico)";
        cacheFraccionario.practico = resultadoFinal;
        htmlVisual =
          key === "S_frac"
            ? `S = [ ${P} × (1 + ${i.toFixed(6)})<sup>${n_ent}</sup> ] × [ 1 + (${i.toFixed(6)} × (${m_rest}/${m_base})) ]`
            : `P = [ ${S} × (1 + ${i.toFixed(6)})<sup>-${n_ent}</sup> ] × [ 1 + (${i.toFixed(6)} × (${m_rest}/${m_base})) ]`;
      }

      if (
        cacheFraccionario.exacto !== null &&
        cacheFraccionario.practico !== null
      ) {
        res.innerHTML = `<div class="alert alert-success mt-3 shadow-sm text-start border-success border-2 fade-in"><h5 class="fw-bold border-bottom pb-2"><i class="bi bi-layout-split"></i> Comparación de Métodos</h5><div class="row g-2"><div class="col-md-6"><div class="p-3 bg-white border border-success rounded"><strong class="text-success d-block mb-1">MÉTODO EXACTO</strong><span class="fs-5 fw-bold text-dark">$${cacheFraccionario.exacto.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div></div><div class="col-md-6"><div class="p-3 bg-white border border-info rounded"><strong class="text-info d-block mb-1">MÉTODO PRÁCTICO</strong><span class="fs-5 fw-bold text-dark">$${cacheFraccionario.practico.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div></div></div></div>`;
        return;
      }
      break;
  }

  if (isNaN(resultadoFinal) || !isFinite(resultadoFinal)) {
    res.innerHTML = `<div class="alert alert-danger mt-3 fw-bold">Por favor, revise los datos ingresados.</div>`;
  } else {
    let minDec = esPorcentaje ? 6 : 2;
    let maxDec = esPorcentaje ? 6 : 4;
    const suf = esPorcentaje ? "%" : "";
    const pref = esPorcentaje || key === "n_comp" ? "" : "$";
    res.innerHTML = `<div class="alert alert-success mt-3 shadow-sm text-center border-success border-2 fade-in"><span class="d-block small text-muted text-uppercase fw-bold">${etiqueta}</span><span class="fs-3 fw-bold text-dark">${pref}${resultadoFinal.toLocaleString("en-US", { minimumFractionDigits: minDec, maximumFractionDigits: maxDec })}${suf}</span>${generarCajaFormula(htmlVisual)}</div>`;
  }
}

// ==========================================
// MÓDULO PAGOS PARCIALES
// ==========================================
function generarCamposPagos() {
  const c = parseInt(document.getElementById("cantidad-pagos").value);
  const cont = document.getElementById("contenedor-pagos-dinamicos");
  let h = "";
  for (let k = 1; k <= c; k++) {
    h += `<div class="row g-2 mb-2 p-2 bg-white rounded border border-start border-info border-3"><div class="col-12 fw-bold small text-info">Pago ${k}</div><div class="col-6"><input type="number" id="monto-p-${k}" class="form-control form-control-sm" placeholder="Monto $"></div><div class="col-6"><input type="number" id="t-p-${k}" class="form-control form-control-sm" placeholder="Tiempo"></div></div>`;
  }
  cont.innerHTML = h;
}

function procesarReglaComercial() {
  const r = document.getElementById("resultado");
  const u = document.getElementById("unidad-pagos").value;
  const i = (parseFloat(document.getElementById("i-pagos").value) || 0) / 100;
  const tF = parseFloat(document.getElementById("t-focal").value) || 0;
  const mD = parseFloat(document.getElementById("monto-deuda").value) || 0;
  const tD = parseFloat(document.getElementById("t-deuda").value) || 0;
  const tX = parseFloat(document.getElementById("t-x").value) || 0;

  const calcularDesglose = (monto, tiempo) => {
    let dF = tF - tiempo;
    let divisor = u === "meses" ? 12 : u === "dias" ? 360 : 1;
    let t_anios = dF / divisor;
    let valor =
      dF >= 0 ? monto * (1 + i * t_anios) : monto / (1 + i * Math.abs(t_anios));
    let formula =
      dF >= 0
        ? `${monto.toLocaleString("en-US")} × [ 1 + (${i.toFixed(6)} × ${t_anios.toFixed(4)}) ]`
        : `${monto.toLocaleString("en-US")} / [ 1 + (${i.toFixed(6)} × ${Math.abs(t_anios).toFixed(4)}) ]`;
    return { valor, formula, t_anios };
  };

  let deudaObj = calcularDesglose(mD, tD);
  let desgloseHtml = `<div class="text-start w-100" style="white-space: normal;">`;
  desgloseHtml += `<h6 class="fw-bold mt-2 border-bottom pb-1 text-danger">1. Deuda llevada a Fecha Focal (t = ${tF})</h6>`;
  desgloseHtml += `<p class="small mb-3 font-monospace">Deuda Focal = ${deudaObj.formula} = <strong>$${deudaObj.valor.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;

  let pE = 0;
  let pagosArr = [];
  desgloseHtml += `<h6 class="fw-bold mt-3 border-bottom pb-1 text-info">2. Pagos llevados a Fecha Focal (t = ${tF})</h6>`;
  let numPagos = parseInt(document.getElementById("cantidad-pagos").value) || 0;

  if (numPagos === 0)
    desgloseHtml += `<p class="small text-muted font-monospace">No hay pagos parciales registrados.</p>`;

  for (let k = 1; k <= numPagos; k++) {
    let pMonto = parseFloat(document.getElementById(`monto-p-${k}`).value) || 0;
    let pTiempo = parseFloat(document.getElementById(`t-p-${k}`).value) || 0;
    let pagoObj = calcularDesglose(pMonto, pTiempo);
    pE += pagoObj.valor;
    pagosArr.push({ k: k, monto: pMonto, t: pTiempo });
    desgloseHtml += `<p class="small mb-1 font-monospace">Pago ${k} Focal = ${pagoObj.formula} = <strong>$${pagoObj.valor.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;
  }

  if (numPagos > 0) {
    desgloseHtml += `<p class="small mt-2 font-monospace text-primary bg-light p-1 border rounded">∑ Pagos en Focal = <strong>$${pE.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;
  }

  let factorXObj = calcularDesglose(1, tX);
  const X = (deudaObj.valor - pE) / factorXObj.valor;

  desgloseHtml += `<h6 class="fw-bold mt-3 border-bottom pb-1 text-success">3. Ecuación de Valor (Despejando X en t = ${tX})</h6>`;
  desgloseHtml += `<p class="small mb-1 font-monospace">Factor del tiempo de X = ${factorXObj.formula} = <strong>${factorXObj.valor.toFixed(6)}</strong></p>`;
  desgloseHtml += `<p class="small mb-1 font-monospace">X = (Deuda Focal - ∑ Pagos Focal) / FactorX</p>`;
  desgloseHtml += `<p class="small mb-1 font-monospace">X = (${deudaObj.valor.toLocaleString("en-US", { minimumFractionDigits: 2 })} - ${pE.toLocaleString("en-US", { minimumFractionDigits: 2 })}) / ${factorXObj.valor.toFixed(6)}</p>`;
  desgloseHtml += `</div>`;

  // Generar línea de tiempo
  let datosLinea = {
    u: u,
    deuda: { monto: mD, t: tD },
    pagos: pagosArr,
    focal: { t: tF, esIncognita: tF === tX }, // Si la focal es igual al tiempo X, resaltarla como incógnita
  };

  r.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2 shadow-sm fade-in"><span class="text-uppercase small fw-bold text-muted">El valor del pago X es:</span><h3 class="mb-0 fw-bold text-dark">$${X.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>${generarCajaFormula(desgloseHtml)}${generarLineaTiempo(datosLinea)}</div>`;
}
function procesarReglaAmericana() {
  const r = document.getElementById("resultado");
  const u = document.getElementById("unidad-pagos").value;
  const i = (parseFloat(document.getElementById("i-pagos").value) || 0) / 100;
  let s = parseFloat(document.getElementById("monto-deuda").value) || 0;
  const mD_inicial = s; 
  let t_ini = parseFloat(document.getElementById("t-deuda").value) || 0;
  const tD_inicial = t_ini;
  const tF = parseFloat(document.getElementById("t-x").value) || 0;
  let divisor = u === "meses" ? 12 : u === "dias" ? 360 : 1;

  let p = [];
  for (
    let k = 1;
    k <= (parseInt(document.getElementById("cantidad-pagos").value) || 0);
    k++
  ) {
    p.push({
      k: k,
      monto: parseFloat(document.getElementById(`monto-p-${k}`).value) || 0,
      t: parseFloat(document.getElementById(`t-p-${k}`).value) || 0,
    });
  }

  let desgloseHtml = `<div class="text-start w-100" style="white-space: normal;">`;
  let paso = 1;
  let interesAcumulado = 0;
  let pagosAcumulados = 0;
  let t_last = t_ini;

  p.sort((a, b) => a.t - b.t).forEach((x) => {
    if (x.t <= t_ini || x.t >= tF) return;

    let dF = x.t - t_last;
    let t_anios = dF / divisor;
    let interesPeriodo = s * i * t_anios;
    interesAcumulado += interesPeriodo;
    pagosAcumulados += x.monto;

    desgloseHtml += `<h6 class="fw-bold mt-3 border-bottom pb-1 text-primary">Paso ${paso}: Análisis en el Pago ${x.k} (t = ${x.t})</h6>`;
    desgloseHtml += `<p class="small mb-1 font-monospace text-muted">Tiempo transcurrido: ${dF} ${u} -> ${t_anios.toFixed(4)} años</p>`;
    desgloseHtml += `<p class="small mb-1 font-monospace">1) Interés generado = <strong>$${interesPeriodo.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;

    if (pagosAcumulados >= interesAcumulado) {
      let amortizacion = pagosAcumulados - interesAcumulado;
      let nuevoSaldo = s - amortizacion;
      desgloseHtml += `<p class="small mb-2 font-monospace text-success">Amortización a capital = <strong>$${amortizacion.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;
      desgloseHtml += `<p class="small mb-2 font-monospace text-danger fw-bold">Saldo Insoluto = <strong>$${nuevoSaldo.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;
      s = nuevoSaldo;
      interesAcumulado = 0;
      pagosAcumulados = 0;
    } else {
      desgloseHtml += `<p class="small mb-2 font-monospace text-warning">Los pagos (${pagosAcumulados.toLocaleString("en-US", { minimumFractionDigits: 2 })}) NO cubren el interés (${interesAcumulado.toLocaleString("en-US", { minimumFractionDigits: 2 })}). Saldo se mantiene en: <strong>$${s.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p>`;
    }
    t_last = x.t;
    paso++;
  });

  let dF_final = tF - t_last;
  let t_anios_final = dF_final / divisor;
  let interesFinalPeriodo = s * i * t_anios_final;
  interesAcumulado += interesFinalPeriodo;
  let final = s + interesAcumulado - pagosAcumulados;

  desgloseHtml += `<h6 class="fw-bold mt-3 border-bottom pb-1 text-success">Paso Final: Liquidación (t = ${tF})</h6>`;
  desgloseHtml += `<p class="small mb-1 font-monospace text-success bg-light p-1 border rounded">Liquidación (X) = <strong>$${final.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></p></div>`;

  let datosLinea = {
    u: u,
    deuda: { monto: mD_inicial, t: tD_inicial },
    pagos: p, 
    focal: { t: tF, esIncognita: true },
  };

  r.innerHTML = `<div class="alert alert-success mt-3 text-center border-success border-2 shadow-sm fade-in">
        <span class="text-uppercase small fw-bold text-muted">El Pago Final a liquidar (X) es:</span>
        <h3 class="mb-0 fw-bold text-dark">$${final.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
        ${generarCajaFormula(desgloseHtml)}
        ${generarLineaTiempo(datosLinea)}
    </div>`;
}
