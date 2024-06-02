import { Router } from 'express'
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
    res.render('index', { user: req.session.user })
})

router.get('/products', isAuthenticated, (req, res) => {
    res.render('products', { user: req.session.user })
})

router.get('/carts', isAuthenticated, (req, res) => {
    res.render('carts', { user: req.session.user })
})

router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login')
})

router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register')
})

router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user })
})

export default router