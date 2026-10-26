const mongoose = require('mongoose')

const mongoURI = process.env.MONGO_URI

module.exports = async function connectToMongo() {
    if (!mongoURI) {
        throw new Error('MONGO_URI is not set. Please define it in backend/.env')
    }

    mongoose.set('strictQuery', false)
    await mongoose.connect(mongoURI)
    console.log('Connected to MongoDB')

    const foodCollection = mongoose.connection.db.collection('food_items')
    const categoryCollection = mongoose.connection.db.collection('foodCategory')

    const [foodData, foodCategory] = await Promise.all([
        foodCollection.find({}).toArray(),
        categoryCollection.find({}).toArray()
    ])

    return { foodData, foodCategory }
};
