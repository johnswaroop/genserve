const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser')


app.use(cors());

var AWS = require('aws-sdk');

const DO_SPACES_ENDPOINT = "https://sgp1.digitaloceanspaces.com";
const DO_SPACES_KEY = 'QX3E2BTZHOIXEVMMPTYB';
const DO_SPACES_SECRET = 'ksZyRKGHYg4Kxd/15PMPk1UT26Xvt6rtNEqFlBZHtuU';
const DO_SPACES_NAME = 'savenft';

const s3 = new AWS.S3({ endpoint: DO_SPACES_ENDPOINT, accessKeyId: DO_SPACES_KEY, secretAccessKey: DO_SPACES_SECRET });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const getBuffer = (testImage) => {
    let buf = Buffer.from(testImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    return buf;
}

app.post('/profile', async function (req, res) {
    let phone = req.body.phone;
    let img = req.body.img
    if (img) {
        console.log("startuplading");
        let type = img.match(/[^:/]\w+(?=;|,)/)[0];
        let buf = getBuffer(img);
        s3.putObject({
            Bucket: DO_SPACES_NAME, Key: `profile_${phone}.${type}`, Body: buf, ACL: 'public-read', ContentEncoding: 'base64',
            ContentType: `image/${type}`
        }, (err, data) => {
            if (err) {
                console.log(err);
                res.json({ status: "error" })
            };
            console.log("Your file has been uploaded successfully!", data);
            res.json({ "status": "ok" });

        });
    }
    else {
        res.json({ status: "error" })
    }
})

app.post('/', async function (req, res) {

    console.log(req.body);

    let phone = req.body.phone;
    let imgList = JSON.parse(req.body.imgList);
    if (imgList) {
        let list = imgList.map((ele) => {
            return '.' + ele;
        })

        let genImage = await mergeImages(list, {
            Canvas: Canvas,
            Image: Image
        })

        if (genImage) {
            console.log("startuplading");
            let buf = getBuffer(genImage);
            s3.putObject({
                Bucket: DO_SPACES_NAME, Key: `nft_${phone}.png`, Body: buf, ACL: 'public-read', ContentEncoding: 'base64',
                ContentType: `image/png`
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    res.json({ status: "error" })
                };
                console.log("Your file has been uploaded successfully!", data);
                res.json({ "status": "ok" });
            });
        }
        else {
            res.json({ status: "error" })
        }
    }
    else {
        res.json({ status: "error" })
    }
})

app.post('/direct', async function (req, res) {

    console.log(req.body);

    let phone = req.body.phone;
    let bs64Img = req.body.img;
    let imgList = JSON.parse(req.body.imgList);
    if (imgList) {
      
        let genImage = bs64Img;

        if (genImage) {
            console.log("startuplading");
            let buf = getBuffer(genImage);
            s3.putObject({
                Bucket: DO_SPACES_NAME, Key: `nft_${phone}.png`, Body: buf, ACL: 'public-read', ContentEncoding: 'base64',
                ContentType: `image/png`
            }, (err, data) => {
                if (err) {
                    console.log(err);
                    res.json({ status: "error" })
                };
                console.log("Your file has been uploaded successfully!", data);
                res.json({ "status": "ok" });
            });
        }
        else {
            res.json({ status: "error" })
        }
    }
    else {
        res.json({ status: "error" })
    }
})

app.listen(8080);