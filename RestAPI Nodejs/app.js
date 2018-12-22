const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

//Connecting to MONGO ATLAS cloud here
mongoose.connect('mongodb://nodeapi:'+process.env.MONGO_ATLAS_PW+'@nodeapi-shard-00-00-hxar5.mongodb.net:27017,nodeapi-shard-00-01-hxar5.mongodb.net:27017,nodeapi-shard-00-02-hxar5.mongodb.net:27017/test?ssl=true&replicaSet=nodeapi-shard-0&authSource=admin&retryWrites=true',{
    useNewUrlParser:true
});
//so that mongoose returns the Promise
mongoose.Promise = global.Promise;

//Making uploads folder available to the internet
app.use('/uploads',express.static('uploads'));

//For logging the incoming requests
app.use(morgan('dev'));

//For parsing url in order to get the data off of it.
app.use(bodyParser.urlencoded({extended: false}));
//Parsing to json
app.use(bodyParser.json());

//Allowing cross origin which is blocked by default in most cases
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With,Content-Type,Accept, Authorization');
    if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
})

app.use('/orders',orderRoutes);

app.use('/products',productRoutes);

app.use('/user',userRoutes);

//if users types in wrong routes, this will handle it.
app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status=404;
    next(error);//This pass error to following function.
});

//Finally, we catch all the error here.
app.use((error,req,res,next)=>{
    res.status(error.status||500);
    res.json({
        error:{
            message: error.message
        }
    })
});

//Exporting so that we can use it inside server.js file
module.exports = app;