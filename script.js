document.addEventListener('DOMContentLoaded', () => {
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const convertButton = document.getElementById('convert');
    const historicalDateInput = document.getElementById('historical-date'); 
    const historicalRatesButton = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const clearFavoritesButton = document.getElementById('clear-favorites');
    const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');
    const apiKey = 'fca_live_WSA9TWXvazZjVhTkpLqnvUY8rnl5ekqmFtfDKo3v';
    const apiBaseURL = 'https://api.freecurrencyapi.com/v1';

    const myHeaders = new Headers();
    myHeaders.append("apikey", apiKey);

    const requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: myHeaders
    };

    const fetchCurrencies = async () => {
        try {
            const response = await fetch(`${apiBaseURL}/currencies?apikey=${apiKey}`, requestOptions);
            const data = await response.json();
            populateCurrencyOptions(data.data);
        } catch (error) {
            console.error('Error fetching currency data:', error);
        }
    };

    const populateCurrencyOptions = (currencies) => {
        Object.keys(currencies).forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            baseCurrencySelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            targetCurrencySelect.appendChild(option2);
        });
    };

    const convertCurrency = async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`${apiBaseURL}/latest?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}`, requestOptions);
            const data = await response.json();
            const rate = data.data[targetCurrency];
            const convertedAmount = (amount * rate).toFixed(2);
            convertedAmountDisplay.textContent = `${convertedAmount} ${targetCurrency}`;
        } catch (error) {
            console.error('Error fetching exchange rate data:', error);
        }
    };

    const fetchHistoricalRates = async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);
        const date = historicalDateInput.value;  // Get the selected date

        if (!date) {
            alert('Please select a date');
            return;
        }

        try {
            const response = await fetch(`${apiBaseURL}/historical?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`, requestOptions);
            const data = await response.json();
            if (data.data[date] && data.data[date][targetCurrency]) {
                const rate = data.data[date][targetCurrency];
                const historicalAmount = (amount * rate).toFixed(2);
                historicalRatesContainer.textContent = `Historical exchange rate on ${date}: ${amount} ${baseCurrency} = ${historicalAmount} ${targetCurrency}`;
            } else {
                historicalRatesContainer.textContent = `No historical data available for ${baseCurrency} to ${targetCurrency} on ${date}`;
            }
        } catch (error) {
            console.error('Error fetching historical exchange rate data:', error);
        }
    };

    const saveFavoritePair = async () => {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const favoritePair = { baseCurrency, targetCurrency };

        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(favoritePair)
            });
            const newFavorite = await response.json();
            displayFavoritePairs();
        } catch (error) {
            console.error('Error saving favorite pair:', error);
        }
    };

    const clearFavoritePairs = async () => { // New function to clear favorite pairs
        try {
            await fetch('/api/favorites', {
                method: 'DELETE'
            });
            displayFavoritePairs();
        } catch (error) {
            console.error('Error clearing favorite pairs:', error);
        }
    };

    const displayFavoritePairs = async () => {
        favoriteCurrencyPairsContainer.innerHTML = '';
        try {
            const response = await fetch('/api/favorites');
            const favoritePairs = await response.json();
            favoritePairs.forEach(pair => {
                const pairButton = document.createElement('button');
                pairButton.textContent = `${pair.baseCurrency}/${pair.targetCurrency}`;
                pairButton.addEventListener('click', () => {
                    baseCurrencySelect.value = pair.baseCurrency;
                    targetCurrencySelect.value = pair.targetCurrency;
                    convertCurrency();
                });
                favoriteCurrencyPairsContainer.appendChild(pairButton);
            });
        } catch (error) {
            console.error('Error fetching favorite pairs:', error);
        }
    };

    convertButton.addEventListener('click', convertCurrency);
    historicalRatesButton.addEventListener('click', fetchHistoricalRates);
    saveFavoriteButton.addEventListener('click', saveFavoritePair);
    clearFavoritesButton.addEventListener('click', clearFavoritePairs); 

    fetchCurrencies();
    displayFavoritePairs();
});
