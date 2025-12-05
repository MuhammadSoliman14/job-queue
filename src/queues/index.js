const Bull = require ('bull');
const dotenv = require ('dotenv');

dotenv.config();

//create queues

const emailQueue = new Bull ('email', process.env.REDIS_URL);
const imageProcessQueue = new Bull('image-processing',process.env.REDIS_URL );
const dataExportQueue = new Bull('data-export', process.env.REDIS_URL);

module.exports ={
emailQueue,
imageProcessQueue,
dataExportQueue
}
