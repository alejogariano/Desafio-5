import { Router } from 'express'
import User from '../../models/user.js'
import Cart from '../../models/cart.js'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El email ya está en uso.' })
        }
        
        const newUser = new User({ first_name, last_name, email, age, password })

        const newCart = new Cart()
        await newCart.save()

        newUser.cart = newCart._id
        await newUser.save()
        
        res.status(200).json({ success: true, message: 'Usuario registrado con éxito.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Error al registrar usuario.' })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            req.session.user = {
                first_name: 'Admin',
                last_name: '',
                email: email,
                role: 'admin',
            }
            return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso. Redirigiendo...', redirectUrl: '/products' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrecta' })
        }

        req.session.user = {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role || 'user',
        }
        
        res.status(200).json({ success: true, message: 'Inicio de sesión exitoso. Redirigiendo...', redirectUrl: '/products' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: 'Error al iniciar sesión.' })
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error al cerrar sesión')
        res.redirect('/login')
    })
})

export default router