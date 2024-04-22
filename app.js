const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./config/db');

const storiesRoutes = require('./routes/stories');
const progressRoutes = require('./routes/progess');
const checkCodeRoute = require('./routes/checkCode');
const questionRoutes = require('./routes/questions');
const secretWordRoutes = require('./routes/getSecret');
const paymentRoutes = require('./routes/paymentRoutes');

app.use(express.json());
app.use(cors());
app.use('/api/payments', paymentRoutes);
app.use('/api', checkCodeRoute);
app.use('/api', questionRoutes);
app.use('/api', storiesRoutes);
app.use('/api', progressRoutes);
app.use('/api', secretWordRoutes);

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});