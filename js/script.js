let products = [];

// 商品データ読み込み
fetch('../json/script.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    displayProducts(products);
    setupPriceRange(products); // スライダー初期化
  })
  .catch(error => {
    console.log('商品データの読み込みに失敗しました：', error);
  });

// 商品表示
function displayProducts(items){
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  items.forEach(item => {
    const product = document.createElement('div');
    product.className = 'product';
    product.dataset.category = item.category;
    product.dataset.jender = item.jender;
    product.dataset.price = item.price;
    product.innerHTML = `
      <img src="img/${item.image}" alt="${item.name}"></img>
      <h3>${item.name}</h3>
      <p>価格：&yen;${item.price.toLocaleString()}</p>
      <p>発売日：${item.release_date}</p>
    `;
    list.appendChild(product);
  });
}

// 価格スライダー
function setupPriceRange(products){
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceHTML = `
    <p class="price-text">商品価格</p>
    <div id="price-slider"></div>
    <p id="price-range-display">${minPrice}円～${maxPrice}円以上</p>
  `;
  const search = document.getElementById('search');
  search.insertAdjacentHTML('afterend', priceHTML);

  const slider = document.getElementById('price-slider');

  noUiSlider.create(slider, {
    start: [minPrice, maxPrice],
    connect: true,
    step: 100,
    range: {
      'min': minPrice,
      'max': maxPrice
    },
    tooltips: [true, true],
    format: {
      to: value => Math.round(value),
      from: value => Number(value)
    }
  });

  // スライダーを動かし始めたら価格を表示
  slider.noUiSlider.on('start', function(){
    const tooltips = slider.querySelectorAll('.noUi-tooltip');
    tooltips.forEach(t => t.style.display = 'block');
  });

  // スライダーを離したら価格を非表示
  slider.noUiSlider.on('end', function(){
    const tooltips = slider.querySelectorAll('.noUi-tooltip');
    tooltips.forEach(t => t.style.display = 'none');
  });

  slider.noUiSlider.on('update', function(values){
    const min = parseInt(values[0]);
    const max = parseInt(values[1]);
    document.getElementById('price-range-display').textContent = `${min}円～${max}円以上`;
    filterAll();
  });
}

// フィルタ
function filterAll(){
  const keyword = document.getElementById('search').value.toLowerCase();
  const selectedCategory = document.querySelector('#category-buttons .active').dataset.category;
  const selectedJender = document.querySelector('#jender-buttons .active').dataset.category;

  const slider = document.getElementById('price-slider');
  const [minPrice, maxPrice] = slider.noUiSlider.get().map(v => parseInt(v));

  const filtered = products.filter(product => {
    const inCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const inJender = selectedJender === 'all' || product.jender === selectedJender;
    const inKeyword = product.name.toLowerCase().includes(keyword);
    const inPrice = product.price >= minPrice && product.price <= maxPrice;
    return inCategory && inJender && inKeyword && inPrice;
  });

  displayProducts(filtered);
}

// 検索
document.getElementById('search').addEventListener('input', filterAll);

// カテゴリボタン
document.querySelectorAll('#category-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#category-buttons button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAll();
  });
});

// 性別ボタン
document.querySelectorAll('#jender-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#jender-buttons button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAll();
  });
});
