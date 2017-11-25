var express=require("express");
var router=express.Router();
var mongoClient=require("mongodb").MongoClient;
var path=require("path");
var url="mongodb://shark:dbmonro@ds119355.mlab.com:19355/globe";
//var url="mongodb://localhost:27017/globe";


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
router.post("/uploadImg",function(req,res,next){
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
