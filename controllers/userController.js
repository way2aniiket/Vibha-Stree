const { generateToken } = require('../utils/generateTokens');
const bcrypt = require('bcryptjs');
const userModel =  require('../models/userModel');
const productModel = require('../models/product-model');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const addressModel = require('../models/userAddress');
const nodemailer = require("nodemailer");

module.exports ={
    indexPage : async(req,res)=>{
        try {
            let category = req.query.category || "all";
            let products;
    
            if (category === "all") {
                products = await productModel.find();
            } else {
                products = await productModel.find({ category: category });
            }
            res.render("index", { products, category, user:false });
        } catch (error) {
            console.error(error);
            res.status(500).send("Server Error");
        }
    },
    userProfile : async (req,res) => {
        const formattedDOB = moment(currentUser.dob, "DD-MM-YYYY").format('DD-MM-YYYY');
        const user = await userModel.findOne({email: currentUser.email}).populate("address"); 
        res.render('profile', { currentUser, formattedDOB, user });
    },
    getProducts : async(req,res)=>{
       try {
        let products = await productModel.find();
        
        res.render("shop",{products, user:false,category: 'All Products'}).status(201);
       } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
       }
    },
    viewCart: async (req, res) => {
        try {
            let user = await userModel.findOne({ email: currentUser.email })
                .populate({
                    path: 'cart.product', 
                    model: 'Product' 
                });
            const populatedCart = user.cart.map(cartItem => ({
                ...cartItem.product._doc, 
                quantity: cartItem.quantity 
            }));
            res.render('cart', { user: { ...user._doc, cart: populatedCart } });
        } catch (error) {
            console.error("Error loading cart:", error);
            res.status(500).send("An error occurred while loading the cart.");
        }
    },
    viewCategory : async (req, res) => {
        try {
            const category = req.params.category;
            const products = await productModel.find({ category: category });
            res.render('shop', { products: products, category: category });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },
    getProfileEdit:async (req,res) => {
        res.render('profileEdit');
    },
    postProfileEdit: async (req, res) => {
        try {
            let updatedUser = await userModel.findOneAndUpdate(
                { email: req.body.email }, 
                {
                    fullname: req.body.fullname,
                    mobileNumber: req.body.mobileNumber,
                    gender: req.body.selectedGender,
                    dob: req.body.dob
                },
                { new: true } 
            );
            if (updatedUser) {
                res.redirect('/profile');
            } else {
                res.status(404).send("User not found");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("An error occurred while updating the profile");
        }
    },
    addToCart: async (req, res) => {
        try {
            let user = await userModel.findOne({ email: currentUser.email });
            if (!user.cart) {
                user.cart = [];
            }
            const existingProduct = user.cart.find(item => item.product.toString() === req.params.productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                user.cart.push({
                    product: req.params.productId, 
                    quantity: 1
                });
            }
    
            // Save the user with the updated cart
            await user.save();
            res.redirect("/products");
        } catch (error) {
            console.error("Error adding to cart:", error);
            res.status(500).send("An error occurred while adding the product to the cart.");
        }
    },
    
    searchProduct : async (req, res) => {
        let {search} = req.body;
        let searchedProduct = await productModel.find({keywords:{ $in : search}});
        console.log("searchedProduct",searchedProduct);
        
        res.render("productDisplay",{searchedProduct});
    },
    newCollection :async (req,res) => {
        let products = await productModel.find().sort({ _id: -1 });
        res.render("shop", { products });
    },
    saveAddress : async (req,res) => {
        try{
            let { fullname, mobileNumber, pincode, state, address, district, addressType } = req.body;
            const user = await userModel.findOne({ email: currentUser.email }).populate('address');
            if (user.address.length >= 3) {
                return res.status(400).send('You can only add up to 3 addresses.');
            }
            // Create the new address
            let userAddress = await addressModel.create({
                fullname,
                mobileNumber,
                address,
                district,
                state,
                pincode,
                addressType
            });
            
            
            if (!user) {
                console.log("User not found.");
                return res.status(404).send("User not found.");
            }
            
            if (!user.address) {
                user.address = []; 
            }
            
            user.address.push(userAddress._id);
            await user.save();
            
            res.status(201).redirect("/profile");
            }catch(error){
                console.error(error);
                res.status(500).send('Server Error');
            }
        
    },
    deleteAddress : async (req,res) => {
        try {
            const { userId, addressId } = req.params;
            let user = await userModel.findById(userId);
    
            if (!user) {
                return res.status(404).send("User not found");
            }
            user.address = user.address.filter(id => id.toString() !== addressId);
            await user.save();
            await addressModel.findByIdAndDelete(addressId);
            res.status(200).json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error("Error deleting address:", error);
            res.status(500).send("Server error");
        }
    },
    deleteAccount : async (req,res) => {
         try {
            const { userId } = req.params;
            console.log(req.params);
            let user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).send("User not found");
            }
            await userModel.findByIdAndDelete(userId);
            res.status(200).redirect("/logout");
        } catch (error) {
            console.error("Error deleting account:", error);
            res.status(500).send("Server error");
        }
    },
    contactUs : async (req,res) => {
            let {name,email,phone,message} = req.body
            const transporter = nodemailer.createTransport({
                service : 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.USER, 
                    pass: process.env.APP_PASSWORD
                }
            });
            
            const mailOptions = {
        
                    from :email,
                    to: process.env.USER,
                    subject: "Enquiry",
                    phone: phone, 
                    text: message,
                    replyTo : email

              };
        console.log("mailOptions",mailOptions);
        
            const sendMail = async (transporter,mailOptions) => {
                  try {
                      await transporter.sendMail(mailOptions);
                      console.log("Email sent successfully");
                      res.redirect("/");
                      
                    } catch (error) {
                        console.error("Error sending email:", error);
                        res.status(500).send("Failed to send email");
                    }
                }
            sendMail(transporter,mailOptions);
    },
    // contactUsReply : async (req,res) => {
    //     console.log(req.body);
        
    //         let {name,email,phone,message} = req.body
    //         const transporter = nodemailer.createTransport({
    //             service : 'gmail',
    //             host: 'smtp.gmail.com',
    //             port: 587,
    //             secure: false,
    //             auth: {
    //                 user: process.env.USER, 
    //                 pass: process.env.APP_PASSWORD
    //             }
    //         });
            
    //         const mailOptions = {
        
    //                 from :process.env.USER,
    //                 to: email,
    //                 subject: "Thank you for reaching out to us!",
    //                 phone: phone, 
    //                 text: "Thank you for reaching out to us!. We will get back to you shortly",
    //                 replyTo : email

    //           };
    //     console.log("mailOptions",mailOptions);
        
    //         const sendMail = async (transporter,mailOptions) => {
    //               try {
    //                   await transporter.sendMail(mailOptions);
    //                   console.log("Email sent successfully");
    //                   res.redirect("/");
                      
    //                 } catch (error) {
    //                     console.error("Error sending email:", error);
    //                     res.status(500).send("Failed to send email");
    //                 }
    //             }
    //         sendMail(transporter,mailOptions);
    // }
}
