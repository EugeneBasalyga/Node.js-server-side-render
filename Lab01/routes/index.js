'use strict';
var express = require('express');
var fs = require('fs');
var formidable = require('formidable');
var bodyParser = require('body-parser');
var router = express.Router(); 

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET home page. */
router.get('/', function (req, res) {
    var json = JSON.parse(fs.readFileSync(__dirname + '/../data/tasks.json', 'utf8'));
    res.render('index', { data: json });
});

router.post("/addTask", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);

    const form = new formidable.IncomingForm();

    var files = [], fields = [];
    form.on('field', function (field, value) {
        fields[field] = value;
    });

    form.on('file', function (field, file) {
        if (fields[field] === undefined)
            fields[field] = [];

        if (file.name !== "")
            fields[field].push(file.name);

        file.path = __dirname + '/../public/files/' + file.name;
    });

    form.on('end', function () {
        var json = JSON.parse(fs.readFileSync(__dirname + '/../data/tasks.json', 'utf8'));

        var task = {
            id: json.length + 1,
            taskname: fields.taskname,
            status: fields.status,
            date: fields.date,
            files: []
        };

        fields.files.forEach((file) => {
            task.files.push(file);
        });

        json.push(task);
        fs.writeFileSync(__dirname + '/../data/tasks.json', JSON.stringify(json));
        response.render('index', { data: json });
    });

    form.parse(request, function (err, fields, files) {
    });

});

router.post("/Filter", urlencodedParser, function (request, response) {
    if (!request.body) return response.sendStatus(400);

    var json = JSON.parse(fs.readFileSync(__dirname + '/../data/tasks.json', 'utf8'));

    json.sort(function (a, b) {
        if ((a.status === request.body.status) && (b.status !== request.body.status))
            return -1;
        if (((a.status === request.body.status) && (b.status === request.body.status)) || ((a.status !== request.body.status) && (b.status !== request.body.status)))
            return 0;
        if ((a.status !== request.body.status) && (b.status === request.body.status))
            return 1;
    })
    response.render('index', { data: json });
});

module.exports = router;
