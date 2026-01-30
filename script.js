const API_URL = 'https://api.escuelajs.co/api/v1/products';
let allData = [];
let filtered = [];
let page = 1;
let pageSize = 10;
let sortField = null; // 'price' or 'title'
let sortDir = 1; // 1 asc, -1 desc

async function getAll(){
  try{
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error('Network error');
    allData = await res.json();
  }catch(e){
    console.warn('Fetch failed, using empty list', e);
    allData = [];
  }
  applyFiltersAndRender();
}

function applyFiltersAndRender(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  filtered = allData.filter(p => p.title && p.title.toLowerCase().includes(q));
  if(sortField){
    filtered.sort((a,b)=>{
      let A = a[sortField];
      let B = b[sortField];
      if(sortField === 'title'){
        A = (A||'').toLowerCase();
        B = (B||'').toLowerCase();
      }
      if(A < B) return -1 * sortDir;
      if(A > B) return 1 * sortDir;
      return 0;
    });
  }
  renderTable();
  renderPager();
}

function renderTable(){
  const tbody = document.querySelector('#productTable tbody');
  tbody.innerHTML = '';
  const start = (page-1)*pageSize;
  const pageItems = filtered.slice(start, start+pageSize);
  for(const p of pageItems){
    const tr = document.createElement('tr');
    const imgTd = document.createElement('td');
    const thumb = document.createElement('div');
    thumb.className = 'img-thumb';
    const img = document.createElement('img');
    img.src = (p.images && p.images[0]) || 'https://placehold.co/160x120?text=No+Image';
    img.alt = p.title || '';
    img.loading = 'lazy';
    img.className = 'd-block';
    img.onerror = ()=>{ img.onerror = null; img.src = 'https://placehold.co/160x120?text=No+Image'; };
    thumb.appendChild(img);
    imgTd.appendChild(thumb);

    const titleTd = document.createElement('td');
    titleTd.textContent = p.title || '';

    const catTd = document.createElement('td');
    catTd.textContent = p.category && p.category.name ? p.category.name : '';

    const descTd = document.createElement('td');
    descTd.textContent = p.description || '';

    const priceTd = document.createElement('td');
    priceTd.textContent = p.price != null ? ('$'+p.price) : '';

    const createdTd = document.createElement('td');
    createdTd.textContent = p.creationAt ? new Date(p.creationAt).toLocaleString() : '';

    tr.appendChild(imgTd);
    tr.appendChild(titleTd);
    tr.appendChild(catTd);
    tr.appendChild(descTd);
    tr.appendChild(priceTd);
    tr.appendChild(createdTd);

    tbody.appendChild(tr);
  }
}

function renderPager(){
  const pager = document.getElementById('pager');
  pager.innerHTML = '';
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // update summary element
  const summary = document.getElementById('summary');
  if(summary) summary.textContent = `Tổng: ${total} — Trang ${page}/${pages}`;

  // build Bootstrap pagination
  const ul = document.createElement('ul');
  ul.className = 'pagination mb-0';

  const makePageItem = (label, idx, disabled=false, active=false)=>{
    const li = document.createElement('li');
    li.className = 'page-item' + (disabled? ' disabled':'') + (active? ' active':'');
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = label;
    a.onclick = (e)=>{ e.preventDefault(); if(disabled) return; page = idx; applyFiltersAndRender(); };
    li.appendChild(a);
    return li;
  };

  ul.appendChild(makePageItem('‹', Math.max(1, page-1), page<=1));

  const maxButtons = 7;
  let startPage = Math.max(1, page - Math.floor(maxButtons/2));
  let endPage = Math.min(pages, startPage + maxButtons -1);
  if(endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons +1);

  for(let i=startPage;i<=endPage;i++){
    ul.appendChild(makePageItem(String(i), i, false, i===page));
  }

  ul.appendChild(makePageItem('›', Math.min(pages, page+1), page>=pages));

  pager.appendChild(ul);
}

function setup(){
  document.getElementById('search').addEventListener('input', ()=>{ page = 1; applyFiltersAndRender(); });
  document.getElementById('pageSize').addEventListener('change', (e)=>{
    pageSize = parseInt(e.target.value,10) || 10; page = 1; applyFiltersAndRender();
  });
  document.getElementById('sortPrice').addEventListener('click', ()=>{
    if(sortField === 'price') sortDir = -sortDir; else { sortField = 'price'; sortDir = 1; }
    applyFiltersAndRender();
  });
  document.getElementById('sortTitle').addEventListener('click', ()=>{
    if(sortField === 'title') sortDir = -sortDir; else { sortField = 'title'; sortDir = 1; }
    applyFiltersAndRender();
  });

  // initial fetch
  getAll();
}

window.addEventListener('DOMContentLoaded', setup);
