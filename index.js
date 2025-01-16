const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 8080

//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // await client.connect();


        //--------------------All Collection -------------------
        const userCollection = client.db('HealthRexStore').collection('users')
        const medicinesCollection = client.db('HealthRexStore').collection('medicines')
        const AddsCollection = client.db('HealthRexStore').collection('adds')
        const categoryCollection = client.db('HealthRexStore').collection('category')





        //------------------Manage user------------------
        //get user from userCollection 
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        //Stored user in usersCollection
        app.post('/users', async (req, res) => {
            const userInfo = req.body;
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


        //---------------------Manage Catefory------------------
        app.get('/category', async (req, res) => {
            const result = await categoryCollection.find().toArray()
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

