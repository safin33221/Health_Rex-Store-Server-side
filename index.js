const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 8080

//middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion } = require('mongodb');
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

        const userCollection = client.db('HealthRexStore').collection('users')

        //manage user------------------
        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const result = await userCollection.insertOne(userInfo)
            res.send(result)
        })



        //-----------------Manage Seller -----------------
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }

            //find the user
            const user = await userCollection.findOne(query)
            let seller = false;
            if (user) {
                seller = user?.role === 'seller'
            }
            res.send({ seller })

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

