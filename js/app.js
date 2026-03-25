const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".content-section");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  const targetSection = document.getElementById(sectionId);
  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);

  if (targetSection) {
    targetSection.classList.add("active");
  }

  if (activeLink) {
    activeLink.classList.add("active");
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const sectionId = link.dataset.section;
    showSection(sectionId);

    if (window.innerWidth <= 768) {
      menu.classList.remove("active");
    }
  });
});

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
}

/* =========================
   MÓDULO DE ESTUDIANTES
========================= */

const cedulaInput = document.getElementById("cedula");
const nombreInput = document.getElementById("nombre");
const seccionInput = document.getElementById("seccion-estudiante");
const editIndexInput = document.getElementById("edit-index");

const saveStudentBtn = document.getElementById("save-student-btn");
const updateStudentBtn = document.getElementById("update-student-btn");
const clearStudentBtn = document.getElementById("clear-student-btn");
const importStudentsBtn = document.getElementById("import-students-btn");
const exportStudentsBtn = document.getElementById("export-students-btn");

const studentsTableBody = document.getElementById("students-table-body");
const filterSeccion = document.getElementById("filter-seccion");
const archivoInput = document.getElementById("archivo");

let students = [];

function clearStudentForm() {
  if (cedulaInput) cedulaInput.value = "";
  if (nombreInput) nombreInput.value = "";
  if (seccionInput) seccionInput.value = "";
  if (editIndexInput) editIndexInput.value = "";
}

function normalizeText(text) {
  return text.trim();
}

function updateSectionFilter() {
  if (!filterSeccion) return;

  const currentValue = filterSeccion.value;
  const uniqueSections = [...new Set(students.map((student) => student.seccion))].sort();

  filterSeccion.innerHTML = `<option value="todos">Todas</option>`;

  uniqueSections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section;
    option.textContent = section;
    filterSeccion.appendChild(option);
  });

  if ([...filterSeccion.options].some((opt) => opt.value === currentValue)) {
    filterSeccion.value = currentValue;
  } else {
    filterSeccion.value = "todos";
  }
}

