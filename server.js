const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(fileUpload());

app.get('/', (req, res) => res.send('Hello World!'));

// Upload Endpoint
app.post('/upload', (req, res) => {
    if (req.files === null) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    //date now miliseconds (last 5 digits) for naming the file
    let dateNow = Date.now();
    let dateNowString = dateNow.toString();
    let dateNowLast6 = dateNowString.slice(dateNowString.length - 6, dateNowString.length);

    const file = req.files.file;

    //name fixer for file (remove unwanted characters)
    file.name = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    let splitted = file.name.split('.');
    let extension = splitted[splitted.length - 1];
    let name = splitted.slice(0, splitted.length - 1).join('_');
    file.name = name + "_" + dateNowLast6 + '.' + extension;


    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });

    });
});

//get all images
app.get('/images', (req, res) => {
    const directoryPath = path.join(__dirname, 'client/public/uploads');

    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        res.json({ files });

    });
});



app.get("/deleteImage", (req, res) => {

    const path = req.query.path;
    fs.unlink(`./client/public/uploads/${path}`, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json({ msg: "File deleted" });
    });

});

app.listen(5000, () => console.log('Server Started...'));
