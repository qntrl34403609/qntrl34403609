function onMail() {
    let stageName = current.job.getStageName();
    console.log("stage name - " + stageName);
    if (stageName == 'Closed') {
        current.mailMeta.addAsJob()
    } else {
        console.log("Not required to changes");
        return;    
    }
}
