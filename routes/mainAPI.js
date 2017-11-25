var express=require("express");
var router=express.Router();
var mongoClient=require("mongodb").MongoClient;
var path=require("path");
var url="mongodb://shark:dbmonro@ds119355.mlab.com:19355/globe";
var Multer=require("multer");
var Storage=require("@google-cloud/storage");
//var url="mongodb://localhost:27017/globe";

var storage=Storage();

var upload = Multer({dest:"/users/shay/img_test"});

var multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

// A bucket is a container for objects (files).
var bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);


// Process the file upload and upload to Google Cloud Storage.
router.post('/uploadImg', multer.single('fl'), (req, res, next) => {
  if (!req.files.fl) {
    res.status(400).send('No file uploaded.bummer');
    return;
  }
  console.log ("ok. this is is behind us");

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.query.nm+".jpg");
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    res.status(200).send(publicUrl);
  });

  blobStream.end(req.files.fl.buffer);

  console.log("file name should be - "+req.query.nm);
});


router.get("/",function(req,res,next){
    console.log("the show is on");
    res.render("../public/jade/home.jade");
//    console.log(path.resolve("../public/imgs","blabla.jpg"));
//    console.log("the __dirname name env contains - "+path.resolve(__dirname));
//    console.log("the __filename env contains - "+path.resolve(__filename));
})

router.get("/retrieveData",function(req,res,next){
/*
    console.log("in retrieve data");
    res.send(JSON.stringify({latitude:req.body.latitude,longitude:req.body.longitude,info:req.body.info}));
*/
    mongoClient.connect(url,function(err,db){
        if (!err){
//        db.collection("neighberhoods").remove();
          db.collection("neighberhoods").find({
            location:{
              $near:{
                $geometry:{type:"Point",coordinates:[parseFloat(req.query.longitude),parseFloat(req.query.latitude)]},
                $minDistance:0,
                $maxDistance:100
              }
            }
          }).toArray(function(err,arDocs){
              var sRslt=JSON.stringify(arDocs);
              db.close();
              res.send(sRslt);
          });
        }
        else
        {
            console.log ("error in retrieveData - " + err.message);
        }
    })
})
router.post("/uploadImg_1",function(req,res,next){
    let fl = req.files.file;
//    fl.mv(path.resolve(__dirname,"../public/imgs/"+req.query.nm+".jpg"));
    fl.mv(path.resolve("../public/imgs",req.query.nm+".jpg"));
    console.log("the img nm should be - "+req.query.nm);
});
router.post("/insertData",function(req,res,next){
/*
    console.log("in retrieve data");
    res.send(JSON.stringify({latitude:req.body.latitude,longitude:req.body.longitude,info:req.body.info}));
*/
    mongoClient.connect(url,function(err,db){
        if (!err){
            var objToInsert={location:{type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]},info:req.body.info,tel:req.body.tel,dt:new Date()};
            db.collection("neighberhoods").insert(objToInsert,function(err,result){
                if (!err){
                    db.collection("neighberhoods").createIndex({location:"2dsphere"});
                    console.log ("record inserted successfully hooray. inserted obj id = "+objToInsert._id);
                    res.send(objToInsert._id);
                }
                else{
                    console.log ("error when inserting record")
                }

            })
        }
        else
        {
            console.log ("error in insertData - " + err.message);
        }
    })
})

router.get("/insertData",function(req,res,next){
/*
    console.log("in retrieve data");
    res.send(JSON.stringify({latitude:req.body.latitude,longitude:req.body.longitude,info:req.body.info}));
*/
    mongoClient.connect(url,function(err,db){
        if (!err){
            var objToInsert={location:{type:"Point",coordinates:[parseFloat(req.query.longitude),parseFloat(req.query.latitude)]},info:req.query.info,tel:req.query.tel,dt:new Date()};
            db.collection("neighberhoods").insert(objToInsert,function(err,result){
                if (!err){
                    db.collection("neighberhoods").createIndex({location:"2dsphere"});
                    console.log ("record inserted successfully hooray. inserted obj id = "+objToInsert._id);
                    res.send("we did it. without you it wasn't possible");
                }
                else{
                    console.log ("error when inserting record")
                }

            })
        }
        else
        {
            console.log ("error in insertData - " + err.message);
        }
    })
})
router.get("/removeAll",function(req,res,next){
    mongoClient.connect(url,function(err,db){
        if (!err){
            db.collection("neighberhoods").remove({});
            res.send("removed all. hooray");
        }
        else
        {
            console.log ("error in removeAll - " + err.message);
        }
    })
})
router.get("/*",function(req,res,next){
    res.end ("in default pg");
})

module.exports=router;
