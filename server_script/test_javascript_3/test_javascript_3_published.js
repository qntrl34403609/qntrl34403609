function execute(data) {
    let usercount = Math.floor(Math.random() * 9) + 1;
    let records = [];
    for (let i = 0; i < usercount; i++){
        let record = {};
        record["user_id"] = Math.floor(Math.random() * 9000) + 1000;
        record["user_name"] = generateRandomString(50);
        records.push(record);
    }
    Table.addRecords("5000000148020", JSON.stringify(records));   
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}
