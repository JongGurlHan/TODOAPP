const express = require('express'); //express라는 라이브를 첨부함
const app = express(); // express라이브를 이용해서 새로운 객체 생성

app.listen(8080, function(){
    console.log('test~!!')
}); //서버를 어디서 열지 결정, listen(서버 띄울 포트번호, 띄운 후 실행할 코드)

app.get('/pet', function(req, rep){
    rep.send('펫용품 사이트잉ㅂ니다.');
});