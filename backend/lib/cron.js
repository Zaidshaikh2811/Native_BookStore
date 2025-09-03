import cron from 'cron';
import http from 'http';

const job = new cron.CronJob("*/14 * * * *", function() {
  http.get(process.env.API_URL, (res) => {
      if(res.statusCode === 200) {
          console.log("Server is awake");
      } else {
          console.error(`Unexpected response status: ${res.statusCode}`);
      }
  }).on('error', (e) => {
    console.error(`Error during keep-alive ping: ${e.message}`);
  });
}, null, true, 'America/Los_Angeles');

export default job;