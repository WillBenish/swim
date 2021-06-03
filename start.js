const app = require('./server/server.js');


const server = app.listen(7777, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
