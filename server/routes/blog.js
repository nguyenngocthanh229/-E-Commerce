const router = require('express').Router()
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken')
const ctrls = require('../controllers/blog')

router.get('/', ctrls.getBlogs)
router.get('/one/:bid', ctrls.getBlog)
router.post('/', [verifyAccessToken, isAdmin], ctrls.createNewBlog)
router.put('/like/:bid', [verifyAccessToken], ctrls.likeBlog)
router.put('/dislike/:bid', [verifyAccessToken], ctrls.dislikeBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], ctrls.updateBlog)


module.exports = router