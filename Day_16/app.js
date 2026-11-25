// import { arch, cpus, endianness, freemem, homedir, hostname, loadavg, networkInterfaces, platform, release, tmpdir, totalmem, type, uptime, userInfo } from "os";
// console.log(arch());
// console.log(cpus());
// console.log(endianness());
// console.log(freemem());
// console.log(homedir());
// console.log(hostname());
// console.log(loadavg());
// console.log(networkInterfaces());
// console.log(platform());
// console.log(release());
// console.log(tmpdir());
// console.log(totalmem());
// console.log(type());
// console.log(uptime());
// console.log(userInfo());
//
//
// import { createReadStream } from 'fs';
// var data = '';
// // create a readable stream
// var readableStream = createReadStream('input.txt');
// // set the encoding to be utf8
// readableStream.setEncoding('utf8');
// // Handle the stream events --> data,end,error
// readableStream.on('data',function(chunk){
//     data += chunk;
// });
// readableStream.on('end',function(){
//     console.log(data);
// });
// readableStream.on('error',function(err){
//     console.log(err.stack);
// });
 
// // console.log("Program ended ");
// import { createWriteStream } from 'fs';
// var data = "A New Solution of all Technology";
// // create a writable stream
// var wStream = createWriteStream('Output.txt');
// // write the data to stream with encoding to be utf8
// wStream.write(data,'utf8');
// // mark the end of the file
// wStream.end()
// // Handle the stream events --> finish and error
// wStream.on('finish',function(){
//     console.log("Write Completed");
// });
// wStream.on('error',function(err){
//     console.log(err.stack);
// });
// console.log("Program Ended");
// import {writeFile, readFile} from "node:fs/promises";
// const path = new URL("./tickets.json", import.meta.url);
// const data = [[
//   {
//     "id": 1,
//     "phone": "1-477-935-8478 x6430",
//     "website": "ola.org",
//     "company": {
//       "name": "Considine-Lockman",
//       "catchPhrase": "Synchronised bottom-line interface",
//       "bs": "e-enable innovative applications"
//     }
//   },
//   {
//     "id": 7,
//     "name": "Kurtis Weissnat",
//     "username": "Elwyn.Skiles",
//     "email": "Telly.Hoeger@billy.biz",
//     "address": {
//       "street": "Rex Trail",
//       "suite": "Suite 280",
//       "city": "Howemouth",
//       "zipcode": "58804-1099",
//       "geo": {
//         "lat": "24.8918",
//         "lng": "21.8984"
//       }
//     },
//     "phone": "210.067.6132",
//     "website": "elvis.io",
//     "company": {
//       "name": "Johns Group",
//       "catchPhrase": "Configurable multimedia task-force",
//       "bs": "generate enterprise e-tailers"
//     }
//   },
//   {
//     "id": 8,
//     "name": "Nicholas Runolfsdottir V",
//     "username": "Maxime_Nienow",
//     "email": "Sherwood@rosamond.me",
//     "address": {
//       "street": "Ellsworth Summit",
//       "suite": "Suite 729",
//       "city": "Aliyaview",
//       "zipcode": "45169",
//       "geo": {
//         "lat": "-14.3990",
//         "lng": "-120.7677"
//       }
//     },
//     "phone": "586.493.6943 x140",
//     "website": "jacynthe.com",
//     "company": {
//       "name": "Abernathy Group",
//       "catchPhrase": "Implemented secondary concept",
//       "bs": "e-enable extensible e-tailers"
//     }
//   },
//   {
//     "id": 9,
//     "name": "Glenna Reichert",
//     "username": "Delphine",
//     "email": "Chaim_McDermott@dana.io",
//     "address": {
//       "street": "Dayna Park",
//       "suite": "Suite 449",
//       "city": "Bartholomebury",
//       "zipcode": "76495-3109",
//       "geo": {
//         "lat": "24.6463",
//         "lng": "-168.8889"
//       }
//     },
//     "phone": "(775)976-6794 x41206",
//     "website": "conrad.com",
//     "company": {
//       "name": "Yost and Sons",
//       "catchPhrase": "Switchable contextually-based project",
//       "bs": "aggregate real-time technologies"
//     }
//   },
//   {
//     "id": 10,
//     "name": "Clementina DuBuque",
//     "username": "Moriah.Stanton",
//     "email": "Rey.Padberg@karina.biz",
//     "address": {
//       "street": "Kattie Turnpike",
//       "suite": "Suite 198",
//       "city": "Lebsackbury",
//       "zipcode": "31428-2261",
//       "geo": {
//         "lat": "-38.2386",
//         "lng": "57.2232"
//       }
//     },
//     "phone": "024-648-3804",
//     "website": "ambrose.net",
//     "company": {
//       "name": "Hoeger LLC",
//       "catchPhrase": "Centralized empowering task-force",
//       "bs": "target end-to-end models"
//     }
//   }
// ]];
// await writeFile(path, JSON.stringify(data), "utf8");
// const tickets = JSON.parse(await readFile(path, "utf8"));
// console.log(tickets.length);

