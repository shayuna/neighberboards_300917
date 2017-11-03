var express=require("express");
var router=express.Router();
var mongoClient=require("mongodb").MongoClient;
//var url="mongodb://shark:dbmonro@ds119355.mlab.com:19355/globe";
var url="mongodb://localhost:27017/globe";


router.get("/",function(req,res,next){
    console.log("in empty get");
    res.render("../public/jade/home.jade");
})

router.post("/retrieveData",function(req,res,next){
/*
    console.log("in retrieve data");
    res.send(JSON.stringify({latitude:req.body.latitude,longitude:req.body.longitude,info:req.body.info}));
*/
    mongoClient.connect(url,function(err,db){
        if (!err){
          db.collection("neighberhoods").find({
            location:{
              $near:{
                $geometry:{type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]},
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

router.post("/insertData",function(req,res,next){
/*
    console.log("in retrieve data");
    res.send(JSON.stringify({latitude:req.body.latitude,longitude:req.body.longitude,info:req.body.info}));
*/
    mongoClient.connect(url,function(err,db){
        if (!err){
            db.collection("neighberhoods").insert({location:{type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]},info:req.body.info},function(err,result){
                if (!err){
                    db.collection("neighberhoods").createIndex({location:"2dsphere"});
                    console.log ("record inserted successfully hooray");
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
router.get("/*",function(req,res,next){
    res.end ("in default pg");
})

module.exports=router;
