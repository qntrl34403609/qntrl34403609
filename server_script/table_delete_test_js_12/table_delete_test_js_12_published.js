function execute(data) {

    let tableId = "5000000455159";
    let empArr = [];
    for (var i = 0; i < 100; i++){
        let emp = {};
        emp["emp_id"] = i;
        emp["first_name"] = "Kavi";
        emp["last_name"] = "Raj";
        emp["phone_number"] = "123456789";
        empArr.push(emp);
    }
    return Table.addRecords(tableId, JSON.stringify(empArr));
}
