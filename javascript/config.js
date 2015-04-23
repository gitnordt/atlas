/*var tables = {
  name: 'common_nameindex', 
  source: 'smp_source',
  ppExp: 'smp_psprtexpiredate', 
  dateRange: 'dateRange'
};

// Config from a .json or .ini file or whatever.
var  ldap = {
    url: 'ldaps://ldap.example.com:636', //cerb.data-tactics.com
	host:'iowf01.iphicles.cerberus.local',
	dn: 'cn=LDAPAdmin,ou=People,dc=iphicles,dc=cerberus,dc=local', //"cn=user,ou=owfRoles,o=Ozone,l=Columbia,st=Maryland,c=US"
    admin:'root',
    pswd: 'CerberusRock$'
};*/

var solr_server_select = "http://192.255.32.218:8500/solr/ECFS/select"; //q=test&sort=id+asc&wt+json&indent=true, http://192.255.32.218:8500/solr/#/ECFS/query
var solr_url_select = "http://192.255.32.218:8080/fccEcfs/Select"; //backend JAVA request
var solr_server_update = "http://192.255.32.218:8500/solr/ECFS/update"; //q=test&sort=id+asc&wt+json&indent=true, http://192.255.32.218:8500/solr/#/ECFS/documents
var solr_url_update = "http://192.255.32.218:8080/fccEcfs/SubmitComment"; //backend JAVA update
var max_records = 10000; //maximum number of records retrieved before user gets a warning
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

