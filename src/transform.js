const fs = require("fs");
const readline = require("readline");
const stream = require("stream");

const instream = fs.createReadStream("./src/transcript.sbv");
const outstream = new stream();
const rl = readline.createInterface(instream, outstream);

const arr = [];
let index = 0;
let startTime;
let endTime;
let text;

rl.on("line", function (line) {
    if (index % 3 === 0) {
        startTime = line.split(',')[0];
        endTime = line.split(',')[1];
    } else if (index % 3 === 1) {
        text = line;
        arr.push({ startTime, endTime, text });
    }
    index++;
});

rl.on("close", function () {
    fs.writeFile("./src/transcript_sbv_1.json", JSON.stringify(arr), err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    });
});
