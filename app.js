var express=require("express");
var path=require("path");
var bodyParser=require("body-parser");
var mainRouter=require("./routes/mainAPI");
var fileUpload = require('express-fileupload');

var app=express();
app.use("/public",express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/",mainRouter);
app.listen(8080);

