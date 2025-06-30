/*----------------------------------------- get weather emoji functions-----------------------------------*/
function getWeatherEmoji(condition) {
  switch (condition) {
    case "Clear": return "☀️"; // Bright sun
    case "Clouds": return "🌥️"; // Sun behind cloud
    case "Rain": return "🌧️"; // Cloud with rain
    case "Thunderstorm": return "🌩️"; // Lightning cloud
    case "Drizzle": return "🌦️"; // Sun behind rain cloud
    case "Snow": return "🌨️"; // Snow cloud
    case "Mist": return "🌫️"; // Foggy
    case "Smoke": return "🚬"; // Smoke symbol
    case "Haze": return "🌫️"; // Hazy
    case "Fog": return "🌁"; // Fog
    case "Dust": return "🌪️"; // Dust storm
    case "Sand": return "🏜️"; // Desert
    case "Ash": return "🌋"; // Volcanic ash
    case "Squall": return "🌬️"; // Wind face
    case "Tornado": return "🌪️"; // Tornado
    case "Night": return "🌙"; // Moon for night
    default: return "🌍"; // Earth as default
  }
}
/*------------------------------------------ set background images fuctions-------------------------------*/
function setBackgroundImage(condition) {
  let bgImage = "clearimages.png"; // default

  switch (condition) {
    case "Clear": bgImage = "clearimages.png"; break;
    case "Clouds": bgImage = "Cloudyimages.png"; break;
    case "Drizzle": bgImage = "Drizzleimages.png"; break;
    case "Rain": bgImage = "Rainimages.png"; break;
    case "Fog":
    case "Mist": bgImage = "Fogimages.png"; break;
    case "Haze": bgImage = "Hazeimages.png"; break;
    case "Snow": bgImage = "Snowimages.png"; break;
    case "Thunderstorm": bgImage = "Thunderstormimages.png"; break;
    case "Smoke":
    case "Dust":
    case "Sand":
    case "Ash":
    case "Squall":
    case "Tornado":
    case "Wind":
    case "Windy": bgImage = "windyimages.png"; break;
  }
const imageUrl = `images/${bgImage}`;
 // Set background on left and right sides
  document.querySelector(".left-bg").style.backgroundImage = `url('${imageUrl}')`;
  document.querySelector(".right-bg").style.backgroundImage = `url('${imageUrl}')`;
}

/* ----------------------------------------formate time of functions ---------------------------------------- */
function formatTime(unixTime) {
  const localTime = new Date(unixTime * 1000);
  return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ------------------------------- Extracted push notification logic for reuse -------------------------------
function sendNotification(title, body, icon = null) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: icon || "https://openweathermap.org/img/wn/11d.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, {
          body: body,
          icon: icon || "https://openweathermap.org/img/wn/11d.png"
        });
      }
    });
  }
}
/* -----------------------------------speek  fucntions------------------------------------------------------ */
function speak(text) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Change if you want other languages
  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------wind directions of functions---------------------------------------------*/
function getWindDirection(degree) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}
// ----------------------------------api key-----------------------------------------------------------
const apiKey = "ce0934b20b45d596aadca86070d2fb2b";

