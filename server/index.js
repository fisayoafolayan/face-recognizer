    const fs = require('fs');
    const cors = require('cors');
    const express = require('express');
    const Kairos = require('kairos-api');
    const bodyParser = require('body-parser');
    const multipart = require('connect-multiparty');
    const path  = require('path');
    const VIEWS = path.join(__dirname, 'public');
    const app = express();
    app.use(express.static("public")); 

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    const multipartMiddleware = multipart();
    let kairos_client = new Kairos('92ae697a', '1c28bee6ed606aa4d846de6f49690620');

    

    app.get('/', function(req, res) {
        res.sendFile('index.html', { root : VIEWS });
    });
    


    app.post('/upload', multipartMiddleware, function(req, res) {
        // get base64 version of image and send that to Kairos for training
        let base64image = fs.readFileSync(req.files.image.path, 'base64');
        var params = {
            image: base64image,
            subject_id: req.body.name,
            gallery_name: 'rekognize',
        };
        console.log('sending to Kairos for training');
        kairos_client.enroll(params).then(function(result) {
        // return status of upload
            return res.json({'status' : true });
        }).catch(function(err) { 
            // return status if upload
            return res.json({'status' : false});
        });
    });

    app.post('/verify', multipartMiddleware, function(req, res) {
        // get base64 version of image and send that to Kairos for recognition
        let base64image = fs.readFileSync(req.files.image.path, 'base64');
        var params = {
            image: base64image,
            gallery_name: 'rekognize',
        };
        console.log('sending to Kairos for recognition');
        kairos_client.recognize(params).then(function(result) {
            // console.log(res.json(result.body));
        // return the response
            return res.json(result.body);
        }).catch(function(err) { 
        // return status code as false
            return res.json({'status' : false});
        });  
    });

    app.listen(3128);
    console.log('Listening on localhost:3128');