"use strict";

document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);

const settings = document.querySelector('.settings');
const fluffyPreset = document.getElementById('fluffy-preset');
const results = document.querySelector('.results');
settings.addEventListener('submit', process);
fluffyPreset.addEventListener('click', loadFluffyStrategy);

/**
 * Ensures the whole JS is loaded before it is executed.
 *
 * @param {Event} e
 */
function theDomHasLoaded(e: Event) {
    runSettingsFromUrl();
}

/**
 * Handle the submit and process all input data.
 *
 * @param {Event} e
 */
function process(e: Event) {
    e.preventDefault();

    let balance = parseFloat((<HTMLInputElement>document.getElementsByName('balance').item(0)).value);
    const sell_percent = parseFloat((<HTMLInputElement>document.getElementsByName('sell_percent').item(0)).value);
    const sell_trigger_factor = parseFloat((<HTMLInputElement>document.getElementsByName('sell_trigger_factor').item(0)).value);
    let coin_price = parseFloat((<HTMLInputElement>document.getElementsByName('coin_price').item(0)).value);
    const number_sells = parseInt((<HTMLInputElement>document.getElementsByName('number_sells').item(0)).value);

    // Abort if number_sells is greater 500 to avoid DOSing user browser resources and it makes barely sense anyway.
    if (number_sells > 500) {
        alert("It barely makes sense to run more than 500 calculations. Script stopped to not needlesly drain your device ressources. Please reduce the value for 'Number of sells/results to print'");
        return;
    }

    let sell_amount = 0.0;
    let earnings = 0.0;
    let total_sum = 0.0;

    // Clear results from any previous run.
    clearResults();

    // Calculate results.
    for (let i = 1; i <= number_sells; i++) {
        sell_amount = sellAmount(balance, sell_percent);
        earnings = sell_amount * coin_price;
        total_sum = updateTotal(total_sum, sell_amount, coin_price);
        // Update balance.
        balance = balance - sell_amount;
        // Update coin price (only after first run)
        if (i > 1) {
            coin_price = coin_price * sell_trigger_factor;
        }

        // Insert into DOM.
        insertResultsRow(sell_amount, coin_price, earnings, total_sum, balance);
    }

    // Update total sum and funds remaining.
    updateResultTotal(total_sum);
    updateFundsLeft(balance);
    updateRemainingEarnings(balance, coin_price);
}

/**
 * Clears the results table.
 */
function clearResults() {
    results.innerHTML = '';
}

/**
 * Update the results total in the DOM.
 *
 * @param {number} total
 *   Sum of fiat of accumulated sells.
 */
function updateResultTotal(total: number) {
    let sum = document.getElementById('total-sum');
    sum.innerText = fiat.format(total);
}

/**
 * Update the crypto funds remaining in the DOM.
 *
 * @param {number} funds_left
 *   Sum of cryptocurrency remaining after sells.
 */
function updateFundsLeft(funds_left: number) {
    let funds = document.getElementById('total-funds');
    funds.innerText = crypto_full.format(funds_left);
}

/**
 * Update the remaining possible earnings at current rate in the DOM.
 *
 * @param {number} funds_left
 * @param {number} coin_price
 */
function updateRemainingEarnings(funds_left: number, coin_price: number) {
    let remaining_earnings = document.getElementById('remaining-earnings');
    remaining_earnings.innerText = `${fiat.format(funds_left * coin_price)} (@${fiat.format(coin_price)})`;
}

/**
 * Inserts calculated data into the DOM table.
 *
 * @param {number} sell_amount
 * @param {number} coin_price
 * @param {number} earnings
 * @param {number} total_sum
 * @param {number} remaining_funds
 */
function insertResultsRow(sell_amount: number, coin_price: number, earnings: number, total_sum: number, remaining_funds: number) {
    let row = document.createElement('tr');
    row.innerHTML = `
            <td>
                ${crypto_short.format(sell_amount)}
            </td>
            <td>
                ${fiat.format(coin_price)}
            </td>
            <td>
                ${fiat.format(earnings)}
            </td> 
            <td>
                ${fiat.format(total_sum)}
            </td>
            <td>
                ${crypto_short.format(remaining_funds)}
            </td>
        `;

    results.appendChild(row);
}

/**
 * Calculate the sell amount depending on the funds and sell factor.
 *
 * @param {number} coin_balance
 * @param {number} sell_factor
 * @returns {number}
 */
function sellAmount(coin_balance: number, sell_factor: number) {
    return coin_balance / 100 * sell_factor;
}

/**
 * Calculate accumulate sum of sell.
 *
 * @param {number} total
 * @param {number} sell_amount
 * @param {number} coin_price
 * @returns {number}
 */
function updateTotal(total: number, sell_amount: number, coin_price: number) {
    return total + (sell_amount * coin_price);
}

function loadFluffyStrategy(e: Event) {
    e.preventDefault();
    (<HTMLInputElement>document.getElementsByName('sell_percent').item(0)).value = "5";
    (<HTMLInputElement>document.getElementsByName('sell_trigger_factor').item(0)).value = "2";
    window.scrollTo(0,0);
}

/**
 * Check if there is a preset appended to the url as a query parameter, prefill settings form and trigger calculation.
 *
 * Format: ?FUNDS-PRICE-PERCENT_SELL-FACTOR-RESULTS
 * Example: https://domain.tld/?5:12000:10:1.5:15
 *
 * This results in the following preset sett
 * Crypto funds at start: 5
 * Price at first sell: 12000
 * % of funds to sell: 10
 * Factor to trigger a sell: 1.5
 * Number of sells/results to print: 15
 */
function runSettingsFromUrl(): void {
    const url = window.location.href;
    const urlParts = url.split("?");
    // If we have no query params we about and return.
    if (urlParts[1] === undefined || urlParts[1] === '') {
        return;
    }

    const values = urlParts[1].split(':').map(Number);

    // Only continue if the query contained all 5 segments.
    if (values.length !== 5) {
        return;
    }

    if (updateSettings(values)) {
        // Calculate results right away.
        document.getElementById("calculateResultsButton").click();
    }
}

/**
 * Updates the DOM settings form with new values.
 *
 * @param {Array<number>} settings
 * @returns {boolean}
 */
function updateSettings(settings: Array<number>): boolean {
    (<HTMLInputElement>document.getElementsByName('balance').item(0)).value = settings[0].toString();
    (<HTMLInputElement>document.getElementsByName('coin_price').item(0)).value = settings[1].toString();
    (<HTMLInputElement>document.getElementsByName('sell_percent').item(0)).value = settings[2].toString();
    (<HTMLInputElement>document.getElementsByName('sell_trigger_factor').item(0)).value = settings[3].toString();
    (<HTMLInputElement>document.getElementsByName('number_sells').item(0)).value = settings[4].toString();

    return true;
}

// Fiat currency formatter.
const fiat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// Cryptocurrency short formatter.
const crypto_short = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
});

// Cryptocurrency full formatter.
const crypto_full = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
});

