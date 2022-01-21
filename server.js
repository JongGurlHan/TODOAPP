const express = require('express'); //express라는 라이브를 첨부함
const app = express(); // express라이브를 이용해서 새로운 객체 생성
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;

var db; //변수 하나 필요
MongoClient.connect('mongodb+srv://admin:3shan212406@cluster0.nuqju.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
                    function(err, client){

    if(err) return console.log(err)

    db = client.db('todoapp'); //todoapp 이라는 database(폴더)에 연결

    app.listen(8090, function(){ //서버를 어디서 열지 결정, listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
        console.log('listening on 8090')
    }); 

})


//함수 안의 함수(function(){}): 콜백함수, 순차적으로 실행하고플때 씀
app.get('/', function(req, rep){
    rep.sendFile(__dirname+'/index.html');
});

app.get('/write', function(req, rep){
    rep.sendFile(__dirname+ '/write.html')
});

// 1. /add로 post 요청하면(폼 전송하면) 
app.post('/add', function(req, rep){
    rep.send('전송완료');

    //2. DB.counter 내의 총게시물 갯수를 찾음
    db.collection('counter').findOne({name: '게시물갯수'}, function(err, rst){
        console.log(rst.totalPost); 
        var 총게시물갯수 = rst.totalPost; //3. 총게시물 갯수를 변수에 저장

        //4. 이제 DB.post에 새 게시물 저장
        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : req.body.title, 날짜: req.body.date}, function(err, rst){ //Object 자료형으로 저장
            console.log('저장완료');

            //5. 저장이 완료되면 db.counter내의 총 게시물 갯수+1
            // $inc(operator): {$inc : {totalPost: 기존값에 더해줄 값}}
            db.collection('counter').updateOne({name: '게시물갯수'},{ $inc : {totalPost:1} }, function(err, rst){
                if(err){return console.log(err)}
            }) 

        });


    }); 
    
    console.log(req.body.title)

});


app.get('/list', function(req, rep){
    
    // 디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요(.find().toArray();)
    db.collection('post').find().toArray(function(err, rst){
        console.log(rst);
        rep.render('list.ejs', {posts : rst}); //마치 model.addAttribute와 같은
    });



});