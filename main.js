const express = require("express");
const readline = require('readline');
const app = express();
const ytdl = require("ytdl-core");
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const port = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	return res.render("index");
});

app.get('/download' , (req, res) => {
  const v_id = req.query.url.split('v=')[1];
  return res.render('process', {
    embed: "https://www.youtube.com/embed/" + v_id,
    video_id: v_id,
  });
});

app.post("/dl", async (req, res) => {
  console.log('Got body:', req.body);
  var pathUrl = req.path;
  var quality = req.body.quality;
  var id = req.body.video_id;
  const info = await ytdl.getInfo(id);
  const stream = ytdl(id, {quality: 'highestaudio',});

  let start = Date.now();
  ffmpeg(stream)
  .audioBitrate(quality)
  .save(`${__dirname}/${id}.mp3`)
  .on('progress', p => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${p.targetSize}kb downloaded`);
  })
  .on('end', () => {
    console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
    var filePath = "services/";
    var fileName = info.videoDetails.title+'.mp3';
    /*if(pathUrl !== '/') {
      res.download(__dirname + '/' + 'services', fileName, function(err){
        console.log(err);
      });
    } else {
        next();
    }*/
    res.download(path.join(__dirname, "services/"+fileName), fileName, err => {
      if (err) console.log(err);
  });
    console.log('downloaded');
    res.redirect('/');
  });


});

var listener = app.listen(port, function(){
  console.log('Youtube Download Service App running on port '+ listener.address().port); //Listening on port 8888
});