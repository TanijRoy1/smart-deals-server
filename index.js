const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

//smartDBUser
const uri =
  "mongodb+srv://smartDBUser:mzuLe8CR3gC7wYVF@cluster0.z1gnsog.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart deals server is running.");
});

async function run() {
  try {
    await client.connect();

    const smartDB = client.db("smartDB");
    const productsCollection = smartDB.collection("products");
    const bidsCollection = smartDB.collection("bids");

    // Create
    app.post("/products", async (req, res) => {
      const newUser = req.body;
      const result = await productsCollection.insertOne(newUser);
      res.send(result);
    });

    // Read
    app.get("/products", async (req, res) => {
        // const projectFields = {title: 1, price_min:1, image:1, seller_name:1, condition:1, description:1, seller_contact:1};
        // const cursor = productsCollection.find().sort({price_min:-1}).skip(2).limit(6).project(projectFields);

        // http://localhost:3000/products?sellerName=Maliha%20Chowdhury
        // console.log(req.query);
        const name = req.query.sellerName;
        const query = {};
        if(name){
            query.seller_name = name;
        }
        
        const cursor = productsCollection.find(query);
        
        const result = await cursor.toArray();
        res.send(result);
    });
    app.get("/latest-products", async (req, res) => {
      const projectFields = {image:1, title:1, price_min:1, price_max:1}
      const cursor = productsCollection.find().sort({created_at : -1}).limit(6).project(projectFields);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/my-products", async (req, res) => {
      const email = req.query.sellerEmail;
      const query = {};
      if(email){
        query.email = email
      }
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await productsCollection.findOne(query);
        res.send(result);
    })

    // Update
    app.patch("/products/:id", async (req, res) => {
        const id = req.params.id;
        const updatedProduct = req.body;
        const query = {_id : new ObjectId(id)};
        const update = {
            $set : {
                // name : updatedUser.name,
                // price : updatedUser.price
                image : updatedProduct.image,
                seller_image : updatedProduct.seller_image
            }
        }
        const options = {};
        const result = await productsCollection.updateOne(query, update, options);
        res.send(result);
    })

    // Delete
    app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.send(result);
    })

    // bids
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    })
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if(email){
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query).sort({bid_price: -1});
      const result = await cursor.toArray();
      res.send(result);
    })
    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    })
    app.get("/products/bids/:productId", async (req, res) => {
      const productId = req.params.productId;
      const query = {product : productId};
      const cursor = bidsCollection.find(query).sort({bid_price: -1});
      const result = await cursor.toArray();
      res.send(result);
    })
    app.patch("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBid = req.body;
      const query = {_id : new ObjectId(id)};
      const update = {
        $set : {
          buyer_image : updatedBid.buyer_image
        }
      }
      const options = {};
      const result = await bidsCollection.updateOne(query, update, options);
      res.send(result);
    })




    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Smart deals server is running on port: ", port);
});
