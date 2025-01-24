const express = require('express');
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cors = require('cors');
const port = process.env.PORT || 8080
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)



//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: Stripe } = require('stripe');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.blz8y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect(); xls



        //--------------------All Collection -------------------
        const userCollection = client.db('HealthRexStore').collection('users')
        const medicinesCollection = client.db('HealthRexStore').collection('medicines')
        const AddsCollection = client.db('HealthRexStore').collection('adds')
        const categoryCollection = client.db('HealthRexStore').collection('category')
        const cartsCollection = client.db('HealthRexStore').collection('carts')
        const paymentsCollection = client.db('HealthRexStore').collection('payments')

        const verfifyToken = async (req, res, next) => {
            // console.log(req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'forbidden access' })
            }
            const token = req?.headers?.authorization.split(' ')[1]

            jwt.verify(token, process.env.JSON_SECRET_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded
                next()
            })
        }

        const verfifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query)
            const isAdmin = user?.role === 'admin'
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden Access! Admin ony actions!' })
            }
            next()

        }
        const verfifySeller = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query)
            const isSeller = user?.role === 'seller'
            if (!isSeller) {
                return res.status(403).send({ message: 'forbidden Access! Admin ony actions!' })
            }
            next()
        }

        //1st Create Json token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JSON_SECRET_TOKEN, { expiresIn: '2h' })
            res.send({ token })
        })





        //------------------Manage user------------------
        //get user from userCollection 
        app.get('/users', verfifyToken, verfifyAdmin, async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        //Stored user in usersCollection
        app.post('/users', async (req, res) => {
            console.log(req.headers)
            const userInfo = req.body;
            const query = { email: userInfo?.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already added in data base', insertedId: null })
            }
            const result = await userCollection.insertOne(userInfo)
            res.send({ result })
        })
        app.patch('/user/role/:email', verfifyToken, verfifyAdmin, async (req, res) => {
            const email = req.params.email;
            const data = req.body;
            const query = { email: email }
            updateDoc = {
                $set: {
                    role: data.role
                }
            }
            const result = await userCollection.updateOne(query, updateDoc)
            res.send(result)
        })





        //-----------------Manage User Role -----------------
        app.get('/user/role/:email', verfifyToken, async (req, res) => {
            const email = req.params.email;
            const query = { email: email }

            //find the user


            const result = await userCollection.findOne(query)



            res.send({ role: result?.role })

        })



        //-------------------Manage Medicines------------------ 
        app.get('/medicines', async (req, res) => {
            const search = req?.query?.search || ''
            const sort = req?.query?.sort || 'ascending'
      
            const sortOrder = sort === 'ascending' ? 1 : -1 


            let query = {
                $or: [
                    {
                        itemName: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        genericName: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        company: {
                            $regex: search,
                            $options: 'i'
                        }
                    }
                ]
            }

            const result = await medicinesCollection.find(query).sort({ pricePerUnit: sortOrder }).toArray()
            res.send(result)
        })
        app.get('/discount-products', async (req, res) => {
            const result = await medicinesCollection.find({ discountPercentage: { $gt: "0" } }).toArray()
            res.send(result)
        })
        app.post('/invoice/medicine', verfifyToken, async (req, res) => {
            const ids = req.body;

            const query = {
                _id: {
                    $in: ids.map(id => new ObjectId(id))
                }
            }
            const result = await (await medicinesCollection.find(query).toArray()).sort()
            res.send(result)

        })
        //get medicines for seller 
        app.get('/seller/medicine/:email', verfifyToken, verfifySeller, async (req, res) => {
            const email = req.params.email;
            const search = req?.query?.search || ''
            let query = {
                $and: [
                    { email: email },
                    {
                        $or: [
                            {
                                itemName: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            },

                            {
                                company: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            }
                        ]
                    }
                ]
            }

            const result = await medicinesCollection.find(query).toArray()
            res.send(result)
        })
        //Add medicines by seller
        app.post('/medicines', verfifyToken, verfifySeller, async (req, res) => {
            const medicineInfo = req.body;
            const result = await medicinesCollection.insertOne(medicineInfo)
            res.send(result)
        })

        app.delete('/medicine/delete/:id', verfifyToken, verfifySeller, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await medicinesCollection.deleteOne(query)
            res.send(result)
        })



        //-----------------------Manage Adverticement-------------------
        app.post('/askAddverticement', verfifyToken, verfifySeller, async (req, res) => {
            const addInfo = req.body;
            const result = await AddsCollection.insertOne(addInfo)
            res.send(result)
        })
        app.get('/addvertisements', verfifyToken, async (req, res) => {
            const result = await AddsCollection.find().toArray()
            res.send(result)
        })
        app.get('/addvertise/success', async (req, res) => {
            const result = await AddsCollection.find({ status: 'success' }).toArray()
            res.send(result)
        })
        //get banner for login sellse
        app.get('/seller/adds/:email', verfifyToken, verfifySeller, async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await AddsCollection.find(query).toArray()
            res.send(result)
        })

        app.patch('/askAddverticement/status', verfifyToken, verfifyAdmin, async (req, res) => {

            const id = req.body.data._id;
            const status = req.body.status;

            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const result = await AddsCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        //---------------------Manage Category------------------
        app.get('/category', async (req, res) => {
            const result = await categoryCollection.find().toArray()
            res.send(result)
        })
        app.get('/categories/:category', async (req, res) => {
            const search = req?.query?.search || ''
            console.log(search);
            const { category } = req.params
            let query = {
                $and: [
                    { category: category },
                    {
                        $or: [
                            {
                                itemName: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            },
                            {
                                genericName: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            },
                            {
                                company: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            }
                        ]
                    }
                ]
            }

            const result = await medicinesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/categoryDetails', async (req, res) => {
            const result = await medicinesCollection.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }

                },
                {
                    $lookup: {
                        from: "category",
                        localField: "_id",
                        foreignField: "name",
                        as: "categoryDetails"
                    }

                },
                {

                    $unwind: "$categoryDetails"
                },
                {
                    $project: {
                        _id: 0,
                        category: '$_id',
                        image: "$categoryDetails.image",
                        count: 1
                    }
                }
            ]).toArray()
            res.send(result)
        })

        app.post('/category', verfifyToken, verfifyAdmin, async (req, res) => {
            const categoryInfo = req.body;
            const result = await categoryCollection.insertOne(categoryInfo)
            res.send(result)
        })

        app.delete('/category/:id', verfifyToken, verfifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await categoryCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/category/:id', verfifyToken, verfifyAdmin, async (req, res) => {
            const id = req.params.id
            const data = req.body;
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    name: data.name,
                    image: data.image
                }
            }
            const result = await categoryCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        //------------------Manage Cart-----------------

        app.get('/carts/:email', verfifyToken, async (req, res) => {
            const search = req?.query?.search || ''

            const email = req.params.email


            let query = {
                $and: [
                    { email: email },
                    {
                        $or: [
                            {
                                itemName: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            },

                            {
                                company: {
                                    $regex: search,
                                    $options: 'i'
                                }
                            }
                        ]
                    }
                ]
            }
            const result = await cartsCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/carts', verfifyToken, async (req, res) => {
            const cartInfo = req.body;
            const email = cartInfo.email
            itemName = cartInfo.itemName
            const query = { email: email, itemName: itemName }
            const alreadyAdded = await cartsCollection.findOne(query)
            if (alreadyAdded) {
                return res.send({ message: 'This medicine is already in your cart.' })
            }
            const result = await cartsCollection.insertOne(cartInfo)
            res.send(result)
        })
        app.patch('/cart/quantity/:id', verfifyToken, async (req, res) => {
            const id = req.params.id
            const status = req.body.status;
            const pricePerUnit = req.body.price

            const query = { _id: new ObjectId(id) }
            const updatedoc = {
                $inc: {
                    quantity: status === 'increse' ? +1 : -1,

                }
            }
            const result = await cartsCollection.updateOne(query, updatedoc)
            res.send(result)

        })
        app.delete('/cart/:id', verfifyToken, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/deletedAll/:email', verfifyToken, async (req, res) => {
            const currentEmail = req.params.email
            const result = cartsCollection.deleteMany({ email: currentEmail })
            res.send(result)
        })


        //------------------------manage payments systems ---------------------
        app.post('/create-payment-intent', verfifyToken, async (req, res) => {
            const { price } = req.body
            const amount = parseInt(price * 100)


            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",

                payment_method_types: ['card']
            })

            res.send({ clientSecret: paymentIntent.client_secret })
        })

        //stored payments data
        app.post('/payment', verfifyToken, async (req, res) => {
            const paymentInfo = req.body;
            const result = await paymentsCollection.insertOne(paymentInfo)
            const query = {
                _id: {
                    $in: paymentInfo.cartId.map(id => new ObjectId(id))
                }
            }
            const deleteResult = await cartsCollection.deleteMany(query)
            res.send({ result, deleteResult })

        })
        app.get('/payments/:email', verfifyToken, async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await paymentsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/manage-payments', verfifyToken, verfifyAdmin, async (req, res) => {

            const result = await paymentsCollection.find().toArray()
            res.send(result)
        })

        app.patch('/payment/:id', verfifyToken, verfifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: "paid"
                }
            }
            const updateResult = await paymentsCollection.updateOne(filter, updateDoc)
            res.send(updateResult)
        })


        // -------------------Mange Sales Reports---------------------
        //payments aggrigate
        app.get('/sales-reports', verfifyToken, verfifyAdmin, async (req, res) => {
            const result = await paymentsCollection.aggregate([
                {
                    $unwind: '$medicineId'
                },
                {
                    $set: {
                        medicineId: { $toObjectId: '$medicineId' } // Convert to ObjectId
                    }
                },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medicineId',
                        foreignField: '_id',
                        as: 'salesInfo',
                    }
                },
                {
                    $unwind: '$salesInfo'
                },


            ]).toArray()

            res.send(result)
        })


        app.get('/payments-history/:email', async (req, res) => {
            const email = req.params.email
            const result = await paymentsCollection.aggregate([
                {
                    $unwind: '$medicineId'
                },
                {
                    $set: {
                        medicineId: { $toObjectId: '$medicineId' } // Convert to ObjectId
                    }
                },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medicineId',
                        foreignField: '_id',
                        as: 'salesInfo',
                    }
                },
                {
                    $unwind: '$salesInfo'
                },
                {
                    $match: {
                        'salesInfo.email': email // Filter by email dynamically
                    }
                },
                {
                    $group: {
                        _id: '$transtionId',
                        email: { $first: '$email' },
                        status: { $first: '$status' },
                        sellerEamil: { $first: '$salesInfo.email' }


                    }
                },
                {
                    $project: {
                        _id: 0,
                        transtionId: '$_id',
                        email: 1,
                        status: 1,
                        sellerEamil: 1

                    }
                }



            ]).toArray()

            res.send(result)
        })



        app.get('/seller/sales-states/:email', async (req, res) => {
            const email = req.params.email
            const result = await paymentsCollection.aggregate([
                {
                    $unwind: '$medicineId'
                },
                {
                    $set: {
                        medicineId: { $toObjectId: '$medicineId' } // Convert to ObjectId
                    }
                },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medicineId',
                        foreignField: '_id',
                        as: 'salesInfo',
                    }
                },
                {
                    $unwind: '$salesInfo'
                },
                {
                    $match: {
                        'salesInfo.email': email // Filter by email dynamically
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        quantity: { $sum: 1 },
                        revenue: { $sum: '$totalPrice' }
                    }
                }

            ]).toArray()

            res.send(result)
        })
        app.get('/admin/sales-states', async (req, res) => {

            const result = await paymentsCollection.aggregate([
                {
                    $unwind: '$medicineId'
                },
                {
                    $set: {
                        medicineId: { $toObjectId: '$medicineId' }
                    }
                },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medicineId',
                        foreignField: '_id',
                        as: 'salesInfo',
                    }
                },
                {
                    $unwind: '$salesInfo'
                },
                {
                    $group: {
                        _id: '$status',
                        quantity: { $sum: 1 },
                        revenue: { $sum: '$totalPrice' }
                    }
                }

            ]).toArray()

            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("server running on without error ")
})
app.listen(port, () => {
    console.log("server running on :", port);
})

