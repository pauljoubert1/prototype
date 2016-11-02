//---------------------------------------------------------------------------------------------------------------------------------
// File: test-config.js
// Contents: configuration for tests
// 
// Copyright Microsoft Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//
// You may obtain a copy of the License at:
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//---------------------------------------------------------------------------------------------------------------------------------

// server connection info
var driver = 'SQL Server Native Client 10.0';
var server = 'P46SKYATA84';
var user = 'UserWebMaT';
var pwd = 'Awz3umdv';
var database = 'PAD';
var useTrustedConnection = true;

// sql WebMaT DJ4 connection info
var driverDJ4 = 'SQL Server Native Client 10.0';
var serverDJ4 = 'S71P12dmdj4';
var userDJ4 = 'UserWebMaT';
var pwdDJ4 = 'Pm9wQcqz';
var databaseDJ4 = 'WEBMAT';
var useTrustedConnectionDJ4 = false;

// sql WebMaTDev DJ4 connection info
var driverDJ4dev = 'SQL Server Native Client 10.0';
var serverDJ4dev = 'S71P12dmdj4';
var userDJ4dev = 'UserWebMaT';
var pwdDJ4dev = 'Pm9wQcqz';
var databaseDJ4dev = 'WEBMAT_DEV';
var useTrustedConnectionDJ4dev = false;


// Server Osmose connection info
var driver_osm = 'SQL Server Native Client 10.0';
var server_osm = 'S71P12dmdj4';
var user_osm = 'IMPORT_WEBZ2N_PROD_READER';
var pwd_osm = 'Password2015';
var database_osm = 'IMPORT_WEBZ2N_PROD';
var useTrustedConnection_Osm = false;

// Server OsmoseLocal connection info
var driver_osmLoc = 'SQL Server Native Client 10.0';
var server_osmLoc = 'P46SKYATA84';
var user_osmLoc = 'UserOsm';
var pwd_osmLoc = 'Awz3umdv';
var database_osmLoc = 'Osmose';
var useTrustedConnection_OsmLoc = false;

// Server Rexmat connection info (MySql)
var host_rm = '10.23.224.38';
var user_rm = 'rexmat';
var pwd_rm = 'rexmat';
var database_rm = 'rexmat';

// Server Rexmat connection info (PG)
var host_pg = '10.105.135.127';
var user_pg = 'rexmat';
var pwd_pg = 'rexmat';
var database_pg = 'rexmat';

// Server GRIFFE (PG)
var host_grf = '10.105.28.180';
var user_grf = 'visiteur';
var pwd_grf = 'guest';
var database_grf = 'base_griffe';

var conn_strLoc = "Driver={" + driver + "};Server=" + server + ";" + (useTrustedConnection == true ? "Trusted_Connection={Yes};" : "UID=" + user + ";PWD=" + pwd + ";") + "Database=" + database;
var conn_strDJ4 = "Driver={" + driverDJ4 + "};Server=" + serverDJ4 + ";" + (useTrustedConnectionDJ4 == true ? "Trusted_Connection={Yes};" : "UID=" + userDJ4 + ";PWD=" + pwdDJ4 + ";") + "Database=" + databaseDJ4;
var conn_str = "Driver={" + driverDJ4dev + "};Server=" + serverDJ4dev + ";" + (useTrustedConnectionDJ4dev == true ? "Trusted_Connection={Yes};" : "UID=" + userDJ4dev + ";PWD=" + pwdDJ4dev + ";") + "Database=" + databaseDJ4dev;
var conn_osm = "Driver={" + driver_osm + "};Server=" + server_osm + ";" + (useTrustedConnection_Osm == true ? "Trusted_Connection={Yes};" : "UID=" + user_osm + ";PWD=" + pwd_osm + ";") + "Database={" + database_osm + "};";
var conn_osmLoc = "Driver={" + driver_osmLoc + "};Server=" + server_osmLoc + ";" + (useTrustedConnection_OsmLoc == true ? "Trusted_Connection={Yes};" : "UID=" + user_osmLoc + ";PWD=" + pwd_osmLoc + ";") + "Database={" + database_osmLoc + "};";
var con_Rexmat = { host: '10.23.224.38', user: 'rexmat', password: 'rexmat', database: 'rexmat' };
var con_RexmatPg = "postgres://rexmat:rexmat@10.105.135.127:5432/rexmat";
var con_Grf = "postgres://visiteur:guest@10.105.28.180/base_griffe";

// The following need to be exported for building connection strings within a test...
exports.database = database;
exports.server = server;
exports.user = user;
exports.pwd = pwd;
// Driver name needs to be exported for building expected error messages...
exports.driver = driver;
// Here's a complete connection string which can be shared by multiple tests...
exports.conn_str        = conn_str;         // Base WEBMAT_DEV sur DJ4
exports.conn_strLoc     = conn_strLoc;      // Base Locale
exports.conn_strDJ4     = conn_strDJ4;      // !! Base WEBMAT sur DJ4 !!
exports.conn_osm        = conn_osm;         // !! Base OSMOSE sur DJ4 !!
exports.con_Rexmat      = con_Rexmat;       // !! Base Rexmat MySql (plus utilisé) !!
exports.con_RexmatPg    = con_RexmatPg;     // !! Base Rexmat PostGre !!
exports.con_Grf         = con_Grf;          // !! Base Griffe !!
