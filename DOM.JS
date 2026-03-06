// ── Selección de elementos ────────────────────────────────────────────────────
const formTarea       = document.getElementById('formTarea');
const inputTitulo     = document.getElementById('inputTitulo');
const selectTag       = document.getElementById('selectTag');
const inputBuscar     = document.getElementById('inputBuscar');
const btnLimpiarBuscar= document.getElementById('btnLimpiarBuscar');
const listaTareas     = document.getElementById('listaTareas');
const emptyState      = document.getElementById('emptyState');
const statTotal       = document.getElementById('statTotal');
const statVisibles    = document.getElementById('statVisibles');
const statFavs        = document.getElementById('statFavs');
const filterBtns      = document.querySelectorAll('.chip[data-filter]');

// ── Estado de la aplicación ───────────────────────────────────────────────────
let filtroActivo = 'all';
let textoBusqueda = '';
let contadorId = 100; // para generar IDs únicos en nuevas tarjetas

// ── 1. Agregar nueva tarea ────────────────────────────────────────────────────
formTarea.addEventListener('submit', (e) => {
  e.preventDefault();

  const titulo = inputTitulo.value.trim();
  if (!titulo) return;

  const tag = selectTag.value;
  const id  = 't' + (++contadorId);

  const li = crearTarjeta(id, tag, titulo, false, false);
  listaTareas.appendChild(li);

  inputTitulo.value = '';
  actualizarVista();
});

// ── Helper: crear elemento de tarjeta ────────────────────────────────────────
function crearTarjeta(id, tag, titulo, done, fav) {
  const li = document.createElement('li');
  li.className = 'card' + (done ? ' is-done' : '');
  li.dataset.id  = id;
  li.dataset.tag = tag;
  li.dataset.fav = fav ? '1' : '0';

  li.innerHTML = `
    <div class="card__head">
      <span class="badge">${tag}</span>
      <div class="actions">
        <button class="icon" type="button" data-action="fav"  aria-label="Marcar favorito">${fav ? '★' : '☆'}</button>
        <button class="icon" type="button" data-action="done" aria-label="Marcar completada">✓</button>
        <button class="icon danger" type="button" data-action="del" aria-label="Eliminar">🗑</button>
      </div>
    </div>
    <p class="card__title">${titulo}</p>
  `;
  return li;
}

// ── 2 / 3 / 4. Delegación de eventos sobre la lista ──────────────────────────
listaTareas.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const card   = btn.closest('.card');
  const action = btn.dataset.action;

  if (action === 'del') {
    // 2. Eliminar tarea
    card.remove();
    actualizarVista();
    return;
  }

  if (action === 'done') {
    // 3. Marcar / desmarcar como completada
    card.classList.toggle('is-done');
    return;
  }

  if (action === 'fav') {
    // 4. Marcar / desmarcar como favorita
    const esFav = card.dataset.fav === '1';
    card.dataset.fav = esFav ? '0' : '1';
    btn.textContent  = esFav ? '☆' : '★';
    actualizarEstadisticas();
  }
});

// ── 5. Filtrar por categoría ──────────────────────────────────────────────────
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    filtroActivo = btn.dataset.filter;
    actualizarVista();
  });
});

// ── 6. Búsqueda en tiempo real ────────────────────────────────────────────────
inputBuscar.addEventListener('input', () => {
  textoBusqueda = inputBuscar.value.trim().toLowerCase();
  actualizarVista();
});

// ── 7. Limpiar búsqueda ───────────────────────────────────────────────────────
btnLimpiarBuscar.addEventListener('click', () => {
  inputBuscar.value = '';
  textoBusqueda = '';
  actualizarVista();
});

// ── 8 / 9. Actualizar vista completa (visibilidad + estadísticas + vacío) ─────
function actualizarVista() {
  const tarjetas = listaTareas.querySelectorAll('.card');
  let visibles = 0;

  tarjetas.forEach((card) => {
    const tag    = card.dataset.tag;
    const esFav  = card.dataset.fav === '1';
    const titulo = card.querySelector('.card__title').textContent.toLowerCase();

    const pasaFiltro =
      filtroActivo === 'all'     ||
      filtroActivo === tag       ||
      (filtroActivo === 'fav' && esFav);

    const pasaBusqueda =
      textoBusqueda === '' || titulo.includes(textoBusqueda);

    const mostrar = pasaFiltro && pasaBusqueda;
    card.classList.toggle('is-hidden', !mostrar);
    if (mostrar) visibles++;
  });

  // Estado vacío
  emptyState.classList.toggle('is-hidden', visibles > 0);

  actualizarEstadisticas(tarjetas, visibles);
}

function actualizarEstadisticas(tarjetas, visibles) {
  // Permite llamarla sin argumentos (solo refrescar favs)
  if (!tarjetas) {
    tarjetas = listaTareas.querySelectorAll('.card');
    visibles = [...tarjetas].filter((c) => !c.classList.contains('is-hidden')).length;
  }

  const total = tarjetas.length;
  const favs  = [...tarjetas].filter((c) => c.dataset.fav === '1').length;

  statTotal.textContent   = total;
  statVisibles.textContent = visibles;
  statFavs.textContent    = favs;
}

// ── Inicializar estadísticas al cargar ────────────────────────────────────────
actualizarVista();