function renderStudents() {
  if (!studentsTableBody) return;

  const selectedSection = filterSeccion ? filterSeccion.value : "todos";

  let filteredStudents = students;

  if (selectedSection !== "todos") {
    filteredStudents = students.filter((student) => student.seccion === selectedSection);
  }

  if (filteredStudents.length === 0) {
    studentsTableBody.innerHTML = `
      <tr>
        <td colspan="4">No hay estudiantes registrados.</td>
      </tr>
    `;
    return;
  }

  studentsTableBody.innerHTML = filteredStudents
    .map((student) => {
      const realIndex = students.findIndex(
        (s) =>
          s.cedula === student.cedula &&
          s.nombre === student.nombre &&
          s.seccion === student.seccion
      );

      return `
        <tr>
          <td>${student.cedula}</td>
          <td>${student.nombre}</td>
          <td>${student.seccion}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="edit-btn" onclick="editStudent(${realIndex})">Editar</button>
              <button type="button" class="delete-btn" onclick="deleteStudent(${realIndex})">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function studentExists(cedula, ignoreIndex = null) {
  return students.some((student, index) => {
    if (ignoreIndex !== null && index === ignoreIndex) return false;
    return student.cedula === cedula;
  });
}

if (saveStudentBtn) {
  saveStudentBtn.addEventListener("click", () => {
    const cedula = normalizeText(cedulaInput.value);
    const nombre = normalizeText(nombreInput.value);
    const seccion = normalizeText(seccionInput.value);

    if (!cedula || !nombre || !seccion) {
      alert("Debes completar cédula, nombre completo y sección.");
      return;
    }

    if (studentExists(cedula)) {
      alert("Ya existe un estudiante con esa cédula.");
      return;
    }

    students.push({ cedula, nombre, seccion });

    updateSectionFilter();
    renderStudents();
    clearStudentForm();
    alert("Estudiante agregado correctamente.");
  });
}

if (updateStudentBtn) {
  updateStudentBtn.addEventListener("click", () => {
    const editIndex = editIndexInput.value;

    if (editIndex === "") {
      alert("Primero selecciona un estudiante para editar.");
      return;
    }

    const cedula = normalizeText(cedulaInput.value);
    const nombre = normalizeText(nombreInput.value);
    const seccion = normalizeText(seccionInput.value);

    if (!cedula || !nombre || !seccion) {
      alert("Debes completar cédula, nombre completo y sección.");
      return;
    }

    if (studentExists(cedula, Number(editIndex))) {
      alert("Ya existe otro estudiante con esa cédula.");
      return;
    }

    students[Number(editIndex)] = { cedula, nombre, seccion };

    updateSectionFilter();
    renderStudents();
    clearStudentForm();
    alert("Estudiante modificado correctamente.");
  });
}

if (clearStudentBtn) {
  clearStudentBtn.addEventListener("click", () => {
    clearStudentForm();
  });
}

window.editStudent = function (index) {
  const student = students[index];
  if (!student) return;

  cedulaInput.value = student.cedula;
  nombreInput.value = student.nombre;
  seccionInput.value = student.seccion;
  editIndexInput.value = index;
};

window.deleteStudent = function (index) {
  if (!students[index]) return;

  const confirmDelete = confirm("¿Deseas eliminar este estudiante?");
  if (!confirmDelete) return;

  students.splice(index, 1);

  updateSectionFilter();
  renderStudents();
  clearStudentForm();
};

if (filterSeccion) {
  filterSeccion.addEventListener("change", renderStudents);
}

if (exportStudentsBtn) {
  exportStudentsBtn.addEventListener("click", () => {
    let filteredStudents = students;
    const selectedSection = filterSeccion ? filterSeccion.value : "todos";

    if (selectedSection !== "todos") {
      filteredStudents = students.filter((student) => student.seccion === selectedSection);
    }

    if (filteredStudents.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    let csvContent = "Cedula,Nombre completo,Seccion\n";

    filteredStudents.forEach((student) => {
      csvContent += `"${student.cedula}","${student.nombre}","${student.seccion}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "estudiantes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

if (importStudentsBtn) {
  importStudentsBtn.addEventListener("click", () => {
    const file = archivoInput.files[0];

    if (!file) {
      alert("Selecciona un archivo CSV para importar.");
      return;
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".csv")) {
      alert("Por ahora la importación funcional está habilitada para archivos CSV.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

      if (lines.length < 2) {
        alert("El archivo no contiene datos suficientes.");
        return;
      }

      const dataLines = lines.slice(1);
      let importedCount = 0;

      dataLines.forEach((line) => {
        const values = line.split(",");

        if (values.length < 3) return;

        const cedula = normalizeText(values[0].replace(/"/g, ""));
        const nombre = normalizeText(values[1].replace(/"/g, ""));
        const seccion = normalizeText(values[2].replace(/"/g, ""));

        if (!cedula || !nombre || !seccion) return;
        if (studentExists(cedula)) return;

        students.push({ cedula, nombre, seccion });
        importedCount++;
      });

      updateSectionFilter();
      renderStudents();
      clearStudentForm();

      alert(`Importación completada. Se agregaron ${importedCount} estudiante(s).`);
    };

    reader.readAsText(file, "UTF-8");
  });
}

updateSectionFilter();
renderStudents();

/* =========================
   MÓDULO DE ASISTENCIA
========================= */

const cargarAsistenciaBtn = document.getElementById("cargar-asistencia-btn");
const guardarAsistenciaBtn = document.getElementById("guardar-asistencia-btn");
const limpiarAsistenciaBtn = document.getElementById("limpiar-asistencia-btn");

const asistenciaSeccion = document.getElementById("asistencia-seccion");
const asistenciaAsignatura = document.getElementById("asistencia-asignatura");
const asistenciaHorario = document.getElementById("asistencia-horario");
const asistenciaFecha = document.getElementById("asistencia-fecha");
const attendanceTableBody = document.getElementById("attendance-table-body");

let attendanceRows = [];

function renderAttendanceTable(rows) {
  if (!attendanceTableBody) return;

  if (!rows || rows.length === 0) {
    attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="4">No hay estudiantes para mostrar en esta sección.</td>
      </tr>
    `;
    return;
  }

  attendanceTableBody.innerHTML = rows
    .map(
      (student, index) => `
        <tr>
          <td>${student.cedula}</td>
          <td>${student.nombre}</td>
          <td>${student.seccion}</td>
          <td>
            <select onchange="updateAttendanceStatus(${index}, this.value)">
              <option value="Presente" ${student.estado === "Presente" ? "selected" : ""}>Presente</option>
              <option value="Ausente" ${student.estado === "Ausente" ? "selected" : ""}>Ausente</option>
              <option value="Llegada tardía" ${student.estado === "Llegada tardía" ? "selected" : ""}>Llegada tardía</option>
              <option value="Justificado" ${student.estado === "Justificado" ? "selected" : ""}>Justificado</option>
            </select>
          </td>
        </tr>
      `
    )
    .join("");
}

window.updateAttendanceStatus = function(index, value) {
  if (!attendanceRows[index]) return;
  attendanceRows[index].estado = value;
};

if (cargarAsistenciaBtn) {
  cargarAsistenciaBtn.addEventListener("click", () => {
    const seccion = asistenciaSeccion.value.trim();
    const asignatura = asistenciaAsignatura.value.trim();
    const horario = asistenciaHorario.value.trim();
    const fecha = asistenciaFecha.value.trim();

    if (!seccion || !asignatura || !horario || !fecha) {
      alert("Debes seleccionar sección, asignatura, horario y fecha.");
      return;
    }

    if (typeof students === "undefined") {
      alert("El módulo de estudiantes no está disponible.");
      return;
    }

    const studentsBySection = students
      .filter((student) => student.seccion === seccion)
      .map((student) => ({
        ...student,
        estado: "Presente"
      }));

    attendanceRows = studentsBySection;
    renderAttendanceTable(attendanceRows);
  });
}

if (guardarAsistenciaBtn) {
  guardarAsistenciaBtn.addEventListener("click", () => {
    const seccion = asistenciaSeccion.value.trim();
    const asignatura = asistenciaAsignatura.value.trim();
    const horario = asistenciaHorario.value.trim();
    const fecha = asistenciaFecha.value.trim();

    if (!seccion || !asignatura || !horario || !fecha) {
      alert("Completa primero los datos de la lección.");
      return;
    }

    if (attendanceRows.length === 0) {
      alert("No hay asistencia cargada para guardar.");
      return;
    }

    console.log("Asistencia guardada:", {
      seccion,
      asignatura,
      horario,
      fecha,
      estudiantes: attendanceRows
    });

    alert("Asistencia registrada correctamente.");
  });
}

if (limpiarAsistenciaBtn) {
  limpiarAsistenciaBtn.addEventListener("click", () => {
    if (asistenciaSeccion) asistenciaSeccion.value = "";
    if (asistenciaAsignatura) asistenciaAsignatura.value = "";
    if (asistenciaHorario) asistenciaHorario.value = "";
    if (asistenciaFecha) asistenciaFecha.value = "";

    attendanceRows = [];
    renderAttendanceTable([]);
  });
}
/* =========================
   MÓDULO DE REPORTES
========================= */

const generarReporteBtn = document.getElementById("generar-reporte-btn");
const exportarReporteBtn = document.getElementById("exportar-reporte-btn");

const tipoReporte = document.getElementById("tipo-reporte");
const reporteEstudiante = document.getElementById("reporte-estudiante");
const reporteSeccion = document.getElementById("reporte-seccion");
const reporteAsignatura = document.getElementById("reporte-asignatura");
const fechaInicial = document.getElementById("fecha-inicial");
const fechaFinal = document.getElementById("fecha-final");

const totalPresentes = document.getElementById("total-presentes");
const totalAusentes = document.getElementById("total-ausentes");
const totalTardias = document.getElementById("total-tardias");
const totalJustificados = document.getElementById("total-justificados");
const reportTableBody = document.getElementById("report-table-body");

/* Datos de ejemplo */
let attendanceReports = [
  {
    fecha: "2026-03-20",
    estudiante: "Juan Pérez López",
    cedula: "101010101",
    seccion: "10-2",
    asignatura: "Español",
    horario: "07:00 - 07:40",
    estado: "Presente"
  },
  {
    fecha: "2026-03-20",
    estudiante: "María Gómez Ruiz",
    cedula: "202020202",
    seccion: "10-2",
    asignatura: "Español",
    horario: "07:00 - 07:40",
    estado: "Ausente"
  },
  {
    fecha: "2026-03-21",
    estudiante: "Carlos Sánchez Mora",
    cedula: "303030303",
    seccion: "8-1",
    asignatura: "Matemática",
    horario: "08:20 - 09:00",
    estado: "Llegada tardía"
  },
  {
    fecha: "2026-03-21",
    estudiante: "Ana López Vega",
    cedula: "404040404",
    seccion: "7-1",
    asignatura: "Ciencias",
    horario: "09:20 - 10:00",
    estado: "Justificado"
  }
];

function renderReportSummary(data) {
  const presentes = data.filter((item) => item.estado === "Presente").length;
  const ausentes = data.filter((item) => item.estado === "Ausente").length;
  const tardias = data.filter((item) => item.estado === "Llegada tardía").length;
  const justificados = data.filter((item) => item.estado === "Justificado").length;

  if (totalPresentes) totalPresentes.textContent = presentes;
  if (totalAusentes) totalAusentes.textContent = ausentes;
  if (totalTardias) totalTardias.textContent = tardias;
  if (totalJustificados) totalJustificados.textContent = justificados;
}

function renderReportTable(data) {
  if (!reportTableBody) return;

  if (!data.length) {
    reportTableBody.innerHTML = `
      <tr>
        <td colspan="6">No hay registros para mostrar con los filtros seleccionados.</td>
      </tr>
    `;
    return;
  }

  reportTableBody.innerHTML = data
    .map(
      (item) => `
        <tr>
          <td>${item.fecha}</td>
          <td>${item.estudiante}</td>
          <td>${item.seccion}</td>
          <td>${item.asignatura}</td>
          <td>${item.horario}</td>
          <td>${item.estado}</td>
        </tr>
      `
    )
    .join("");
}

function filterReports() {
  let filtered = [...attendanceReports];

  const tipo = tipoReporte ? tipoReporte.value : "general";
  const estudiante = reporteEstudiante ? reporteEstudiante.value.trim().toLowerCase() : "";
  const seccion = reporteSeccion ? reporteSeccion.value : "";
  const asignatura = reporteAsignatura ? reporteAsignatura.value : "";
  const inicio = fechaInicial ? fechaInicial.value : "";
  const fin = fechaFinal ? fechaFinal.value : "";

  if (estudiante) {
    filtered = filtered.filter(
      (item) =>
        item.estudiante.toLowerCase().includes(estudiante) ||
        item.cedula.includes(estudiante)
    );
  }

  if (seccion) {
    filtered = filtered.filter((item) => item.seccion === seccion);
  }

  if (asignatura) {
    filtered = filtered.filter((item) => item.asignatura === asignatura);
  }

  if (inicio) {
    filtered = filtered.filter((item) => item.fecha >= inicio);
  }

  if (fin) {
    filtered = filtered.filter((item) => item.fecha <= fin);
  }

  if (tipo === "estudiante" && !estudiante) {
    filtered = [];
  }

  if (tipo === "seccion" && !seccion) {
    filtered = [];
  }

  if (tipo === "asignatura" && !asignatura) {
    filtered = [];
  }

  if (tipo === "ausentismo") {
    filtered = filtered.filter(
      (item) => item.estado === "Ausente" || item.estado === "Llegada tardía"
    );
  }

  return filtered;
}

if (generarReporteBtn) {
  generarReporteBtn.addEventListener("click", () => {
    const filtered = filterReports();
    renderReportSummary(filtered);
    renderReportTable(filtered);
  });
}

if (exportarReporteBtn) {
  exportarReporteBtn.addEventListener("click", () => {
    const filtered = filterReports();

    if (!filtered.length) {
      alert("No hay datos para exportar.");
      return;
    }

    let csvContent = "Fecha,Estudiante,Seccion,Asignatura,Horario,Estado\n";

    filtered.forEach((item) => {
      csvContent += `"${item.fecha}","${item.estudiante}","${item.seccion}","${item.asignatura}","${item.horario}","${item.estado}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reporte_asistencia.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}