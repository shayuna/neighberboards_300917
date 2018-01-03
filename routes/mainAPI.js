var express=require("express");
var router=express.Router();
var mongoClient=require("mongodb").MongoClient;
var path=require("path");
var url="mongodb://shark:dbmonro@ds119355.mlab.com:19355/globe";
var multer=require("multer");
//var upload = multer({ dest: '/users/shay/img_test' })
/*
var upload = multer();


router.post("/uploadImg",upload.single("fl"),function(req,res,next){
    if (!req.file){
        console.log ("there isn't any file here");
    }
    else{
        console.log ("there is a file");
    }
})
*/

var Multer=require("multer");

try{
    var Storage=require("@google-cloud/storage");
    var storage=Storage();
    // A bucket is a container for objects (files).
    var bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
}
catch(err){
    console.log("err using google-cloud/storage. supposedly because i used it from the browser and not from google appengine.err="+err);
}

var multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});



// Process the file upload and upload to Google Cloud Storage.
router.post('/uploadImg', multer.single('fl'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.bummer');
    return;
  }
  console.log ("ok. this is is behind us");

  var sFlNm=req.query.nm+".jpg";
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(sFlNm);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
//    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
//    res.status(200).send(publicUrl);
  req.file.cloudStorageObject = sFlNm;
    blob.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(sFlNm);
      next();
    });



  });

  blobStream.end(req.file.buffer);
  res.end("finished uploading photo");

  console.log("the file name should be - "+req.query.nm);
});

function getPublicUrl (filename) {
  return `https://storage.googleapis.com/${GCLOUD_STORAGE_BUCKET}/${filename}`;
}

router.get("/download*",function(req,res,next){
    console.log("download app pg");
    res.render("../public/jade/downloadapp.jade");
})

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
            var objToInsert={location:{type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]},info:req.body.info,tel:req.body.tel,isContainPic:req.body.isContainPic,dt:new Date()};
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
router.get("/removeQuotes",function(req,res,next){
    mongoClient.connect(url,function(err,db){
        if (!err){
            db.collection("quotes").remove({});
            res.send("removed all quotes. hooray");
        }
        else
        {
            console.log ("error in removeQuotes - " + err.message);
        }
    })
})
router.get("/insertQuote",function(req,res,next){
    mongoClient.connect(url,function(err,db){
        if (!err){
            if (req.query.quote && req.query.quote.trim()!=""){
                db.collection("quotes").insert({quote:req.query.quote,author:req.query.author},function(err,result){
                    if (!err){
                        res.send("inserted quote. p.s. the quote is - "+req.query.quote);
                    }
                    else{
                        res.send("there is an error when inserting a quote.err="+err.message);
                    }
                });
            }
            else{
                res.send("empty quote in insertQuote");
            }
          }
        else
        {
            console.log ("error in insertQuote - " + err.message);
           res.send ("failed in sending log");
         }
    })
})
router.get("/getQuote",function(req,res,next){
    mongoClient.connect(url,function(err,db){
        if (!err){
            db.collection("quotes").find({}).toArray(function(err,arQuotes){
//                res.send(JSON.stringify(arQuotes));
                if (arQuotes.length>0){
                    var iNum=Math.round(Math.random()*(arQuotes.length-1));
                    res.send(JSON.stringify(arQuotes[iNum]));
                }
                else{
                    res.send("no quotes");
                }
                console.log("quote num used is="+iNum);
            });

        }
        else
        {
            console.log ("error in findQuote - " + err.message);
        }
    })
})
router.get("/getAllQuotes",function(req,res,next){
    mongoClient.connect(url,function(err,db){
        if (!err){
            db.collection("quotes").find({}).toArray(function(err,arQuotes){
                if (!err){
                    res.send(JSON.stringify(arQuotes));
                }
                else{
                    res.send ("err in retrieving all quotes");
                }
            });
        }
        else
        {
            console.log ("error in findQuote - " + err.message);
        }
    })
})
router.get("/*",function(req,res,next){
    res.end ("in default pg");
})

module.exports=router;
