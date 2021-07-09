const app = express()
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const port = 3000;

const secretKey = 'thisisverysecretkey'

                                     /* ------------- CONECTION DATABASE ------------- */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "db_kamera"
})

db.connect((err) => {
    if (err) throw err
    console.log('terhubung dengan database')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

                                              /** ------------ TOKEN ------------ */

const isAuthorized = (request, result, next) => {

    if (typeof(request.headers['x-api-key']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }


    let token = request.headers['x-api-key']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })  
    next()
}

                                  /** ------------- LOGIN AND REGITRASI USER ---------------- */
/* endpoint yang digunakan untuk melakukan login */
app.post('/login', (request, result) => { 
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

            if (results.length > 0) {
                let token = jwt.sign(data.username + '|' + data.password, secretKey)

                result.json ({
                success: true,
                message: 'Login success, welcome back Admin!',
                token: token
            });
        
            } else {
                result.json ({
                success: false,
                message: 'You are not person with username admin and have password admin!'
            });

            }
            result.end();
        });
    }
});

/* endpoint untuk melakukan registrasi */
app.post('/registrasi', isAuthorized, (req, res) => { 
    let data = req.body
    let sql = 
    `
        insert into users (username, password)
        values ('`+data.username+`', '`+data.password+`')
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Registrasi berhasil", 
            data: result
        })
    })
})

                                              /* -------- CRUD USERS ------- */ 

/*mengambil data dari database users (read)*/
app.get('/users', isAuthorized, (req, res) => { 
    let sql = `
        select id, username, created_at from users ` /** hanya menampilkan username dan created_at */

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "berhasil menampilkan data", 
            data: result
        })
    })
})

/** menambahkan data baru user pada database */
app.post('/users', isAuthorized, (req, res) => { 
    let data = req.body

    let sql = `
        insert into users (username, password)
        values ('`+data.username+`', '`+data.password+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data user ditambahkan", 
            data: result
        })
    })
})

/** menampilkan data sesuai dengan id */
app.get('/users/:id', isAuthorized, (req, res) => { 
    let sql = `
        select * from users
        where id = `+req.params.id+`
        limit 1
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil ditampilkan sesuai id",
            data: result[0]
        })
    })
})

/** endpoint untuk mengubah data users sesuai id yang akan diubah datanya */
app.put('/users/:id', isAuthorized, (req, res) => { 
    let data = req.body

    let sql = `
        update users
        set username = '`+data.username+`', password = '`+data.password+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil diubah",
            data: result
        })
    })
})

/** endpoint untuk menghapus data */
app.delete('/users/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from users
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        
            res.json({
            message: "Data berhasil dihapus",
            data: result
        })
    })
})

                                                /* --------- CRUD kamera --------- */
/** endpoint untuk mengambil atau menampilkan data kamera */
app.get('/kamera', isAuthorized, (req, res) => {
    let sql = 
    `
        select jenis, warna, merk, created_at from kamera` /*hanya menampilkan jenis warna merk created_at saja*/

    db.query(sql, (err, result) => {
        if (err) throw err

            res.json({
            message: "Data berhasil diambil dari database",
            data: result
        })
    })
})

/** endpoint untuk menambahkan data kamera */
app.post('/kamera', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into kamera (jenis,warna,merk, stock)
        values ('`+data.jenis+`', '`+data.warna+`', '`+data.merk+`', '`+data.stock+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data kamera ditambahkan",
            data: result
        })
    })
})

/** endpoint untuk menampilkan data kamera sesuai id yang ditentukan */
app.get('/kamera/:id', isAuthorized, (req, res) => {
    let sql = `
        select * from kamera
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil ditampilkan sesuai id",
            data: result[0]
        })
    })
})

/** endpoint untuk mengubah data kamera */
app.put('/kamera/:id', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update kamera
        set jenis = '`+data.jenis+`', warna = '`+data.warna+`', merk = '`+data.merk+`', stock = '`+data.stock+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil diubah",
            data: result
        })
    })
})

/** endpoint untuk menghapus data kamera */
app.delete('/kamera/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from kamera
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        
        res.json({
            message: "Data berhasil dihapus",
            data: result
        })
    })
})

                                            /* ---------- CRUD TRANSAKSI ---------- */
/** endpoint untuk menambahkan data transaksi */
app.post('/kamera/:id/take', (req, res) => {
    let data = req.body

    db.query(`
        insert into user_kamera (user_id, kamera_id)
        values ('`+data.user_id+`', '`+req.params.id+`')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update kamera
        set stock = stock - 1
        where id = '`+req.params.id+`'`, 
        (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "kamera has been taked by user"
    })
})

/** endpoint untuk mengambil atau menampilkan data transaksi */
app.get('/users/:id/kamera', (req, res) => {
    db.query(`
        select kamera.jenis, kamera.warna, kamera.merk
        from users
        right join user_kamera on users.id = user_kamera.user_id
        right join kamera on user_kamera.kamera_id = kamera.id
        where user_kamera.id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get user's kamera",
            data: result
        })
    })
})

/** endpoint untuk mengubah data transaksi */
app.put('/users/:id/update', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update user_kamera
        set user_id = '`+data.user_id+`', kamera_id = '`+data.kamera_id+`'
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data berhasil diubah",
            data: result
        })
    })
})

/** endpoint untuk menghapus data transaksi */
app.delete('/users/:id/delete', isAuthorized, (req, res) => {
    let sql = `
        delete from user_kamera
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err
        
        res.json({
            message: "Data berhasil dihapus",
            data: result
        })
    })
})

/** BERJALAN PADA PORT */
app.listen(port, () => {
    console.log('Aplikasi berjalan pada port ' + port)
})
