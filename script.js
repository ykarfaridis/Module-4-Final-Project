// configuration: using requested API key and single movie
// base URL is http://www.omdbapi.com/?i=tt3896198&apikey=27a85546
const apiKey = "27a85546";


// items will be populated asynchronously from the OMDB API
let items = []; // { name, date, posterId }

const itemList = document.getElementById("itemList");
const sortSelect = document.getElementById("sortSelect");

function renderList(sortedItems) {
    itemList.innerHTML = "";
    sortedItems.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${item.name}</strong> (${item.date.getFullYear()})<br />
            <img src="http://img.omdbapi.com/?apikey=${apiKey}&i=${item.posterId}" alt="${item.name} poster" width="100" />
        `;
        itemList.appendChild(li);
    });
}

function sortItems(criteria) {
    let sorted = [...items];
    switch (criteria) {
        case "az":
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "za":
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "newest":
            sorted.sort((a, b) => b.date - a.date);
            break;
        case "oldest":
            sorted.sort((a, b) => a.date - b.date);
            break;
        default:
            break;
    }
    return sorted;
}

sortSelect.addEventListener("change", (e) => {
    const criteria = e.target.value;
    const sorted = sortItems(criteria);
    renderList(sorted);
});

// fetch the movie data and render once we have it
// using the same pattern but the API key and ID come from the above constants
async function fetchMovies() {
    const promises = movieIds.map(id =>
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.Response === "True") {
                    items.push({
                        name: data.Title,
                        date: new Date(`${data.Year}`),
                        posterId: data.imdbID
                    });
                }
            })
            .catch(err => console.error("OMDB fetch error", err))
    );

    await Promise.all(promises);
    renderList(sortItems(sortSelect.value));
}

fetchMovies();