/*------------------------- getweather of information to print this functions--------------------------- */
async function getWeather(cityName) {
  const city = cityName || document.getElementById("cityInput").value.trim();
  const isFahrenheit = document.getElementById("unitToggle")?.checked || false;
  const unit = isFahrenheit ? "imperial" : "metric";
  const unitSymbol = isFahrenheit ? "°F" : "°C";

  if (!city) {
    document.getElementById("weatherResult").innerHTML = `<p style="color: red;">Please enter a city name.</p>`;
    return;
  }

  document.getElementById("weatherResult").innerHTML = `<div id="loading">Loading...</div>`;

  try {
    const apiKey = "ce0934b20b45d596aadca86070d2fb2b";

    // Step 1: Get current weather
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod !== 200) {
      document.getElementById("weatherResult").innerHTML = `<p style="color: red;">${weatherData.message}</p>`;
      return;
    }

    const { lat, lon } = weatherData.coord;

    // Step 2: Fetch One Call API
    const oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${apiKey}`;
    const oneCallResponse = await fetch(oneCallURL);
    const oneCallData = await oneCallResponse.json();

    // Step 3: Custom alerts
    const alerts = [];
    const temp = weatherData.main.temp;
    const description = weatherData.weather[0].description.toLowerCase();
    const windSpeed = weatherData.wind.speed;
    // Step 3: Fetch Air Quality Index (AQI)
    const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const airQualityResponse = await fetch(airQualityURL);
    const airQualityData = await airQualityResponse.json();
    const aqiValue = airQualityData.list[0]?.main?.aqi || 0;

    // AQI Description
    const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiValue - 1] || "Unknown";


    // 🌡️ Temperature Alerts
    if (temp >= 45)
      alerts.push("🚨 Heatwave: Stay indoors, hydrate well.");
    else if (temp >= 40)
      alerts.push("🥵 Extreme Heat: Avoid sun, drink water.");
    else if (temp >= 35)
      alerts.push("🔥 Hot Day: Stay cool and shaded.");
    else if (temp <= -5)
      alerts.push("🥶 Severe Cold: Wear full winter gear.");
    else if (temp < 0)
      alerts.push("❄️ Freezing: Dress warmly, watch for ice.");
    else if (temp < 5)
      alerts.push("🧥 Cold: Layer up before going out.");

    // 🌧️ Rain
    if (description.includes("rain") || description.includes("shower"))
      alerts.push("🌧️ Rain: Carry umbrella, roads may be slippery.");

    // ⛈️ Thunderstorms
    if (description.includes("storm") || description.includes("thunderstorm"))
      alerts.push("⛈️ Thunderstorm: Stay indoors, avoid open areas.");

    // 🌨️ Snow
    if (description.includes("snow"))
      alerts.push("🌨️ Snow: Drive slowly, roads may be icy.");

    // 🌫️ Low visibility
    if (["fog", "mist", "haze"].some(w => description.includes(w)))
      alerts.push("🌫️ Fog: Low visibility, drive carefully.");

    // 💨 Wind
    if (windSpeed >= 30)
      alerts.push("🌪️ High Winds: Stay inside, secure items.");
    else if (windSpeed >= 20)
      alerts.push("💨 Windy: Be cautious, hold on to hats!");
    else if (windSpeed > 10)
      alerts.push("🌬️ Breezy: Secure loose outdoor items.");

    // 🥶 Wind Chill
    if (temp < 5 && windSpeed > 10)
      alerts.push("🥶 Wind Chill: Feels colder, dress warmly.");

    // 💦 Humid Heat
    if (temp > 35 && weatherData.main.humidity > 60)
      alerts.push("💦 Humid & Hot: Rest often, drink water.");

    // Step 4: Official alerts HTML
    let alertHTML = "";

    if (oneCallData.alerts && oneCallData.alerts.length > 0) {
      oneCallData.alerts.forEach(alert => {
        alertHTML += `
          <div style="background: #ff4444; color: white; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
            ⚠️ <strong>${alert.event}</strong><br>
            <em>${alert.sender_name}</em><br>
            <small>${new Date(alert.start * 1000).toLocaleString()} - ${new Date(alert.end * 1000).toLocaleString()}</small>
            <p>${alert.description}</p>
          </div>
        `;
        sendNotification(`⚠️ ${alert.event}`, alert.description.slice(0, 100) + '...');
      });
    }

    if (alerts.length > 0) {
      alerts.forEach(customAlert => {
        alertHTML += `
          <div style="background: #ffbb33; color: black; padding: 10px; margin-bottom: 10px; border-radius: 12px;">
            <strong>${customAlert}</strong>
          </div>
        `;
        sendNotification("Weather Alert", customAlert);
      });
    }

    const windSpeedKmh = isFahrenheit ? windSpeed : windSpeed * 3.6;
    const windChill = calculateWindChill(temp, windSpeedKmh, isFahrenheit);
    const heatIndex = calculateHeatIndex(temp, weatherData.main.humidity, isFahrenheit);

    let feelsLikeHTML = `<div>`;
    feelsLikeHTML += `<b>Feels Like:</b> ${weatherData.main.feels_like.toFixed(1)} ${unitSymbol}<br>`;
    if (windChill) feelsLikeHTML += `<b>Wind Chill:</b> ${windChill} ${unitSymbol}<br>`;
    else if (heatIndex) feelsLikeHTML += `<b>Heat Index:</b> ${heatIndex} ${unitSymbol}<br>`;
    feelsLikeHTML += `</div>`;

    const emoji = getWeatherEmoji(weatherData.weather[0].main);
    setBackgroundImage(weatherData.weather[0].main);

    const now = new Date();
    const formattedTime = now.toLocaleString();
    const sunriseTime = formatTime(weatherData.sys.sunrise);
    const sunsetTime = formatTime(weatherData.sys.sunset);
    document.getElementById("weatherResult").innerHTML = `
  ${alertHTML}

  <section class="weather-container fade-in">
    <h2>Weather in <span class="city-name">${weatherData.name}</span></h2>

  <div class="weather-main">
  <div class="weather-emoji">
    ${emoji}
    <br>
    <p class="weather-desc">${weatherData.weather[0].description}</p>
  </div>
  <div class="weather-temp">
    <div class="temp-row">
      <span class="temp-value">${temp.toFixed(1)}</span>
      <span class="temp-unit">${unitSymbol}</span>
    </div>
    <div class="feels-like">${feelsLikeHTML}</div>
  </div>
</div>


    <div class="weather-details">
      <div class="weather-info-blue">
        <img src="humidity.png" alt="Humidity" />
        <span>Humidity: <strong>${weatherData.main.humidity}%</strong></span>
      </div>
      <div class="detail-item">
        <img src="wind.png" alt="Wind Speed" />
        <span>Wind Speed: <strong>${windSpeedKmh.toFixed(1)} km/h</strong></span>
      </div>
      <div class="detail-item">
        <img src="Wind-directions.png" alt="Wind Direction" />
        <span>Wind Direction: <strong>${getWindDirection(weatherData.wind.deg)}</strong></span>
      </div>
      <div class="detail-item">
        <img src="pressure.png" alt="Pressure" />
        <span>Pressure: <strong>${weatherData.main.pressure} hPa</strong></span>
      </div>
      <div class="detail-item">
        <img src="Air Quality.png" alt="Air Quality" />
        <span>Air Quality: <strong>${aqiDescription}</strong></span>
      </div>
    </div>

    <div class="sun-times">
      <p>🌅 Sunrise: <strong>${sunriseTime}</strong></p>
      <p>🌇 Sunset: <strong>${sunsetTime}</strong></p>
   <p style="text-align:center;">🕒 Time: <strong>${formattedTime}</strong></p>
    </div>
    <br>
   
    <div id="chartSection" data-city="${weatherData.name}" data-unit="${unit}" data-unit-symbol="${unitSymbol}">
      <button id="showChartsBtn">📊 Show Charts</button>
      <canvas id="weatherChart" width="500" height="400"></canvas>
    </div>
  </section>
`;





    let currentTime = new Date().toLocaleTimeString();
    // Compose speech text
    let speechText = `Weather in ${weatherData.name}. Temperature is ${temp.toFixed(1)} degrees ${isFahrenheit ? 'Fahrenheit' : 'Celsius'}. `;
    if (alerts.length > 0) {
      speechText += "Weather alerts: " + alerts.join(", ") + ". ";
    }
    speechText += `Current conditions: ${weatherData.weather[0].description}. Humidity is ${weatherData.main.humidity} percent. `;
    if (windChill) speechText += `Wind chill makes it feel like ${windChill} degrees. `;
    if (heatIndex) speechText += `Heat index is ${heatIndex} degrees. `;
    speechText += `Sunrise at ${sunriseTime}, sunset at ${sunsetTime}. Current local time is ${currentTime}. `;
    speechText += `A chart showing temperature, humidity, and wind power to display press button.`;

    // Then pass speechText to your speech synthesis function

    speak(speechText);


    saveCityToHistory(city);
    historyDropdown.style.display = "none";

  } catch (error) {
    console.error(error);
    document.getElementById("weatherResult").innerHTML = `<p style="color: red;">An error occurred. Please try again later.</p>`;
  }
}

// ----------------------------------Wind Chill calculation function--------------------------------------
// temp in °C or °F depending on isFahrenheit flag
// windSpeed in km/h if metric, mph if imperial
function calculateWindChill(temp, windSpeed, isFahrenheit) {
  if (isFahrenheit) {
    // Use Wind Chill formula in °F, valid for temp <= 50°F and wind speed > 3 mph
    if (temp > 50 || windSpeed <= 3) return null;
    return (
      35.74 +
      0.6215 * temp -
      35.75 * Math.pow(windSpeed, 0.16) +
      0.4275 * temp * Math.pow(windSpeed, 0.16)
    ).toFixed(1);
  } else {
    // Metric: valid for temp <= 10°C and wind speed > 4.8 km/h
    if (temp > 10 || windSpeed <= 4.8) return null;
    return (
      13.12 +
      0.6215 * temp -
      11.37 * Math.pow(windSpeed, 0.16) +
      0.3965 * temp * Math.pow(windSpeed, 0.16)
    ).toFixed(1);
  }
}

//--------------------------------------------Heat Index calculation function--------------------------------
// temp in °C or °F depending on isFahrenheit flag
// humidity in percentage
function calculateHeatIndex(temp, humidity, isFahrenheit) {
  if (isFahrenheit) {
    // Heat Index formula valid for temp >= 80°F and humidity >= 40%
    if (temp < 80 || humidity < 40) return null;
    const HI =
      -42.379 +
      2.04901523 * temp +
      10.14333127 * humidity -
      0.22475541 * temp * humidity -
      0.00683783 * temp * temp -
      0.05481717 * humidity * humidity +
      0.00122874 * temp * temp * humidity +
      0.00085282 * temp * humidity * humidity -
      0.00000199 * temp * temp * humidity * humidity;
    return HI.toFixed(1);
  } else {
    // Metric: convert °C to °F to calculate heat index, then convert back
    if (temp < 27 || humidity < 40) return null;
    const tempF = temp * 9 / 5 + 32;
    const HI =
      -42.379 +
      2.04901523 * tempF +
      10.14333127 * humidity -
      0.22475541 * tempF * humidity -
      0.00683783 * tempF * tempF -
      0.05481717 * humidity * humidity +
      0.00122874 * tempF * tempF * humidity +
      0.00085282 * tempF * humidity * humidity -
      0.00000199 * tempF * tempF * humidity * humidity;
    const heatIndexC = (HI - 32) * 5 / 9;
    return heatIndexC.toFixed(1);
  }
}

/* --------------------------------getweather by our locations of functions---------------------------------- */
async function getWeatherByLocation() {
  const isFahrenheit = document.getElementById("unitToggle")?.checked || false;
  const unit = isFahrenheit ? "imperial" : "metric";
  const unitSymbol = isFahrenheit ? "°F" : "°C";

  document.getElementById("weatherResult").innerHTML = `<div id="loading">Loading...</div>`;

  // Use Geolocation API
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const apiKey = "ce0934b20b45d596aadca86070d2fb2b";

      // Step 1: Get current weather by lat/lon
      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
      const weatherResponse = await fetch(weatherURL);
      const weatherData = await weatherResponse.json();

      if (weatherData.cod !== 200) {
        document.getElementById("weatherResult").innerHTML = `<p style="color: red;">${weatherData.message}</p>`;
        return;
      }

      // Step 2: Fetch One Call API for alerts
      const oneCallURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${apiKey}`;
      const oneCallResponse = await fetch(oneCallURL);
      const oneCallData = await oneCallResponse.json();

      // Step 3: Fetch Air Quality Index (AQI)
      const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const airQualityResponse = await fetch(airQualityURL);
      const airQualityData = await airQualityResponse.json();
      const aqiValue = airQualityData.list[0]?.main?.aqi || 0;
      const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiValue - 1] || "Unknown";

      // Step 4: Custom alerts
      const alerts = [];
      const temp = weatherData.main.temp;
      const description = weatherData.weather[0].description.toLowerCase();
      const windSpeed = weatherData.wind.speed;

      // Temperature alerts
      if (temp >= 45) alerts.push("🚨 Heatwave: Stay indoors, hydrate well.");
      else if (temp >= 40) alerts.push("🥵 Extreme Heat: Avoid sun, drink water.");
      else if (temp >= 35) alerts.push("🔥 Hot Day: Stay cool and shaded.");
      else if (temp <= -5) alerts.push("🥶 Severe Cold: Wear full winter gear.");
      else if (temp < 0) alerts.push("❄️ Freezing: Dress warmly, watch for ice.");
      else if (temp < 5) alerts.push("🧥 Cold: Layer up before going out.");

      // Rain alerts
      if (description.includes("rain") || description.includes("shower"))
        alerts.push("🌧️ Rain: Carry umbrella, roads may be slippery.");

      // Thunderstorms
      if (description.includes("storm") || description.includes("thunderstorm"))
        alerts.push("⛈️ Thunderstorm: Stay indoors, avoid open areas.");

      // Snow
      if (description.includes("snow"))
        alerts.push("🌨️ Snow: Drive slowly, roads may be icy.");

      // Fog, mist, haze
      if (["fog", "mist", "haze"].some(w => description.includes(w)))
        alerts.push("🌫️ Fog: Low visibility, drive carefully.");

      // Wind alerts
      if (windSpeed >= 30) alerts.push("🌪️ High Winds: Stay inside, secure items.");
      else if (windSpeed >= 20) alerts.push("💨 Windy: Be cautious, hold on to hats!");
      else if (windSpeed > 10) alerts.push("🌬️ Breezy: Secure loose outdoor items.");

      // Wind chill
      if (temp < 5 && windSpeed > 10)
        alerts.push("🥶 Wind Chill: Feels colder, dress warmly.");

      // Humid heat
      if (temp > 35 && weatherData.main.humidity > 60)
        alerts.push("💦 Humid & Hot: Rest often, drink water.");

      // Step 5: Prepare alert HTML
      let alertHTML = "";

      if (oneCallData.alerts && oneCallData.alerts.length > 0) {
        oneCallData.alerts.forEach(alert => {
          alertHTML += `
            <div style="background: #ff4444; color: white; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
              ⚠️ <strong>${alert.event}</strong><br>
              <em>${alert.sender_name}</em><br>
              <small>${new Date(alert.start * 1000).toLocaleString()} - ${new Date(alert.end * 1000).toLocaleString()}</small>
              <p>${alert.description}</p>
            </div>
          `;
          sendNotification(`⚠️ ${alert.event}`, alert.description.slice(0, 100) + '...');
        });
      }

      if (alerts.length > 0) {
        alerts.forEach(customAlert => {
          alertHTML += `
            <div style="background: #ffbb33; color: black; padding: 10px; margin-bottom: 10px; border-radius: 12px;">
              <strong>${customAlert}</strong>
            </div>
          `;
          sendNotification("Weather Alert", customAlert);
        });
      }

      const windSpeedKmh = isFahrenheit ? windSpeed : windSpeed * 3.6;
      const windChill = calculateWindChill(temp, windSpeedKmh, isFahrenheit);
      const heatIndex = calculateHeatIndex(temp, weatherData.main.humidity, isFahrenheit);

      let feelsLikeHTML = `<div>`;
      feelsLikeHTML += `<b>Feels Like:</b> ${weatherData.main.feels_like.toFixed(1)} ${unitSymbol}<br>`;
      if (windChill) feelsLikeHTML += `<b>Wind Chill:</b> ${windChill} ${unitSymbol}<br>`;
      else if (heatIndex) feelsLikeHTML += `<b>Heat Index:</b> ${heatIndex} ${unitSymbol}<br>`;
      feelsLikeHTML += `</div>`;

      const emoji = getWeatherEmoji(weatherData.weather[0].main);
      const now = new Date();
      const formattedTime = now.toLocaleString();
      const sunriseTime = formatTime(weatherData.sys.sunrise);
      const sunsetTime = formatTime(weatherData.sys.sunset);

      document.getElementById("weatherResult").innerHTML = `
        ${alertHTML}

        <section class="weather-container fade-in">
          <h2>Weather in <span class="city-name">${weatherData.name}</span></h2>

          <div class="weather-main">
          
            <div class="weather-emoji">
              ${emoji}
              <br>
              <p class="weather-desc">${weatherData.weather[0].description}</p>
            </div>
            <div class="weather-temp">
              <div class="temp-row">
                <span class="temp-value">${temp.toFixed(1)}</span>
                <span class="temp-unit">${unitSymbol}</span>
              </div>
              <div class="feels-like">${feelsLikeHTML}</div>
            </div>
          </div>

          <div class="weather-details">
            <div class="weather-info-blue">
              <img src="humidity.png" alt="Humidity" />
              <span>Humidity: <strong>${weatherData.main.humidity}%</strong></span>
            </div>
            <div class="detail-item">
              <img src="wind.png" alt="Wind Speed" />
              <span>Wind Speed: <strong>${windSpeedKmh.toFixed(1)} km/h</strong></span>
            </div>
            <div class="detail-item">
              <img src="Wind-directions.png" alt="Wind Direction" />
              <span>Wind Direction: <strong>${getWindDirection(weatherData.wind.deg)}</strong></span>
            </div>
            <div class="detail-item">
              <img src="pressure.png" alt="Pressure" />
              <span>Pressure: <strong>${weatherData.main.pressure} hPa</strong></span>
            </div>
            <div class="detail-item">
              <img src="Air Quality.png" alt="Air Quality" />
              <span>Air Quality: <strong>${aqiDescription}</strong></span>
            </div>
          </div>

          <div class="sun-times">
            <p>🌅 Sunrise: <strong>${sunriseTime}</strong></p>
            <p>🌇 Sunset: <strong>${sunsetTime}</strong></p>
            <p style="text-align:center;">🕒 Time: <strong>${formattedTime}</strong></p>
           
          </div>
 
          <div id="chartSection" data-city="${weatherData.name}" data-unit="${unit}" data-unit-symbol="${unitSymbol}">
            <button id="showChartsBtn">📊 Show Charts</button>
            <canvas id="weatherChart" width="500" height="400"></canvas>
          </div>
        </section>
      `;

      // Compose speech text
      let currentTime = new Date().toLocaleTimeString();
      let speechText = `Weather in ${weatherData.name}. Temperature is ${temp.toFixed(1)} degrees ${isFahrenheit ? 'Fahrenheit' : 'Celsius'}. `;
      if (alerts.length > 0) {
        speechText += "Weather alerts: " + alerts.join(", ") + ". ";
      }
      speechText += `Current conditions: ${weatherData.weather[0].description}. Humidity is ${weatherData.main.humidity} percent. `;
      if (windChill) speechText += `Wind chill makes it feel like ${windChill} degrees. `;
      if (heatIndex) speechText += `Heat index is ${heatIndex} degrees. `;
      speechText += `Sunrise at ${sunriseTime}, sunset at ${sunsetTime}. Current local time is ${currentTime}. `;
      speechText += `A chart showing temperature, humidity, and wind power to display press button.`;

      speak(speechText);

      saveCityToHistory(weatherData.name);
      historyDropdown.style.display = "none";

    } catch (error) {
      console.error(error);
      document.getElementById("weatherResult").innerHTML = `<p style="color: red;">An error occurred. Please try again later.</p>`;
    }
  }, (error) => {
    document.getElementById("weatherResult").innerHTML = `<p style="color: red;">Location access denied. Please allow location or enter a city manually.</p>`;
  });
}

