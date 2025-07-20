const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3005;
const APR = 5;

function getParams(path) {
  let myURL = new URL(path, `http://localhost:${PORT}`);
  return {
    amount: Number(myURL.searchParams.get('amount')),
    duration: Number(myURL.searchParams.get('duration'))
  }
}

function monthlyPayment(amount, duration, interestRate) {
  let annualInterestRate = interestRate / 100;
  let monthlyInterestRate = annualInterestRate / 12;
  let months = duration * 12;
  let monthlyPayment = amount *
                  (monthlyInterestRate /
                  (1 - Math.pow((1 + monthlyInterestRate), (-Number(months)))));
  return monthlyPayment.toFixed(2);
}

function createLoanOffer(params) {
  const APR = 5;
  let { amount, duration } = params;
  let paymentPerMonth = monthlyPayment(amount, duration, APR);
  return `Amount: $${amount}\nDuration: $${duration} years\nAPR: ${APR}%\nMonthly Payment: $${paymentPerMonth}`
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url
  let content = createLoanOffer(getParams(path));

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(content);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listeing on port ${PORT}...`);
});