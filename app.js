const HTTP = require('http');
const URL = require('url').URL;
const PORT = 3005;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 1.5rem;
      }
      th {
        text-align: right;
      }
      td {
        text-align: center;
      }
      th,
      td {
        padding: 0.5rem;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
`;


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
  let payment = amount *
                  (monthlyInterestRate /
                  (1 - Math.pow((1 + monthlyInterestRate), (-Number(months)))));
    
  if (!payment || payment === Infinity || payment === -Infinity) {
    return '0.00';
  }

  return payment.toFixed(2);
}

function createLoanOffer(params) {
  const APR = 5;
  let { amount, duration } = params;
  amount = !amount ? 0 : amount;
  duration = !duration ? 0 : duration;
  let paymentPerMonth = monthlyPayment(amount, duration, APR);

  let content = `<tr>
                  <th>Amount:</th>
                    <td>
                      <a href='/?amount=${amount - 100}&duration=${duration}'>- $100</a>
                    </td>
                    <td>$${amount}</td>
                    <td>
                      <a href='/?amount=${amount + 100}&duration=${duration}'>+ $100</a>
                    </td>
                  </tr>
                  <tr>
                    <th>Duration:</th>
                    <td>
                      <a href='/?amount=${amount}&duration=${duration - 1}'>- 1 year</a>
                    </td>
                    <td>${duration} years</td>
                    <td>
                      <a href='/?amount=${amount}&duration=${duration + 1}'>+ 1 year</a>
                    </td>
                  </tr>
                  <tr>
                    <th>APR:</th>
                    <td colspan='3'>${APR}%</td>
                  </tr>
                  <tr>
                    <th>Monthly payment:</th>
                    <td colspan='3'>$${paymentPerMonth}</td>
                  </tr>`;

  return HTML_START + content + HTML_END;
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