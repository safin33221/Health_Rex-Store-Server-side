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

        //1st Create Json token
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JSON_SECRET_TOKEN, { expiresIn: '2h' })
            res.send({ token })
        })





        //------------------Manage user------------------
        //get user from userCollection 
        app.get('/users', verfifyToken, async (req, res) => {
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
        app.patch('/user/role/:email', async (req, res) => {
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
        app.get('/user/role/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }

            //find the user


            const result = await userCollection.findOne(query)



            res.send({ role: result?.role })

        })



        //-------------------Manage Medicines------------------ 
        app.get('/medicines', async (req, res) => {
            const result = await medicinesCollection.find().toArray()
            res.send(result)
        })

        app.post('/invoice/medicine', async (req, res) => {
            const ids = req.body;

            const query = {
                _id: {
                    $in: ids.map(id => new ObjectId(id))
                }
            }
            const result = await medicinesCollection.find(query).toArray()
            res.send(result)

        })
        //get medicines for seller 
        app.get('/seller/medicine/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await medicinesCollection.find(query).toArray()
            res.send(result)
        })
        //Add medicines by seller
        app.post('/medicines', async (req, res) => {
            const medicineInfo = req.body;
            const result = await medicinesCollection.insertOne(medicineInfo)
            res.send(result)
        })



        //-----------------------Manage Adverticement-------------------
        app.post('/askAddverticement', async (req, res) => {
            const addInfo = req.body;
            const result = await AddsCollection.insertOne(addInfo)
            res.send(result)
        })
        app.get('/addvertisements', async (req, res) => {
            const result = await AddsCollection.find().toArray()
            res.send(result)
        })
        app.get('/addvertise/success', async (req, res) => {
            const result = await AddsCollection.find({ status: 'success' }).toArray()
            res.send(result)
        })
        //get banner for login sellse
        app.get('/seller/adds/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await AddsCollection.find(query).toArray()
            res.send(result)
        })

        app.patch('/askAddverticement/status', async (req, res) => {

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

        app.post('/category', async (req, res) => {
            const categoryInfo = req.body;
            const result = await categoryCollection.insertOne(categoryInfo)
            res.send(result)
        })

        app.delete('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await categoryCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/category/:id', async (req, res) => {
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

        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await cartsCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/carts', async (req, res) => {
            const cartInfo = req.body;
            const result = await cartsCollection.insertOne(cartInfo)
            res.send(result)
        })
        app.patch('/cart/quantity/:id', async (req, res) => {
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
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/deletedAll/:email', async (req, res) => {
            const currentEmail = req.params.email
            const result = cartsCollection.deleteMany({ email: currentEmail })
            res.send(result)
        })


        //------------------------manage payments systems ---------------------
        app.post('/create-payment-intent', async (req, res) => {
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
        app.post('/payment', async (req, res) => {
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
        app.get('/payments/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await paymentsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/manage-payments', async (req, res) => {

            const result = await paymentsCollection.find().toArray()
            res.send(result)
        })

        app.patch('/payment/:id', async (req, res) => {
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

        //payments aggrigate
        app.get('/sales-reports', async (req, res) => {
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
                // {
                //     $group: {
                //         _id: '$salesInfo.itemName',
                //         quantity: { $sum: 1 },
                //         revenue: { $sum: '$totalPrice' }
                //     }
                // }

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

