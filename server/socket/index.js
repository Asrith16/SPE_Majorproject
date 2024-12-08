// const express = require('express')
// const { Server } = require('socket.io')
// const http  = require('http')
// const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
// const UserModel = require('../models/UserModel')
// const { ConversationModel,MessageModel } = require('../models/ConversationModel')
// const getConversation = require('../helpers/getConversation')

// const app = express()

// const frontendUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 
//     'http://localhost:3000' : 
//     'http://192.168.49.2:30000';

// /***socket connection */
// const server = http.createServer(app)
// const io = new Server(server,{
//     cors : {
//         origin : frontendUrl,
//         credentials : true
//     }
// })

// /***
//  * socket running at http://localhost:8080/
//  */

// //online user
// const onlineUser = new Set()

// io.on('connection',async(socket)=>{
//     console.log("connect User ", socket.id)

//     const token = socket.handshake.auth.token 

//     //current user details 
//     const user = await getUserDetailsFromToken(token)

    
//     //create a room
//     socket.join(user?._id.toString())
//     onlineUser.add(user?._id?.toString())

//     io.emit('onlineUser',Array.from(onlineUser))

//     socket.on('message-page',async(userId)=>{
//         console.log('userId',userId)
//         const userDetails = await UserModel.findById(userId).select("-password")
//         console.log(userDetails)
//         const payload = {
//             _id : userDetails?._id,
//             name : userDetails?.name,
//             email : userDetails?.email,
//             profile_pic : userDetails?.profile_pic,
//             online : onlineUser.has(userId)
//         }
//         socket.emit('message-user',payload)


//          //get previous message
//          const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : userId },
//                 { sender : userId, receiver :  user?._id}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })

//         socket.emit('message',getConversationMessage?.messages || [])
//     })


//     //new message
//     socket.on('new message',async(data)=>{

//         //check conversation is available both user

//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         })

//         //if conversation is not available
//         if(!conversation){
//             const createConversation = await ConversationModel({
//                 sender : data?.sender,
//                 receiver : data?.receiver
//             })
//             conversation = await createConversation.save()
//         }
        
//         const message = new MessageModel({
//           text : data.text,
//           imageUrl : data.imageUrl,
//           videoUrl : data.videoUrl,
//           msgByUserId :  data?.msgByUserId,
//         })
//         const saveMessage = await message.save()

//         const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
//             "$push" : { messages : saveMessage?._id }
//         })

//         const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : data?.sender, receiver : data?.receiver },
//                 { sender : data?.receiver, receiver :  data?.sender}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })


//         io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
//         io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

//         //send conversation
//         const conversationSender = await getConversation(data?.sender)
//         const conversationReceiver = await getConversation(data?.receiver)

//         io.to(data?.sender).emit('conversation',conversationSender)
//         io.to(data?.receiver).emit('conversation',conversationReceiver)
//     })


//     //sidebar
//     socket.on('sidebar',async(currentUserId)=>{
//         console.log("current user",currentUserId)

//         const conversation = await getConversation(currentUserId)

//         socket.emit('conversation',conversation)
        
//     })

//     socket.on('seen',async(msgByUserId)=>{
        
//         let conversation = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : msgByUserId },
//                 { sender : msgByUserId, receiver :  user?._id}
//             ]
//         })

//         const conversationMessageId = conversation?.messages || []

//         const updateMessages  = await MessageModel.updateMany(
//             { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
//             { "$set" : { seen : true }}
//         )

//         //send conversation
//         const conversationSender = await getConversation(user?._id?.toString())
//         const conversationReceiver = await getConversation(msgByUserId)

//         io.to(user?._id?.toString()).emit('conversation',conversationSender)
//         io.to(msgByUserId).emit('conversation',conversationReceiver)
//     })

//     //disconnect
//     socket.on('disconnect',()=>{
//         onlineUser.delete(user?._id?.toString())
//         console.log('disconnect user ',socket.id)
//     })
// })

// module.exports = {
//     app,
//     server
// }
 

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

// Frontend URL for CORS
const frontendUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 
    'http://localhost:3000' : 
    'http://192.168.49.2:30000';

/*** Socket connection setup */
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: frontendUrl,
        credentials: true,
    }
});

// Online users set
const onlineUser = new Set();

io.on('connection', async (socket) => {
    console.log("Connected user:", socket.id);

    // Retrieve token from the handshake
    const token = socket.handshake.auth.token;

    try {
        // Get user details from the token
        const user = await getUserDetailsFromToken(token);
        if (!user) {
            return socket.emit('error', { message: 'User authentication failed' });
        }

        // Create a room for the user and add to online users
        socket.join(user._id.toString());
        onlineUser.add(user._id.toString());
        io.emit('onlineUser', Array.from(onlineUser));

        // Send user details to the client
        socket.on('message-page', async (userId) => {
            const userDetails = await UserModel.findById(userId).select("-password");
            const payload = {
                _id: userDetails?._id,
                name: userDetails?.name,
                email: userDetails?.email,
                profile_pic: userDetails?.profile_pic,
                online: onlineUser.has(userId),
            };
            socket.emit('message-user', payload);

            // Get previous messages
            const conversationMessage = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: userId },
                    { sender: userId, receiver: user._id }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            socket.emit('message', conversationMessage?.messages || []);
        });

        // Handle sending a new message
        socket.on('new message', async (data) => {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            });

            // If conversation doesn't exist, create one
            if (!conversation) {
                conversation = await new ConversationModel({
                    sender: data?.sender,
                    receiver: data?.receiver
                }).save();
            }

            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data?.msgByUserId,
            });

            const saveMessage = await message.save();

            await ConversationModel.updateOne(
                { _id: conversation._id },
                { "$push": { messages: saveMessage._id } }
            );

            const updatedConversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data?.sender, receiver: data?.receiver },
                    { sender: data?.receiver, receiver: data?.sender }
                ]
            }).populate('messages').sort({ updatedAt: -1 });

            io.to(data?.sender).emit('message', updatedConversation?.messages || []);
            io.to(data?.receiver).emit('message', updatedConversation?.messages || []);

            // Send updated conversation
            const conversationSender = await getConversation(data?.sender);
            const conversationReceiver = await getConversation(data?.receiver);

            io.to(data?.sender).emit('conversation', conversationSender);
            io.to(data?.receiver).emit('conversation', conversationReceiver);
        });

        // Sidebar request
        socket.on('sidebar', async (currentUserId) => {
            const conversation = await getConversation(currentUserId);
            socket.emit('conversation', conversation);
        });

        // Mark messages as seen
        socket.on('seen', async (msgByUserId) => {
            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: msgByUserId },
                    { sender: msgByUserId, receiver: user._id }
                ]
            });

            const conversationMessageId = conversation?.messages || [];
            await MessageModel.updateMany(
                { _id: { "$in": conversationMessageId }, msgByUserId },
                { "$set": { seen: true } }
            );

            // Send updated conversation
            const conversationSender = await getConversation(user._id.toString());
            const conversationReceiver = await getConversation(msgByUserId);

            io.to(user._id.toString()).emit('conversation', conversationSender);
            io.to(msgByUserId).emit('conversation', conversationReceiver);
        });

        // Disconnect handling
        socket.on('disconnect', () => {
            onlineUser.delete(user._id.toString());
            io.emit('onlineUser', Array.from(onlineUser));
            console.log('Disconnected user:', socket.id);
        });

    } catch (error) {
        console.error('Connection error:', error);
        socket.emit('error', { message: 'An error occurred during connection' });
    }
});

module.exports = {
    app,
    server
};
