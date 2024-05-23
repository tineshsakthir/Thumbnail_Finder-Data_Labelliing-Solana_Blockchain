import express from 'express' ; 
import userRouter from './router/user' ; 
import workerRouter from './router/worker' ;

const app = express() ; 

app.use('/v1/user', userRouter) ; 
app.use('/v1/worker', workerRouter) ; 

app.listen(3000 , () => {
    console.log('Server is running on port 3000') ; 
}) ;