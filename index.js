const express = require("express");
const cors = require("cors");
const {MongoClient} = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ss",(req,res) => {

 const url=process.env.MONGO_URL;
 const con=new MongoClient(url);
 const db = con.db("recipe_29june25");
 const coll = db.collection("recipes");
 const doc = {"_id":req.body.name,"ing":req.body.ing,"recipe":req.body.recipe};
 coll.insertOne(doc)
 .then(response => {
                     res.send({ inserted: true });

 })
.catch(error => {
  if (error.code === 11000) {
    res.send({ inserted: false, reason: "duplicate" });
  } else {
    res.send({ inserted: false, reason: "other", error });
  }
});

});

app.get("/gs",(req,res) => {

 const url=process.env.MONGO_URL;
 const con=new MongoClient(url);
 const db = con.db("recipe_29june25");
 const coll = db.collection("recipes");
 coll.find().toArray()
 .then(response => {
                     res.send(response);

})
 .catch(error => {
                     res.send(error);
});

});


app.delete("/ds",(req,res) => {

 const url=process.env.MONGO_URL;
 const con=new MongoClient(url);
 const db = con.db("recipe_29june25");
 const coll = db.collection("recipes");
 const doc = {"_id":req.body.name};
 coll.deleteOne(doc)
 .then(response => {
                     res.send(response);

})
 .catch(error => {
                     res.send(error);
});

});


app.put("/us", (req, res) => {
  const url = process.env.MONGO_URL;
  const con = new MongoClient(url);
  const db = con.db("recipe_29june25");
  const coll = db.collection("recipes");
  const filter = { "_id": req.body.name };
  const doc = {
    $set: {
      ing: req.body.ing,
      recipe: req.body.recipe
    }
  };

  coll.updateOne(filter, doc)
    .then(response => {
                       res.send(response);
    })
    .catch(error => {
                       res.send(error);
});
});

app.post("/fav/toggle", (req, res) => {
  const url = process.env.MONGO_URL;
  const con = new MongoClient(url);
  const db = con.db("recipe_29june25");
  const favColl = db.collection("favorites");

  const did = req.body.deviceId;
  const rid = req.body.rid;

  favColl.findOne({ _id: did })
    .then(doc => {
      let favs = [];

      if (doc) {
        if (doc.favs.includes(rid)) {
          favs = doc.favs.filter(x => x !== rid);
        } else {
          favs = [...doc.favs, rid];
        }
      } else {
        favs = [rid];
      }

      favColl.updateOne(
        { _id: did },
        { $set: { favs: favs } },
        { upsert: true }
      )
      .then(response => {
        res.send({ favs: favs });
      })
      .catch(error => {
        res.send(error);
      });

    })
    .catch(error => {
      res.send(error);
    });
});

app.get("/fav/recipes/:deviceId", (req, res) => {
  const url = process.env.MONGO_URL;
  const con = new MongoClient(url);
  const db = con.db("recipe_29june25");
  const favColl = db.collection("favorites");
  const recipeColl = db.collection("recipes");

  const did = req.params.deviceId;

  favColl.findOne({ _id: did })
    .then(doc => {
      if (!doc || doc.favs.length === 0) {
        res.send([]);
        return;
      }

      recipeColl.find({ _id: { $in: doc.favs } }).toArray()
        .then(data => {
          res.send(data);
        })
        .catch(error => {
          res.send(error);
        });

    })
    .catch(error => {
      res.send(error);
    });
});


app.listen(9000, () => {console.log("ready to serve @9000");});




