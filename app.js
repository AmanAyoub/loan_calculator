const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3005;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

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
  return HTML_START + `<table><tbody><tr><th>Amount:</th><td>$${amount}</td>
          </tr><tr><th>Duration:</th><td>${duration} years</td></tr>
          <tr><th>APR:</th><td>${APR}%</td></tr><tr><th>Monthly payment:</th>
          <td>$${paymentPerMonth}</td></tr></tbody></table>` + HTML_END;
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url
  let content = createLoanOffer(getParams(path));

  if (path === '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(content);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listeing on port ${PORT}...`);
});