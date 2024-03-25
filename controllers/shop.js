const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then((products)=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
  .then((prod)=>{
  
    res.render('shop/product-detail', {
      product: prod,
      pageTitle: prod.title,
      path: '/products'
    });
  })
  .catch( err=>console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
  .then((products)=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {

  req.user.getCart()
  .then((cart)=>{
    return cart.getProducts()                 //this method is added because of these line on app.js******  Cart.belongsToMany(Product ,{through : CartItem})

      .then((products)=>{
        res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products
              });
      })
      .catch(err=>console.log(err));
    })
  .catch(err=>console.log(err));

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchCart;
  req.user.getCart()
  .then(cart => {
    fetchCart=cart;
    return cart.getProducts({where: {id: prodId}})
  })
    .then(products=>{

      let product;
      if(products.length>0){
        product= products[0];
      }

      if (product) {
        const oldQty=product.cartItem.quantity;
        return fetchCart.addProduct(product, {through : {quantity:oldQty+1}})
      }

      return Product.findByPk(prodId)
      .then(product=>{
         return fetchCart.addProduct(product, {through :{quantity: 1}});
      })
      .catch(err=>console.log(err))
  
    })
    .then(data=>{
      res.redirect('/cart')
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  
  req.user.getCart()
  .then(cart=>{
    return cart.getProducts({where :{id:prodId}})

  })
  .then(products=>{
    const product=products[0]
    product.cartItem.destroy()
    .then(data=>{
      console.log("Product Deleted");
      res.redirect('/cart');
    })
    .catch(err=>console.log(err));

  })
  .catch(err=>console.log(err));
  
  // (, product => {
  //   Cart.deleteProduct(prodId, product.price);
  //   
  // });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ["products"]})
  .then(orders=>{

      res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders:orders
      });
  })
  .catch(err=>console.log(err));
  // res.render('shop/orders', {
  //   path: '/orders',
  //   pageTitle: 'Your Orders'
  // });
};



exports.postOrder =(req,res,next) =>{
  let fetchProducts;
  let fetchCart;

  req.user.getCart()
  .then(cart=>{
    fetchCart=cart;
  
    return cart.getProducts()

  })
  .then(products=>{
  fetchProducts= products;

    return req.user.createOrder()
  })
  .then(order=>{
    return order.addProducts(fetchProducts.map(product=>{
      product.orderItem= {quantity: product.cartItem.quantity};
      return product;
    }))
  })
  .then(data=>{
    return fetchCart.setProducts(null);
  })
  .then(result=>{
    res.redirect("/orders")
  })

  .catch(err=>console.log(err));
}