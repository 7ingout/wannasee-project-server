const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs")
const dbinfo = fs.readFileSync('./database.json');
const conf = JSON.parse(dbinfo);


//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// 업로드 이미지를 관리하는 스토리지 서버를 연결 -> multer를 사용하겠다.
// const multer = require("multer");
// // 이미지 파일 요청이 오면 어디에 저장할건지 지정
// const upload = multer({ 
//     storage: multer.diskStorage({
//         destination: function(req, file, cb){
//             // 어디에 저장할거냐? upload/
//             cb(null, 'upload/')
//         },
//         filename: function(req, file, cb){
//             // 어떤 이름으로 저장할거야?
//             // file 객체의 오리지널 이름으로 저장하겠다.
//             cb(null, file.originalname)
//         }
//     })
// });

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database:  conf.database
})

app.use(express.json());
app.use(cors());

// 회원가입
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
//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// upload폴더에 있는 파일에 접근할 수 있도록 설정
// app.use("/upload", express.static("upload"));
// app.post('/image', upload.single('image'), (req,res)=>{
//     const file = req.file;
//     console.log(file);
//     res.send({
//         imageUrl: "https:localhost:3000/"+file.destination+file.filename
//     })
// })
// app.use("/upload", express.static("upload"));
// app.post('/image', upload.single('c_imgsrc'), (req,res)=>{
//     const file = req.file;
//     console.log(file);
//     res.send({
//         // imageUrl: "https://lamp-shopping-server-zoaseo.herokuapp.com/"+file.destination+file.filename

//     })
// })
//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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
    connection.query(
        `select * from concert_table where weekend=${weekend}`,
        (err, rows, fields)=> {
            res.send(rows)
        }
    )
})
// 기간별 // 7_8월
app.get('/period/july', async (req, res)=> {
    // const params = req.params;
    // console.log(params);
    // const { month } = params;
    connection.query(
        // `select * from concert_table where month(DATE_FORMAT(concertdate, "%Y-%m-%d"))=7`,
        "select * from concert_table where month(concertdate)=7",
        (err, rows, fields)=> {
            res.send(err)
        }
    )
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
    const { c_title, c_singer, c_genre, c_location, c_price, c_concertdate, c_start_time, c_end_time, c_description, c_concert_place } = body;
    connection.query(
        `update concert_table
        set title='${c_title}', singer='${c_singer}', genre='${c_genre}', location='${c_location}', price='${c_price}', concertdate='${c_concertdate}'
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
    const {c_imgsrc, c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place } = body;
    if(!c_title) {
        res.send("모든 필드를 입력해주세요");
    }
    connection.query(
        "insert into concert_table( imgsrc, title, singer, genre, location, concertdate, price, start_time, end_time, description, concert_place) values(?,?,?,?,?,?,?,?,?,?,?)",
        [c_imgsrc, c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place],
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

// 서버실행
app.listen(port, () => {
    console.log("서버가 돌아가고 있습니다.")
})
