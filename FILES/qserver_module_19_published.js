import {
    Table,
    QntrlFile,
	ZDK,
	QntrlParam
} from "sdk";

export class QServerUtils {

    static cliqnotify(job_id, notify_name) {

        if (job_id == undefined) {
            console.error("Invalid job id. Job ID - " + job_id);
            return "invalid job";
		}

		let jobreq = new HttpRequest('https://coreapi.qntrl.in/blueprint/api/buildupdates/job/' + job_id, "GET", null, null, null, 'qserverqntrl');

        let jobresp = jobreq.execute().asJson();
        console.log('job response from send notification - ' + jobresp);
        let jobdetails = jobresp['statusMessage'];
        let jobinfo = jobdetails['job_details'];
		let requestoruserid = jobinfo['requestor_id'];
		let name = jobinfo['requestor_name'];
		console.log('job requestor id from send notification - ' + requestoruserid);

		let userreq = new HttpRequest('https://coreapi.qntrl.in/blueprint/api/buildupdates/user/' + requestoruserid, null, null, null, null, 'qserverqntrl');
        let userresp = userreq.execute().asJson();
        let userdetails = userresp['statusMessage'];
        let emailid = userdetails['email_id'];

        let messageqry = "select notification_name,notification_type,message,extra_users,is_enabled,required_params from qserver_notification_details where notification_name='" + notify_name + "'";
        let tableresponse = Table.executeQuery(messageqry);

        if (tableresponse == undefined) {
            console.error("server error, check server team");
            return;
        }

        let tableresult = tableresponse['result'];

        if (tableresult == undefined || tableresult.length == 0) {
            console.debug("No notification available to push this message, Check server team");
            return;
        }

        let notificationdata = tableresult[0];
        let isenabled = notificationdata['is_enabled'];
        if (isenabled == undefined || isenabled == 0) {
            console.log('Notification disable for this notification name - ' + notify_name + '. Contact server team to enable this');
            return;
        }

		let notifymessage = notificationdata['message'];
		let required_params = notificationdata['required_params'];


        
		return QServerUtils.pushMessageToUserByBot(emailid, QServerUtils.processnotifymessage(notifymessage, jobinfo, required_params));
	}

	static processnotifymessage(notifymessage, jobinfo, required_params) {

    	if (notifymessage == undefined || jobinfo == undefined) {
        	console.error("Invalid inputs to processnotifymessage");
        	return;
		}

		if (required_params == undefined) {
			required_params = '';
		}

   	 	// required_params is comma-separated string: "branch,buildurl,product"
   	 	let params = required_params.split(",").map(p => p.trim()).filter(p => p.length > 0);

   	 	for (let i = 0; i < params.length; i++) {

    	    let paramName = params[i];

    	    // Fetch mapping: param_name -> field_name
    	    let qry = "select field_name from qserver_param_field_mapping where param_name='" + paramName + "'";
    	    let resp = Table.executeQuery(qry);

    	    if (resp == undefined || resp['result'] == undefined || resp['result'].length == 0) {
    	        console.error("No field mapping found for param_name - " + paramName);
     	       return;
     	   }

     	   let fieldName = resp['result'][0]['field_name'];
     	   if (fieldName == undefined || fieldName === "") {
     	       console.error("Empty field_name mapping for param_name - " + paramName);
      	      return;
      	  }

        	// Get value from jobinfo
        	let value = jobinfo[fieldName];

       		if (value == undefined || value === null) {
        	    console.error("No value found in jobinfo for field - " + fieldName + " (param " + paramName + ")");
            	return;
        	}

        	// If lookup field: it's an array, take first element's "value"
        	if (Array.isArray(value)) {
            	if (value.length === 0 || value[0] == undefined || value[0]['value'] == undefined) {
                	console.error("Lookup field empty or invalid for field - " + fieldName);
                	return;
            	}
            	value = value[0]['value'];
        	}


        	// Replace placeholder {i}
        	let placeholder = "{" + i + "}";
        	notifymessage = notifymessage.replaceAll(placeholder, String(value));
    	}

    	return notifymessage;
	}

	static pushMessageToUserByBot(userEmail, message, extra_users) {

    	if (!userEmail || !message) {
        	console.error("pushMessageToUserByBot: userEmail or message is empty");
        	return;
    	}


    	// Zoho Cliq API to message a user by email
		let url = "https://cliq.zoho.in/api/v2/bots/qntrlserver/message";

		let userids = userEmail;
		if (extra_users != undefined) {
			userids = userids + ',' + extra_users;
		}

		let headers = {
    		"Content-Type": "application/json"
		};

		let payload = {
			userids: userids,
			text: message,
			sync_message: true
		};

		// let params = {};
		// params['userids'] = "60040394902";
		// params['text'] = "Hi";

    	let req = new HttpRequest(url, "POST", headers, null, payload, "qntrlservercliq");


    	let resp = req.execute().asJson();
    	console.log("Zoho Cliq Bot DM response: " + JSON.stringify(resp));

    	return JSON.stringify(resp);
	}

