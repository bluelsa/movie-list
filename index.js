const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

const movies = [] //放電影清單中的所有電影
let filterMovies = []

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach (item =>
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card mt-2">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}" >More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
    )
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const totalPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= totalPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

//page -> 該頁電影資料
function getMoviesByPage (page) {
  const data = filterMovies.length ? filterMovies : movies
  //如果有filterMovies的資料就使用filterMovies數據，若沒有則是顯示movies數據
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#modal-title')
  const modalImg = document.querySelector('#modal-img')
  const modalDate = document.querySelector('#modal-date')
  const modalDescription = document.querySelector('#modal-description')

  axios.get(INDEX_URL + id)
  .then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImg.innerHTML = `<img src="${POSTER_URL + data.image}"></img>`
    modalDate.innerText = 'Release Date : ' + data.release_date
    modalDescription.innerText = data.description
  })

}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  //清單不重複
  if (list.some(movie => movie.id === id)) {
    return alert('已在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies' , JSON.stringify(list))
}

dataPanel.addEventListener('click', function panelClick (event){
  let target = event.target
  if (target.matches('.btn-show-movie')) {
  showMovieModal(Number(target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite'))  {
    addToFavorite(Number(target.dataset.id))
  }
})

paginator.addEventListener('click', function onPageClick(event) {
  let target =  event.target
  if(target.tagName !== 'A') return
  const page = Number(target.dataset.page)
renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filterMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filterMovies.length === 0) {
    return alert('No result.')
  } 
renderPaginator(filterMovies.length)
renderMovieList(getMoviesByPage(1))  
})

axios.get(INDEX_URL)
  .then(function (response) {
    movies.push(...response.data.results) //把ajax的資料全部push到movies的陣列，用...的方式，依序列出單純的陣列
    //迴圈作法 for of 迴圈
    //for (const movie of response.data.results) {
    //  movies.push(movie)
    //}
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


