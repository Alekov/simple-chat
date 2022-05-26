const path = require('path')

const { clients } = require('../util/clients')

module.exports = function (app, passport) {
    app.get('/', (req, res, next) => {
        if (req.user && req.user.nickname) {
            res.redirect('/chat')
        } else {
            res.redirect('/login')
        }
    })

    app.get('/login', (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/chat')
        } else {
            res.render('login.html')
        }
    })

    app.post('/login', async (req, res, next) => {
        if (clients.get(req.body.nickname)) {
            return res.redirect('/login')
        }

        clients.set(req.body.nickname, { nickname: req.body.nickname })

        await passport.authenticate('local-login', function (err, data, message) {
            if (err) {
                res.redirect('/login')
            } else if (!data) {
                res.redirect('/login')
            } else {
                req.logIn(data, function (err) {
                    if (err) return next(err)
                    return res.redirect('/chat')
                })
            }
        })(req, next)
    })

    app.get('/chat', (req, res, next) => {
        if (req.user && req.user.nickname) {
            res.render('chat.html', { user: req.user })
        } else {
            res.redirect('/login')
        }
    })
}
