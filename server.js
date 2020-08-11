const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'raphael',
        password: 'admin',
        database: 'faceRecognitionApp'
    }
});


const app = express();

app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'Raphael',
            password: 'bafenta',
            email: 'raphael@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Vitoria',
            password: 'hulk',
            email: 'vitoria@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: 'raphael@gmail.com'
        }
    ]
}

const searchUser = (id) => {
    let found = false;
    let userReturn;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            userReturn = user;
            return;
        }
    });
    if (!found) {
        return false;
    } else {
        return userReturn;
    }
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid){
                return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0]);
                })
                .catch(err => res.status(400).json('unable to get user'));
            } else {
                res.status(400).json('wrong credentials');
            }
        })
        .catch(err =>res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    database.users.push({
        id: '125',
        name: name,
        email: email,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    const user = searchUser(id);
    if (user === false) {
        res.status(404).json('not found');
    }
    else {
        res.json(user);
    }
});

app.put('/image', (req, res) => {
    const { id } = req.body;
    const user = searchUser(id);
    if (user === false) {
        res.status(404).json('not found');
    } else {
        user.entries++;
        res.json(user.entries);
    }
});

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, () => {
    console.log('app is running on port 3000');
});
