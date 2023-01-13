const http = require("http");

const hostname = "0.0.0.0";
const port = 3000;

const request = require("request");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");

// const urls = [
//   "https://www.ugc.ac.in/ugc_notices.aspx",
//   "https://www.ugc.ac.in/ugc_circular.aspx",
// ];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("running");
});

server.listen(port, hostname, () => {
  console.log(`Server running`);

  setTimeout(() => {
    notice();
  }, 1000 * 5); 

  function notice() {
    setInterval(() => {
      request(
        "https://www.ugc.ac.in/ugc_notices.aspx",
        async (err, response, html) => {
          if (!err && response.statusCode == 200) {
            const $ = cheerio.load(html);
  
            //create excel
            const workbook = new ExcelJS.Workbook();
  
            workbook.xlsx.readFile("./UGC.xlsx").then(async function () {
              let worksheet2 = workbook.getWorksheet("Notices_Latest_HTML");
              worksheet2.columns = [{ header: "tag", key: "tag" }];
  
              // get scraptData
              const stripped = $("#ctl00_bps_homeCPH_rptState")
                .children()
                .children()
                .first()
                .html()
                .replace(/\s+/g, " ")
                .trim();
  
              if (worksheet2.getCell("A2").value != stripped) {
                console.log("Notice available!");
                worksheet2.getCell("A2").value = stripped;
  
                await workbook.xlsx.writeFile("./UGC.xlsx");
  
                var transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "shrey.kanani@darshan.ac.in",
                    pass: "Darshan@spk1101",
                  },
                });
  
                var mailOptions = {
                  from: "shrey.kanani@darshan.ac.in",
                  to: "shreykanani5505@gmail.com",
                  subject: `⚠️UPDATE! New UGC Notice!`,
                  html: `<h3>UPDATE! UGC Notice
                  </h3><table><tr>${stripped}</tr></table>`,
                };
  
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log("Email sent: " + info.response);
                  }
                });
              } else {
                console.log("No New Notices✅");
              }
            });
          }
        }
      );
    }, 1000 * 10);
  }
  

  setTimeout(() => {
    circular();
  }, 1000 * 10);

  function circular() {
    setInterval(() => {
      request(
        "https://www.ugc.ac.in/ugc_circular.aspx",
        async (err, response, html) => {
          if (!err && response.statusCode == 200) {
            const $ = cheerio.load(html);

            //create excel
            const workbook = new ExcelJS.Workbook();

            workbook.xlsx.readFile("./UGC.xlsx").then(async function () {
              let worksheet2 = workbook.getWorksheet("Circulars_Latest_HTML");
              worksheet2.columns = [{ header: "tag", key: "tag" }];

              // get scraptData
              const stripped = $("#ctl00_bps_homeCPH_rptState")
                .children()
                .children()
                .first()
                .html()
                .replace(/\s+/g, " ")
                .trim();


              if (worksheet2.getCell("A2").value != stripped) {
                console.log("Circular available!");
                worksheet2.getCell("A2").value = stripped;

                await workbook.xlsx.writeFile("./UGC.xlsx");

                var transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "shrey.kanani@darshan.ac.in",
                    pass: "Darshan@spk1101",
                  },
                });

                var mailOptions = {
                  from: "shrey.kanani@darshan.ac.in",
                  to: "shreykanani5505@gmail.com",
                  subject: `⚠️UPDATE! New UGC Circular!`,
                  html: `<h3>UPDATE! UGC  Circular!
                </h3><table><tr>${stripped}</tr></table>`,
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log("Email sent: " + info.response);
                  }
                });
              } else {
                console.log("No New Circular✅");
              }
            });
          }
        }
      );
    }, 1000 * 10);
  }
});