/* -----------------------------------------Voice recognition of functions---------------------------------- */
const voiceBtn = document.getElementById('voiceBtn');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceBtn.classList.add('listening');
  });

  recognition.onresult = (event) => {
    let city = event.results[0][0].transcript;
    city = city.replace(/[.,!?]$/, '').trim();

    document.getElementById('cityInput').value = city;
    getWeather();
  };

  recognition.onerror = (event) => {
    alert('Voice recognition error: ' + event.error);
    voiceBtn.classList.remove('listening');
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('listening');
  };
} else {
  voiceBtn.style.display = 'none'; // Hide if not supported
}
/* ----------------------------------------Upcoming day of forecast of functions---------------------------- */
async function getForecast() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const apiKey = "ce0934b20b45d596aadca86070d2fb2b";
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;

  try {
    // Fetch current weather to get coordinates
    const currentRes = await fetch(currentWeatherUrl);

    if (!currentRes.ok) {
      if (currentRes.status === 404) {
        alert("City not found. Please check the city name.");
      } else {
        alert("Error fetching current weather data.");
      }
      return;
    }

    const currentData = await currentRes.json();

    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;

    // Fetch air quality data
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const airRes = await fetch(airUrl);

    if (!airRes.ok) {
      alert("Error fetching air quality data.");
      return;
    }

    const airData = await airRes.json();

    const aqi = airData.list[0].main.aqi;
    const aqiText = getAQIDescription(aqi);

    // Fetch 5-day forecast data
    const forecastRes = await fetch(forecastUrl);

    if (!forecastRes.ok) {
      alert("Error fetching forecast data.");
      return;
    }

    const data = await forecastRes.json();

    if (!data.list) {
      alert("No forecast data available.");
      return;
    }

    const forecastContainer = document.getElementById("weatherResult");
    forecastContainer.innerHTML = `<h2>5-Day Forecast for ${city}</h2><div id="forecastContainer"></div>`;

    const days = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });

    const forecastDiv = document.getElementById("forecastContainer");

    function getWeekdayName(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    forecastDiv.innerHTML = ""; // clear previous forecast

    Object.keys(days).slice(1, 7).forEach(date => {
      const readings = days[date];
      const midReading = readings[Math.floor(readings.length / 2)];

      const icon = midReading.weather[0].icon;
      const description = midReading.weather[0].description;
      const temp = midReading.main.temp.toFixed(1);
      const humidity = midReading.main.humidity;
      const wind = midReading.wind.speed;
      const weekday = getWeekdayName(date);

      // Time slots
      const timeSlots = {
        "Night": null,
        "Morning": null,
        "Afternoon": null,
        "Evening": null
      };

      readings.forEach(item => {
        const hour = new Date(item.dt_txt).getHours();
        if (hour === 0) timeSlots["Night"] = item;
        if (hour === 6) timeSlots["Morning"] = item;
        if (hour === 12) timeSlots["Afternoon"] = item;
        if (hour === 18) timeSlots["Evening"] = item;
      });

      let slotDetails = "";
      for (const [label, slot] of Object.entries(timeSlots)) {
        if (slot) {
          const slotIcon = slot.weather[0].icon;
          const slotDesc = slot.weather[0].description;
          const slotTemp = slot.main.temp.toFixed(1);
          const slotHumidity = slot.main.humidity;
          const slotWind = slot.wind.speed;

          slotDetails += `
            <div class="slot-group">
              <h2>${label}</h2>
              <div class="slot-details">
                <img src="https://openweathermap.org/img/wn/${slotIcon}.png" alt="${slotDesc}" title="${slotDesc}" />
            <h3>${slotTemp} °C</h3>
                ${slotDesc}
                Humidity: ${slotHumidity}%<br>
                Wind: ${slotWind} m/s
            
           
            <div class="weekday">${weekday}</div>
               
              </div>
            </div>
          `;
        }
      }

      forecastDiv.innerHTML += `
        <div class="forecast-item">
          <div class="summary-box">
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" title="${description}" />
            <div><h2><strong>${temp} °C</strong></h2></div>
            <div>Humidity: ${humidity}%</div>
            <div>Wind: ${wind} m/s</div>
            <div class="air-quality">Air Quality: ${aqiText}</div>
            <div class="date">${date}</div>
            <div class="weekday">${weekday}</div>
          </div>
          ${slotDetails}
        </div>
      `;
    });

  } catch (error) {
    console.error("Error fetching forecast data:", error);
    alert("An unexpected error occurred while fetching the forecast.");
  }
}

