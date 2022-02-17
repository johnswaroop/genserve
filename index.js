const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
var express = require('express');
var app = express();

var AWS = require('aws-sdk')

const DO_SPACES_ENDPOINT = "https://sgp1.digitaloceanspaces.com";
const DO_SPACES_KEY = 'QX3E2BTZHOIXEVMMPTYB';
const DO_SPACES_SECRET = 'ksZyRKGHYg4Kxd/15PMPk1UT26Xvt6rtNEqFlBZHtuU';
const DO_SPACES_NAME = 'savenft';

const s3 = new AWS.S3({ endpoint: DO_SPACES_ENDPOINT, accessKeyId: DO_SPACES_KEY, secretAccessKey: DO_SPACES_SECRET });

app.use(express.json());

const getBuffer = (testImage) => {
    let buf = Buffer.from(testImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    return buf;
}


app.post('/', async function (req, res) {

    let phone = req.body.phone;

    if (req.body.imgList) {
        let list = req.body.imgList.map((ele) => {
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

app.listen(8080);