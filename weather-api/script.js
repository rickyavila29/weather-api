var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';

var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function displaySearchHistory() {
    searchHistoryContainer.innerHTML = '';

    for(var i = searchHistory.length -1; i>= 0; i--) {
        var btn = document.createElement('button');
        btn.setAttribute('aria-controls', 'today forecast');
        btn.classList.add('history-btn', 'btn-history');

        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        searchHistoryContainer.append(btn);
    }
}

function addToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
        return;
    }
    searchHistory.push(search);

    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    displaySearchHistory();
}

function readSearchHistory() {
    var localHisotry = localStorage.getItem('search-history');
    if (localHisotry) {
        searchHistory = JSON.parse(localHisotry);
    }
    displaySearchHistory();
}

function displayWeather(city, weather) {
    var date = dayjs().format('M/D/YYYY');
    var faren = weather.main.temp;
    var windSpeed = weather.wind.speed;
    var humidity = weather.main.humidity;
    var weatherURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var weatherDescrip = weather.weather[0].description || weather[0].main;

    var card = document.createElement('div');
    var body = document.createElement('div');
    var heading = document.createElement('h2');
    var icon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    card.setAttribute('class', 'card');
    body.setAttribute('class', 'card-body');
    card.append(body);

    heading.textContent = `${city} (${date})`;
    icon.setAttribute('src', weatherURL);
    icon.setAttribute('alt', weatherDescrip);
    icon.setAttribute('class', 'weather-img');
    heading.append(icon);
    tempEl.textContent = `Temp: ${faren} °F`;
    windEl.textContent = `Wind: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidty: ${humidity} %`;
    body.append(heading, tempEl, windEl, humidityEl);

    todayContainer.innerHTML = '';
    todayContainer.append(card);
}


function dispayForecast(forecast) {
    var weatherURL = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var weatherDescrip = forecast.weather[0].description;
    var faren = forecast.main.temp;
    var humidity = forecast.main.humidity;
    var windSpeed = forecast.wind.speed;

    var col = document.createElement('div');
    var card = document.createElement('div');
    var body = document.createElement('div');
    var title = document.createElement('h5');
    var icon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(body);
    body.append(title, icon, tempEl, windEl, humidityEl);

    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    body.setAttribute('class', 'card-body p-2');
    title.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    title.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    icon.setAttribute('src', weatherURL);
    icon.setAttribute('alt', weatherDescrip);
    tempEl.textContent = `Temp: ${faren} °F`;
    windEl.textContent = `Wind: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(col);
}

function fiveDayForecast(dailyForecast) {
    var dayOne = dayjs().add(1, 'day').startOf('day').unix();
    var lastDay = dayjs().add(6, 'day').startOf('day').unix();
    
    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);

    for (var i = 0; i < dailyForecast.length; i++) {
        if (dailyForecast[i].dt >= dayOne && dailyForecast[i].dt < lastDay) {
            
            if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
                dispayForecast(dailyForecast[i]);
            }
        }
    }
}

function displayData(city, data) {
    displayWeather(city, data.list[0], data.city.timezone);
    fiveDayForecast(data.list);
}


function getWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;

    var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            displayData(city, data);
        })
        .catch(function (err) {
            console.error(err);
        });
}

function getCoords(search) {
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then( function (data) {
            if(!data[0]) {
                alert('Location not found');
            } else {
                addToHistory(search);
                getWeather(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        })
}

function handleSearch(e) {
    if (!searchInput.value) {
        return;
    }

    e.preventDefault();
    var search = searchInput.value.trim();
    getCoords(search);
    searchInput.value = '';
}

function handleSearchHistory(e) {
    if (!e.target.matches('.btn-history')) {
        return;
    }

    var btn = e.target;
    var search = btn.getAttribute('data-search');
    getCoords(search);
}

readSearchHistory();
searchForm.addEventListener('submit', handleSearch);
searchHistoryContainer.addEventListener('click', handleSearchHistory);
