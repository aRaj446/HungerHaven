const express = require('express')
const User = require('../models/User')
const Order = require('../models/Orders')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetchUser = require('../middleware/fetchdetails');

const jwtSecret = process.env.JWT_SECRET
const opencageApiKey = process.env.OPENCAGE_API_KEY

// Creating a user and storing data to MongoDB Atlas. No login required.
router.post('/createuser', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(400).json({ success: false, error: "An account with this email already exists." })
        }

        const salt = await bcrypt.genSalt(10)
        const securePass = await bcrypt.hash(req.body.password, salt);

        const user = await User.create({
            name: req.body.name,
            password: securePass,
            email: req.body.email,
            location: req.body.location
        })

        const data = { user: { id: user.id } }
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success: true, authToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, error: "Internal server error" })
    }
})

// Authenticate a user. No login required.
router.post('/login', [
    body('email', "Enter a Valid Email").isEmail(),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: "Try logging in with correct credentials" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({ success: false, error: "Try logging in with correct credentials" });
        }

        const data = { user: { id: user.id } }
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success: true, authToken })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, error: "Internal server error" })
    }
})

// Get logged in user details. Login required.
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password") // exclude password from result
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Reverse geocode lat/long into a human readable address. No login required.
router.post('/getlocation', async (req, res) => {
    try {
        const { lat, long } = req.body.latlong || {}
        if (lat === undefined || long === undefined) {
            return res.status(400).json({ error: "latlong.lat and latlong.long are required" })
        }

        const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: {
                q: `${lat}+${long}`,
                key: opencageApiKey
            }
        })

        const components = response.data.results?.[0]?.components;
        if (!components) {
            return res.status(404).json({ error: "Unable to resolve location" })
        }

        const { village, county, state_district, state, postcode } = components
        const location = `${village || ''},${county || ''},${state_district || ''},${state || ''}\n${postcode || ''}`
        res.json({ location })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Return cached food catalog data.
router.post('/foodData', async (req, res) => {
    try {
        res.json([global.foodData, global.foodCategory])
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal server error" })
    }
})

// Append a new order to the user's order history, creating it if it doesn't exist yet.
router.post('/orderData', async (req, res) => {
    try {
        const { email, order_date } = req.body
        if (!email) {
            return res.status(400).json({ success: false, error: "email is required" })
        }

        const items = req.body.order_data || []
        // Each batch is stored as a [items[], orderDateString] tuple, matching what
        // the frontend (MyOrder.js) expects when reading order_data back out.
        const batch = [items, order_date]

        // findOneAndUpdate with upsert avoids the find-then-create/update race condition.
        await Order.findOneAndUpdate(
            { email },
            { $push: { order_data: batch } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        res.json({ success: true })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ success: false, error: "Internal server error" })
    }
})

// Fetch a user's full order history.
router.post('/myOrderData', async (req, res) => {
    try {
        const orderData = await Order.findOne({ email: req.body.email })
        res.json({ orderData })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Internal server error" })
    }
});

module.exports = router
