require("dotenv").config();

// API key and base URL for weather data
const apiKey = `${process.env.API_KEY}&units=imperial`;
const baseUrl = "https://api.openweathermap.org/data/2.5/weather";

// Regular expression patterns for ZIP codes in different countries
const zipCodePatterns = {
  US: /^\d{5}(-\d{4})?$/, // United States (5-digit or 5-digit+4 format)
  CA: /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/, // Canada (ANA NAN format)
  UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // United Kingdom (AA9A 9AA or A9A 9AA format)
  AU: /^\d{4}$/, // Australia (4-digit format)
  DE: /^\d{5}$/, // Germany (5-digit format)
  FR: /^\d{5}$/, // France (5-digit format)
  IN: /^\d{6}$/, // India (6-digit format)
  // Add more patterns for other countries as needed
};

// List of supported country codes
const countryCodes = ["US", "CA", "UK", "AU", "DE", "FR", "IN"];

// Function to fetch weather data from the API
const getWeatherData = async (zipCode, countryCode) => {
  try {
    // Validate the country code
    if (!validateCountryCode(countryCode)) {
      throw new Error(
        "Invalid country code. Please enter a valid country code."
      );
    }

    // Validate the ZIP code
    if (!validateZIPCode(zipCode, countryCode)) {
      throw new Error("Invalid ZIP code. Please enter a valid ZIP code.");
    }

    // Construct the API URL
    const url = `${baseUrl}?zip=${zipCode},${countryCode}&appid=${apiKey}`;

    // Fetch weather data from the API
    const response = await fetch(url);

    // Handle unsuccessful API response
    if (!response.ok) {
      throw new Error("Failed to fetch weather data. Please try again later.");
    }

    // Parse the response data as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Function to post data to the server
const postData = async (path, data) => {
  try {
    // Post data to the specified path
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: data.temperature,
        date: data.date,
        userResponse: data.feelings,
      }),
    });

    // Handle unsuccessful response
    if (!response.ok) {
      throw new Error("Failed to post data. Please try again later.");
    }

    // Parse the response data as JSON
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Function to update the UI with weather data
const updateUI = async () => {
  try {
    // Fetch data from the server
    const response = await fetch("/data");

    // Handle unsuccessful response
    if (!response.ok) {
      throw new Error("Failed to fetch data. Please try again later.");
    }

    // Parse the response data as JSON
    const data = await response.json();

    // Format the date
    const rawDate = new Date(data.date);
    const formattedDate = `${rawDate.getDate()} ${getMonthName(
      rawDate.getMonth()
    )} ${rawDate.getFullYear()}`;

    // Update the UI with weather data
    document.getElementById("date").textContent = formattedDate;
    document.getElementById("temp").textContent = `${Math.round(
      data.temperature
    )} °F`;
    document.getElementById("content").textContent = data.userResponse;

    const resultSection = document.querySelector(".result-section");
    resultSection.style.display = "block";
  } catch (error) {
    console.error(error);
    showError("Failed to update the UI. Please try again later.");
  }
};

// Helper function to get the month name
const getMonthName = (monthIndex) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
};

// Function to validate ZIP code
function validateZIPCode(zipCode, countryCode) {
  const pattern = zipCodePatterns[countryCode];
  if (!pattern) {
    return false; // Return false for unsupported country code
  }
  return pattern.test(zipCode);
}

// Function to validate country code
function validateCountryCode(countryCode) {
  return countryCodes.includes(countryCode);
}

// Event listener for the "Generate" button
document.getElementById("generate").addEventListener("click", async () => {
  try {
    // Get input values
    const zipCode = document.getElementById("zip").value;
    const countryCode = document.getElementById("country").value;
    const feelings = document.getElementById("feelings").value;

    // Validate input values
    if (!zipCode || !countryCode || !feelings) {
      throw new Error("Please fill in all the required fields.");
    }

    // Get weather data
    const weatherData = await getWeatherData(zipCode, countryCode);

    // Get the current date
    const date = new Date().toLocaleDateString();

    // Post data to the server
    await postData("/data", {
      temperature: weatherData.main.temp,
      date,
      feelings,
    });

    // Clear error message and update the UI
    document.getElementById("error").style.display = "none";
    updateUI();
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
});

// Function to display error message
function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}
