const http = require('http')

http.createServer((request, response) => {
    console.log('we had received a request')
    let body = []
    request.on('error', (err) =>{
        console.error(err)
    }).on('data', (chunk) => { 
        /* chunked body 
         */
        // console.log(chunk)
        // chunk 是储存 Buffer类型的TCP流文件 
        body.push(chunk.toString()) // 将二进制文件转化为string
    }).on('end', ()=>{
        // body = Buffer.concat(body).toString()
        // console.log(body)
        // console.log('body:', body)
        console.log('响应')
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end(`<html meta="utf-8">
<head>
<style>
html{
    width:100vw;
    height:100vh;
    background:#000;
}
#box{
    width:200px;
    height:200px;
    background:red;
}
</style>
</head>
<body>
<div id="box">Hello World</div>
</body>
</html>`)
        console.log('结束')
        
        // response.end(`<html>
        // <div>
        //     我的妈呀
        // </div>
        // </html>`)
    })
}).listen(8088)

console.log('server started') 