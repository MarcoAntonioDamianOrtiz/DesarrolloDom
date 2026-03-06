'use strict';

// Utilidades
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Referencias DOM
const form = $('#formTarea');
const titulo = $('#inputTitulo');
const tag = $('#selectTag');
const buscar = $('#inputBuscar');
const btnClear = $('#btnLimpiarBuscar');

const lista = $('#listaTareas');
const empty = $('#emptyState');

const statTotal = $('#statTotal');
const statVis = $('#statVisibles');
const statFav = $('#statFavs');

// Estado de filtros
const filterState = {
  q: '',
  tag: 'all'
};

let id = 100;

// Crear tarjeta
const buildCard = ({ id, tag, titulo }) => {

  const li = document.createElement('li');

  li.className = 'card';
  li.dataset.id = id;
  li.dataset.tag = tag;
  li.dataset.fav = '0';

  li.innerHTML = `
        <div class="card__head">
            <span class="badge">${tag}</span>
            <div class="actions">
                <button class="icon" data-action="fav">☆</button>
                <button class="icon" data-action="done">✓</button>
                <button class="icon danger" data-action="del">🗑</button>
            </div>
        </div>
        <p class="card__title"></p>
    `;

  li.querySelector('.card__title').textContent = titulo;

  return li;
};

// Agregar tarea
form.addEventListener('submit', (e) => {

  e.preventDefault();

  const text = titulo.value.trim();
  if (!text) return;

  lista.append(buildCard({
    id: 't' + (++id),
    tag: tag.value,
    titulo: text
  }));

  titulo.value = '';
  applyFilters();
});
// Acciones de tarjeta
const doDelete = (card) => {
  card.remove();
  applyFilters();
};

const doDone = (card) => {
  card.classList.toggle('is-done');
};

const doFav = (card, btn) => {

  const fav = card.dataset.fav === '1';

  card.dataset.fav = fav ? '0' : '1';
  btn.textContent = fav ? '☆' : '★';

  updateStats();
};

// Delegación de eventos
lista.addEventListener('click', (e) => {

  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const card = btn.closest('.card');
  const action = btn.dataset.action;

  if (action === 'del') doDelete(card);
  if (action === 'done') doDone(card);
  if (action === 'fav') doFav(card, btn);
});

// Filtros por categoría
$('.filters').addEventListener('click', (e) => {

  const chip = e.target.closest('.chip');
  if (!chip) return;

  $$('.chip').forEach(c => c.classList.remove('is-active'));

  chip.classList.add('is-active');
  filterState.tag = chip.dataset.filter;

  applyFilters();
});

// Filtro de búsqueda
buscar.addEventListener('input', () => {
  filterState.q = buscar.value.trim().toLowerCase();
  applyFilters();
});

btnClear.addEventListener('click', () => {
  buscar.value = '';
  filterState.q = '';
  applyFilters();
});

// Funciones de filtrado
const matchTag = (card, tag) => {
  if (tag === 'all') return true;
  if (tag === 'fav') return card.dataset.fav === '1';
  return card.dataset.tag === tag;
};

const matchText = (card, q) => {
  if (!q) return true;
  return card.querySelector('.card__title')
    .textContent
    .toLowerCase()
    .includes(q);
};

const applyFilters = () => {

  const cards = $$('.card', lista);
  let visibles = 0;

  cards.forEach(card => {

    const ok =
      matchTag(card, filterState.tag) &&
      matchText(card, filterState.q);

    card.classList.toggle('is-hidden', !ok);

    if (ok) visibles++;
  });

  empty.classList.toggle('is-hidden', visibles > 0);

  updateStats();
};

// Estadísticas
const updateStats = () => {

  const cards = $$('.card', lista);
  const visibles = cards.filter(c => !c.classList.contains('is-hidden')).length;
  const favs = cards.filter(c => c.dataset.fav === '1').length;

  statTotal.textContent = cards.length;
  statVis.textContent = visibles;
  statFav.textContent = favs;
};
applyFilters();
updateStats();