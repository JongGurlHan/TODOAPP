const express = require('express'); //express라는 라이브를 첨부함
const app = express(); // express라이브를 이용해서 새로운 객체 생성
const bodyParser = require('body-parser');
const { response } = require('express');
app.use(bodyParser.urlencoded({extended : true}));
const methodOverride = require('method-override') //html에서 put/delete 요청하기위해
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
// const dotenv = require('dotenv')
// dotenv.config();

app.use('/public', express.static('public')); //static파일을 보관하기위해 public 폴더 쓸거다.

const MongoClient = require('mongodb').MongoClient;

var db; //변수 하나 필요
MongoClient.connect('mongodb+srv://admin:3shan212406@cluster0.nuqju.mongodb.net/myFiresDatabase?retryWrites=true&w=majority',function(err, client){
    if(err) return console.log(err)
    db = client.db('todoapp'); //todoapp 이라는 database(폴더)에 연결
    app.listen(8090, function(){ //서버를 어디서 열지 결정, listen(서버 띄울 포트번호, 띄운 후 실행할 코드)
        console.log('listening on 8090')
    }); 

})


//함수 안의 함수(function(){}): 콜백함수, 순차적으로 실행하고플때 씀
app.get('/', function(req, res){
    res.render(__dirname+'/views/index.ejs');
});

app.get('/write', function(req, res){
    res.render(__dirname+ '/views/write.ejs')
});

// 1. /add로 post 요청하면(폼 전송하면) 
app.post('/add', function(req, res){
    res.send('전송완료');

    //2. DB.counter 내의 총게시물 갯수를 찾음
    db.collection('counter').findOne({name: '게시물갯수'}, function(err, res){
        console.log(res.totalPost); 
        var 총게시물갯수 = res.totalPost; //3. 총게시물 갯수를 변수에 저장

        //4. 이제 DB.post에 새 게시물 저장
        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : req.body.title, 날짜: req.body.date}, function(err, res){ //Object 자료형으로 저장
            console.log('저장완료');

            //5. 저장이 완료되면 db.counter내의 총 게시물 갯수+1
            // $inc(operator): {$inc : {totalPost: 기존값에 더해줄 값}}
            db.collection('counter').updateOne({name: '게시물갯수'},{ $inc : {totalPost:1} }, function(err, res){
                if(err){return console.log(err)}
            }) 

        });     
    }); 
    
    console.log(req.body.title)

});


app.get('/list', function(req, res){    
    // 디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요(.find().toArray();)
    db.collection('post').find().toArray(function(err, rst){
        console.log(rst);
        res.render('list.ejs', {posts : rst}); //마치 model.addAttribute와 같은
    });
});

//특정 게시물 조회
app.get('/search', (req, res) => {
    console.log(req.query.value)
    db.collection('post').find({제목:req.query.value}).toArray((req, res)=>{
        console.log(res)
    })
})


app.delete('/delete', function(req, res){
    //req.body에 담긴 게시물 번호에 따라 db에서 게시물 삭제
    console.log(req.body); 
    req.body._id = parseInt(req.body._id); //int 형변화

    db.collection('post').deleteOne(req.body,function(err, res){
        console.log('삭제완료');
        res.status(200).send({message :'성공했습니다'});
    })
});

//게시물 자세히 보기
app.get('/detail/:id', function(req, res){
    
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, res){
        console.log(res);
     
        res.render('detail.ejs', {data :res});
    });

})

//게시물 수정 페이지 이동
app.get('/edit/:id', function(req, res){

    db.collection('post').findOne({_id: parseInt(req.params.id)}, function(err, res){
        console.log(res);

        res.render('edit.ejs', {data:res})
    });

} )

//게시물 수정
app.put('/edit', function(req, res){


    //$set: 업데이트(없으면 추가)
    db.collection('post').updateOne({_id : parseInt(req.body.id)},{$set : {제목: req.body.title, 날짜 : req.body.date}}, function(err, res){
        console.log('수정완료')
        res.redirect('/list');
    }) 
} );

//Session 방식 로그인 기능
const passport =require('passport');
const LocalStrategy = require('passport-local').Strategy ;
const session = require('express-session');

//app.use(미들웨어:요청과 응답 중간에 실행되는 코드))
app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function(req, res){
    res.render('login.ejs')
});

//passport를 통과해야 function실행
app.post('/login', passport.authenticate('local', {
    failureRedirect:'/fail'
}), function (req, res) {
    res.redirect('/')
});

app.get('/mypage', isLogin, function(req, res){
    req.user //deserializeUser()통해서 찾은 사용자정보
    res.render('mypage.ejs', {user_data : req.user})
})

//로그인 여부 확인하는 미들웨어
function isLogin(req, res, next){
    if(req.user){ //로그인 후 세션이 있으면 req.user가 항상있음
        next()
    }else{
        res.send('로그인 하지 않았습니다.')
    }
}


//'local' strategy(인증방식)
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true, //세션으로 저장할지 
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) { //아이디, 비번 검증하는 콜백함수
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (err, res) {
      
        if (err) return done(err)
    //done(서버에러, 성공시 사용자DB데이터, 에러메시지)
      if (!res) return done(null, false, { message: '존재하지않는 아이디입니다.' })
      if (입력한비번 == res.pw) {
        return done(null, res)
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));
  //이 방식은 보안이 안좋다. 입력한 비번을 암호화해서 비교하는방법으로 개선해야

  //id를 이용해서 세션을 저장(로그인 성공시 발동) +쿠키만들어줌
  //아이디/비번 검증 성공시 res가 user로 보내짐
  passport.serializeUser(function(user, done){
      done(null, user.id)
  });

  //deserializeUser(): 로그인한 유저의 세션 아이디를 바탕으로 개인정보를 db에서 찾는 역할
  //mypage 접속시 db에서 {id:xx}인걸 찾아서 그 결과를 보내줌
  passport.deserializeUser(function(id, done){
      db.collection('login').findOne({id: id},function(err, res){
        //db에서 위에있는 user.id로 유저를 찾음
        done(null, res)
      })    
     
  });







