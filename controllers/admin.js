const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title; 
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  
  // this is magic of sequelization .....this method is created because we make relationShip between user and Product in app.js   and add user in req body by  a middle ware
  req.user.createProduct({ // this method add userId in products table in database
    title:title,
    price:price,
    imageUrl:imageUrl,
    description:description
  })
  .then(result=>{
    console.log("Product created");
    res.redirect("/")
  })
  .catch((err)=>console.log(err))

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;
  //retrive product from database with PK
  Product.findByPk(prodId)
  .then( (product) => {
    if (!product) {
      return res.redirect('/');
    }
    //rander edit form with pre-populated
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err=>console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  req.user.getProducts({where :{id:prodId}})// this also another method that comes with relationship as described above
  // Product.findByPk(prodId)
  .then( products => {
    const product= products[0]
    product.title=updatedTitle;
    product.price=updatedPrice;
    product.imageUrl=updatedImageUrl;
    product.description=updatedDesc;

    return product.save()//this method save all the changes locally, and return promis that is handled in below then
  } )
  .then( result=>{
    console.log("Product Updated!");
    res.redirect('/admin/products');
  })
  .catch(err=>console.log(err))
};

exports.getProducts = (req, res, next) => {

  req.user.getProducts()// this is megic methid that fetch product that according to user id
  //Fetch all products from database by sequelize
  // Product.findAll()
  .then((products) => {

    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });

  })
  .catch(err=>console.log(err))
  
  
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
  .then( product => {
    return product.destroy()//this method Delete product, and return promis that is handled in below then
  } )
  .then( result=>{
    console.log("Product Deleted!");
    res.redirect('/admin/products');

  })
  .catch(err=>console.log(err))

};
