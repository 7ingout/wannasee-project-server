const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs")
const dbinfo = fs.readFileSync('./database.json');
const conf = JSON.parse(dbinfo)

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database:  conf.database
})

app.use(express.json());
app.use(cors());
// 장르
app.get('/genre', async (req, res)=> {
    connection.query(
        "select * from concert_table order by rank_location asc",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
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
            console.log(fields);
        }
    )
})
// 지역
app.get('/region', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
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
            console.log(fields);
        }
    )
})
// 기간
app.get('/period', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})
// 기간별 // 7_8월
app.get('/period/:month', async (req, res)=> {
    const params = req.params;
    const { cmonth } = params;
    connection.query(
        `select * from concert_table where month(concertdate)=${cmonth}`,
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
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
            console.log(fields);
        }
    )
})


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
    const { c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place } = body;
    if(!c_title) {
        res.send("모든 필드를 입력해주세요");
    }
    connection.query(
        "insert into concert_table(title, singer, genre, location, concertdate, price, start_time, end_time, description, concert_place) values(?,?,?,?,?,?,?,?,?,?)",
        [c_title, c_singer, c_genre, c_location, c_concertdate, c_price, c_start_time, c_end_time, c_description, c_concert_place],
        (err, rows, fields)=>{
            res.send(err);
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
