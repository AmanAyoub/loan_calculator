const HTTP = require('http');
const URL = require('url').URL;
const PATH = require('path');
const PORT = 3005;
const HANDLEBARS = require('handlebars');
const FS = require('fs');
const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const APR = 5;

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{amountDecrement}}&duration={{duration}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/loan-offer?amount={{amountIncrement}}&duration={{duration}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{payment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_FORM_SOURCE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="get">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" id="amount" value="">
        <label for="duration">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" id="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>
`;

const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE)
const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);

function render(template, data) {
  let html = template(data);
  return html;
}

function getParams(path) {
  let myURL = new URL(path, `http://localhost:${PORT}`);
  return {
    amount: Number(myURL.searchParams.get('amount')),
    duration: Number(myURL.searchParams.get('duration'))
  }
}

function getPathname(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.pathname;
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
  let data = {};

  data.amount = params.amount;
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.duration = params.duration;
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.apr = APR;
  data.payment = monthlyPayment(data.amount, data.duration, APR);

  return data;
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;
  let pathname = getPathname(path);
  let fileExtention = PATH.extname(path);

  FS.readFile(`./public/${pathname}`, (err, data) => {
    if (data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', `${MIME_TYPES[fileExtention]}`);
      res.write(`${data}\n`);
      res.end();
    } else {
      if (pathname === '/') {
        let content = render(LOAN_FORM_TEMPLATE, {apr: APR});

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else if (pathname === '/loan-offer') {
        let data = createLoanOffer(getParams(path));
        let content = render(LOAN_OFFER_TEMPLATE, data);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(`${content}\n`);
        res.end();
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  });
  

});

SERVER.listen(PORT, () => {
  console.log(`Server listeing on port ${PORT}...`);
});