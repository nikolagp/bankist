'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-01-11T17:01:17.194Z',
    '2022-01-14T20:00:17.929Z',
    '2022-01-15T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// FUNCTIONS
// Set timer on login / logout
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call print the remain time to UI
    labelTimer.textContent = `${min}:${sec}`;
    // When 0 sec, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      //Show the app window
      containerApp.style.opacity = 0;
    }
    // Decrease it
    time--;
  };
  // Set the time to 5 min
  let time = 300;
  // Call the timer every sec
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Format currency
const formatedCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
// Format date
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = `${date.getFullYear()}`;
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// Display Movements
// Iteration throught the movements //
const displayMovements = function (acc) {
  // Clean the default values in the container
  containerMovements.innerHTML = '';
  // Iterate through the movements
  acc.movements.forEach(function (mov, i) {
    // Select the type of movement
    let type = mov > 0 ? 'deposit' : 'withdrawal';
    //Add date to each movement
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Create the html to be displayed along with the type and the movement
    const formatedMov = formatedCurrency(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value"> ${formatedMov}</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calculating and Display Balance
const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, cur) => acc + cur);
  acc.balance = balance;
  const formatedMov = new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(balance);
  labelBalance.textContent = formatedCurrency(
    balance,
    acc.locale,
    acc.currency
  );
};

// Calculating and Display Summary
const calcDisplaySummary = function (acc) {
  const movements = acc.movements;
  const summaryIn = movements
    .filter(mov => mov > 0)
    .reduce(function (mov, acc) {
      return mov + acc;
    }, 0);
  labelSumIn.textContent = formatedCurrency(
    summaryIn,
    acc.locale,
    acc.currency
  );

  const summaryOut = movements
    .filter(mov => mov < 0)
    .reduce(function (mov, acc) {
      return mov + acc;
    }, 0);
  labelSumOut.textContent = formatedCurrency(
    Math.abs(summaryOut),
    acc.locale,
    acc.currency
  );

  const bankInterest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * currentAccount.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((deposit, interest) => deposit + interest, 0);
  labelSumInterest.textContent = formatedCurrency(
    bankInterest,
    acc.locale,
    acc.currency
  );
};
// Update UI functions in one
const updateUI = function (currAcc) {
  //Display Movements
  displayMovements(currAcc);
  //Display Balance
  calcDisplayBalance(currAcc);
  //Display Summary
  calcDisplaySummary(currAcc);
};
// Create abbreviations from the names and adding username to the object //

// Iterate through the accounts array
const userNameAbbr = function (accs) {
  // Adding username to each account
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
userNameAbbr(accounts);

// Event Handlers

// = Login Users
let currentAccount, timer;

// // FAKE always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(function (acc) {
    return acc.username === inputLoginUsername.value;
  });
  // console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log('Logged In');
    // Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    //Show the app window
    containerApp.style.opacity = '1';
    // Create Date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = `${now.getFullYear()}`;
    // const hours = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // const seconds = `${now.getSeconds()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;

    // Clear inputs and mouse courser
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }
  // // Every second row - different color
  // [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
  //   if (i % 2 === 0) {
  //     row.style.backgroundColor = 'whitesmoke';
  //   }
  // });
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    console.log('Transfer Valid');

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
    updateUI(currentAccount);
  }

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferTo.blur();
  console.log(amount, receiverAcc);
});

// = Delete account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // Delete account
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = '0';
    //Clear welcome message
    labelWelcome.textContent = 'Log in to get started';
    //Clear the input fields
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

// Request loan btn
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date());
      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

// Sort btn
let order = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount.movements.sort(function (a, b) {
    return order ? a - b : b - a;
  });
  order = !order;
  displayMovements(currentAccount);
  // console.log(contacts);

  // if(currentAccount.movements.sort === )
});

// Filter deposits and withdrawals
// const filteredMovements = function (accs) {
//   accs.forEach(function (acc) {
//     acc.deposits = acc.movements.filter(mov => mov > 0);
//     acc.withdrawals = acc.movements.filter(mov => mov < 0);
//   });
// };
// filteredMovements(accounts);

// Balance for each account
// const balance = function (accs) {
//   accs.forEach(function (acc) {
//     acc.balance = acc.movements.reduce(function (
//       accumulator,
//       currentValue,
//       index
//     ) {
//       return accumulator + currentValue;
//     },
//     0);
//     labelBalance.textContent = `${acc.balance} EUR`;
//   });
// };
// balance(accounts);

//////////////////// LECTURES ///////////////////////////
