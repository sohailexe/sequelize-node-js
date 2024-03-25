const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

//*********this is imported to make relation ship */
const Product= require('./models/product')
const User= require('./models/user')
const Cart =require('./models/cart')
const CartItem =require('./models/cart-items')
const Order =require('./models/order')
const OrderItem =require('./models/order-item')

//**************************************
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const sequelize = require('./util/db');// imported because sync database
const { log } = require('console');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//*****************ADING A MIDDLE WHERE TO STORE USER IN REQEST*****   START  ** */
app.use((req,res,next)=>{
    User.findByPk(1)
    .then(user=>{
        req.user=user;  //this will add user sequelize OBJECT that has also method like Destroy in req body
        next()
    })
    .catch(err=>console.log(err))
})
//**********************************************************************END */
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


// ******************** Making relation-Ship between tables that are created using sequelize*******
Product.belongsTo(User,{constraints:true, onDelete: "CASCADE"})
User.hasMany(Product)                                           // this is in reverse direction and opetional.....but it make it clear
// ....................................
User.hasOne(Cart,{constraints:true, onDelete: "CASCADE"});
Cart.belongsTo(User,{constraints:true, onDelete: "CASCADE"});
Cart.belongsToMany(Product ,{through : CartItem},{constraints:true, onDelete: "CASCADE"})
Product.belongsToMany(Cart ,{through : CartItem},{constraints:true, onDelete: "CASCADE"})
// ......................
Order.belongsTo(User,{constraints:true, onDelete: "CASCADE"});
User.hasMany(Order,{constraints:true, onDelete: "CASCADE"});
Order.belongsToMany(Product,{through: OrderItem},{constraints:true, onDelete: "CASCADE"});
//***********************************  AT last object for making options */


sequelize
.sync({force:true})             
// .sync()
.then((res)=>{      // creating a user if not exist if exist then return   *****START*****
    return User.findByPk(3);
})
.then(user=>{

    if (!user) {
       return User.create({name:"ALi", email: "ALI@test.com"});
    }
    return user;
})
.then( async user=>{
    
    const cart = await Cart.findByPk(3)
    if (cart) {
        return
    }
    
    return user.createCart()          //****************END****************** */
})
.then(cart=>{
    app.listen(3000);

})
.catch((err)=>{
    console.log(err);
})


