const express = require("express");
const keys = require("./config/keys");
const mogoose = require("mongoose");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const passport = require("passport");
var cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/public", express.static("public"));
const PORT = process.env.PORT || 5000;

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const voteRoute = require('./routes/voteRoute');
const projectRoute = require('./routes/projectRoute');
const internshipRoute = require('./routes/internshipRoute');

require("./services/passport");

mogoose
	.connect(
		keys.MONGO_URI,

		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => {
		console.log("Connected to DB");
	})
	.catch((err) => {
		console.log(err);
	});

app.use(
	cookieSession({
		name: "college",
		maxAge: 30 * 24 * 60 * 60 * 1000,
		keys: [keys.cookieKey],
	})
);

app.use(passport.initialize());
app.use(passport.session());
app.use('', authRoute);
app.use('/user', userRoute);
app.use('/api/question', voteRoute);
app.use('/api/projects', projectRoute);
app.use('/api/internships', internshipRoute);
app.listen(PORT, () => {
	console.log(`Server running on ${PORT}`);
});
