"use strict";
var settings = document.querySelector('.settings');
var results = document.querySelector('.results');
settings.addEventListener('submit', process);
/**
 * Handle the submit and process all input data.
 *
 * @param {Event} e
 */
function process(e) {
    e.preventDefault();
    var balance = parseFloat(document.getElementsByName('balance').item(0).value);
    var sell_percent = parseFloat(document.getElementsByName('sell_percent').item(0).value);
    var sell_trigger_factor = parseFloat(document.getElementsByName('sell_trigger_factor').item(0).value);
    var coin_price = parseFloat(document.getElementsByName('coin_price').item(0).value);
    var number_sells = parseInt(document.getElementsByName('number_sells').item(0).value);
    var sell_amount = 0.0;
    var earnings = 0.0;
    var total_sum = 0.0;
    // Clear results from any previous run.
    clearResults();
    // Calculate results.
    for (var i = 1; i <= number_sells; i++) {
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
function updateResultTotal(total) {
    var sum = document.getElementById('total-sum');
    sum.innerText = fiat.format(total);
}
/**
 * Update the crypto funds remaining in the DOM.
 *
 * @param {number} funds_left
 *   Sum of cryptocurrency remaining after sells.
 */
function updateFundsLeft(funds_left) {
    var funds = document.getElementById('total-funds');
    funds.innerText = crypto_full.format(funds_left);
}
/**
 * Update the remaining possible earnings at current rate in the DOM.
 *
 * @param {number} funds_left
 * @param {number} coin_price
 */
function updateRemainingEarnings(funds_left, coin_price) {
    var remaining_earnings = document.getElementById('remaining-earnings');
    remaining_earnings.innerText = fiat.format(funds_left * coin_price) + " (@" + fiat.format(coin_price) + ")";
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
function insertResultsRow(sell_amount, coin_price, earnings, total_sum, remaining_funds) {
    var row = document.createElement('tr');
    row.innerHTML = "\n            <td>\n                " + crypto_short.format(sell_amount) + "\n            </td>\n            <td>\n                " + fiat.format(coin_price) + "\n            </td>\n            <td>\n                " + fiat.format(earnings) + "\n            </td> \n            <td>\n                " + fiat.format(total_sum) + "\n            </td>\n            <td>\n                " + crypto_short.format(remaining_funds) + "\n            </td>\n        ";
    results.appendChild(row);
}
/**
 * Calculate the sell amount depending on the funds and sell factor.
 *
 * @param {number} coin_balance
 * @param {number} sell_factor
 * @returns {number}
 */
function sellAmount(coin_balance, sell_factor) {
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
function updateTotal(total, sell_amount, coin_price) {
    return total + (sell_amount * coin_price);
}
// Fiat currency formatter.
var fiat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
// Cryptocurrency short formatter.
var crypto_short = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
});
// Cryptocurrency full formatter.
var crypto_full = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
});
