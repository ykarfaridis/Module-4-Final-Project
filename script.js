// API key provided by user
const apiKey = "27a85546";

// items will be populated by search results from OMDB
let items = []; // { name, year, poster, imdbID }

const itemList = document.getElementById("itemList");
const sortSelect = document.getElementById("sortSelect");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

function renderList(sortedItems) {
    itemList.innerHTML = "";
    if (!sortedItems.length) {
        const p = document.createElement('p');
        p.textContent = 'No results. Try searching for a movie title.';
        itemList.appendChild(p);
        return;
    }

    sortedItems.forEach(item => {
        const li = document.createElement("li");
        const posterSrc = item.poster && item.poster !== 'N/A' ? item.poster : 'https://via.placeholder.com/100x150?text=No+Poster';
        li.innerHTML = `
            <div class="media">
                <img src="${posterSrc}" alt="${item.name} poster" />
                <div class="meta">
                    <strong>${item.name}</strong><br />
                    <span class="year">${item.year || ''}</span>
                </div>
            </div>
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
            sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case "oldest":
            sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
            break;
        default:
            break;
    }
    return sorted;
}

sortSelect.addEventListener("change", () => {
    renderList(sortItems(sortSelect.value));
});

// Theme detection based on search query
function detectTheme(query) {
    const lowerQuery = query.toLowerCase();
    
    // Define theme keywords
    const themes = {
        'horror': ['horror', 'haunted', 'psycho', 'scream', 'nightmare', 'evil', 'dead', 'saw', 'insidious', 'conjuring'],
        'romance': ['love', 'romance', 'wedding', 'romance', 'heart', 'passion', 'kiss', 'bride', 'groom', 'romantic'],
        'adventure': ['adventure', 'hero', 'marvel', 'super', 'avengers', 'action', 'mission', 'quest', 'treasure', 'explorer'],
        'cool': ['frozen', 'ice', 'snow', 'winter', 'elsa', 'cold', 'arctic', 'freeze'],
        'scifi': ['star', 'force', 'jedi', 'space', 'trek', 'alien', 'robot', 'terminator', 'blade runner', 'avatar'],
        'dark': ['dark', 'batman', 'noir', 'thriller', 'dracul', 'vampire', 'shadow', 'midnight', 'cryptnight', 'silence']
    };
    
    // Check which theme matches
    for (const [theme, keywords] of Object.entries(themes)) {
        if (keywords.some(keyword => lowerQuery.includes(keyword))) {
            return `theme-${theme}`;
        }
    }
    
    // Default to tech theme
    return 'theme-tech';
}

// Apply theme to page
function applyTheme(themeName) {
    document.body.className = themeName;
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    performSearch(q);
});

async function performSearch(query) {
    try {
        // Apply theme based on search query
        const theme = detectTheme(query);
        applyTheme(theme);
        
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.Response === 'True' && Array.isArray(data.Search)) {
            items = data.Search.map(r => ({
                name: r.Title,
                year: parseInt((r.Year || '').slice(0,4)) || 0,
                poster: r.Poster,
                imdbID: r.imdbID
            }));
        } else {
            items = [];
        }
        renderList(sortItems(sortSelect.value));
    } catch (err) {
        console.error('Search error', err);
        items = [];
        renderList(items);
    }
}

// Load search results for "The Matrix" by default
performSearch("The Matrix");
