document.addEventListener('DOMContentLoaded', () => {
    // Get references to various DOM elements
    const baseCurrencySelect = document.getElementById('base-currency'); // Dropdown for selecting the base currency
    const targetCurrencySelect = document.getElementById('target-currency'); // Dropdown for selecting the target currency
    const amountInput = document.getElementById('amount'); // Input field for the amount to convert
    const convertedAmountDisplay = document.getElementById('converted-amount'); // Element to display the converted amount
    const convertButton = document.getElementById('convert'); // Button to trigger the conversion
    const historicalDateInput = document.getElementById('historical-date'); // Input field for selecting a historical date
    const historicalRatesButton = document.getElementById('historical-rates'); // Button to fetch historical rates
    const historicalRatesContainer = document.getElementById('historical-rates-container'); // Element to display historical rates
    const saveFavoriteButton = document.getElementById('save-favorite'); // Button to save the current currency pair as a favorite
    const clearFavoritesButton = document.getElementById('clear-favorites'); // Button to clear all saved favorite currency pairs
    const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs'); // Container to display favorite currency pairs
    
    // Define API key and base URL for currency API
    const apiKey = 'fca_live_WSA9TWXvazZjVhTkpLqnvUY8rnl5ekqmFtfDKo3v';
    const apiBaseURL = 'https://api.freecurrencyapi.com/v1';

    // Set up headers for the API request
    const myHeaders = new Headers();
    myHeaders.append("apikey", apiKey); // Append the API key to headers

    const requestOptions = {
        method: 'GET', // HTTP GET method
        redirect: 'follow', // Follow redirects automatically
        headers: myHeaders // Use the headers defined above
    };

    // Fetch available currencies and populate the select options
    const fetchCurrencies = async () => {
        try {
            const response = await fetch(`${apiBaseURL}/currencies?apikey=${apiKey}`, requestOptions); // Fetch the list of currencies from the API
            const data = await response.json(); // Parse the JSON response
            populateCurrencyOptions(data.data); // Populate the dropdowns with currency options
        } catch (error) {
            console.error('Error fetching currency data:', error); // Log any errors
        }
    };

    // Populate the currency select elements with options
    const populateCurrencyOptions = (currencies) => {
        Object.keys(currencies).forEach(currency => {
            const option1 = document.createElement('option'); // Create an option element for the base currency dropdown
            option1.value = currency;
            option1.textContent = currency;
            baseCurrencySelect.appendChild(option1); // Append the option to the base currency dropdown

            const option2 = document.createElement('option'); // Create an option element for the target currency dropdown
            option2.value = currency;
            option2.textContent = currency;
            targetCurrencySelect.appendChild(option2); // Append the option to the target currency dropdown
        });
    };

    // Convert currency using the API and display the result
    const convertCurrency = async () => {
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency
        const amount = parseFloat(amountInput.value); // Get and parse the input amount

        if (isNaN(amount) || amount <= 0) { // Check if the input amount is valid
            alert('Please enter a valid amount'); // Show an alert if the amount is invalid
            return;
        }

        try {
            const response = await fetch(`${apiBaseURL}/latest?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}`, requestOptions); // Fetch the latest conversion rate from the API
            const data = await response.json(); // Parse the JSON response
            const rate = data.data[targetCurrency]; // Get the conversion rate for the target currency
            const convertedAmount = (amount * rate).toFixed(2); // Calculate the converted amount and format it to 2 decimal places
            convertedAmountDisplay.textContent = `${convertedAmount} ${targetCurrency}`; // Display the converted amount
        } catch (error) {
            console.error('Error fetching exchange rate data:', error); // Log any errors
        }
    };

    // Fetch historical rates and display the result
    const fetchHistoricalRates = async () => {
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency
        const amount = parseFloat(amountInput.value); // Get and parse the input amount
        const date = historicalDateInput.value;  // Get the selected date

        if (!date) { // Check if a date is selected
            alert('Please select a date'); // Show an alert if no date is selected
            return;
        }

        try {
            const response = await fetch(`${apiBaseURL}/historical?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`, requestOptions); // Fetch historical rates from the API
            const data = await response.json(); // Parse the JSON response
            if (data.data[date] && data.data[date][targetCurrency]) { // Check if historical data is available for the selected date and currencies
                const rate = data.data[date][targetCurrency]; // Get the historical conversion rate
                const historicalAmount = (amount * rate).toFixed(2); // Calculate the historical converted amount
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: ${amount} ${baseCurrency} = ${historicalAmount} ${targetCurrency}`; // Display the historical rate
            } else {
                historicalRatesContainer.textContent = `No historical data available for ${baseCurrency} to ${targetCurrency} on ${date}`; // Display a message if no data is available
            }
        } catch (error) {
            console.error('Error fetching historical exchange rate data:', error); // Log any errors
        }
    };

    // Save the selected currency pair as a favorite
    const saveFavoritePair = async () => {
        const baseCurrency = baseCurrencySelect.value; // Get the selected base currency
        const targetCurrency = targetCurrencySelect.value; // Get the selected target currency
        const favoritePair = { baseCurrency, targetCurrency }; // Create an object for the favorite pair

        try {
            const response = await fetch('/api/favorites', {
                method: 'POST', // HTTP POST method
                headers: {
                    'Content-Type': 'application/json' // Set the content type to JSON
                },
                body: JSON.stringify(favoritePair) // Send the favorite pair data as JSON
            });
            const newFavorite = await response.json(); // Parse the JSON response
            displayFavoritePairs(); // Refresh the display of favorite pairs
        } catch (error) {
            console.error('Error saving favorite pair:', error); // Log any errors
        }
    };

    // Clear all favorite currency pairs
    const clearFavoritePairs = async () => {
        try {
            await fetch('/api/favorites', {
                method: 'DELETE' // HTTP DELETE method to clear all favorites
            });
            displayFavoritePairs(); // Refresh the display of favorite pairs
        } catch (error) {
            console.error('Error clearing favorite pairs:', error); // Log any errors
        }
    };

    // Display the saved favorite currency pairs
    const displayFavoritePairs = async () => {
        favoriteCurrencyPairsContainer.innerHTML = ''; // Clear the current display
        try {
            const response = await fetch('/api/favorites'); // Fetch the saved favorite pairs from the server
            const favoritePairs = await response.json(); // Parse the JSON response
            favoritePairs.forEach(pair => {
                const pairButton = document.createElement('button'); // Create a button for each favorite pair
                pairButton.textContent = `${pair.baseCurrency}/${pair.targetCurrency}`; // Set the button text
                pairButton.addEventListener('click', () => {
                    baseCurrencySelect.value = pair.baseCurrency; // Set the base currency select to the favorite base currency
                    targetCurrencySelect.value = pair.targetCurrency; // Set the target currency select to the favorite target currency
                    convertCurrency(); // Convert the currency
                });
                favoriteCurrencyPairsContainer.appendChild(pairButton); // Add the button to the container
            });
        } catch (error) {
            console.error('Error fetching favorite pairs:', error); // Log any errors
        }
    };

    // Add event listeners to buttons
    convertButton.addEventListener('click', convertCurrency); // Add click event listener to the convert button
    historicalRatesButton.addEventListener('click', fetchHistoricalRates); // Add click event listener to the historical rates button
    saveFavoriteButton.addEventListener('click', saveFavoritePair); // Add click event listener to the save favorite button
    clearFavoritesButton.addEventListener('click', clearFavoritePairs); // Add click event listener to the clear favorites button

    // Fetch and display initial data
    fetchCurrencies(); // Fetch and populate currency options
    displayFavoritePairs(); // Display saved favorite pairs
});
