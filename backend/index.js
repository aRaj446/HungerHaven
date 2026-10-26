require('dotenv').config()

const express = require('express')
const connectToMongo = require('./db')

const app = express()
const port = process.env.PORT || 5000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', clientOrigin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, auth-token'
  );
  next();
});
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', require('./Routes/Auth'));

connectToMongo()
  .then(({ foodData, foodCategory }) => {
    global.foodData = foodData;
    global.foodCategory = foodCategory;

    app.listen(port, () => {
      console.log(`Example app listening on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
