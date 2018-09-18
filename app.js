let express = require("express");
let bodyParser = require("body-parser");
let exphbs = require('express-handlebars');
let path = require('path');
let methodOverride = require("method-override");

//create Redis Client

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);
} else {
   var redis = require("redis").createClient();
   console.log('Conneted To Redis Succesfully');
}




//set port 
const port = process.env.PORT||4000;
//init app
let app = express();

// view engine 
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

// //body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methodoverride for delete request
app.use(methodOverride('_method'));

// Route for main page
app.get('/',function(req,res){
    res.render('searchusers');
});
// search route
app.post('/user/search',function(req,res,next){
    let id = req.body.id;
    client.hgetall(id,function(err,obj){
        if(!obj){
            res.render('searchusers',{
                error:'User Dose Not Exist'
            });
        }else {
            obj.id = id ;
            res.render('details',{
                user :obj
            })
        }
    });
});

//Add user LInk 
app.get('/addUser',function(req,res){
       res.render('addusers');
});

// Add user to database
app.post('/user/add',function(req,res){
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
    client.HMSET(id,[
        'first_name',first_name,
        'last_name',last_name,
        'email',email,
        'phone',phone
    ],function(err,rply){
        if(err){
            Console.log(err);
        }
        console.log(rply);
        res.redirect('/');

    });
});
//Delete A user
app.delete('/user/delete/:id',function(req,res){
client.del(req.params.id);
res.redirect('/')
});
//Run server
app.listen(port,function(){
    console.log('server running on port '+port);
});

