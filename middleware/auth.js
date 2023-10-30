const jwt = require('jsonwebtoken')

const auth = (req,res, next) =>{
    //grab token from cookies
    console.log(req.cookies);
    
    const {token} = req.cookies
    
    //if no token, stop there
    if(!token) {
        res.status(403).send('please login first')
    }
    //decode that token and get id //here there is chance to fail, so use try-catch block
   try {
    const decode = jwt.verify(token, 'shhh')
    console.log(decode);
    req.user = decode //user can access decode through middleware

   } catch (error) {
    console.log(error);
    res.status(401).send('invalid token')
   }
    //query Db for that user ID

    return next()
}

module.exports = auth
