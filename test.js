const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$10$tmV7othinbXhS9gfYM7yduy19f6LIQd5kd/ZM8d8a.rNpZel8fPya';

bcrypt.compare(password, hash, (err, result) => {
    console.log(result); // true ya false
});


// // const bcrypt = require('bcrypt');

// // const password = 'admin123';
// // const saltRounds = 10;

// // bcrypt.hash(password, saltRounds, (err, hash) => {
// //   if (err) {
// //     console.error(err);
// //     return;
// //   }

// //   console.log(hash);
// // });


