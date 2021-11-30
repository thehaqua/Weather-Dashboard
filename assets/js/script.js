$(document).ready(function () {

  $('#getEnteredCityWeather,#past-searches').on('click', function () {

    let onClick = $(event.target)[0];
    let location = "";
    if (onClick.id === "getEnteredCityWeather") {
      location = $('#cityEntered').val().trim().toUpperCase();
    } else if (onClick.className === ("cityList")) {
      location = onClick.innerText;
    }
    if (location == "") return;

    updateLocalStorage(location);

    getCurrentWeather(location);

    getForecastWeather(location);
  });

  function convertDate(UNIXtimestamp) {
    let convertedDate = "";
    let a = new Date(UNIXtimestamp * 1000);
    let monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let year = a.getFullYear();
    let month = monthList[a.getMonth()];
    let date = a.getDate();
    convertedDate = month + ' ' + date + ', ' + year;
    return convertedDate;
  }

  function updateLocalStorage(location) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    cities.push(location);
    cities.sort();

    for (let i = 1; i < cities.length; i++) {
      if (cities[i] === cities[i - 1]) cities.splice(i, 1);
    }
    localStorage.setItem('cities', JSON.stringify(cities));

    $('#cityEntered').val("");
  }

  function establishCurrLocation() {

    let location = {};

    function success(position) {
      location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        success: true
      }

      getCurrentWeather(location);

      getForecastWeather(location);
    }

    function error() {
      location = { success: false }
      return location;
    }

    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }

  function getCurrentWeather(loc) {

    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    $('#past-searches').empty();

    cities.forEach(function (city) {
      let cityHistoryNameDiv = $('<div>');
      cityHistoryNameDiv.addClass("cities");
      cityHistoryNameDiv.attr("value", city);
      cityHistoryNameDiv.text(city);
      $('#past-searches').append(cityHistoryNameDiv);
    });

    $('#city-search').val("");

    if (typeof loc === "object") {
      city = `lat=${loc.latitude}&lon=${loc.longitude}`;
    } else {
      city = `q=${loc}`;
    }

    var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
    var cityName = city;
    var unitsURL = "&units=imperial";
    var apiIdURL = "&appid="
    var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
    var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;

    $.ajax({
      url: openCurrWeatherAPI,
      method: "GET"
    }).then(function (response1) {

      weatherObj = {
        city: `${response1.name}`,
        wind: response1.wind.speed,
        humidity: response1.main.humidity,
        temp: Math.round(response1.main.temp),

        date: (convertDate(response1.dt)),
        icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
        desc: response1.weather[0].description
      }

      $('#forecast').empty();

      $('#cityName').text(weatherObj.city + " (" + weatherObj.date + ")");

      $('#currWeathIcn').attr("src", weatherObj.icon);

      $('#currTemp').text("Temperature: " + weatherObj.temp + " " + "°F");

      $('#currHum').text("Humidity: " + weatherObj.humidity + "%");

      $('#currWind').text("Windspeed: " + weatherObj.wind + " MPH");


      city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;


      var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
      var apiIdURL = "?appid="
      var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
      var cityName = city;
      var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;


      $.ajax({
        url: openUviWeatherAPI,
        method: "GET"
      }).then(function (response3) {


        let UviLevel = parseFloat(response3.value);


        let backgrdColor = 'violet';

        if (UviLevel < 3) { backgrdColor = 'green'; }
        else if (UviLevel < 6) { backgrdColor = 'yellow'; }
        else if (UviLevel < 8) { backgrdColor = 'orange'; }
        else if (UviLevel < 11) { backgrdColor = 'red'; }


        let uviTitle = '<span>UV Index: </span>';
        let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
        $('#currUVI').html(color);
      });
    });
  }


  function getForecastWeather(loc) {


    if (typeof loc === "object") {
      city = `lat=${loc.latitude}&lon=${loc.longitude}`;

    } else {
      city = `q=${loc}`;
    }

    var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
    var cityName = city;
    var unitsURL = "&units=imperial";
    var apiIdURL = "&appid="
    var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
    var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;


    $.ajax({
      url: openCurrWeatherAPI2,
      method: "GET",
    }).then(function (response4) {


      var cityLon = response4.coord.lon;
      var cityLat = response4.coord.lat;


      city = `lat=${cityLat}&lon=${cityLon}`;


      let weatherArr = [];
      let weatherObj = {};


      var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
      var cityName = city;

      var exclHrlURL = "&exclude=hourly";
      var unitsURL = "&units=imperial";
      var apiIdURL = "&appid=";
      var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
      var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;


      $.ajax({
        url: openFcstWeatherAPI,
        method: "GET"
      }).then(function (response2) {


        for (let i = 1; i < (response2.daily.length - 2); i++) {
          let cur = response2.daily[i]
          weatherObj = {
            weather: cur.weather[0].description,
            icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
            minTemp: Math.round(cur.temp.min),
            maxTemp: Math.round(cur.temp.max),
            humidity: cur.humidity,
            uvi: cur.uvi,


            date: (convertDate(cur.dt))
          }

          weatherArr.push(weatherObj);
        }

        for (let i = 0; i < weatherArr.length; i++) {
          let $colmx1 = $('<div class="col mx-1">');
          let $cardBody = $('<div class="card-body forecast-card">');
          let $cardTitle = $('<h6 class="card-title">');

          $cardTitle.text(weatherArr[i].date);


          let $ul = $('<ul>');


          let $iconLi = $('<li>');
          let $iconI = $('<img>');
          let $weathLi = $('<li>');
          let $tempMaxLi = $('<li>');
          let $tempMinLi = $('<li>');
          let $humLi = $('<li>');


          $iconI.attr('src', weatherArr[i].icon);
          $weathLi.text(weatherArr[i].weather);
          $tempMaxLi.text('Temp High: ' + weatherArr[i].maxTemp + " °F");
          $tempMinLi.text('Temp Low: ' + weatherArr[i].minTemp + " °F");
          $humLi.text('Humidity: ' + weatherArr[i].humidity + "%");

          $iconLi.append($iconI);
          $ul.append($iconLi);
          $ul.append($weathLi);
          $ul.append($tempMaxLi);
          $ul.append($tempMinLi);
          $ul.append($humLi);
          $cardTitle.append($ul);
          $cardBody.append($cardTitle);
          $colmx1.append($cardBody);

          $('#forecast').append($colmx1);
        }
      });
    });
  }

  var location = establishCurrLocation();
});