// -----------------------------------------AQI description function (unchanged)------------------------
function getAQIDescription(aqi) {
  switch (aqi) {
    case 1: return "Good";
    case 2: return "Fair";
    case 3: return "Moderate";
    case 4: return "Poor";
    case 5: return "Very Poor";
    default: return "Unknown";
  }
}

/*---------------------------------suggestion list of city inputs to eventlistener---------------------------  */
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('cityInput');
  const suggestionsList = document.getElementById('suggestions');

  cityInput.addEventListener('input', async () => {
    const query = cityInput.value.trim();
    if (query.length < 1) {
      suggestionsList.innerHTML = '';
      return;
    }

    const apiKey = "c49414d297mshce1bd654d0a34f9p12cbeajsnfa9cd1ec844a";
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        suggestionsList.innerHTML = '<li>No results found</li>';
        return;
      }

      displaySuggestions(data.data);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      suggestionsList.innerHTML = '<li>No results found</li>';
    }
  });
/*-----------------------------display suggestion of city of functions------------------------------------*/
  function displaySuggestions(cities) {
    suggestionsList.innerHTML = '';

    const filteredCities = cities.filter(city => city.type === "CITY");

    if (filteredCities.length === 0) {
      suggestionsList.innerHTML = '<li>No results found</li>';
      return;
    }

    filteredCities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = `${city.city}, ${city.countryCode}`;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        cityInput.value = city.city;
        suggestionsList.innerHTML = '';
        getWeather(city.city);
      });
      suggestionsList.appendChild(li);
    });
  }
});
const cityInput = document.getElementById("cityInput");
const searchIcon = document.getElementById("searchIcon");
const historyDropdown = document.getElementById("historyDropdown");
const weatherResult = document.getElementById("weatherResult");

