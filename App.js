

let currentPage = 1;
let MOVIE_LIST = [];
// selectors

const movieListContainer = document.getElementById("movie-list");

// Search bar Elements
const searchInputBoxElement = document.getElementById("search-input");
const searchButtonElement = document.getElementById("search-button");

// sorting option button Selectors
const sortByDateButtonElement = document.getElementById("sort-by-date");
const sortByRateButtonElement = document.getElementById("sort-by-rating");

// tab button Selector
const allTabButtonElement = document.getElementById("all-tab");
const favoritesTabButtonElement = document.getElementById("favorites-tab");

// pagination button selector
const prevbuttonElement = document.getElementById("prev-button");
const pageNumberButtonElement = document.getElementById("page-number-button");
const nextButtonElement = document.getElementById("next-button");


// 1. Fetch THE DATA

function remapData(movieList = []) {

    const modifiedList = movieList.map(movieObj => {
        return {
            id: movieObj.id,
            popularity: movieObj.popularity,
            voteAverage: movieObj.vote_average,
            title: movieObj.title,
            posterPath: movieObj.poster_path,
        };

    });
    return modifiedList;
}
async function fetchData(pageNumber, sortingOption) {
    let url = "";
    if (sortingOption) {
        url = ` https://api.themoviedb.org/3/discover/movie?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=${pageNumber}&sort_by=popularity.desc`;
    } else {
        url = ` https://api.themoviedb.org/3/movie/top_rated?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=${pageNumber}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const results = data["results"];
    const modifiedList = remapData(results);
    
    MOVIE_LIST = modifiedList;
    return modifiedList;

}

// Render the data

function randerMovies(movieList = []) {

    console.log(movieList);
    movieList.forEach(movie => {
        const { id } = movie;
        const movieCardHTMLElement = createCardForMovie(movie);

        movieListContainer.append(movieCardHTMLElement);

        // Add Listener for the fav button
        // HERE cardContainerElement is GURANTED INSIDE THE DOM

        // const favElement = document.getElementById(`favorites${id}`);
        const heartElement = document.getElementById(`icon${id}`)

        heartElement.addEventListener("click", (event) => {
            event.stopPropagation();
            const movieIdILike = event.target.id;
            const isFavMovie = heartElement.classList.contains("fa-heart")
            if (isFavMovie) {
                // Make it unFav
                removeMovieFromLocalStorage(movieIdILike);
                heartElement.classList.add("fa-heart-o");
                heartElement.classList.remove("fa-heart");
            } else {
                // Make it Fav
                // set in local storage
                setMoviesToLocalStorage(id)
                heartElement.classList.remove("fa-heart-o");
                heartElement.classList.add("fa-heart");

            }
            console.log("fav element click", movieIdILike)

        });

        // Determine if Each Movie is Fav or Not
        const favMovies = getMoviesToLocalStorage();

        const isFavMovie = favMovies.includes(id);

        if (isFavMovie) {
            heartElement.classList.remove("fa-heart-o");
                heartElement.classList.add("fa-heart");
        }

    });
}




function createCardForMovie(movie) {
    const { id, popularity, posterPath, title, voteAverage } = movie;
    const imageLink = "https://image.tmdb.org/t/p/original/" + posterPath;

    const cardContainerElement = document.createElement("div");

    cardContainerElement.id = id;
    cardContainerElement.classList.add("card");

    cardContainerElement.innerHTML = `
        
        <section>
            <img class="poster" src=${imageLink} alt="movie image" />
        </section>
        <p>
            ${title}
        </p>
        <section class="votes-favorites">
            <section class="votes">
                <p class="vote-count">Votes : ${voteAverage}</p>
                <p class="vote-popularity">Popularity : ${popularity}</p>
            </section>
            <section style="cursor: pointer" id="favorites${id}" class="favorites">
                <i id=icon${id} class="fa fa-heart-o" ></i>
                </section>
        </section>
        `;

    return cardContainerElement;

}

function clearMovie() {
    movieListContainer.innerHTML = "";
}
async function fecilitator(sortOptions = false) {

    const data = await fetchData(currentPage, sortOptions);
    clearMovie();
    randerMovies(data);

    allTabButtonElement.classList.add("active-tab");

}

fecilitator();

// ---------PEGINATION----------
// ---------------Click Listeners-----------

prevbuttonElement.addEventListener('click', () => {
    currentPage--;

    fecilitator();
    pageNumberButtonElement.innerHTML = `Current Page: ${currentPage}`;

    // if(currentPage === 1){
    //     prevbuttonElement.disabled = true;
    // }else{
    //     prevbuttonElement.disabled = false;
    // }
});

nextButtonElement.addEventListener('click', () => {
    currentPage++;
    fecilitator();
    pageNumberButtonElement.innerHTML = `Current Page: ${currentPage}`

    // if(currentPage === 1){
    //     nextButtonElement.disabled = false;
    // }else{
    //     nextButtonElement.disabled = true;
    // }

});


// --------SORTING OPTION---------
sortByRateButtonElement.addEventListener('click', () => {

    sortByRateButtonElement.classList.toggle("sort-button-active")

    if (sortByRateButtonElement.classList.contains("sort-button-active")) {
        fecilitator(true);
    } else {
        fecilitator(false);
    }

});

//TABS

    function displayMoviesForSwitchTab(element){
        
       
        const id = element.id;
        
        if(id === "all-tab"){
            sortByRateButtonElement.style.display = "block";
            sortByDateButtonElement.style.display = "block";
            fecilitator();
        }else if(id === "favorites-tab"){
            clearMovie();


            const favMovieListIds = getMoviesToLocalStorage();
            
            const FavMovieList = MOVIE_LIST.filter(movie => {
                const {id} = movie;
                return favMovieListIds.includes(id);
            });

            randerMovies(FavMovieList);
            console.log(FavMovieList);

            sortByRateButtonElement.style.display = "none";
            sortByDateButtonElement.style.display = "none";

        }else{
            //we can add more tabs..
        }

    }
function switchTab(event) {
    allTabButtonElement.classList.remove("active-tab");
    favoritesTabButtonElement.classList.remove("active-tab");

    const element = event.target;
    element.classList.add("active-tab");

    displayMoviesForSwitchTab(element);

}

allTabButtonElement.addEventListener("click", switchTab);
favoritesTabButtonElement.addEventListener("click", switchTab)

// FAVOURITES => USE only Local storage...

function setMoviesToLocalStorage(newFavMovie) {
    const prevFavMovies = getMoviesToLocalStorage();
    const arrayofFavMovies = [...prevFavMovies, newFavMovie];

    localStorage.setItem("favMovie", JSON.stringify(arrayofFavMovies));

}

function getMoviesToLocalStorage() {
    const allFavMovieObj = JSON.parse(localStorage.getItem("favMovie"));
    if (!allFavMovieObj) {
        return [];
    } else {
        return allFavMovieObj;
    }
}

function removeMovieFromLocalStorage(id) {
    const allFavMovieObj = getMoviesToLocalStorage();
    const filterdMovies = allFavMovieObj.filter((ids) => Number(ids) != Number(String(id).substring(4)));
    localStorage.setItem("favMovie", JSON.stringify(filterdMovies));
}

const favIconElement = document.getElementById("favorites");
favIconElement.addEventListener("click", (event) => {
    console.log(event)
    setMoviesToLocalStorage()
})