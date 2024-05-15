import express from 'express';
import {WebSocketServer} from 'ws';

const app= express();
const port=8080;


const server= app.listen(port, ()=>{
    console.log(`Server listening on ${port}`)
})

const webSocketServer = new WebSocketServer({server});

webSocketServer.on('connection',(ws)=>{

    ws.on('message',(data)=>{
        console.log('data from client %s', data);
        ws.send(`Thats an ${data.length%2==0 ? 'even': 'odd'} number`)
    })

})