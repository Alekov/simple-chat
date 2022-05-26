const LocalStrategy = require('passport-local').Strategy

const { clients } = require('../util/clients')

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user)
    })

    passport.deserializeUser((user, done) => {
        done(null, clients.get(user.nickname))
    })

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'nickname',
                passwordField: 'nickname',
            },
            (req, nickname, done) => {
                return done(null, clients.get(nickname))
            }
        )
    )
}