// Load saved history from localStorage or start empty
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// -----------Function to save city to history (called inside getWeather when successful)
function saveCityToHistory(city) {
  city = city.trim();
  if (!city) return;

  // Avoid duplicates: remove city if it exists already
  searchHistory = searchHistory.filter(c => c.toLowerCase() !== city.toLowerCase());

  // Add city to the start of the array (latest first)
  searchHistory.unshift(city);

  // Limit history length (optional, e.g., last 5 searches)
  if (searchHistory.length > 5) searchHistory.pop();

  // Save updated history to localStorage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

// --------------------------Function to render dropdown history list--------------------------------------
function renderHistoryDropdown() {
  if (searchHistory.length === 0) {
    historyDropdown.style.display = "none";
    historyDropdown.innerHTML = "";
    return;
  }

  // ------------------------------Build list items for each city------------------------------------------
  historyDropdown.innerHTML = searchHistory
    .map(city => `<div class="history-item">${city}</div>`)
    .join("");

  historyDropdown.style.display = "block";

  // Add click listeners for each item
  document.querySelectorAll(".history-item").forEach(item => {
    item.addEventListener("click", () => {
      cityInput.value = item.textContent;
      historyDropdown.style.display = "none";
      getWeather(item.textContent);
    });
  });
}

// -------------------------------Event listener for search icon click--------------------------------------
searchIcon.addEventListener("click", () => {
  if (historyDropdown.style.display === "block") {
    historyDropdown.style.display = "none"; // toggle hide
  } else {
    renderHistoryDropdown(); // show history
  }
});

// Optional: Hide dropdown if clicked outside
document.addEventListener("click", (event) => {
  if (!historyDropdown.contains(event.target) && event.target !== searchIcon && event.target !== cityInput) {
    historyDropdown.style.display = "none";
  }
});

let chartInstance = null;

/*-------------------------------------- fetch forecast data of upcoming functions-------------------------  */
async function fetchForecastData(city, unit = "metric") {
  const apiKey = "ce0934b20b45d596aadca86070d2fb2b";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}
/*------------------------------- chart display of humality wind power and temprature of functions------------  */
function drawChart(forecastData, unitSymbol = "°C") {
  const labels = [];
  const temps = [];
  const humidities = [];
  const winds = [];

  // Get data every 8 steps (3-hr interval x 8 = 24hr)
  for (let i = 0; i < forecastData.list.length; i += 8) {
    const item = forecastData.list[i];
    labels.push(new Date(item.dt * 1000).toLocaleDateString());
    temps.push(item.main.temp);
    humidities.push(item.main.humidity);
    winds.push(item.wind.speed);
  }

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById('weatherChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `Temperature (${unitSymbol})`,
          data: temps,
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Humidity (%)',
          data: humidities,
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Wind Speed (m/s)',
          data: winds,
          borderColor: 'green',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '5-Day Weather Trends'
        }
      }
    }
  });
}
// event listener of chart button 
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "showChartsBtn") {
    const section = document.getElementById("chartSection");
    const city = section.dataset.city;
    const unit = section.dataset.unit;
    const unitSymbol = section.dataset.unitSymbol;

    const forecastData = await fetchForecastData(city, unit);
    drawChart(forecastData, unitSymbol);
  }
});
/*--------------------------------- get upcoming hourly forecast functions--------------------------------- */
async function getHourlyForecast() {
  const city = document.getElementById('cityInput').value.trim();
  const weatherResult = document.getElementById('weatherResult');

  if (!city) {
    alert('Please enter a city name');
    return;
  }

  const apiKey = 'ce0934b20b45d596aadca86070d2fb2b';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  weatherResult.innerHTML = 'Loading...';

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
    const data = await response.json();

    const forecastMap = new Map();
    data.list.forEach(forecast => {
      const forecastTime = new Date(forecast.dt * 1000);
      forecastMap.set(forecastTime.getTime(), forecast);
    });

    // 24-hour format HH:00
    function formatHour(date) {
      const h = date.getHours(); // 0 - 23
      return `${h.toString().padStart(2, '0')}:00`;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const now = new Date();
    const hourlyData = [];
    // Next 24 hours (0 to 23)
    for (let i = 0; i <= 23; i++) {
      hourlyData.push(new Date(now.getTime() + i * 60 * 60 * 1000));
    }

    const keys = Array.from(forecastMap.keys()).sort((a, b) => a - b);
    let result = [];

    hourlyData.forEach(hourDate => {
      const hourTs = hourDate.getTime();
      let before = null, after = null;

      for (let j = 0; j < keys.length; j++) {
        if (keys[j] <= hourTs) before = keys[j];
        if (keys[j] > hourTs) {
          after = keys[j];
          break;
        }
      }

      if (!before && !after) return;

      let forecast;
      if (before && after) {
        const t = (hourTs - before) / (after - before);
        const beforeF = forecastMap.get(before);
        const afterF = forecastMap.get(after);
        const temp = lerp(beforeF.main.temp, afterF.main.temp, t);
        const humidity = lerp(beforeF.main.humidity, afterF.main.humidity, t);
        const wind = lerp(beforeF.wind.speed, afterF.wind.speed, t);
        const icon = t < 0.5 ? beforeF.weather[0].icon : afterF.weather[0].icon;
        const desc = t < 0.5 ? beforeF.weather[0].description : afterF.weather[0].description;

        forecast = {
          date: hourDate,
          temp,
          humidity,
          wind,
          icon,
          description: desc
        };
      } else {
        const f = forecastMap.get(before || after);
        forecast = {
          date: hourDate,
          temp: f.main.temp,
          humidity: f.main.humidity,
          wind: f.wind.speed,
          icon: f.weather[0].icon,
          description: f.weather[0].description
        };
      }

      result.push(forecast);
    });

    // Fetch air quality once (lat/lon from city)
    const lat = data.city.coord.lat;
    const lon = data.city.coord.lon;
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let airQuality = 'Unknown';
    try {
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        const aqi = aqiData.list[0].main.aqi;
        airQuality = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1];
      }
    } catch {
      airQuality = 'N/A';
    }

    // Render HTML
    let html = `<h2>Hourly Forecast for ${data.city.name}</h2>`;
    html += `<div class="hourly-forecast">`;
    result.forEach(entry => {
      const timeStr = formatHour(entry.date);
      html += `
        <div class="hour-block">
          <div class="time">${timeStr}</div>
          <img class="weather-icon" src="https://openweathermap.org/img/wn/${entry.icon}@2x.png" alt="${entry.description}" />
          <div class="temp">${entry.temp.toFixed(1)}°C</div>
          <div class="desc">${entry.description}</div>
          <div class="info-row">
            <h4><img class="inline-icon" src="humidity.png" alt="Humidity" /> Humidity: ${entry.humidity.toFixed(0)}%</h4>
          </div>
          <div class="info-row">
            <h4><img class="inline-icon" src="wind.png" alt="Wind" /> Wind: ${entry.wind.toFixed(1)} m/s</h4>
          </div>
          <div class="info-row">
            <h4><img class="inline-icon" src="Air Quality.png" alt="Air Quality" /> Air Quality: ${airQuality}</h4>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    weatherResult.innerHTML = html;

  } catch (err) {
    weatherResult.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    console.error(err);
  }
}
