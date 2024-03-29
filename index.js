const express = require("express");
const cors = require("cors");
const app = express();
// const port = 3001;
const port = process.env.PORT || 3001;
const mysql = require("mysql");
const fs = require("fs")
const dbinfo = fs.readFileSync('./database.json');
const conf = JSON.parse(dbinfo);

// 08-19 이미지 부분 추가수정
const multer = require("multer");
//

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
})

app.use(express.json());
app.use(cors());


// 08-19 이미지 부분 추가수정
app.use("/upload", express.static("upload"));
// 파일 요청시 파일이 저장될 경로와 파일이름(요청된 원본파일이름) 지정
const storage = multer.diskStorage({
    destination:"./upload",
    filename: function(req, file, cb) {
        cb(null, file.originalname); // 원본 파일 이름과 똑같이 저장하겠다
    }
})
// 업로드 객체
const upload = multer({
    storage: storage,
    limits: { fieldSize: 1000000 }
})
// upload 경로로 post 요청이 왔을 경우 응답
app.post("/upload", upload.single("c_imgsrc"), function(req, res, next){
    res.send({
        c_imgsrc: req.file.filename
    })
})
//
//
//




// 회원가입
app.post('/join', async (req,res)=>{
    const body = req.body;
    const { id, name, phone, email, add, adddetail, password } = body;
    const query = "INSERT INTO users(userId, userName, phone, email, address, adddetail, password) values(?,?,?,?,?,?,?)";
    connection.query(
                    query, 
                    [id, name, phone, email, add, adddetail, password], 
                    (err, rows, fields) => {
                        res.send(err);
                    });

})

// 로그인 id 중복확인
app.get('/idCh', async (req,res)=>{
    connection.query(
        "select userId from users",
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})

// 장르
app.get('/genre', async (req, res)=> {
    connection.query(
        "select * from concert_table order by rank_location asc",
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 장르별
app.get('/genre/:genre', async (req, res)=> {
    const params = req.params;
    const { genre } = params;
    connection.query(
        `select * from concert_table where genre='${genre}'`,
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 지역
app.get('/region', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 지역별
app.get('/region/:rank_location', async (req, res)=> {
    const params = req.params;
    const { rank_location } = params;
    connection.query(
        `select * from concert_table where rank_location=${rank_location}`,
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 기간
app.get('/period', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})

// 기간별 // 주말
app.get('/period/:weekend', async (req, res)=> {
    const params = req.params;
    const { weekend } = params;
    if(weekend == 7 ) {
        connection.query(
            `select * from concert_table where month(concertdate) = ${weekend}`,
            (err, rows, fields)=> {
                res.send(rows)
            }
        )
    } else if(weekend == 8) {
        connection.query(
            `select * from concert_table where month(concertdate) = ${weekend}`,
            (err, rows, fields)=> {
                res.send(rows)
            }
        )
    } else {
        connection.query(
            `select * from concert_table where weekend=${weekend}`,
            (err, rows, fields)=> {
                res.send(rows)
            }
        )
    }

})

app.post('/join', async (req,res)=>{
    const body = req.body;
    const { id, name, phone, email, add, detailadd, password } = body;
    const query = "INSERT INTO users(userId, userName, phone, email, address, detailadd, password) values(?,?,?,?,?,?,?)";
    connection.query(
                    query, 
                    [id, name, phone, email, add, detailadd, password], 
                    (err, rows, fields) => {
                        res.send(err);
                    });

})

// 상세보기
app.get('/detailview/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    connection.query(
        `select title, singer, genre, location, price, DATE_FORMAT(concertdate, "%Y-%m-%d") as concertdate, imgsrc, rank_location, description, start_time, end_time, concert_place from concert_table where id=${id}`,
        (err, rows, fields)=>{
            res.send(rows[0]);
        }
    )
})

// 콘서트 수정
app.put('/editConcert/:id', async (req,res)=>{
    // 파라미터 값을 가지고 있는 객체
    const params = req.params;
    const { id } = params;
    const body = req.body;
    const { c_imgsrc, c_rank_location, c_title, c_singer, c_genre, c_location, c_price, c_concertdate, c_start_time, c_end_time, c_description, c_concert_place } = body;
    connection.query(
        `update concert_table
        set imgsrc='${c_imgsrc}', rank_location='${c_rank_location}', title='${c_title}', singer='${c_singer}', genre='${c_genre}', location='${c_location}', price='${c_price}', concertdate='${c_concertdate}'
        , start_time='${c_start_time}', end_time='${c_end_time}', description='${c_description}', concert_place='${c_concert_place}'
        where id = ${id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 콘서트 추가
app.post('/addConcert', async (req,res)=>{
    const body = req.body;
    const {c_rank_location, c_imgsrc, c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place } = body;
    if(!c_title) {
        res.send("모든 필드를 입력해주세요");
    }
    connection.query(
        "insert into concert_table(rank_location, imgsrc, title, singer, genre, location, concertdate, price, start_time, end_time, description, concert_place) values(?,?,?,?,?,?,?,?,?,?,?,?)",
        [c_rank_location, c_imgsrc, c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place],
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 콘서트 삭제
app.delete('/delConcert/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    console.log("삭제");
    connection.query(
        `delete from concert_table where id=${id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 로그인
app.get('/getId/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    connection.query(
        `select userId from users where userId='${id}'`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})
app.get('/getPw/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    connection.query(
        `select password from users where userId='${id}'`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 예매내역
app.get('/mypage/:idid', async (req,res)=>{
    const params = req.params;
    const { idid } = params;
    connection.query(
        `select id, user_title, user_region, user_location, DATE_FORMAT(user_date, "%Y-%m-%d") as user_date, user_start, user_num from user_reserve where user_id='${idid}'`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 예매내역에 추가
app.put('/addReservation', async (req,res)=>{
    const body = req.body;
    const {c_user_id, c_user_title, c_user_region, c_user_location, c_user_date, c_user_start, c_user_num} = body;
    connection.query(
        "insert into user_reserve( user_id, user_title, user_region, user_location, user_date, user_start, user_num) values(?,?,?,?,?,?,?)",
        [c_user_id, c_user_title, c_user_region, c_user_location, c_user_date, c_user_start, c_user_num],
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 예매내역에 삭제
app.delete('/delReservation/:id', async (req,res)=>{
    const params = req.params;
    const { id } = params;
    console.log("삭제");
    connection.query(
        `delete from user_reserve where id=${id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 서버실행
app.listen(port, () => {
    console.log("서버가 돌아가고 있습니다.")
})
