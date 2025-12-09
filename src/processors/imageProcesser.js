const {updateJobStatus} = require('../utils/queueHelper');

async function processImage(imageUrl, options){
    //todo: use Sharp library or a similar one
    console.log('processing image from ${imageUrl}');
    console.log('Options:', options);

    //simulate cpu-intensive task
    await new Promise((resolve)=> setTimeout(resolve, 3000));
} 

    async function processImageJob (job){
        try {
        await updateJobStatus(job.id, 'image-processing', {
            status: 'active',
            started_at: new Date.ISOString(),
        });
    
        const {imageUrl, options} = job.data;

        // process job
        const result = await processImage(imageUrl, options);

        //update job status on success
        await updateJobStatus(job.id, 'image-processing',{
            status: 'completed',
            started_at: new Date.ISOString(),
        });

        // Return the result
        return result;
      } catch (error) {
        // Update job status on failure
        await updateJobStatus(job.id, 'image-processing', {
          status: 'failed',
          error: error.message,
          completed_at: new Date().toISOString(),
        });
        // Re-throw the error for Bull to handle
        throw error;
      }};
    
    module.exports = processImageJob;