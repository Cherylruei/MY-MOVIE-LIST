// 2. 宣告變數
// 找出規律 定義基本連結，因為連結有可能未來會更新，所以我們使用常用變數定義，之後可以從這統一快速修改連結
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POST_URL = BASE_URL + '/posters/'
// 要來做分頁器，先規畫一個頁面要放幾部電影
const MOVIES_PER_PAGE = 12
// 使用const 宣告來裝 movies 的資料, 讓別人無法輕易更改裡面的資料
const movies = []
// 要使用movies.push() 方法把資料放進去 *copied by reference* 按址拷貝，使用push 修改陣列內容屬於"深層修改"，不會觸發const限制
// 如果是 *copied by value* 按值拷貝，像是 movies = response.data.results 的簡單等號賦值來把資料放進變數裡，則沒有辦法成功 
let filteredMovies = []
// 1.先測試API 是否有成功連上。 確認以後宣告變數 

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeChangeSwitch = document.querySelector('#change-mode')
let currentPage = 1


function renderMovieList(data) {
  let dataContent = ''
  if (dataPanel.dataset.mode === 'card-mode') {
    data.forEach((item) => {
      dataContent += `
     <div class="col-sm-3">
      <div class="mb-2">
        <div class="card" style="width: 18rem;">
            <div class="card-body">
              <img
                src="${POST_URL + item.image}"
                class="card-img-top" class="card-img-top" alt="Movie Poster">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <a href="#" class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</a>
              <a href="#" class="btn btn-info btn-add-favorite" data-bs-toggle=""
                data-bs-target="" data-id="${item.id}">+</a>
            </div>
          </div>
        </div>
    </div>
    `
    })
  } else if (dataPanel.dataset.mode === "list-mode") {
    dataContent += `<ul class="list-group col-sm-12 mb-2">`
    data.forEach((item) => {
      dataContent += `
         <li class="list-group-item d-flex justify-content-between">
          <h5 class="card-title">${item.title}</h5>
          <div>
           <a href="#" class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
            data-bs-target="#movie-modal" data-id="${item.id}">More</a>
           <a href="#" class="btn btn-info btn-add-favorite" data-bs-toggle=""
            data-bs-target="" data-id="${item.id}">+</a>
          </div >
         </li>
      `
    })
    dataContent += `</ul>`
  }
  dataPanel.innerHTML = dataContent
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    // console.log(event.target.dataset.id) 檢查取的id 是否正確
    addFavoriteList(Number(event.target.dataset.id))
  }
})



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 頁面出現了重新整理，但是資料重整後不見就消失，無法出現。 故要使用event.Preventdefault()
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  // 拿來存放篩選過後的movie
  // 方法一: 使用for of 迴圈取出每一個movie
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  // 方法二: 使用filter()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  renderPaginator(filteredMovies.length)
  renderMovieList(filteredMovies)
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release Date:" + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POST_URL + data.image}" alt="movie-poster"> class="img-fluid" `
  })
    .catch((error) => {
      console.log(error)
    })
}

function addFavoriteList(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert("The movie is in your favorite movies list already.")
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 要來增加一個function 來把所有的movies 來分頁，讓他分類每一頁切割分配的陣列
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //page 1: 0-11
  //page 2: 12-23
  //page 3: 24-35...
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 現在要來渲染出正確的paginator,需要規劃總共需要幾頁，顯示出正確的分頁數量
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawContent = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawContent += `
   <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `
  }
  paginator.innerHTML = rawContent
}

function changeDisplayMode(diplayMode) {
  // 要來更換 dataPanel 上的 data-mode 轉換模式
  if (dataPanel.dataset.mode === diplayMode) return
  dataPanel.dataset.mode = diplayMode
  renderMovieList(getMoviesByPage(1))
}

// 分頁渲染出來以後要在上面增設addEventListener，我們點擊該頁面的時候才會顯示出相對應的正確頁面
paginator.addEventListener('click', function onPageClicked(event) {
  // 這裡的 "A"，是類似 連結屬性的 <a></a>
  if (event.target.tagName !== "A") return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

modeChangeSwitch.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('#list-mode-button')) {
    changeDisplayMode("list-mode")
  } else if (event.target.matches('#card-mode-button')) {
    changeDisplayMode("card-mode")
  }
})

axios
  .get(INDEX_URL) //修改這裡
  .then((response) => {
    // 方法一: 使用for of 迴圈，取出陣列中的每一部電影資料
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    // console.log(movies)
    // 方法二: 使用展開運算子
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    //新增paginator DOM後，改成每一次顯示電影只改成一次顯是一頁的數量就好(12個)
  })
  .catch((error) => { console.log(error) })