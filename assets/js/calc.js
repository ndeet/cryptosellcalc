"use strict";
var settings = document.querySelector('.settings');
var fluffyPreset = document.getElementById('fluffy-preset');
var results = document.querySelector('.results');
settings.addEventListener('submit', process);
fluffyPreset.addEventListener('click', loadFluffyStrategy);
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
    clearResults();
    for (var i = 1; i <= number_sells; i++) {
        sell_amount = sellAmount(balance, sell_percent);
        earnings = sell_amount * coin_price;
        total_sum = updateTotal(total_sum, sell_amount, coin_price);
        balance = balance - sell_amount;
        if (i > 1) {
            coin_price = coin_price * sell_trigger_factor;
        }
        insertResultsRow(sell_amount, coin_price, earnings, total_sum, balance);
    }
    updateResultTotal(total_sum);
    updateFundsLeft(balance);
    updateRemainingEarnings(balance, coin_price);
}
function clearResults() {
    results.innerHTML = '';
}
function updateResultTotal(total) {
    var sum = document.getElementById('total-sum');
    sum.innerText = fiat.format(total);
}
function updateFundsLeft(funds_left) {
    var funds = document.getElementById('total-funds');
    funds.innerText = crypto_full.format(funds_left);
}
function updateRemainingEarnings(funds_left, coin_price) {
    var remaining_earnings = document.getElementById('remaining-earnings');
    remaining_earnings.innerText = fiat.format(funds_left * coin_price) + " (@" + fiat.format(coin_price) + ")";
}
function insertResultsRow(sell_amount, coin_price, earnings, total_sum, remaining_funds) {
    var row = document.createElement('tr');
    row.innerHTML = "\n            <td>\n                " + crypto_short.format(sell_amount) + "\n            </td>\n            <td>\n                " + fiat.format(coin_price) + "\n            </td>\n            <td>\n                " + fiat.format(earnings) + "\n            </td> \n            <td>\n                " + fiat.format(total_sum) + "\n            </td>\n            <td>\n                " + crypto_short.format(remaining_funds) + "\n            </td>\n        ";
    results.appendChild(row);
}
function sellAmount(coin_balance, sell_factor) {
    return coin_balance / 100 * sell_factor;
}
function updateTotal(total, sell_amount, coin_price) {
    return total + (sell_amount * coin_price);
}
function loadFluffyStrategy(e) {
    e.preventDefault();
    document.getElementsByName('sell_percent').item(0).value = "5";
    document.getElementsByName('sell_trigger_factor').item(0).value = "2";
    window.scrollTo(0, 0);
}
var fiat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
var crypto_short = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
});
var crypto_full = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
});
