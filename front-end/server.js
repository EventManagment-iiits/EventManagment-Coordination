const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const viewsPath = __dirname;

app.set('views', viewsPath);
app.set('view engine', 'ejs');

// Serve static assets (css, js, assets) from front-end root
app.use(express.static(__dirname));

app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup-organizer', (req, res) => res.render('signup-organizer'));
app.get('/signup-attendee', (req, res) => res.render('signup-attendee'));
app.get('/signup-staff', (req, res) => res.render('signup-staff'));
app.get('/admin', (req, res) => res.render('admin'));
app.get('/organizer', (req, res) => res.render('organizer'));
app.get('/attendee', (req, res) => res.render('attendee'));
app.get('/staff', (req, res) => res.render('staff'));
app.get('/super-user', (req, res) => res.render('super-user'));

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`EMCP front-end running at http://localhost:${PORT}`);
});
