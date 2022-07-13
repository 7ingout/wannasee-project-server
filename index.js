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

app.get('/genre', async (req, res)=> {
    connection.query(
        "select * from concert_table order by rank_location asc",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})

app.get('/region', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})
app.get('/period', async (req, res)=> {
    connection.query(
        "select * from concert_table",
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
        `select * from concert_table where id=${id}`,
        (err, rows, fields)=>{
            res.send(rows[0]);
        }
    )
})
app.get('/genre/:genre', async (req, res)=> {
    const params = req.params;
    const { genre } = params;
    connection.query(
        `select * from concert_table where genre=${genre}`,
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})
app.put('/editConcert/:id', async (req,res)=>{
    // 파라미터 값을 가지고 있는 객체
    const params = req.params;
    const { id } = params;
    const body = req.body;
    const { c_title, c_singer, c_genre, c_location, c_price, c_date } = body;
    connection.query(
        `update concert_table
        set title='${c_title}', singer='${c_singer}', genre='${c_genre}', location='${c_location}', price='${c_price}', date='${c_date}'
        where id = ${id}`,
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})

// 서버실행
app.listen(port, () => {
    console.log("서버가 돌아가고 있습니다.")
})
