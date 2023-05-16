const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async(req, res) => { 
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot created new product'
    })
})
// Filtering, sorting & pagination
const getProduct = asyncHandler(async(req, res) => { 
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData : product ? product : 'Cannot get product'
    })
})
const getProducts = asyncHandler(async(req, res) => { 
    const queries = {...req.query}
    // tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete queries[el])

    // Format lại các operatiors cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries)
   queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    const formatedQueries = JSON.parse(queryString)

    // Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' }
    let queryCommand = Product.find(formatedQueries)

    // Sorting




    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }
    

    // Fields limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    // Pagination
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page -1) * limit
    queryCommand.skip(skip).limit(limit)
       //
       try {
        const response = await queryCommand.exec();
        const counts = await Product.find(formatedQueries).countDocuments();
        return res.status(200).json({
          success: response ? true : false,
          counts,
          products: response ? response : 'Cannot get products',
        });
      } catch (error) {
        throw new Error(error.message);
      }
    }) ;

const updateProduct = asyncHandler(async(req, res) => { 
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {new: true})
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct : updatedProduct ? updatedProduct : 'Cannot update products'
    })
}) 
const deleteProduct = asyncHandler(async(req, res) => { 
    const { pid } = req.params
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct : deletedProduct ? deletedProduct : 'Cannot delete products'
    })
})

const ratings = asyncHandler(async(req, res) => { 
    const {_id} = req.user
    const {star, comment, pid} = req.body
    if (!star || !pid) throw new Error('Missing inputs')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.some(el => el.postedBy.some(uid => uid === _id))
    console.log({ alreadyRating });
    if (alreadyRating) {
       
    }else{
        const response = await Product.findByIdAndUpdate(pid, {
            $push: {ratings: {star, comment, postedBy: _id}}
        }, {new: true})
        console.log(response);
    }

    return res.status(200).json({
        status: true
    })
 }) 
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings
}