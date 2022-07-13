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

// 장르별 페이지
app.get('/genre', async (req, res)=> {
    connection.query(
        "select * from concert_table order by rank_location asc",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})

app.get('/genre/:genre', async (req, res)=> {
    const params = req.params;
    connection.query(
    `select * from customers_table where genre=${params.genre}`,
        (err, rows, fields)=> {
            res.send(rows[0])
        }
    )
})


// 지역별 페이지
app.get('/region', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})


// 기간별 페이지
app.get('/period', async (req, res)=> {
    connection.query(
        "select * from concert_table",
        (err, rows, fields)=> {
            res.send(rows)
            console.log(fields);
        }
    )
})

// 서버실행
app.listen(port, () => {
    console.log("서버가 돌아가고 있습니다.")
})
