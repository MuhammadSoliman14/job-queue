const {updateJobStatus} = require('../utils/queueHelper');

async function sendEmail(to, subject, body){
    //todo: use a real library like nodemailer

    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Return success
    return {delievered: true, timeStamp: new Date()} 

}

    async function processEmailJob(job){
        try {
            await updateJobStatus(job.id, 'email', {
                status: 'active',
                result: JSON.stringify(result),
                completed_at: new Date().toISOString(),
            });

            const {to, subject, body} = job.data;

            const result = await sendEmail(to, subject, body);

            await updateJobStatus(job.id, 'email', {
                status: 'completed',
                result: JSON.stringify(result),
                completed_at: new Date().toISOString(),
            });

            return result;

        } catch (error) {
            // update job status on failure 
            await updateJobStatus(job.id, 'email', {
                status: 'ffailed',
                result: error.message,
                completed_at: new Date().toISOString(),
            });
            throw error;
        }
    }



module.exports = processEmailJob;