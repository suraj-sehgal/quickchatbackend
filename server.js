const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./Routes/userRoutes');
const {notFound,errorHandler} = require('./middlewares/errorMiddleware');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoutes');

dotenv.config();

connectDB();
const app = express();

app.use(express.json());  //to accept json data


const PORT=process.env.PORT;


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);


// error handling middleware
// app.use(notFound);
// app.use(errorHandler);



const server = app.listen(PORT, () => {
    console.log(`QuickChat app backend listening on port http://localhost:${PORT}`.yellow.bold)
})

const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors:{
        origin:"http://localhost:3000",
    },
});

io.on("connection",(socket)=>{
    // console.log("Connected to socket.io");
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat",(room)=>{
        socket.join(room);
        console.log("User Joined Room :"+room);
    });

    socket.on("typing",(room)=>socket.in(room).emit("typing"));
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"))

    socket.on("new message",(newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log("chat users not defined");

        chat.users.forEach((user)=>{
            if(user._id===newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message received",newMessageRecieved);
        });
    });

    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });

});
