/*var tables = {
  name: 'common_nameindex', 
  source: 'smp_source',
  ppExp: 'smp_psprtexpiredate', 
  dateRange: 'dateRange'
};

// Config from a .json or .ini file or whatever.
var  ldap = {
    url: 'https://', 
	host:'iapetus-env.com',
	dn: 'cn=LDAPAdmin,ou=People,dc=test, dc=local',
    admin:'root',
    pswd: 'changeme'
};*/

var url_origin = window.location.origin;
//change url to the original newserver if testing from localhost
if(url_origin.indexOf("localhost") > -1) 
	url_origin = "http://192.255.40.245"; //url_origin = "http://192.255.32.218"; 	
	
var solr_server_select = url_origin + ":8500/solr/ECFS/select"; //q=test&sort=id+asc&wt+json&indent=true, http://192.255.32.218:8500/solr/#/ECFS/query
var solr_url_select = url_origin + ":8080/fccEcfs/Select"; //backend JAVA request
var solr_server_update = url_origin + ":8500/solr/ECFS/update"; //q=test&sort=id+asc&wt+json&indent=true, http://192.255.32.218:8500/solr/#/ECFS/documents
var solr_url_update = url_origin + ":8080/fccEcfs/SubmitComment"; //backend JAVA update
var max_records = 100; //maximum number of records retrieved before user gets a warning
var query_wait_time = 60000; //60 secs to check for results before stopping the loop
var status_check_time = 5000; //every 5 secs send a request to QSL to check the "DONE" status of a query 



function getSolrHost(action) {
	if(action == "select")
		return solr_server_select;
	else if(action == "update")
		return solr_server_update;
	else
		return solr_server_select;
}

function getSolrUrl(action){
	if(action == "select")
		return solr_url_select;
	else if(action == "update")
		return solr_url_update;
	else
		return solr_url_select;
}

function getMaxRecords() {
	return max_records;
}

function getWaitTime() {
	return query_wait_time;
}

function getCheckTime() {
	return status_check_time;
}

