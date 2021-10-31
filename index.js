const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jug4s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("campDB");
        const campCollection = database.collection("services");
        const campRegistrations = database.collection('registrations')
        //GET API FOR CAMPS
        app.get('/camps', async (req, res) => {
            const cursor = campCollection.find({});
            const camps = await cursor.toArray();
            res.send(camps);
        })
        app.get('/camps/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific id', id);
            const query = { _id: ObjectId(id) }
            const service = await campCollection.findOne(query);
            res.json(service);
        })
        //For Camp Registered user
        app.get('/registrations', async (req, res) => {
            const cursor = campRegistrations.find({});
            const forms = await cursor.toArray();
            res.send(forms);
        })
        app.get('/registrations/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific id', id);
            const query = { _id: ObjectId(id) }
            const camp = await campRegistrations.findOne(query);
            res.json(camp);
        })

        //POST API For Registrations
        app.post('/registrations', async (req, res) => {
            const form = req.body;
            console.log('hit the post api', form);
            const result = await campRegistrations.insertOne(form);
            res.json(result);
        })
        //POST API For Services
        app.post('/camps', async (req, res) => {
            const newCamp = req.body;
            console.log('hit the post api', newCamp);
            const result = await campCollection.insertOne(newCamp);
            res.json(result);
        })

        // UPDATE API
        app.put('/registrations/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Approved"
                },
            };
            const result = await campRegistrations.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        //DELETE API 
        app.delete('/registrations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await campRegistrations.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Camperience Server');
});


app.listen(port, () => {
    console.log('Running Camperience Server on Port:', port);
})