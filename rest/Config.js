module.exports = {
    PORT:  process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI ||  "mongodb://localhost:27017/esd_website",
    JWT_SECRET: "7:-/X<Q:Pmf8!K@!",
    MAIL_AUTH: {
        user: "ibuesd@gmail.com",
        pass: "sifrusmodalipr"
    },
    MAILING_LIST: [
        'aldin.kovacevic.97@gmail.com',
        'lejlaimsirovic3@gmail.com'
    ]
}
