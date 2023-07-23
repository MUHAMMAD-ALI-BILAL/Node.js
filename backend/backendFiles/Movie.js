require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const app = express();

// app.use(cors({
//   origin: 'https://www.onflixer.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }));
app.use(cors());
app.use(bodyParser.json());

// const PORT = process.env.PORT || 8009;

// Configure AWS credentials
AWS.config.update({
  accessKeyId: 'AKIA4HS62D34JAFUHUWZ',
  secretAccessKey: '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',
  region: 'ap-south-1',
});

// Define the route to generate the signed URL
app.post('/api/getSignedUrls', (req, res) => {
  const { videoKey } = req.body;
  // Create a new instance of the S3 service
  const s3 = new AWS.S3();

  // Set the parameters for generating the signed URLs
  const navigateParams = {
    Bucket: 'onflixer',
    Key: videoKey,
    Expires: 3600, // Expiration time in seconds (1 hour in this example)
  };

  const playParams = {
    Bucket: 'onflixer',
    Key: videoKey,
    Expires: 3600 * 24, // Expiration time in seconds (24 hours in this example)
  };

  // Generate the signed URLs
  s3.getSignedUrl('getObject', navigateParams, (error, navigateUrl) => {
    if (error) {
      console.error('Error generating navigate URL:', error);
      res.status(500).json({ error: 'Error generating navigate URL' });
    } else {
      s3.getSignedUrl('getObject', playParams, (error, playUrl) => {
        if (error) {
          console.error('Error generating play URL:', error);
          res.status(500).json({ error: 'Error generating play URL' });
        } else {
          // Return the signed URLs to the client-side
          res.json({ navigateUrl, playUrl });
        }
      });
    }
  });
});


app.post('/api/videoPlay', (req, res) => {
   console.log("Second Success")

    const { videoKeys } = req.body;

    console.log("Missed Success")

    // Create a new instance of the S3 service
    const s3 = new AWS.S3();

    console.log("Thired Success")

    // Set the parameters for generating the signed URL
    const params = {
      Bucket: 'onflixer',
      Key: videoKeys,
      Expires: 3600 // Expiration time in seconds (1 hour in this example)
      // ContentType: 'video/mp4'
    };
    console.log("Fourth Success")

    // Generate the signed URL
    s3.getSignedUrl('getObject', params, (error, url) => {
      if (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({ error: 'Error generating signed URL' });
      } else {
        // Return the signed URL to the client-side
        console.log("Fifth Success")
        res.json({ signedUrl: url });
      }
    });
  });

  app.get('/api/serverStatus', (req, res) => {
  res.send('Server is running');
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port`);
});
