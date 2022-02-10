var router = require('express').Router(); //npm으로 설치했던 express 라이브러리의 Router()함수를 쓰겠습니다.

//로그인 여부 확인하는 미들웨어
function isLogin(req, res, next){
    if(req.user){ //로그인 후 세션이 있으면 req.user가 항상있음
        next()
    }else{
        res.send('로그인 하지 않았습니다.')
    }
}

//특정 라우터파일에 미들웨어를 적용하고 싶으면 
//router.use(isLogin); //여기있는 모든 url에 적용할 미들웨어
router.use('/shirts' , isLogin); // : 특정 라우터에만 적용

router.get('/shirts', isLogin, function(req, res){
    res.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function(req, res){
    res.send('바지 파는 페이지입니다.');
});

module.exports = router;
// module.exports = 내보낼 변수명 : js파일을 다른 파일에서 갔다쓰고 싶을때 
// 다른 곳에서 shop.js를 가져다 쓸때 내보낼 변수
// *require: 특정파일, 혹은 라이브러리를 가져다 쓸때 