// import { dirname, join} from "node:path";
// import { fileURLToPath } from "node:url";
// const path = new URL("./tickets.json", import.meta.url);
// const here=dirname(fileURLToPath (import.meta.url));
// console.log(join("|--->", here, "data", path.toString()),"<---");

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const inputPath = path.join(__dirname, "tickets.json");
// const outputPath = path.join(__dirname, "open-tickets-report.json");

// try {
//     const tickets = JSON.parse(
//         fs.readFileSync(inputPath, "utf8")
//     );

//     const openTickets = tickets.filter(
//         ticket => ticket.status === "open"
//     );

//     const report = {
//         generated_at: new Date().toISOString(),
//         tickets_processed: tickets.length,
//         open_tickets_count: openTickets.length,
//         tickets: openTickets
//     };

//     fs.writeFileSync(
//         outputPath,
//         JSON.stringify(report, null, 2),
//         "utf8"
//     );

//     console.log("Report generated successfully!");
//     console.log(`Open tickets found: ${openTickets.length}`);

// } catch (error) {
//     console.error("Error:", error.message);
// }

// import dotenv from "dotenv";
// const process=dotenv.config();
// const port=Number(process.parsed.PORT??3000);
// if(!Number.isInteger (port) || port < 1 || port > 65535) {
//     throw new Error("Invalid PORT");
// }
// console.log(`PORT: ${port}`);

// import fs from "fs";
// import { EventEmitter } from "events";
// import dotenv from "dotenv";

// dotenv.config();

// const emitter = new EventEmitter();

// emitter.on("validatePort", () => {
//   try {
//     const port = process.env.PORT;

//     console.log("PORT =", port);

//     if (!port) {
//       throw new Error("PORT is not configured in .env");
//     }

//     const portNumber = Number(port);

//     if (Number.isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
//       throw new Error("Invalid PORT Number");
//     }

//     console.log(`PORT Validated: ${portNumber}`);

//     emitter.emit("readFile");
//   } catch (error) {
//     console.error("PORT Validation Error:", error.message);
//   }
// });

// emitter.on("readFile", () => {
//   const fileName = "./sample.txt";

//   fs.readFile(fileName, "utf8", (err, data) => {
//     if (err) {
//       if (err.code === "ENOENT") {
//         console.log("File not found. Creating file...");

//         const sampleContent = "Sample Content\n";

//         fs.writeFile(fileName, sampleContent, "utf8", (writeErr) => {
//           if (writeErr) {
//             console.error("File Creation Error:", writeErr.message);
//             return;
//           }

//           console.log("File created successfully");

//           fs.appendFile(fileName, "New Text\n", "utf8", (appendErr) => {
//             if (appendErr) {
//               console.error("Append Error:", appendErr.message);
//               return;
//             }

//             console.log("New text appended successfully");
//           });
//         });
//       } else {
//         console.error("Read Error:", err.message);
//       }

//       return;
//     }

//     console.log("File exists");
//     console.log("File Content:");
//     console.log(data);

//     fs.appendFile(fileName, "New Text\n", "utf8", (appendErr) => {
//       if (appendErr) {
//         console.error("Append Error:", appendErr.message);
//         return;
//       }

//       console.log("New text appended successfully");
//     });
//   });
// });

// emitter.emit("validatePort");


// import fs from "fs";
// const readFile = () => {
//   const readStream = fs.createReadStream("large.log", {
//     encoding: "utf8",
//     highWaterMark: 64 * 1024
//   });
//   readStream.on("data", (chunk) => {
//     console.log("Chunk size:", chunk.length);
//     console.log(chunk);
//   });
//   readStream.on("end", () => {
//     console.log("\nFile reading completed");
//   });
//   readStream.on("error", (err) => {
//     console.error("Error:", err.message);
//   });
// };
// console.log("===== FIRST READ =====");
// readFile();
// const appendData = () => {
//   const data = `\nNew Log Entry Added at ${new Date().toLocaleString()}`;
//   fs.appendFile("large.log", data, (err) => {
//     if (err) {
//       console.error("❌ Append Error:", err.message);
//       return;
//     }
//     console.log("\n Data Appended Successfully");
//     console.log("\n===== SECOND READ AFTER APPEND =====");
//     readFile();
//   });
// };
// setTimeout(() => {
//   appendData();
// }, 2000);

import fs from "fs";
import { Transform } from "stream";

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    const result = chunk.toString().toUpperCase();
    callback(null, result);
  }
});

fs.createReadStream("input.txt")
  .pipe(upperCase)
  .pipe(fs.createWriteStream("output.txt"))
  .on("finish", () => {
    console.log("File transformed and written to output.txt");
  });