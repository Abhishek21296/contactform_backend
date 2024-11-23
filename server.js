var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var cors = require('cors');
const fs = require('fs');
const creds = require('./config');
const serverPort = 5000;

//For HTTPS
//const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

app.get('/', (req, res) => {
	res.json('hi');
});

var transport = {
	host: creds.HOST,
	port: creds.MAILPORT,
	auth: {
		user: creds.USER,
		pass: creds.PASS,
	},
	secure: true
};

var transporter = nodemailer.createTransport(transport);
console.log(transport);
transporter.verify((error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log('Server is ready to take messages');
	}
});

router.post('/contact-bge', (req, res, next) => {
	var name = req.body.name;
	var email = req.body.email;
	var message = req.body.message;
	var number = req.body.phone;
	var content = `name: ${name} \n number: ${number} \n email: ${email} \n message: ${message} `;
	var mail = {
		from: creds.EMAIL,
		to: 'bharatgreenurja@gmail.com', // This is email address where you will receive messages
		subject: `New Portfolio Message from ${name}`,
		text: content,
	};

	transporter.sendMail(mail, (err, data) => {
		console.log('a',err);
		console.log('b',data);
		if (err) {
			res.json({
				status: 'fail',
			});
		} else {
			res.json({
				status: 'success',
			});

			//Send Auto Reply email
			transporter.sendMail(
				{
					from: creds.EMAIL,
					to: email,
					subject: 'Message received',
					text: `Hi ${name},\nThank you for sending me a message. I will get back to you soon.\n\nBest Regards,\n${creds.YOURNAME}\n${creds.YOURSITE}\n\n\nMessage Details\nName: ${name}\n Email: ${email}\n Message: ${message}`,
					html: `<p>Hi ${name},<br>Thank you for sending me a message. I will get back to you soon.<br><br>Best Regards,<br>${creds.YOURNAME}<br>${creds.YOURSITE}<br><br><br>Message Details<br>Name: ${name}<br> Email: ${email}<br>Phone:${number}<br> Message: ${message}</p>`,
				},
				function (error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				}
			);
		}
	});
});

//This is for https server, make sure to set the path to the certificates
// const httpsServer = https.createServer(
// 	{
// 		key: fs.readFileSync('path-to-privkey.pem'),
// 		cert: fs.readFileSync('path-to-cert.pem'),
// 	},
// 	app
// );
// httpsServer.listen(serverPort, () =>
// 	console.log(`backend is running on port ${serverPort}`)
// );

//For testing locally
app.listen(serverPort, () =>
	console.log(`backend is running on port ${serverPort}`)
);
