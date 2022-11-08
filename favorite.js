// 2. 宣告變數
// 找出規律 定義基本連結，因為連結有可能未來會更新，所以我們使用常用變數定義，之後可以從這統一快速修改連結
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POST_URL = BASE_URL + '/posters/'
// 更改從local storage 裡來取出資料，取代axios
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) //收藏清單
// 宣告movies= localStorage裡面取出key值為"favoriteMovies"的item 

const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let dataContent = ''
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
              <a href="#" class="btn btn-danger btn-remove-favorite" data-bs-toggle=""
                data-bs-target="" data-id="${item.id}">X</a>
            </div>
          </div>
        </div>
    </div>
    `
  });

  dataPanel.innerHTML = dataContent
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    // console.log(event.target.dataset.id) 檢查取的id 是否正確
    btnRemoveFavorite(Number(event.target.dataset.id))
  }
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

function btnRemoveFavorite(id) {
  // 因為開頭已經 從local storage 取出favorite movies, 所以不用再取。但是我們要找到需要被刪除影片的索引位置
  // 使用 arr.findIndex()
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // console.log(movieIndex)
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

renderMovieList(movies)