	static getuserDetails(job_id) {

		let jobreq = new HttpRequest('https://coreapi.qntrl.in/blueprint/api/buildupdates/job/' + job_id, "GET", null, null, null, 'qserverqntrl');

        let jobresp = jobreq.execute().asJson();
        console.log('job response from send notification - ' + jobresp);
        let jobdetails = jobresp['statusMessage'];
        let jobinfo = jobdetails['job_details'];
		let requestoruserid = jobinfo['requestor_id'];
		let name = jobinfo['requestor_name'];
		console.log('job requestor id from send notification - ' + requestoruserid);

		let userreq = new HttpRequest('https://coreapi.qntrl.in/blueprint/api/buildupdates/user/' + requestoruserid, null, null, null, null, 'qserverqntrl');
        let userresp = userreq.execute().asJson();
        let userdetails = userresp['statusMessage'];
		let emailid = userdetails['email_id'];

		let userdet = {};
		userdet['email_id'] = emailid;
		userdet['name'] = name;
		return userdet;
	}

	static pushMessageToChannelByJob(job_id, notify_name) {

    	if (!job_id || !notify_name) {
        	console.error("pushMessageToChannelByJob: job_id or notify_name is empty");
        	return "no_job_notify";
    	}

    	// 1) Get notification template + type + required params
    	let msgQry = "select notification_name,notification_type,message,extra_users,is_enabled,required_params from qserver_notification_details where notification_name='" + notify_name + "'";
    	let msgResp = Table.executeQuery(msgQry);

    	if (!msgResp || !msgResp.result || msgResp.result.length === 0) {
        	console.error("No notification config found for " + notify_name);
        	return msgResp;
    	}

    	let notifRow = msgResp.result[0];
    	if (!notifRow.is_enabled) {
       		console.log("Notification disabled for " + notify_name);
        	return "disabled";
    	}

    	let template = notifRow.message;
    	let notifyType = notifRow.notification_type;
    	let requiredParams = notifRow.required_params; // e.g. "branch,buildurl,product"

    	// 2) Fetch job info
   		let jobReq = new HttpRequest(
        	"https://coreapi.qntrl.in/blueprint/api/buildupdates/job/" + job_id,
        	"GET",
        	null,
        	null,
        	null,
        	"qserverqntrl"
    	);

    	let jobResp = jobReq.execute().asJson();
    	if (!jobResp || !jobResp.statusMessage || !jobResp.statusMessage.fields) {
       		console.error("Unable to fetch job details for job_id " + job_id);
        	return "no_job";
   		}

    	let jobinfo = jobResp.statusMessage.job_details;

    	// 3) Build final message (uses your implemented helper)
    	let finalMessage = QServerUtils.processnotifymessage(template, jobinfo, requiredParams);
    	if (!finalMessage) {
        	console.error("Failed to process notification message");
        	return "no_message";
		}
		
		let channelName = QntrlParam.ofLinkName('qserver_notification_channel_name_38').getValue();
    	if (!channelName) {
        	console.error("Empty channel name for notification type " + notifyType);
        	return "no_channel";
    	}

    	// 5) Send to Zoho Cliq channel
    	let url = "https://cliq.zoho.in/api/v2/channelsbyname/" +
              	encodeURIComponent(channelName) + "/message?bot_unique_name=qntrlserver";

    	let payload = {
        	text: finalMessage
		};

    	let headers = {
        	"Content-Type": "application/json"
    	};

    	let req = new HttpRequest(url,"POST",headers, null, JSON.stringify(payload),"qntrlservercliq");

		let resp = req.execute().asText();
    	console.log("Cliq channel message response: " + resp);

    	return resp;
	}

	static sendCliqCardView(title, message, cardTitle, headerarr, dataarray) {
	
		let payloadobj = {};
		payloadobj['text'] = message;

		let slideObj = [];
		let tableObj = {};

		tableObj['type'] = 'table';
		tableObj['title'] = cardTitle;

		let dataobj = {};
		dataobj['headers'] = headerarr;
		dataobj['rows'] = dataarray;

		tableObj['data'] = dataobj;

		slideObj.push(tableObj);

		let cardObj = {};
		cardObj['title'] = title;
		cardObj['theme'] = 'modern-inline';
		cardObj['thumbnail'] = 'https://www.zoho.com/cliq/help/restapi/images/announce_icon.png';


		payloadobj['slides'] = slideObj;
		payloadobj['card'] = cardObj;


    	// 5) Send to Zoho Cliq channel
    	let url = "https://cliq.zoho.in/api/v2/channelsbyname/" + 'qntrlsigmaserversupport' + "/message?bot_unique_name=qntrlserver";

		let headers = {
    		"Content-Type": "application/json"
		};


		payloadobj['userids'] = 'kaviraj.p@zohocorp.com';
		payloadobj['sync_message'] = true;

		// let params = {};
		// params['userids'] = "60040394902";
		// params['text'] = "Hi";

    	let req = new HttpRequest(url, "POST", headers, null, payloadobj, "qntrlservercliq");

    	let resp = req.execute().asJson();
    	console.log("Zoho Cliq Bot DM response: " + JSON.stringify(resp));

		return resp;
	
	}
}

export class QServerSDUtils {

	static getSDUserName(job_id) {
		if (job_id == undefined) {
			console.error("invalid job id");
		}
		let userdetails = QServerUtils.getuserDetails(job_id);
		let emailid = userdetails['email_id'];
		return emailid.split('@')[0];
		//return "true";
	}
}

export class QServerRepoUtils {

	static GET_BRANCHES = "/branches";
	static CREATE_BRANCH = "/branches";

	static getRepoDomain() {
		return QntrlParam.ofLinkName('qserver_repsitory_domain_37').getValue();
	}
}