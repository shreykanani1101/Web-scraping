const request = require("request");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");

const urls = [
  "https://www.ugc.ac.in/ugc_notices.aspx",
  "https://www.ugc.ac.in/ugc_circular.aspx",
];

setInterval(() => {
  urls.forEach((v, i) => {
    // console.log(v,i);
    request(v, async (err, response, html) => {
      if (!err && response.statusCode == 200) {
        const $ = cheerio.load(html);

        //create excel
        const workbook = new ExcelJS.Workbook();

        workbook.xlsx.readFile("./UGC.xlsx").then(async function () {
          // const worksheet = workbook.getWorksheet("Notices_Final");
          let worksheet2;

          // get scraptData
          const stripped = $("#ctl00_bps_homeCPH_rptState")
            .children()
            .children()
            .first()
            .html()
            .replace(/\s+/g, " ")
            .trim();

          if (i == 0) {
            worksheet2 = workbook.getWorksheet("Notices_Latest_HTML");
            worksheet2.columns = [{ header: "tag", key: "tag" }];
          } else {
            worksheet2 = workbook.getWorksheet("Circulars_Latest_HTML");
            worksheet2.columns = [{ header: "tag", key: "tag" }];
          }

          if (worksheet2.getCell("A2").value != stripped) {
            console.log("Update available!");
            console.log("Fetching details and sending mail...!");
            worksheet2.getCell("A2").value = stripped;

            const data = await workbook.xlsx.writeFile("./UGC.xlsx");
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
          } else {
            console.log("No New Notices✅");
          }
        });
      }
    });
  });
}, 1000*10);

// 1000*60*60
