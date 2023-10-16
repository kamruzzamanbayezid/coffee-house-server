const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 7000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d8abmis.mongodb.net/?retryWrites=true&w=majority`;

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
            await client.connect();
            const database = client.db("coffeesDB");
            const coffeesCollection = database.collection("coffees");

            // user
            const userCollection = database.collection("users")

            app.get('/coffees', async (req, res) => {
                  const cursor = coffeesCollection.find();
                  const result = await cursor.toArray();
                  res.send(result);
            })

            app.get('/coffees/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) }
                  const result = await coffeesCollection.findOne(query)
                  res.send(result)
            })

            app.put('/coffees/:id', async (req, res) => {
                  const id = req.params.id;
                  const filter = { _id: new ObjectId(id) };
                  const options = { upsert: true };
                  const updatedCoffee = req.body;
                  const coffee = {
                        $set: {
                              name: updatedCoffee.name,
                              supplier: updatedCoffee.supplier,
                              chef: updatedCoffee.chef,
                              taste: updatedCoffee.taste,
                              details: updatedCoffee.details,
                              category: updatedCoffee.category,
                              photo: updatedCoffee.photo
                        },
                  };
                  const result = await coffeesCollection.updateOne(filter, coffee, options);
                  res.send(result);

            })

            app.post('/coffees', async (req, res) => {
                  const coffees = req.body;
                  const result = await coffeesCollection.insertOne(coffees);
                  res.send(result)
            })

            app.delete('/coffees/:id', async (req, res) => {
                  const id = req.params.id
                  const query = { _id: new ObjectId(id) }
                  const result = await coffeesCollection.deleteOne(query);
                  res.send(result)
            })

            // user

            app.get('/users', async (req, res) => {
                  const result = await userCollection.find().toArray();
                  res.send(result)
            })

            app.get('/users/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) }
                  const result = await userCollection.findOne(query);
                  res.send(result);
            })

            app.post('/users', async (req, res) => {
                  const user = req.body
                  const result = await userCollection.insertOne(user);
                  res.send(result)
            })

            app.delete('/users/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) };
                  const result = await userCollection.deleteOne(query);
                  res.send(result)
            })

            app.patch('/users', async (req, res) => {
                  const user = req.body;
                  const filter = { email: user.email };
                  const options = { upsert: true };
                  const updateUser = {
                        $set: {
                              lastSignInTime: user.lastSignInTime
                        },
                  };
                  const result = await userCollection.updateOne(filter, updateUser, options);
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


app.get('/', (req, res) => {
      res.send('Coffee house is running')
});

app.listen(port, () => {
      console.log(`Coffee house is running in: ${port}`);
})