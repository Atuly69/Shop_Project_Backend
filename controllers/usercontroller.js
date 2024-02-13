const UserModel = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const { secretKey } = require("../secret_key");


const sendEmail = (email, name, msg) => {
  // # Make the call to the client\ var
  transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com', port: 587,
    secure: true,
    SMTPSecure: "tls",
    service: "gmail",
    tls: {
      rejectUnauthorized: true,
      servername: "smtp.gmail.com",
    },
    auth: {
      user: "infratester22@gmail.com",
      pass: "ibhdanuuabojztev",
    },
  }); // console.log(transporter);
  var mailOptions = {
    from: { name: "Shop App", address: "infratester22@gmail.com" },
    to: email,
    subject: "Shop App",
    html:
      `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          * {
            margin: 0px;
            padding: 0px;
          }
        </style>
      </head>
      <body>
        <div
          class="latter"
          style="
            width: 100%;
            display: inline-block;
            background-color: rgb(247, 247, 247);
          ">
          <div
            style="
              max-width: 600px;
              width: 100%;
              margin: auto;
              color: #333333;
              font-family: arial, helvetica, sans-serif;
              background-color: white;
              box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
              margin-bottom: 50px;
            ">
            <div>
              <p
                style="
                  text-align: center;
                  font-size: 27px;
                  padding-top: 30px;
                  padding-bottom: 15px;
                  color: #1a2441;
                ">
                Hi ` +
      name +
      `, ` +
      msg +
      `
              </p>
            </div>
            <hr />
           
          </div>
        </div>
      </body>
    </html>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return;

    }
  });
};

function generateRandomAlphanumericString(length) {
  const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphanumericChars.charAt(Math.floor(Math.random() * alphanumericChars.length));
  }
  return result;
}

const register_user = async (req, res) => {
  const { email, gender, mobile, name, address } = req.body;
  const existingUser = await UserModel.findOne({ email: email });
  if (existingUser != null) {
    return res.status(200).json({ message: "Email already exists", status: 0 });
  }
  try {
    const password = generateRandomAlphanumericString(8);
    const salt = await bcrypt.genSalt(10);
    const hash_pass = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
      email,
      password: hash_pass,
      name,
      address,
      mobile,
      gender
    });
    // await newUser.save()
    if (await newUser.save()) {
      sendEmail(email, name, "Your password is " + password);
      return res
        .status(200)
        .json({ message: "User registered successfully", status: 1 });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login_user = async (req, res) => {
  const { email, password } = req.body;
  const user_data = await UserModel.findOne({ email });
  if (user_data) {
    const decrypt_pass = await bcrypt.compare(password, user_data.password);
    if (decrypt_pass) {
      const token = jwt.sign({ id: user_data._doc?._id, name: user_data._doc?.name }, secretKey, { expiresIn: '10h' });
      res
        .status(200)
        .json({
          result: {
            ...user_data._doc,
            password: '',
            token
          }, message: "Successfully Login", status: 1
        });
    } else {

      res
        .status(200)
        .json({ result: [], message: "Incorrect Password", status: 0 });
    }
  } else {
    res.status(500).json({ status: 0, message: "Invalid Credentials" });
  }
};


module.exports = {
  register_user,
  login_user
};
