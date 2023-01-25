const http = require("http");

const hostname = "0.0.0.0";
const port = 3000;

const request = require("request");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

const Sequelize = require("sequelize");

// const path = "mysql://root:admin@localhost:3306/ugc-notice-circular";
const path = "mysql://sql12591424:3UuxCBprWY@sql12.freesqldatabase.com:3306/sql12591424";

const urls = [
  "https://www.ugc.ac.in/ugc_notices.aspx",
  "https://www.ugc.ac.in/ugc_circular.aspx",
];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Running");
});

server.listen(port, hostname,()=>{
  console.log("server running");
  const sequelize = new Sequelize(path, {
    operatorsAliases: false,
    logging: false,
  });

  let Record = sequelize.define("record", {
    html: Sequelize.TEXT,
    type: Sequelize.STRING,
  });

  setInterval(() => {
    urls.forEach((url, i) => {
      // console.log(url,i);
      request(url, async (err, response, html) => {
        if (!err && response.statusCode == 200) {
          const $ = cheerio.load(html);
          const stripped = $("#ctl00_bps_homeCPH_rptState")
            .children()
            .children()
            .first()
            .html()
            .replace(/\s+/g, " ")
            .trim();
            
          if (i == 0) {
            Record
              .findOne({ where: { type: "notice" } })
              .then(async(record) => {
                // console.log(record.get({ plain: true }));
                let data = record.get({ plain: true });

                if(data.html==stripped){
                  // console.log("same");
                }
                else{
                  console.log("new notice available✅");
                  let id = await Record.update(
                    { html:stripped },
                    { where: { id: 1 } }
                  );
                  sendEmail();
                }
              })
              .finally(() => {
                // sequelize.close();
              });
          } else {
            Record
              .findOne({ where: { type: "circular" } })
              .then(async(record) => {
                // console.log(record.get({ plain: true }));
                let data = record.get({ plain: true });
                if(data.html==stripped){
                  // console.log("same");
                }
                else{
                  console.log("new circlular available✅");
                  let id = await Record.update(
                    { html:stripped },
                    { where: { id: 2 } }
                  );
                  sendEmail();
                }
              })
              .finally(() => {
                // sequelize.close();
              });
          }

          function sendEmail(){
            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "ugcnotify@gmail.com",
                pass: "mgzprkbyjborrhmd",
              },
            });
  
            var mailOptions = {
              from: "ugcnotify@gmail.com",
              to: ["shrey.kanani@darshan.ac.in","jay.dhamsaniya@darshan.ac.in"],
              subject: `⚠️UPDATE! New UGC ${i == 0 ? "Notice" : "Circular"}!`,
              html: `<h3>UPDATE! UGC  ${
                i == 0 ? "Notice" : "Circular"
              }</h3><table><tr>${stripped}</tr></table>`,
            };
  
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
          }
        }
      });
    });
  }, 1000 * 10 * 30);
});

