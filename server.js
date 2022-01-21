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

    app.listen(8080, function(){ //서버를 어디서 열지 결정, listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
        console.log('listening on 8080')
    }); 

})


//함수 안의 함수(function(){}): 콜백함수, 순차적으로 실행하고플때 씀
app.get('/', function(req, rep){
    rep.sendFile(__dirname+'/index.html');
});

app.get('/write', function(req, rep){
    rep.sendFile(__dirname+ '/write.html')
});

app.post('/add', function(req, rep){
    rep.send('전송완료');
    db.collection('post').insertOne({제목 : req.body.title, 날짜: req.body.date}, function(err, rst){ //Object 자료형으로 저장
        console.log('저장완료');
    });
    console.log(req.body.title)

});


app.get('/list', function(req, rep){
    rep.render('list.ejs')

});