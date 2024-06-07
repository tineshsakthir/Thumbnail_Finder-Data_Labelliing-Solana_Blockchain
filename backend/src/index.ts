import express from 'express' ; 
import userRouter from './router/user' ; 
import workerRouter from './router/worker' ;
import cors from 'cors' ;

const app = express() ; 

app.use(express.json()) ; 

app.use(cors()) ; 

app.use('/v1/user', userRouter) ; 
app.use('/v1/worker', workerRouter) ; 

app.listen(3000 , () => {
    console.log('Server is running on port 3000') ; 
}) ;