var config = require('./connection_config');

var conn_str        = config.conn_str;
var conn_Osm        = config.conn_osm;
var conn_OsmLoc     = config.conn_osmLoc;
var con_Rexmat      = config.con_Rexmat;
var con_RexmatPg    = config.con_RexmatPg;
var conn_strLoc     = config.conn_strLoc;
var conn_griffe     = config.con_Grf;

var sql = require('msnodesql');
var express = require('express');
var dateFormat = require('dateformat');
var mysql = require('mysql');
var pg = require('pg');
var bodyParser = require('body-parser')

var conRexmat = mysql.createConnection(con_Rexmat);
var conRexmatPg = con_RexmatPg;

var webmat = express();

// create application/json parser 
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var port = process.env.PORT || 3000;

webmat.get('/TestDate', function (request, response) {
    var d1 = dateFormat(new Date(), "yyyy-mm-dd 00:00:00");
    var d2 = dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss");

    response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
    response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
    response.type('json');
    response.status(200).jsonp({ Result: d2 });
})

webmat.get('/getGrf', function (request, response) {
    var query = "SELECT no_rame, gare_arrivee from rl_seg_train where gare_arrivee = 'SDE-JO' AND no_rame='112A' ";
    var jResults = new Array();
    var stmt_stf = sql.query(conn_griffe, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID: results[i].ID,
                IDrexmat: results[i].StfIdRM,
                IDosmose: results[i].CodeOsmose.trim(),
                STF: results[i].STF.trim(),
                STFosmose: results[i].LibelleOsmose.trim(),
                Semelle: results[i].ModSemelle
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
})

webmat.get('/getFaitTechOsmose', function (request, response) {
    if (!request.query.stf) {
        response.send('Check the params');
        return;
    }
    else {
        var params  = request.query;
        var stf     = params.stf;                   // STF
        var rame    = params.rame;                  // Rame 
        var flotte  = params.flotte;
        var dtCreaFtStr = "";

        if (params.dtCrea) {
            var dtCrea = params.dtCrea.split(' - ');
            var dtCreaS = dtCrea[0]; var dtCreaE = dtCrea[1];      // date de création
            dtCreaFtStr = " AND (CONVERT(datetime, [t0].[DT_CREA_FT], 103) BETWEEN CONVERT(datetime, '" + dtCreaS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtCreaE + " 23:59:59', 103))";
        }
    }

    var separateur = ' / ';
    var ifNull = '';

    var req = "SELECT";
    req += " [t0].[ID_FT] AS IdFT,";
    req += " [t0].[N_INT] AS IdINT,";
    req += " LTRIM(RTRIM([t0].[N_EF])) AS NumEF,";
    req += " LTRIM(RTRIM([t0].[N_EU])) AS NumEU,";
    req += " [t0].[DT_CREA_FT] AS DateFT,";
    req += " LTRIM(RTRIM([t0].[DS_FT])) AS DescFT,";
    req += " LTRIM(RTRIM([t0].[CMT_FT])) AS CmtFT,";
    req += " LTRIM(RTRIM([t0].[STATUT])) AS Statut,";
    req += " LTRIM(RTRIM([t0].[C_GR_FT])) AS Gravite,";
    req += " LTRIM(RTRIM([t0].[C_EMET])) AS Emeteur,";
    req += " LTRIM(RTRIM([t0].[N_SIGN])) AS Signalement,";
    req += " LTRIM(RTRIM([t0].[STF])) AS Stf,";
    req += " LTRIM(RTRIM([t0].[FONCTION])) AS Fonction,";
    req += " LTRIM(RTRIM([t0].[PANNE])) AS Panne,";
    req += " [t0].[DT_Signal] AS DateSignalement,";
    req += " [t0].[C_Recidive] AS Recidive";
    req += " FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_FT] AS [t0] ";
    req += " WHERE ([t0].[DT_CREA_FT] IS NOT NULL)";
    req += " AND (LTRIM(RTRIM([t0].[STF])) = '" + stf + "')";
    if (params.rame != "0") req += " AND (LTRIM(RTRIM([t0].[N_EF])) = '" + rame + "')";
    if (flotte != null && flotte != "") req += " AND (LTRIM(RTRIM([t0].[C_FLT])) IN " + flotte + ")";
    if (params.dtCrea) req += dtCreaFtStr;

    var jSonFT = new Array();
    var stmtFt = sql.query(conn_Osm, req, function (err, FT) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < FT.length; i++) {
            jSonFT.push({
                IdFT:               FT[i].IdFT,
                IdInterv:           FT[i].IdINT,
                NumEF:              FT[i].NumEF,
                NumEU:              FT[i].NumEU,
                DateCreate:         new Date(new Date(FT[i].DateFT).getTime() + (new Date(FT[i].DateFT).getTimezoneOffset() * 60000)), 
                DescFt:             FT[i].DescFT,
                Statut:             FT[i].Statut,
                CmtFt:              FT[i].CmtFT,
                Gravite:            FT[i].Gravite,
                Emeteur:            FT[i].Emeteur,
                Signalement:        FT[i].Signalement,
                Stf:                FT[i].Stf,
                DateSignalement:    FT[i].DateSignalement == null ? null : new Date(new Date(FT[i].DateSignalement).getTime() + (new Date(FT[i].DateSignalement).getTimezoneOffset() * 60000)),
                FctPanne:           FT[i].Fonction + "/" + FT[i].Panne,
                Recidive:           FT[i].Recidive
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jSonFT });
    });
});
webmat.get('/getInterventionsOsmose', function (request, response) {
    if (!request.query.stf) {
        response.send('Check the params');
        return;
    }
    else {
        var params = request.query;
        var stf     = params.stf;                   // STF
        var rame    = params.rame;                  // Rame 
        var flotte  = params.flotte;

        var dtCreaIntStr    = "";
        var dtDebIntStr     = "";
        var dtFinIntStr     = "";
        var dtButeeStr      = "";
        var whereStatus     = "";
        var whereSites      = "";
        var whereTypesDi    = "";
        var whereTypesInt   = "";

        if (params.status) {
            var tmpST = params.status.split('|');
            for (var i1 = 0; i1 < tmpST.length; i1++) tmpST[i1] = "'" + tmpST[i1] + "'";
            whereStatus = " AND (LTRIM(RTRIM([t0].[STATUT])) IN " + "(" + tmpST.join(",") + "))";
        }
        if (params.typeDI) {
            var tmpTD = params.typeDI.split('|');
            for (var i2 = 0; i2 < tmpTD.length; i2++) tmpTD[i2] = "'" + tmpTD[i2] + "'";
            whereTypesDi = " AND (LTRIM(RTRIM([t0].[TYP_DI])) IN " +  "(" + tmpTD.join(",") + "))";
        }
        if (params.typeINT) {
            var tmpTI = params.typeINT.split('|');
            for (var i3 = 0; i3 < tmpTI.length; i3++) tmpTI[i3] = "'" + tmpTI[i3] + "'";
            whereTypesInt = " AND (LTRIM(RTRIM([t0].[TYP_INT])) IN " + "(" + tmpTI.join(",") + "))";
        }
        if (params.sr) {
            var tmpSR = params.sr.split('|');
            for (var i4 = 0; i4 < tmpSR.length; i4++) tmpSR[i4] = "'" + tmpSR[i4] + "'";
            whereSites = " AND (LTRIM(RTRIM([t0].[SR])) IN " + "(" + tmpSR.join(",") + "))";
        }

        if (params.dtCrea) {
            var dtCrea = params.dtCrea.split(' - ');
            var dtCreaS = dtCrea[0]; var dtCreaE = dtCrea[1];      // date de création
            dtCreaIntStr = " AND (CONVERT(datetime, [t0].[INT_CREA], 103) BETWEEN CONVERT(datetime, '" + dtCreaS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtCreaE + " 23:59:59', 103))";
        }

        if (params.dtDebInt) {
            var dtDebInt = params.dtDebInt.split(' - ');
            var dtDebS = dtDebInt[0]; var dtDebE = dtDebInt[1];      // date de debut
            dtDebIntStr = " AND (CONVERT(datetime, [t0].[DT_DB_INT_R], 103) BETWEEN CONVERT(datetime, '" + dtDebS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtDebE + " 23:59:59', 103))";
        }
        if (params.dtFinInt) {
            var dtFinInt = params.dtFinInt.split(' - ');
            var dtFinS = dtFinInt[0]; var dtFinE = dtFinInt[1];      // date de fin
            dtFinIntStr = " AND (CONVERT(datetime, [t0].[DT_FIN_INT_R], 103) BETWEEN CONVERT(datetime, '" + dtFinS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtFinE + " 23:59:59', 103))";
        }
        if (params.dtButee) {
            var dtButee = params.dtButee.split(' - ');
            var dtButeeS = dtButee[0]; var dtButeeE = dtButee[1];      // date butee
            dtButeeStr = " AND (CONVERT(datetime, [t0].[DT_BUTEE], 103) BETWEEN CONVERT(datetime, '" + dtButeeS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtButeeE + " 23:59:59', 103))";
        }
    }

    var separateur = ' / ';
    var ifNull = '';

    var req = "SELECT";
    req += " [t0].[N_INT],";
    req += " [t0].[N_EF],";
    req += " [t0].[INT_CREA],";
    req += " LTRIM(RTRIM([t0].[DS_POSITION])) AS DS_POSITION,";
    req += " LTRIM(RTRIM([t0].[STATUT])) AS STATUT,";
    req += " LTRIM(RTRIM([t0].[SR_ORIG])) AS SR_ORIG,";
    req += " LTRIM(RTRIM([t0].[SR])) AS SR,";
    req += " LTRIM(RTRIM([t0].[DS_OPE])) AS DS_OPE,";
    req += " LTRIM(RTRIM([t0].[DS_INT])) AS DS_INT,";
    req += " LTRIM(RTRIM([t0].[CMT_DI])) AS CMT_DI,";
    req += "( CASE WHEN [t0].[DT_FIN_INT_R] IS NOT NULL THEN [t0].[DT_FIN_INT_R] ELSE NULL END) AS DT_FIN_INT_R,";
    req += "( CASE WHEN (( SELECT COUNT(*) FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_OT] AS [t1] WHERE [t0].[N_INT] = [t1].[N_INT])) > 0 THEN (((";
    req += " SELECT [t3].[FONCTION] FROM ( SELECT TOP (1) [t2].[FONCTION] FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_OT] AS [t2] WHERE [t0].[N_INT] = [t2].[N_INT]) AS [t3])) + '" + separateur + "') + ";
    req += "(( SELECT [t5].[PANNE] FROM ( SELECT TOP (1) [t4].[PANNE] FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_OT] AS [t4] WHERE [t0].[N_INT] = [t4].[N_INT]) AS [t5]))";
    req += " ELSE '" + ifNull + "' END) AS FctPan,";
    req += " LTRIM(RTRIM([t0].[TYP_INT])) AS TYP_INT,";
    req += " LTRIM(RTRIM([t0].[TYP_DI])) AS TYP_DI,";
    req += " [t0].[DT_DB_INT_R],";
    req += " [t0].[DT_BUTEE]";
    req += " FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_INT] AS [t0] ";
    req += " WHERE ([t0].[INT_CREA] IS NOT NULL)";
    req += " AND (LTRIM(RTRIM([t0].[STF])) = '" + stf + "')";
    if (params.rame != "0")             req += " AND (LTRIM(RTRIM([t0].[N_EF])) = '" + rame + "')";
    if (flotte != null && flotte != "") req += " AND (LTRIM(RTRIM([t0].[C_FLT])) IN " + flotte + ")";
    if (params.dtCrea)                  req += dtCreaIntStr;
    if (params.dtDebInt)                req += dtDebIntStr;
    if (params.dtFinInt)                req += dtFinIntStr;
    if (params.dtButee)                 req += dtButeeStr;
    if (params.status)                  req += whereStatus;
    if (params.typeDI)                  req += whereTypesDi;
    if (params.typeINT)                 req += whereTypesInt;
    if (params.sr)                      req += whereSites;

    //console.log(req);

    var jSonInterventions = new Array();
    var stmtIntervention = sql.query(conn_Osm, req, function (err, Interventions) {
        if (err) { console.log('getInterventionsOsmose >> database error:' + err); return; }

        for (var i = 0; i < Interventions.length; i++) {
            jSonInterventions.push({
                IDintervention:     Interventions[i].N_INT,
                NumEF:              Interventions[i].N_EF,
                DateCreate:         new Date(new Date(Interventions[i].INT_CREA).getTime() + (new Date(Interventions[i].INT_CREA).getTimezoneOffset() * 60000)), 
                Motrice:            Interventions[i].DS_POSITION,
                Statut:             Interventions[i].STATUT,
                SitePoseur:         Interventions[i].SR_ORIG == "MR" ? "STF" : Interventions[i].SR_ORIG,
                SiteReal:           Interventions[i].SR,
                Operation:          Interventions[i].DS_OPE,
                DescIntervention:   Interventions[i].DS_INT,
                CmtIntervention:    Interventions[i].CMT_DI,
                FctPanne:           Interventions[i].FctPan,
                TypeInterv:         Interventions[i].TYP_INT,
                TypeDi:             Interventions[i].TYP_DI,
                DateDebut:          Interventions[i].DT_DB_INT_R == null ?  null : new Date(new Date(Interventions[i].DT_DB_INT_R).getTime() + (new Date(Interventions[i].DT_DB_INT_R).getTimezoneOffset() * 60000)),
                DateFin:            Interventions[i].DT_FIN_INT_R == null ? null : new Date(new Date(Interventions[i].DT_FIN_INT_R).getTime() + (new Date(Interventions[i].DT_FIN_INT_R).getTimezoneOffset() * 60000)),
                DateButee:          Interventions[i].DT_BUTEE == null ?     null : new Date(new Date(Interventions[i].DT_BUTEE).getTime() + (new Date(Interventions[i].DT_BUTEE).getTimezoneOffset() * 60000))
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jSonInterventions });
    });
});
webmat.get('/getInterventionById', function (request, response) {
    var idInterv = request.query.IntervId;
    var jSonIntervention = {};

    var query = "SELECT N_INT AS IntervID, INT_CREA AS DateCreateINT, LTRIM(RTRIM(DS_INT)) AS DscIntervention, DT_DB_INT_R AS DateDebINT, DT_FIN_INT_R AS DateFinINT, DT_BUTEE AS DateButee, LTRIM(RTRIM(CMT_DI)) AS CmtDI, LTRIM(RTRIM(STATUT)) AS Statut, LTRIM(RTRIM(TYP_INT)) AS TypeINT, LTRIM(RTRIM(TYP_DI)) AS TypeDI, LTRIM(RTRIM(DS_OPE)) AS DscOpe, LTRIM(RTRIM(CYCLE)) AS Cycle, LTRIM(RTRIM(GAMME)) AS Gamme, LTRIM(RTRIM(DS_POSITION)) AS DscPosition, DT_DB_PREV AS DateDebRdvPrev, DT_FIN_PREV AS DateFinRdvPrev, DT_DB_RDV AS DateDebRdv, DT_FIN_RDV AS DateFinRdv, LTRIM(RTRIM(SR_ORIG)) AS SitePoseur, LTRIM(RTRIM(SR)) AS SiteRealisateur, LTRIM(RTRIM(N_EF)) AS numEF";
    query += " FROM OSM_INT";
    query += " WHERE N_INT = " + idInterv;

    var stmtIntervention = sql.query(conn_Osm, query, function (err, interv) {
        if (err) { console.log('getInterventionById >> database error:' + err); return; }
        var result = interv[0];
        jSonIntervention = {
            IntervID:           result.IntervID,
            DateCreateINT:      new Date(new Date(result.DateCreateINT).getTime() + (new Date(result.DateCreateINT).getTimezoneOffset() * 60000)),  
            DscIntervention:    result.DscIntervention,
            DscPosition:        result.DscPosition,
            Statut:             result.Statut,
            SitePoseur:         result.SitePoseur == "MR" ? "STF" : result.SitePoseur,
            SiteRealisateur:    result.SiteRealisateur,
            DscOpe:             result.DscOpe,
            CmtDI:              result.CmtDI,
            TypeINT:            result.TypeINT,
            TypeDI:             result.TypeDI,
            Cycle:              result.Cycle,
            Gamme:              result.Gamme == null ? 0 : result.Gamme,
            numEF:              result.numEF,

            DateDebINT:         result.DateDebINT       == null ?   null    : new Date(new Date(result.DateDebINT).getTime() + (new Date(result.DateDebINT).getTimezoneOffset() * 60000)),
            DateFinINT:         result.DateFinINT       == null ?   null    : new Date(new Date(result.DateFinINT).getTime() + (new Date(result.DateFinINT).getTimezoneOffset() * 60000)),
            DateButee:          result.DateButee        == null ?   null    : new Date(new Date(result.DateButee).getTime() + (new Date(result.DateButee).getTimezoneOffset() * 60000)),
            DateDebRdvPrev:     result.DateDebRdvPrev   == null ?   null    : new Date(new Date(result.DateDebRdvPrev).getTime() + (new Date(result.DateDebRdvPrev).getTimezoneOffset() * 60000)),
            DateFinRdvPrev:     result.DateFinRdvPrev   == null ?   null    : new Date(new Date(result.DateFinRdvPrev).getTime() + (new Date(result.DateFinRdvPrev).getTimezoneOffset() * 60000)),
            DateDebRdv:         result.DateDebRdv       == null ?   null    : new Date(new Date(result.DateDebRdv).getTime() + (new Date(result.DateDebRdv).getTimezoneOffset() * 60000)),
            DateFinRdv:         result.DateFinRdv       == null ?   null    : new Date(new Date(result.DateFinRdv).getTime() + (new Date(result.DateFinRdv).getTimezoneOffset() * 60000))
        };

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jSonIntervention);
    });
});
webmat.get('/getOtsByInterventionId', function (request, response) {
    var idInterv = request.query.IntervId;
    var jSonOts = new Array();

    var query="SELECT N_OT, DS_OT, DT_DB_OT, DT_FIN_OT, STATUT, FONCTION, PANNE, CAUSE, REMEDE, CMT_F, CMT_P, CMT_C, CMT_R, CMT_D, N_INT";
    query += " FROM OSM_OT";
    query += " WHERE (N_INT =" + idInterv + ")";
    query += " ORDER BY DT_CREA DESC";

    var stmtOts = sql.query(conn_Osm, query, function (err, ots) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < ots.length; i++) {
            jSonOts.push({
                IdOrdreTrv:     ots[i].N_OT,
                DscOrdreTrv:    ots[i].DS_OT,
                DateDebOT:      ots[i].DT_DB_OT == null ? null : new Date(new Date(ots[i].DT_DB_OT).getTime() + (new Date(ots[i].DT_DB_OT).getTimezoneOffset() * 60000)),
                DateFinOT:      ots[i].DT_FIN_OT == null ? null : new Date(new Date(ots[i].DT_FIN_OT).getTime() + (new Date(ots[i].DT_FIN_OT).getTimezoneOffset() * 60000)),
                StatutOT:       ots[i].STATUT,
                Fonction:       ots[i].FONCTION,
                Panne:          ots[i].PANNE,
                Cause:          ots[i].CAUSE,
                Remede:         ots[i].REMEDE,
                CmtFonction:    ots[i].CMT_F == null ? null : ots[i].CMT_F.replace(/<br\s*[\/]?>/gi, " - "),
                CmtPanne:       ots[i].CMT_P,
                CmtCause:       ots[i].CMT_C,
                CmtRemede:      ots[i].CMT_R,
                CmtD:           ots[i].CMT_D,
                NumInterv:      ots[i].N_INT
            });

        }
    
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jSonOts);
    });
});
webmat.get('/getCrtOsmose', function (request, response) {
    if (!request.query.stf) { response.send('Check the params'); return; }
    else {
        var params          = request.query;
        var stf             = params.stf;                   // STF
        var rame            = params.rame;                  // Rame 
        var flotte          = params.flotte;
        var dtFinIntStr     = "";

        var dtFinInt = params.dtFinInt.split(' - ');
        var dtFinS = dtFinInt[0]; var dtFinE = dtFinInt[1];      // date de fin
        dtFinIntStr = " AND (CONVERT(datetime, [t0].[DT_FIN_INT_R], 103) BETWEEN CONVERT(datetime, '" + dtFinS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtFinE + " 23:59:59', 103))";
    }

    var separateur = ' / ';
    var ifNull = '';

    var req = "SELECT [t0].[N_INT] AS [IntervID], ";
    req += "[t0].[INT_CREA] AS [DateCreateINT], ";
    req += "[t0].[N_EF] AS [numEF], ";
    req += "LTRIM(RTRIM([t0].[DS_POSITION])) AS [DscPosition], ";
    req += "LTRIM(RTRIM([t0].[STATUT])) AS [Statut], ";
    req += "LTRIM(RTRIM([t0].[SR])) AS [SiteRealisateur], ";
    req += "LTRIM(RTRIM([t0].[SR_ORIG])) AS [SitePoseur], ";
    req += "LTRIM(RTRIM([t0].[DS_OPE])) AS [DscOpe], ";
    req += "LTRIM(RTRIM([t0].[CMT_DI])) AS [CmtDI], ";
    req += "LTRIM(RTRIM([t0].[DS_INT])) AS [DscIntervention], ";
    req += "[t0].[DT_FIN_INT_R] AS [DateFinINT], ";
    req += " LTRIM(RTRIM([t0].[TYP_INT])) AS [TypeInt], ";
    req += " LTRIM(RTRIM([t0].[TYP_DI])) AS [TypeDi], ";
    req += " LTRIM(RTRIM([t1].[FONCTION])) AS [Fonction], ";
    req += " LTRIM(RTRIM([t1].[PANNE])) AS [Panne], ";
    req += " LTRIM(RTRIM([t1].[CMT_F])) AS [CmtF], ";
    req += " LTRIM(RTRIM([t1].[CMT_P])) AS [CmtP], ";
    req += " LTRIM(RTRIM([t1].[CMT_R])) AS [CmtR], ";
    req += " LTRIM(RTRIM([t1].[CMT_D])) AS [CmtD], ";
    req += " LTRIM(RTRIM([t1].[CMT_C])) AS [CmtC] ";

    req += " FROM [IMPORT_WEBZ2N_PROD].[dbo].[OSM_INT] AS [t0] ";
    req += " LEFT OUTER JOIN [IMPORT_WEBZ2N_PROD].[dbo].[OSM_OT] AS [t1] ON [t0].[N_INT] = [t1].[N_INT]";
    req += " WHERE ([t0].[INT_CREA] IS NOT NULL)";
    if (rame == "0") req += " AND (LTRIM(RTRIM([t0].[STF])) = '" + stf + "')";
    if (rame != "0") req += " AND (LTRIM(RTRIM([t0].[N_EF])) = '" + rame + "')";
    req += " AND (LTRIM(RTRIM([t0].[TYP_INT])) = 'CORRECTIF')"; // Pour le correctif on prend les Interventions de type TypeInt = 'CORRECTIF'
    if (flotte != null && flotte != "") req += " AND (LTRIM(RTRIM([t0].[C_FLT])) IN " + flotte + ")";
    req += dtFinIntStr;
    req += " ORDER BY [t0].[N_INT]";


    var jSonInterventions = new Array();
    var nInt = 0;
    var ComOts = "";
    var FctPan = "";

    var stmtInt = sql.query(conn_Osm, req, function (err, Interventions) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < Interventions.length; i++) {
            if (nInt != Interventions[i].IntervID) {
                var tab = Interventions.filter(function (item) { return item.IntervID == Interventions[i].IntervID; })
                for (var j = 0; j < tab.length; j++) {
                    if (tab[j].Fonction != "" && tab[j].Panne != "" && tab[j].Fonction != null && tab[j].Panne != null && FctPan == "") FctPan = tab[j].Fonction + "/" + tab[j].Panne;
                    if (tab[j].CmtF != "") ComOts += tab[j].CmtF;
                }

                jSonInterventions.push({
                    IDintervention:     Interventions[i].IntervID,
                    NumEF:              Interventions[i].numEF,
                    DateCreate:         new Date(new Date(Interventions[i].DateCreateINT).getTime() + (new Date(Interventions[i].DateCreateINT).getTimezoneOffset() * 60000)), // Interventions[i].DateCreateINT,
                    Motrice:            Interventions[i].DscPosition,
                    Statut:             Interventions[i].Statut,
                    SitePoseur:         Interventions[i].SitePoseur == "MR" ? "STF" : Interventions[i].SitePoseur,
                    SiteReal:           Interventions[i].SiteRealisateur,
                    Operation:          Interventions[i].DscOpe,
                    DescIntervention:   Interventions[i].DscIntervention,
                    CmtIntervention:    Interventions[i].CmtDI,
                    DateFin:            Interventions[i].DateFinINT == null ? null : new Date(new Date(Interventions[i].DateFinINT).getTime() + (new Date(Interventions[i].DateFinINT).getTimezoneOffset() * 60000)),  //Interventions[i].DateFinINT,
                    FctPanne:           FctPan,
                    TypeInterv:         Interventions[i].TypeInt,
                    TypeDi:             Interventions[i].TypeDi,
                    CRT:                ComOts
                });
                ComOts = "";
                FctPan = "";
            }
            nInt = Interventions[i].IntervID;
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jSonInterventions });

    });

});
webmat.get('/getIncidents', function (request, response) {

    if (!request.query.stf) { response.send('Check the params'); return; }

    var params          = request.query;
    var IdStf           = params.stf;                   // STF
    var idMat           = params.rame;                  // Rame 
    var numEF           = params.numef;
    var periode         = params.bPeriode;

    var req = "SELECT id_signal AS ID,";
    req += " Date_Incident AS DateIncident,";
    req += " Lieu_Incident AS LieuIncident,";
    req += " origine_signal AS OrigineIncident,";
    req += " libelle_incident AS Libelle,";
    req += " id_train AS NumTrain,";
    req += " sens AS Sens,";
    req += " engin_impacte AS EnginImpact,";
    req += " id_elt AS IdElement,";
    req += " tps_perdu AS TpsPerdu,";
    req += " fpac_panne.panne AS Panne,";
    req += " fpac_fonction.fonction AS Fonction,";
    req += " fpac_fonction.code AS LCN";
    req += " FROM signalements ";
    req += " LEFT OUTER JOIN fpac_panne ON id_panne = id INNER JOIN fpac_fonction ON fpac_panne.id_fonction = fpac_fonction.id"
    req += " WHERE Id_signal > 0";
    if (!params.rame || params.rame == 0) req += " AND id_stf = " + IdStf;
    if (periode == 'true') req += " AND date_incident Between " + params.dperiodeDebut + " AND " + params.dperiodeFin;
    if (params.numef && params.numef != "0") req += " AND engin_impacte = '" + numEF + "'";
    req += " ORDER BY date_incident DESC ";


    var jSonRexmat = new Array();
    conRexmat.query(req, function (err, rows, fields) {
        if (err) {
            response.send('Error opening the connection With Rexmat !' + err);
            return;
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": rows });
    });
});

webmat.get('/getIncidentsPg', function (request, response) {

    if (!request.query.stf) { response.send('Check the params'); return; }

    var params = request.query;
    var IdStf = params.stf;                   // STF
    var idMat = params.rame;                  // Rame 
    var numEF = params.numef;
    var periode = params.bPeriode;

    var req = "SELECT id_signal AS ID,";
    req += " Date_Incident AS DateIncident,";
    req += " Lieu_Incident AS LieuIncident,";
    req += " origine_signal AS OrigineIncident,";
    req += " libelle_incident AS Libelle,";
    req += " id_train AS NumTrain,";
    req += " sens AS Sens,";
    req += " engin_impacte AS EnginImpact,";
    req += " id_elt AS IdElement,";
    req += " tps_perdu AS TpsPerdu,";
    req += " fpac_panne.panne AS Panne,";
    req += " fpac_fonction.fonction AS Fonction,";
    req += " fpac_fonction.code AS LCN";
    req += " FROM signalements, fpac_fonction, fpac_panne";
    req += " WHERE signalements.id_panne = fpac_panne.id AND fpac_panne.id_fonction = fpac_fonction.id AND Id_signal > 0";
    if (!params.rame || params.rame == 0) req += " AND id_stf = " + IdStf;
    if (periode == 'true') req += " AND (date_incident Between '" + params.dperiodeDebut + "' AND '" + params.dperiodeFin + "')";
    if (params.numef && params.numef != "0") req += " AND engin_impacte = '" + numEF + "'";
    req += " ORDER BY date_incident DESC ";
    console.log(req);
    var jSonRexmat = new Array();
    pg.connect(conRexmatPg, function (err, client, done) {
        if (err) {
            console.log('error fetching client from pool', err);
            return console.error('error fetching client from pool', err);
        }
        client.query(req, function (err, rows) {
            if (err) {
                console.log('Error opening the connection With Rexmat !' + err);
                response.send('Error opening the connection With Rexmat !' + err);
                return;
            }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp({ "data": rows.rows });
            //response.status(200).jsonp({ "data": rows }); L'Obejct rows renvoie plus d'info que les données elles même : Le Nbr de données renvoyées, etc....
        });
    });
});

/* Region Préventif */
webmat.get('/getModuleByStf', function (request, response) {
    var stf = request.query.stf;
    var req = "SELECT ID, RTRIM(Module) AS Module, RTRIM(Operation) AS Operation, Priorite FROM T_OSM_Preventif  WHERE (Tete = 1) AND (StfId = " + stf + ") ORDER BY Priorite";
    var json_operations = new Array();

    var stmtOpe = sql.query(conn_str, req, function (err, Operations) {
        if (err) { console.log('database error:' + err); return; }
        for (var t = 0; t < Operations.length; t++) { json_operations.push({ Module: Operations[t].Module, Operation: Operations[t].Operation }); }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(json_operations);

    });
});
webmat.get('/getPreventif', function (request, response) {
    var rame = request.query.rame;
    var stf = request.query.stf;

    var req = "SELECT OSM_INT.N_INT AS IntervID, OSM_INT.DT_DB_INT_R AS DateDebINT, OSM_INT.DT_FIN_INT_R AS DateFinINT, OSM_INT.DT_BUTEE AS DateButee, OSM_INT.STATUT AS Statut, OSM_INT.DS_OPE AS DescOP, OSM_INT.DT_DB_PREV AS DateDebPrv, OSM_INT.DT_DB_RDV AS DateDebRdv, OSM_INT.SR AS SiteReal, WEBMAT_DEV.dbo.T_Osm_Preventif.Operation, WEBMAT_DEV.dbo.T_Osm_Preventif.Priorite ";
    req += "FROM  OSM_INT INNER JOIN";
    req += " WEBMAT_DEV.dbo.T_Osm_Preventif ON OSM_INT.DS_OPE = WEBMAT_DEV.dbo.T_Osm_Preventif.Module";
    req += " WHERE (LTRIM(RTRIM(OSM_INT.N_EF)) = '" + rame + "') AND (WEBMAT_DEV.dbo.T_Osm_Preventif.StfId = " + stf + ") AND (WEBMAT_DEV.dbo.T_Osm_Preventif.Tete = 1)";

    var jSonPrev = new Array();

    var stmtint = sql.query(conn_Osm, req, function (err, interventions) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < interventions.length; i++) {
            jSonPrev.push({
                IDintervention: interventions[i].IntervID,
                Priorite: interventions[i].Priorite,
                Operation: interventions[i].Operation,
                Libelle: interventions[i].Operation + " [" + interventions[i].DescOP + "]",
                Statut: interventions[i].Statut,
                SiteReal: interventions[i].SiteReal,
                Operation: interventions[i].DescOP,
                DateDebIntv: interventions[i].DateDebINT == null ? null : new Date(new Date(interventions[i].DateDebINT).getTime() + (new Date(interventions[i].DateDebINT).getTimezoneOffset() * 60000)),
                DateFinIntv: interventions[i].DateFinINT == null ? null : new Date(new Date(interventions[i].DateFinINT).getTime() + (new Date(interventions[i].DateFinINT).getTimezoneOffset() * 60000)),
                DateRdvPrev: interventions[i].DateDebPrv == null ? null : new Date(new Date(interventions[i].DateDebPrv).getTime() + (new Date(interventions[i].DateDebPrv).getTimezoneOffset() * 60000)),
                DateRdvReel: interventions[i].DateDebRdv == null ? null : new Date(new Date(interventions[i].DateDebRdv).getTime() + (new Date(interventions[i].DateDebRdv).getTimezoneOffset() * 60000)),
                DateButee: interventions[i].DateButee == null ? null : new Date(new Date(interventions[i].DateButee).getTime() + (new Date(interventions[i].DateButee).getTimezoneOffset() * 60000)),
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jSonPrev });
    });
});

/* Région Semelle */
webmat.get('/getCtrlSemelle', function (request, response) {

    var req = "SELECT T_Sem_Controles.*, T_Sem_Interventions.Intervention, T_Sem_Sites.Site, T_SNCF_Rames.EAB  FROM T_Sem_Controles  INNER JOIN T_Sem_Sites ON T_Sem_Controles.IdSite = T_Sem_Sites.ID INNER JOIN  T_Sem_Interventions ON T_Sem_Controles.IdIntervention = T_Sem_Interventions.ID  INNER JOIN  T_SNCF_Rames ON T_Sem_Controles.IdRame = T_SNCF_Rames.ID "
    req += request.query.periode;
    req += " ORDER BY DateCtrl DESC, ID DESC";

    console.log(req);

    var stmtSemelle = sql.query(conn_str, req, function (err, ctrlSem) {
        if (err) { console.log('database error:' + err); return; }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": ctrlSem });
    });
});
webmat.get('/getBogie', function (request, response) {
    var params = request.query;
    var lstIdCtrl = params.IdCtrl;                   // STF

    var req = "SELECT T_Sem_Bogie.*, T_SNCF_Compo.NumVehicule FROM T_Sem_Bogie INNER JOIN  T_SNCF_Compo ON T_Sem_Bogie.CompoId = T_SNCF_Compo.ID WHERE  ControleId IN (" + lstIdCtrl + ") ORDER BY ControleId";

    var stmtBogie = sql.query(conn_str, req, function (err, Bogie) {
        if (err) { console.log('database error:' + err); return; }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": Bogie });
    });
});
webmat.get('/getMesures', function (request, response) {
    var params = request.query;
    var lstIdBogie = params.IdBogie;                   // STF

    var req = "SELECT * FROM T_Sem_Data WHERE BogieId IN (" + lstIdBogie + ") ORDER BY NumRoue";

    var stmtMesure = sql.query(conn_str, req, function (err, Mesures) {
        if (err) { console.log('database error:' + err); return; }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": Mesures });
    });
});
webmat.get('/getLastCtrlByRameId', function (request, response) {
    var params = request.query;
    var idrame = params.rame;
    var nbCtrl = params.NbCtrl

    var query = "SELECT TOP (" + nbCtrl + ") ID, DateCtrl, IdRame, IdIntervention, IdSite, ControlerName, SerieId, StfId";
    query += " FROM T_Sem_Controles";
    query += " WHERE  (IdRame = " + idrame + ")";
    query += " ORDER BY DateCtrl DESC, ID DESC";

    var stmtSemelle = sql.query(conn_str, query, function (err, ctrlSem) {
        if (err) { console.log('database error:' + err); return; }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(ctrlSem );
    });

});

webmat.get('/getLoiUsure', function (request, response) {
    var _stfId = request.query.stfId;
    var query = "SELECT SerieId, SousSerieId, BmIso, BmEs, Max3SigBmIso, Max3SigBmEs FROM T_Sem_ParamUsure";
    query += " WHERE (StfId = " + _stfId + ")";

    var stmt = sql.query(conn_str, query, function (err, loiUsure) {
        if (err) { console.log('database error:' + err); return; }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(loiUsure );
    });
});
webmat.get('/getLastCtrlByID', function (request, response) {
    var _Id = request.query.id;
    var _zb = request.query.zb;

    var query = "SELECT " + _zb + "_BM_Iso, " + _zb + "_R1_RPL, " + _zb + "_R2_RPL, " + _zb + "_R3_RPL, " + _zb + "_R4_RPL, " + _zb + "_R1_VISUEL, " + _zb + "_R2_VISUEL, " + _zb + "_R3_VISUEL, " + _zb + "_R4_VISUEL, " + _zb + "_R1_MESURE, " + _zb + "_R2_MESURE, " + _zb + "_R3_MESURE, " + _zb + "_R4_MESURE";
    query += " FROM T_SemellesData WHERE(ID = " + _Id + ")";

    //console.log(query);

    var stmt = sql.query(conn_str, query, function (err, LastCtrl) {
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(LastCtrl[0]);
    });
});
webmat.get('/getOneCtrlByID', function (request, response) {
    var _Id = request.query.id;

    var query = "SELECT * ";
    query += " FROM T_SemellesData WHERE(ID = " + _Id + ")";

    //console.log(query);

    var stmt = sql.query(conn_str, query, function (err, OneCtrl) {
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(OneCtrl[0]);
    });
});
webmat.get('/updtValueCtrlByID', function (request, response) {
    var _Id = request.query.id;
    var _field = request.query.field;
    var _value = request.query.value;

    var query = "UPDATE T_SemellesData ";
    query += " SET " + _field + " = " + _value;
    query += " WHERE(ID = " + _Id + ")";

    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});
webmat.post('/updtCtrlSemelle', urlencodedParser, function (request, response) {
    var ctrl = request.body.ctrl;
    var _Id = request.body.id;

    var query = "UPDATE T_SemellesData";
    query += " SET ZIB1_Ctrl = " + (ctrl.zib1ctrl == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_Ctrl = " + (ctrl.zib2ctrl == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_Ctrl = " + (ctrl.zpb1ctrl == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_Ctrl = " + (ctrl.zpb2ctrl == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_BG_Iso = " + (ctrl.zib1BgIso == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_BG_Iso = " + (ctrl.zib2BgIso == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_BG_Iso = " + (ctrl.zpb1BgIso == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_BG_Iso = " + (ctrl.zpb2BgIso == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_BM_Iso = " + (ctrl.zib1BmIso == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_BM_Iso = " + (ctrl.zib2BmIso == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_BM_Iso = " + (ctrl.zpb1BmIso == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_BM_Iso = " + (ctrl.zpb2BmIso == 'true' ? 1 : 0) + " ,";

    query += " ZIB1_R1_RPL = " + (ctrl.zib1RplR1 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R2_RPL = " + (ctrl.zib1RplR2 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R3_RPL = " + (ctrl.zib1RplR3 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R4_RPL = " + (ctrl.zib1RplR4 == 'true' ? 1 : 0) + " ,";

    query += " ZIB2_R1_RPL = " + (ctrl.zib2RplR1 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R2_RPL = " + (ctrl.zib2RplR2 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R3_RPL = " + (ctrl.zib2RplR3 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R4_RPL = " + (ctrl.zib2RplR4 == 'true' ? 1 : 0) + " ,";

    query += " ZPB1_R1_RPL = " + (ctrl.zpb1RplR1 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R2_RPL = " + (ctrl.zpb1RplR2 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R3_RPL = " + (ctrl.zpb1RplR3 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R4_RPL = " + (ctrl.zpb1RplR4 == 'true' ? 1 : 0) + " ,";

    query += " ZPB2_R1_RPL = " + (ctrl.zpb2RplR1 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R2_RPL = " + (ctrl.zpb2RplR2 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R3_RPL = " + (ctrl.zpb2RplR3 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R4_RPL = " + (ctrl.zpb2RplR4 == 'true' ? 1 : 0) + " ,";

    query += " ZIB1_R1_VISUEL = " + (ctrl.zib1VisuR1 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R2_VISUEL = " + (ctrl.zib1VisuR2 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R3_VISUEL = " + (ctrl.zib1VisuR3 == 'true' ? 1 : 0) + " ,";
    query += " ZIB1_R4_VISUEL = " + (ctrl.zib1VisuR4 == 'true' ? 1 : 0) + " ,";

    query += " ZIB2_R1_VISUEL = " + (ctrl.zib2VisuR1 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R2_VISUEL = " + (ctrl.zib2VisuR2 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R3_VISUEL = " + (ctrl.zib2VisuR3 == 'true' ? 1 : 0) + " ,";
    query += " ZIB2_R4_VISUEL = " + (ctrl.zib2VisuR4 == 'true' ? 1 : 0) + " ,";

    query += " ZPB1_R1_VISUEL = " + (ctrl.zpb1VisuR1 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R2_VISUEL = " + (ctrl.zpb1VisuR2 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R3_VISUEL = " + (ctrl.zpb1VisuR3 == 'true' ? 1 : 0) + " ,";
    query += " ZPB1_R4_VISUEL = " + (ctrl.zpb1VisuR4 == 'true' ? 1 : 0) + " ,";

    query += " ZPB2_R1_VISUEL = " + (ctrl.zpb2VisuR1 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R2_VISUEL = " + (ctrl.zpb2VisuR2 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R3_VISUEL = " + (ctrl.zpb2VisuR3 == 'true' ? 1 : 0) + " ,";
    query += " ZPB2_R4_VISUEL = " + (ctrl.zpb2VisuR4 == 'true' ? 1 : 0) + " ,";

    query += " ZIB1_R1_MESURE = " + ctrl.zib1MesuR1 + " ,";
    query += " ZIB1_R2_MESURE = " + ctrl.zib1MesuR2 + " ,";
    query += " ZIB1_R3_MESURE = " + ctrl.zib1MesuR3 + " ,";
    query += " ZIB1_R4_MESURE = " + ctrl.zib1MesuR4 + " ,";

    query += " ZIB2_R1_MESURE = " + ctrl.zib2MesuR1 + " ,";
    query += " ZIB2_R2_MESURE = " + ctrl.zib2MesuR2 + " ,";
    query += " ZIB2_R3_MESURE = " + ctrl.zib2MesuR3 + " ,";
    query += " ZIB2_R4_MESURE = " + ctrl.zib2MesuR4 + " ,";

    query += " ZPB1_R1_MESURE = " + ctrl.zpb1MesuR1 + " ,";
    query += " ZPB1_R2_MESURE = " + ctrl.zpb1MesuR2 + " ,";
    query += " ZPB1_R3_MESURE = " + ctrl.zpb1MesuR3 + " ,";
    query += " ZPB1_R4_MESURE = " + ctrl.zpb1MesuR4 + " ,";

    query += " ZPB2_R1_MESURE = " + ctrl.zpb2MesuR1 + " ,";
    query += " ZPB2_R2_MESURE = " + ctrl.zpb2MesuR2 + " ,";
    query += " ZPB2_R3_MESURE = " + ctrl.zpb2MesuR3 + " ,";
    query += " ZPB2_R4_MESURE = " + ctrl.zpb2MesuR4 + " ,";

    query += " ZIB1_R1_CONSO = " + ctrl.zib1ConsoR1 + " ,";
    query += " ZIB1_R2_CONSO = " + ctrl.zib1ConsoR2 + " ,";
    query += " ZIB1_R3_CONSO = " + ctrl.zib1ConsoR3 + " ,";
    query += " ZIB1_R4_CONSO = " + ctrl.zib1ConsoR4 + " ,";

    query += " ZIB2_R1_CONSO = " + ctrl.zib2ConsoR1 + " ,";
    query += " ZIB2_R2_CONSO = " + ctrl.zib2ConsoR2 + " ,";
    query += " ZIB2_R3_CONSO = " + ctrl.zib2ConsoR3 + " ,";
    query += " ZIB2_R4_CONSO = " + ctrl.zib2ConsoR4 + " ,";

    query += " ZPB1_R1_CONSO = " + ctrl.zpb1ConsoR1 + " ,";
    query += " ZPB1_R2_CONSO = " + ctrl.zpb1ConsoR2 + " ,";
    query += " ZPB1_R3_CONSO = " + ctrl.zpb1ConsoR3 + " ,";
    query += " ZPB1_R4_CONSO = " + ctrl.zpb1ConsoR4 + " ,";

    query += " ZPB2_R1_CONSO = " + ctrl.zpb2ConsoR1 + " ,";
    query += " ZPB2_R2_CONSO = " + ctrl.zpb2ConsoR2 + " ,";
    query += " ZPB2_R3_CONSO = " + ctrl.zpb2ConsoR3 + " ,";
    query += " ZPB2_R4_CONSO = " + ctrl.zpb2ConsoR4;

    query += " WHERE (ID = " + _Id + ")";
    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});
webmat.get('/deleteCtrlByID', function (request, response) {
    var _Id = request.query.id;

    var query = "Delete T_SemellesData   WHERE(ID = " + _Id + ")";

    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});
webmat.get('/getLastDateCtrlByEab', function (request, response) {
    var _rameId = request.query.rameId;
    var _date = request.query.dateRef;
    var zib1 = "ZIB1"; zib2 = "ZIB2"; zpb1 = "ZPB1"; zpb2 = "ZPB2";

    //console.log(_date);

    var query   = "SELECT  ";

    query += "(SELECT TOP (1) CONVERT(CHAR(10), DateCtrl, 103) + '-' + CONVERT(CHAR(10), ID) AS value FROM T_SemellesData AS t0 WHERE (RameId = " + _rameId + ") AND (" + zib1 + "_Ctrl = 1) AND (" + zib1 + "_R1_VISUEL = 0) AND (" + zib1 + "_R2_VISUEL = 0) AND (" + zib1 + "_R3_VISUEL = 0) AND (" + zib1 + "_R4_VISUEL = 0) AND (CONVERT(DATETIME, DateCtrl) < '" + _date + "') ORDER BY DateCtrl DESC, ID DESC) AS LastDateZIB1, ";
    query += "(SELECT TOP (1) CONVERT(CHAR(10), DateCtrl, 103) + '-' + CONVERT(CHAR(10), ID) AS value FROM T_SemellesData AS t2 WHERE (RameId = " + _rameId + ") AND (" + zib2 + "_Ctrl = 1) AND (" + zib2 + "_R1_VISUEL = 0) AND (" + zib2 + "_R2_VISUEL = 0) AND (" + zib2 + "_R3_VISUEL = 0) AND (" + zib2 + "_R4_VISUEL = 0) AND (CONVERT(DATETIME, DateCtrl) < '" + _date + "') ORDER BY DateCtrl DESC, ID DESC) AS LastDateZIB2, ";
    query += "(SELECT TOP (1) CONVERT(CHAR(10), DateCtrl, 103) + '-' + CONVERT(CHAR(10), ID) AS value FROM T_SemellesData AS t3 WHERE (RameId = " + _rameId + ") AND (" + zpb1 + "_Ctrl = 1) AND (" + zpb1 + "_R1_VISUEL = 0) AND (" + zpb1 + "_R2_VISUEL = 0) AND (" + zpb1 + "_R3_VISUEL = 0) AND (" + zpb1 + "_R4_VISUEL = 0) AND (CONVERT(DATETIME, DateCtrl) < '" + _date + "') ORDER BY DateCtrl DESC, ID DESC) AS LastDateZPB1, ";
    query += "(SELECT TOP (1) CONVERT(CHAR(10), DateCtrl, 103) + '-' + CONVERT(CHAR(10), ID) AS value FROM T_SemellesData AS t4 WHERE (RameId = " + _rameId + ") AND (" + zpb2 + "_Ctrl = 1) AND (" + zpb2 + "_R1_VISUEL = 0) AND (" + zpb2 + "_R2_VISUEL = 0) AND (" + zpb2 + "_R3_VISUEL = 0) AND (" + zpb2 + "_R4_VISUEL = 0) AND (CONVERT(DATETIME, DateCtrl) < '" + _date + "') ORDER BY DateCtrl DESC, ID DESC) AS LastDateZPB2";

    //console.log(query);

    var stmt = sql.query(conn_str, query, function (err, LastDate) {
        if (err) {
            console.log("getLastDateCtrlByEab >> Error : " + err);
            return;
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": LastDate[0] });
    });
});

webmat.post('/ImportDataV2', urlencodedParser, function (request, response) {
    var ctrl = request.body.ctrl;

    console.log(ctrl.length);

    var query = "INSERT INTO T_SemellesData VALUES " + ctrl.join(',');
    sql.open(conn_str, function (err, conn) {
        if (err) { console.log("Error opening the connection!"); return; }
        conn.queryRaw(query, function (err, results) {
            if (err) console.log("Erreur : " + err);
            else { console.log('Importation des données V2 : ' + ctrl.length + ' Ctrls importés....'); }

            console.log("Result : " + results);

            conn.close();
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp({ "Result": results, "Req" : query });
        });
    });

});
webmat.get('/GetIdMaxV2', function (request, response) {
    var query = "SELECT TOP (1) CtrlIdV2 FROM T_SemellesData ORDER BY CtrlIdV2 DESC ";
    var stmtSemelle = sql.query(conn_str, query, function (err, IdMax) {
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": IdMax[0] });
    });

});

webmat.post('/SaveCtrlSemelle', urlencodedParser, function (request, response) {
    var ctrl = request.body.ctrl;

    var query = "INSERT INTO T_SemellesData (";
    query += "DateCtrl, ";
    query += "DateSaisi, ";
    query += "StfId, ";
    query += "UserCtrl, ";
    query += "SiteId, ";
    query += "InterventionId, ";
    query += "RameId, ";
    query += "NumRame, ";
    query += "SerieId, ";
    query += "SousSerieId, ";
    query += "ZIB1_Ctrl, ";
    query += "ZIB2_Ctrl, ";
    query += "ZPB1_Ctrl, ";
    query += "ZPB2_Ctrl, ";
    query += "ZIB1_BG_Iso, ";
    query += "ZIB2_BG_Iso, ";
    query += "ZPB1_BG_Iso, ";
    query += "ZPB2_BG_Iso, ";
    query += "ZIB1_BM_Iso, ";
    query += "ZIB2_BM_Iso, ";
    query += "ZPB1_BM_Iso, ";
    query += "ZPB2_BM_Iso, ";

    query += "ZIB1_R1_RPL, ";
    query += "ZIB1_R2_RPL, ";
    query += "ZIB1_R3_RPL, ";
    query += "ZIB1_R4_RPL, ";

    query += "ZIB2_R1_RPL, ";
    query += "ZIB2_R2_RPL, ";
    query += "ZIB2_R3_RPL, ";
    query += "ZIB2_R4_RPL, ";

    query += "ZPB1_R1_RPL, ";
    query += "ZPB1_R2_RPL, ";
    query += "ZPB1_R3_RPL, ";
    query += "ZPB1_R4_RPL, ";

    query += "ZPB2_R1_RPL, ";
    query += "ZPB2_R2_RPL, ";
    query += "ZPB2_R3_RPL, ";
    query += "ZPB2_R4_RPL, ";

    query += "ZIB1_R1_VISUEL, ";
    query += "ZIB1_R2_VISUEL, ";
    query += "ZIB1_R3_VISUEL, ";
    query += "ZIB1_R4_VISUEL, ";

    query += "ZIB2_R1_VISUEL, ";
    query += "ZIB2_R2_VISUEL, ";
    query += "ZIB2_R3_VISUEL, ";
    query += "ZIB2_R4_VISUEL, ";

    query += "ZPB1_R1_VISUEL, ";
    query += "ZPB1_R2_VISUEL, ";
    query += "ZPB1_R3_VISUEL, ";
    query += "ZPB1_R4_VISUEL, ";

    query += "ZPB2_R1_VISUEL, ";
    query += "ZPB2_R2_VISUEL, ";
    query += "ZPB2_R3_VISUEL, ";
    query += "ZPB2_R4_VISUEL, ";

    query += "ZIB1_R1_MESURE, ";
    query += "ZIB1_R2_MESURE, ";
    query += "ZIB1_R3_MESURE, ";
    query += "ZIB1_R4_MESURE, ";

    query += "ZIB2_R1_MESURE, ";
    query += "ZIB2_R2_MESURE, ";
    query += "ZIB2_R3_MESURE, ";
    query += "ZIB2_R4_MESURE, ";

    query += "ZPB1_R1_MESURE, ";
    query += "ZPB1_R2_MESURE, ";
    query += "ZPB1_R3_MESURE, ";
    query += "ZPB1_R4_MESURE, ";

    query += "ZPB2_R1_MESURE, ";
    query += "ZPB2_R2_MESURE, ";
    query += "ZPB2_R3_MESURE, ";
    query += "ZPB2_R4_MESURE, ";

    query += "ZIB1_R1_CONSO, ";
    query += "ZIB1_R2_CONSO, ";
    query += "ZIB1_R3_CONSO, ";
    query += "ZIB1_R4_CONSO, ";

    query += "ZIB2_R1_CONSO, ";
    query += "ZIB2_R2_CONSO, ";
    query += "ZIB2_R3_CONSO, ";
    query += "ZIB2_R4_CONSO, ";

    query += "ZPB1_R1_CONSO, ";
    query += "ZPB1_R2_CONSO, ";
    query += "ZPB1_R3_CONSO, ";
    query += "ZPB1_R4_CONSO, ";

    query += "ZPB2_R1_CONSO, ";
    query += "ZPB2_R2_CONSO, ";
    query += "ZPB2_R3_CONSO, ";
    query += "ZPB2_R4_CONSO, ";
    query += "TracaId, ";
    query += "NonCorformite, ";
    query += "Commentaire, ";
    query += "CtrlIdV2) ";

    query += " OUTPUT Inserted.ID ";

    query += " VALUES ( ";
    query += "CONVERT(DATETIME, '" + ctrl.datectrl + "', 102) ,";
    query += "CONVERT(DATETIME, '" + ctrl.datesaisi + "', 102) ,";
    query += ctrl.stfId + " ,";
    query += "'" + ctrl.userctrl + "' ,";
    query += ctrl.siteId + " ,";
    query += ctrl.interId + " ,";
    query += ctrl.rameId + " ,";
    query += "'" + ctrl.rameNum + "' ,";
    query += ctrl.serieID + " ,";
    query += ctrl.sousserieId + " ,";
    query += (ctrl.zib1ctrl == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2ctrl == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1ctrl == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2ctrl == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1BgIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2BgIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1BgIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2BgIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1BmIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2BmIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1BmIso == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2BmIso == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zib1RplR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1RplR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1RplR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1RplR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zib2RplR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2RplR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2RplR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2RplR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zpb1RplR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1RplR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1RplR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1RplR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zpb2RplR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2RplR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2RplR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2RplR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zib1VisuR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1VisuR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1VisuR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib1VisuR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zib2VisuR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2VisuR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2VisuR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zib2VisuR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zpb1VisuR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1VisuR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1VisuR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb1VisuR4 == 'true' ? 1 : 0) + " ,";

    query += (ctrl.zpb2VisuR1 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2VisuR2 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2VisuR3 == 'true' ? 1 : 0) + " ,";
    query += (ctrl.zpb2VisuR4 == 'true' ? 1 : 0) + " ,";

    query += ctrl.zib1MesuR1 + " ,";
    query += ctrl.zib1MesuR2 + " ,";
    query += ctrl.zib1MesuR3 + " ,";
    query += ctrl.zib1MesuR4 + " ,";

    query += ctrl.zib2MesuR1 + " ,";
    query += ctrl.zib2MesuR2 + " ,";
    query += ctrl.zib2MesuR3 + " ,";
    query += ctrl.zib2MesuR4 + " ,";

    query += ctrl.zpb1MesuR1 + " ,";
    query += ctrl.zpb1MesuR2 + " ,";
    query += ctrl.zpb1MesuR3 + " ,";
    query += ctrl.zpb1MesuR4 + " ,";

    query += ctrl.zpb2MesuR1 + " ,";
    query += ctrl.zpb2MesuR2 + " ,";
    query += ctrl.zpb2MesuR3 + " ,";
    query += ctrl.zpb2MesuR4 + " ,";

    // Conso
    query += ctrl.zib1ConsoR1 + " ,";
    query += ctrl.zib1ConsoR2 + " ,";
    query += ctrl.zib1ConsoR3 + " ,";
    query += ctrl.zib1ConsoR4 + " ,";

    query += ctrl.zib2ConsoR1 + " ,";
    query += ctrl.zib2ConsoR2 + " ,";
    query += ctrl.zib2ConsoR3 + " ,";
    query += ctrl.zib2ConsoR4 + " ,";

    query += ctrl.zpb1ConsoR1 + " ,";
    query += ctrl.zpb1ConsoR2 + " ,";
    query += ctrl.zpb1ConsoR3 + " ,";
    query += ctrl.zpb1ConsoR4 + " ,";

    query += ctrl.zpb2ConsoR1 + " ,";
    query += ctrl.zpb2ConsoR2 + " ,";
    query += ctrl.zpb2ConsoR3 + " ,";
    query += ctrl.zpb2ConsoR4 + " ,";
    query += ctrl.tracaId + " ,";
    query += (ctrl.nonconform == 'true' ? 1 : 0) + " ,";
    query += "'" + ctrl.comment + "' ,";
    query += 0;

    query += " )";

    ///console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp("OK");
        });
    });
});
webmat.get('/getCtrlsSemelles', function (request, response) {
    if (!request.query.stf) { response.send('Check the params'); return; }

    var _stf = request.query.stf;                   
    var _date = request.query.date;
    var _periode = request.query.periode;
    var _rameId = request.query.Idame;

    if (_periode && _date == '') {
        var dtPeriode = _periode.split(' - ');
        var dtDebS = dtPeriode[0]; var dtDebE = dtPeriode[1];     
        var dtPeriodeStr = " AND (CONVERT(datetime, T_SemellesData.DateCtrl, 103) BETWEEN CONVERT(datetime, '" + dtDebS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtDebE + " 23:59:59', 103)) ";
    }

    //console.log("STF : " + _stf + " " + request.query.stf);
    //console.log("Date : " + _date + " " + request.query.date);
    //console.log("Periode : " + _periode + " " + request.query.periode);
    //console.log("RameId : " + _rameId + " " + request.query.Idame);

    var req = "SELECT  T_SemellesData.ID, T_SemellesData.DateCtrl, T_SemellesData.DateSaisi, T_SemellesData.StfId, T_SemellesData.UserCtrl, T_SemellesData.SiteId, T_SemellesData.InterventionId, T_SemellesData.RameId, T_SemellesData.NumRame, T_SemellesData.SerieId, T_SemellesData.SousSerieId, T_SemellesData.TracaId, Commentaire, NonCorformite, ";
    req += "T_SemellesData.ZIB1_Ctrl, T_SemellesData.ZIB2_Ctrl, T_SemellesData.ZPB1_Ctrl, T_SemellesData.ZPB2_Ctrl, ";
    req += "T_SemellesData.ZIB1_BG_Iso, T_SemellesData.ZIB2_BG_Iso, T_SemellesData.ZPB1_BG_Iso, T_SemellesData.ZPB2_BG_Iso, "; 
    req += "T_SemellesData.ZIB1_BM_Iso, T_SemellesData.ZIB2_BM_Iso, T_SemellesData.ZPB1_BM_Iso, T_SemellesData.ZPB2_BM_Iso, ";

    req += "T_SemellesData.ZIB1_R1_RPL, T_SemellesData.ZIB1_R2_RPL, T_SemellesData.ZIB1_R3_RPL, T_SemellesData.ZIB1_R4_RPL, "; 
    req += "T_SemellesData.ZIB2_R1_RPL, T_SemellesData.ZIB2_R2_RPL, T_SemellesData.ZIB2_R3_RPL, T_SemellesData.ZIB2_R4_RPL, "; 
    req += "T_SemellesData.ZPB1_R1_RPL, T_SemellesData.ZPB1_R2_RPL, T_SemellesData.ZPB1_R3_RPL, T_SemellesData.ZPB1_R4_RPL, "; 
    req += "T_SemellesData.ZPB2_R1_RPL, T_SemellesData.ZPB2_R2_RPL, T_SemellesData.ZPB2_R3_RPL, T_SemellesData.ZPB2_R4_RPL, ";

    req += "T_SemellesData.ZIB1_R1_VISUEL, T_SemellesData.ZIB1_R2_VISUEL, T_SemellesData.ZIB1_R3_VISUEL, T_SemellesData.ZIB1_R4_VISUEL, "; 
    req += "T_SemellesData.ZIB2_R1_VISUEL, T_SemellesData.ZIB2_R2_VISUEL, T_SemellesData.ZIB2_R3_VISUEL, T_SemellesData.ZIB2_R4_VISUEL, "; 
    req += "T_SemellesData.ZPB1_R1_VISUEL, T_SemellesData.ZPB1_R2_VISUEL, T_SemellesData.ZPB1_R3_VISUEL, T_SemellesData.ZPB1_R4_VISUEL, "; 
    req += "T_SemellesData.ZPB2_R1_VISUEL, T_SemellesData.ZPB2_R2_VISUEL, T_SemellesData.ZPB2_R3_VISUEL, T_SemellesData.ZPB2_R4_VISUEL, ";

    req += "T_SemellesData.ZIB1_R1_MESURE, T_SemellesData.ZIB1_R2_MESURE, T_SemellesData.ZIB1_R3_MESURE, T_SemellesData.ZIB1_R4_MESURE, "; 
    req += "T_SemellesData.ZIB2_R1_MESURE, T_SemellesData.ZIB2_R2_MESURE, T_SemellesData.ZIB2_R3_MESURE, T_SemellesData.ZIB2_R4_MESURE, "; 
    req += "T_SemellesData.ZPB1_R1_MESURE, T_SemellesData.ZPB1_R2_MESURE, T_SemellesData.ZPB1_R3_MESURE, T_SemellesData.ZPB1_R4_MESURE, "; 
    req += "T_SemellesData.ZPB2_R1_MESURE, T_SemellesData.ZPB2_R2_MESURE, T_SemellesData.ZPB2_R3_MESURE, T_SemellesData.ZPB2_R4_MESURE, "; 

    req += "T_SemellesData.ZIB1_R1_CONSO, T_SemellesData.ZIB1_R2_CONSO, T_SemellesData.ZIB1_R3_CONSO, T_SemellesData.ZIB1_R4_CONSO, ";
    req += "T_SemellesData.ZIB2_R1_CONSO, T_SemellesData.ZIB2_R2_CONSO, T_SemellesData.ZIB2_R3_CONSO, T_SemellesData.ZIB2_R4_CONSO, ";
    req += "T_SemellesData.ZPB1_R1_CONSO, T_SemellesData.ZPB1_R2_CONSO, T_SemellesData.ZPB1_R3_CONSO, T_SemellesData.ZPB1_R4_CONSO, ";
    req += "T_SemellesData.ZPB2_R1_CONSO, T_SemellesData.ZPB2_R2_CONSO, T_SemellesData.ZPB2_R3_CONSO, T_SemellesData.ZPB2_R4_CONSO, ";

    req += "T_Sem_Sites.Site, T_Sem_Interventions.Intervention ";
    req += "FROM T_SemellesData INNER JOIN ";
    req += "T_Sem_Sites ON T_SemellesData.SiteId = T_Sem_Sites.ID INNER JOIN ";
    req += "T_Sem_Interventions ON T_SemellesData.InterventionId = T_Sem_Interventions.ID ";
    req += "WHERE (T_SemellesData.StfId = " + _stf + ") ";
    if (_date != '') req += "AND (CONVERT(DATE, DateSaisi) = '" + _date + "') ";
    else req += dtPeriodeStr;
    if (_rameId > 0) req += "AND (T_SemellesData.RameId = " + _rameId + ")";

    //req += "WHERE   (CONVERT(DATE, DateCtrl) = '" + _date + "') AND (T_SemellesData.StfId = " + _stf + ") ";
    req += "ORDER BY DateCtrl DESC, ID DESC";

    //console.log( req);
    var jCtrl = new Array();
    var stmtSemelle = sql.query(conn_str, req, function (err, ctrlSem) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < ctrlSem.length; i++) {
            jCtrl.push({
                ID:             ctrlSem[i].ID,
                DateCtrl:       new Date(new Date(ctrlSem[i].DateCtrl).getTime() + (new Date(ctrlSem[i].DateCtrl).getTimezoneOffset() * 60000)),
                DateSaisi:      ctrlSem[i].DateSaisi == null ? null : new Date(new Date(ctrlSem[i].DateSaisi).getTime() + (new Date(ctrlSem[i].DateSaisi).getTimezoneOffset() * 60000)),
                StfId:          ctrlSem[i].StfId,
                UserCtrl:       ctrlSem[i].UserCtrl,
                SiteId:         ctrlSem[i].SiteId,
                InterventionId: ctrlSem[i].InterventionId,
                RameId:         ctrlSem[i].RameId,
                NumRame:        ctrlSem[i].NumRame,
                SerieId:        ctrlSem[i].SerieId,
                SousSerieId:    ctrlSem[i].SousSerieId,
                Site:           ctrlSem[i].Site,
                Intervention:   ctrlSem[i].Intervention,
                TracaId:        ctrlSem[i].TracaId,
                Comment:        ctrlSem[i].Commentaire,
                NonConf:        ctrlSem[i].NonCorformite,

                ZIB1_Ctrl: ctrlSem[i].ZIB1_Ctrl,
                ZIB2_Ctrl: ctrlSem[i].ZIB2_Ctrl,
                ZPB1_Ctrl: ctrlSem[i].ZPB1_Ctrl,
                ZPB2_Ctrl: ctrlSem[i].ZPB2_Ctrl,
                ZIB1_BG_Iso: ctrlSem[i].ZIB1_BG_Iso,
                ZIB2_BG_Iso: ctrlSem[i].ZIB2_BG_Iso,
                ZPB1_BG_Iso: ctrlSem[i].ZPB1_BG_Iso,
                ZPB2_BG_Iso: ctrlSem[i].ZPB2_BG_Iso,
                ZIB1_BM_Iso: ctrlSem[i].ZIB1_BM_Iso,
                ZIB2_BM_Iso: ctrlSem[i].ZIB2_BM_Iso,
                ZPB1_BM_Iso: ctrlSem[i].ZPB1_BM_Iso,
                ZPB2_BM_Iso: ctrlSem[i].ZPB2_BM_Iso,

                ZIB1_R1_RPL: ctrlSem[i].ZIB1_R1_RPL,
                ZIB1_R2_RPL: ctrlSem[i].ZIB1_R2_RPL,
                ZIB1_R3_RPL: ctrlSem[i].ZIB1_R3_RPL,
                ZIB1_R4_RPL: ctrlSem[i].ZIB1_R4_RPL,
                ZIB2_R1_RPL: ctrlSem[i].ZIB2_R1_RPL,
                ZIB2_R2_RPL: ctrlSem[i].ZIB2_R2_RPL,
                ZIB2_R3_RPL: ctrlSem[i].ZIB2_R3_RPL,
                ZIB2_R4_RPL: ctrlSem[i].ZIB2_R4_RPL,
                ZPB1_R1_RPL: ctrlSem[i].ZPB1_R1_RPL,
                ZPB1_R2_RPL: ctrlSem[i].ZPB1_R2_RPL,
                ZPB1_R3_RPL: ctrlSem[i].ZPB1_R3_RPL,
                ZPB1_R4_RPL: ctrlSem[i].ZPB1_R4_RPL,
                ZPB2_R1_RPL: ctrlSem[i].ZPB2_R1_RPL,
                ZPB2_R2_RPL: ctrlSem[i].ZPB2_R2_RPL,
                ZPB2_R3_RPL: ctrlSem[i].ZPB2_R3_RPL,
                ZPB2_R4_RPL: ctrlSem[i].ZPB2_R4_RPL,

                ZIB1_R1_VISUEL: ctrlSem[i].ZIB1_R1_VISUEL,
                ZIB1_R2_VISUEL: ctrlSem[i].ZIB1_R2_VISUEL,
                ZIB1_R3_VISUEL: ctrlSem[i].ZIB1_R3_VISUEL,
                ZIB1_R4_VISUEL: ctrlSem[i].ZIB1_R4_VISUEL,
                ZIB2_R1_VISUEL: ctrlSem[i].ZIB2_R1_VISUEL,
                ZIB2_R2_VISUEL: ctrlSem[i].ZIB2_R2_VISUEL,
                ZIB2_R3_VISUEL: ctrlSem[i].ZIB2_R3_VISUEL,
                ZIB2_R4_VISUEL: ctrlSem[i].ZIB2_R4_VISUEL,
                ZPB1_R1_VISUEL: ctrlSem[i].ZPB1_R1_VISUEL,
                ZPB1_R2_VISUEL: ctrlSem[i].ZPB1_R2_VISUEL,
                ZPB1_R3_VISUEL: ctrlSem[i].ZPB1_R3_VISUEL,
                ZPB1_R4_VISUEL: ctrlSem[i].ZPB1_R4_VISUEL,
                ZPB2_R1_VISUEL: ctrlSem[i].ZPB2_R1_VISUEL,
                ZPB2_R2_VISUEL: ctrlSem[i].ZPB2_R2_VISUEL,
                ZPB2_R3_VISUEL: ctrlSem[i].ZPB2_R3_VISUEL,
                ZPB2_R4_VISUEL: ctrlSem[i].ZPB2_R4_VISUEL,

                ZIB1_R1_MESURE: ctrlSem[i].ZIB1_R1_MESURE,
                ZIB1_R2_MESURE: ctrlSem[i].ZIB1_R2_MESURE,
                ZIB1_R3_MESURE: ctrlSem[i].ZIB1_R3_MESURE,
                ZIB1_R4_MESURE: ctrlSem[i].ZIB1_R4_MESURE,
                ZIB2_R1_MESURE: ctrlSem[i].ZIB2_R1_MESURE,
                ZIB2_R2_MESURE: ctrlSem[i].ZIB2_R2_MESURE,
                ZIB2_R3_MESURE: ctrlSem[i].ZIB2_R3_MESURE,
                ZIB2_R4_MESURE: ctrlSem[i].ZIB2_R4_MESURE,
                ZPB1_R1_MESURE: ctrlSem[i].ZPB1_R1_MESURE,
                ZPB1_R2_MESURE: ctrlSem[i].ZPB1_R2_MESURE,
                ZPB1_R3_MESURE: ctrlSem[i].ZPB1_R3_MESURE,
                ZPB1_R4_MESURE: ctrlSem[i].ZPB1_R4_MESURE,
                ZPB2_R1_MESURE: ctrlSem[i].ZPB2_R1_MESURE,
                ZPB2_R2_MESURE: ctrlSem[i].ZPB2_R2_MESURE,
                ZPB2_R3_MESURE: ctrlSem[i].ZPB2_R3_MESURE,
                ZPB2_R4_MESURE: ctrlSem[i].ZPB2_R4_MESURE,

                ZIB1_R1_CONSO: ctrlSem[i].ZIB1_R1_CONSO,
                ZIB1_R2_CONSO: ctrlSem[i].ZIB1_R2_CONSO,
                ZIB1_R3_CONSO: ctrlSem[i].ZIB1_R3_CONSO,
                ZIB1_R4_CONSO: ctrlSem[i].ZIB1_R4_CONSO,
                ZIB2_R1_CONSO: ctrlSem[i].ZIB2_R1_CONSO,
                ZIB2_R2_CONSO: ctrlSem[i].ZIB2_R2_CONSO,
                ZIB2_R3_CONSO: ctrlSem[i].ZIB2_R3_CONSO,
                ZIB2_R4_CONSO: ctrlSem[i].ZIB2_R4_CONSO,
                ZPB1_R1_CONSO: ctrlSem[i].ZPB1_R1_CONSO,
                ZPB1_R2_CONSO: ctrlSem[i].ZPB1_R2_CONSO,
                ZPB1_R3_CONSO: ctrlSem[i].ZPB1_R3_CONSO,
                ZPB1_R4_CONSO: ctrlSem[i].ZPB1_R4_CONSO,
                ZPB2_R1_CONSO: ctrlSem[i].ZPB2_R1_CONSO,
                ZPB2_R2_CONSO: ctrlSem[i].ZPB2_R2_CONSO,
                ZPB2_R3_CONSO: ctrlSem[i].ZPB2_R3_CONSO,
                ZPB2_R4_CONSO: ctrlSem[i].ZPB2_R4_CONSO,
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jCtrl });
    });

});
webmat.get('/getLastCtrlSemellesOfRame', function (request, response) {
    var _rameId = request.query.Idrame;

    var req = "SELECT TOP(1)  T_SemellesData.ID, T_SemellesData.DateCtrl, T_SemellesData.DateSaisi, T_SemellesData.StfId, T_SemellesData.UserCtrl, T_SemellesData.SiteId, T_SemellesData.InterventionId, T_SemellesData.RameId, T_SemellesData.NumRame, T_SemellesData.SerieId, T_SemellesData.SousSerieId, T_SemellesData.TracaId, Commentaire, NonCorformite, ";
    req += "T_SemellesData.ZIB1_Ctrl, T_SemellesData.ZIB2_Ctrl, T_SemellesData.ZPB1_Ctrl, T_SemellesData.ZPB2_Ctrl, ";
    req += "T_SemellesData.ZIB1_BG_Iso, T_SemellesData.ZIB2_BG_Iso, T_SemellesData.ZPB1_BG_Iso, T_SemellesData.ZPB2_BG_Iso, ";
    req += "T_SemellesData.ZIB1_BM_Iso, T_SemellesData.ZIB2_BM_Iso, T_SemellesData.ZPB1_BM_Iso, T_SemellesData.ZPB2_BM_Iso, ";

    req += "T_SemellesData.ZIB1_R1_RPL, T_SemellesData.ZIB1_R2_RPL, T_SemellesData.ZIB1_R3_RPL, T_SemellesData.ZIB1_R4_RPL, ";
    req += "T_SemellesData.ZIB2_R1_RPL, T_SemellesData.ZIB2_R2_RPL, T_SemellesData.ZIB2_R3_RPL, T_SemellesData.ZIB2_R4_RPL, ";
    req += "T_SemellesData.ZPB1_R1_RPL, T_SemellesData.ZPB1_R2_RPL, T_SemellesData.ZPB1_R3_RPL, T_SemellesData.ZPB1_R4_RPL, ";
    req += "T_SemellesData.ZPB2_R1_RPL, T_SemellesData.ZPB2_R2_RPL, T_SemellesData.ZPB2_R3_RPL, T_SemellesData.ZPB2_R4_RPL, ";

    req += "T_SemellesData.ZIB1_R1_VISUEL, T_SemellesData.ZIB1_R2_VISUEL, T_SemellesData.ZIB1_R3_VISUEL, T_SemellesData.ZIB1_R4_VISUEL, ";
    req += "T_SemellesData.ZIB2_R1_VISUEL, T_SemellesData.ZIB2_R2_VISUEL, T_SemellesData.ZIB2_R3_VISUEL, T_SemellesData.ZIB2_R4_VISUEL, ";
    req += "T_SemellesData.ZPB1_R1_VISUEL, T_SemellesData.ZPB1_R2_VISUEL, T_SemellesData.ZPB1_R3_VISUEL, T_SemellesData.ZPB1_R4_VISUEL, ";
    req += "T_SemellesData.ZPB2_R1_VISUEL, T_SemellesData.ZPB2_R2_VISUEL, T_SemellesData.ZPB2_R3_VISUEL, T_SemellesData.ZPB2_R4_VISUEL, ";

    req += "T_SemellesData.ZIB1_R1_MESURE, T_SemellesData.ZIB1_R2_MESURE, T_SemellesData.ZIB1_R3_MESURE, T_SemellesData.ZIB1_R4_MESURE, ";
    req += "T_SemellesData.ZIB2_R1_MESURE, T_SemellesData.ZIB2_R2_MESURE, T_SemellesData.ZIB2_R3_MESURE, T_SemellesData.ZIB2_R4_MESURE, ";
    req += "T_SemellesData.ZPB1_R1_MESURE, T_SemellesData.ZPB1_R2_MESURE, T_SemellesData.ZPB1_R3_MESURE, T_SemellesData.ZPB1_R4_MESURE, ";
    req += "T_SemellesData.ZPB2_R1_MESURE, T_SemellesData.ZPB2_R2_MESURE, T_SemellesData.ZPB2_R3_MESURE, T_SemellesData.ZPB2_R4_MESURE, ";

    req += "T_SemellesData.ZIB1_R1_CONSO, T_SemellesData.ZIB1_R2_CONSO, T_SemellesData.ZIB1_R3_CONSO, T_SemellesData.ZIB1_R4_CONSO, ";
    req += "T_SemellesData.ZIB2_R1_CONSO, T_SemellesData.ZIB2_R2_CONSO, T_SemellesData.ZIB2_R3_CONSO, T_SemellesData.ZIB2_R4_CONSO, ";
    req += "T_SemellesData.ZPB1_R1_CONSO, T_SemellesData.ZPB1_R2_CONSO, T_SemellesData.ZPB1_R3_CONSO, T_SemellesData.ZPB1_R4_CONSO, ";
    req += "T_SemellesData.ZPB2_R1_CONSO, T_SemellesData.ZPB2_R2_CONSO, T_SemellesData.ZPB2_R3_CONSO, T_SemellesData.ZPB2_R4_CONSO, ";

    req += "T_Sem_Sites.Site, T_Sem_Interventions.Intervention ";
    req += "FROM T_SemellesData INNER JOIN ";
    req += "T_Sem_Sites ON T_SemellesData.SiteId = T_Sem_Sites.ID INNER JOIN ";
    req += "T_Sem_Interventions ON T_SemellesData.InterventionId = T_Sem_Interventions.ID ";
    req += "WHERE (T_SemellesData.RameId = " + _rameId + ")";
    req += "ORDER BY DateCtrl DESC, ID DESC";

    //console.log( req);
    var jCtrl = new Array();
    var stmtSemelle = sql.query(conn_str, req, function (err, ctrlSem) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < ctrlSem.length; i++) {
            jCtrl.push({
                ID:             ctrlSem[i].ID,
                DateCtrl:       new Date(new Date(ctrlSem[i].DateCtrl).getTime() + (new Date(ctrlSem[i].DateCtrl).getTimezoneOffset() * 60000)),
                DateSaisi:      ctrlSem[i].DateSaisi == null ? null : new Date(new Date(ctrlSem[i].DateSaisi).getTime() + (new Date(ctrlSem[i].DateSaisi).getTimezoneOffset() * 60000)),
                StfId:          ctrlSem[i].StfId,
                UserCtrl:       ctrlSem[i].UserCtrl,
                SiteId:         ctrlSem[i].SiteId,
                InterventionId: ctrlSem[i].InterventionId,
                RameId:         ctrlSem[i].RameId,
                NumRame:        ctrlSem[i].NumRame,
                SerieId:        ctrlSem[i].SerieId,
                SousSerieId:    ctrlSem[i].SousSerieId,
                Site:           ctrlSem[i].Site,
                Intervention:   ctrlSem[i].Intervention,
                TracaId:        ctrlSem[i].TracaId,
                Comment:        ctrlSem[i].Commentaire,
                NonConf:        ctrlSem[i].NonCorformite,

                ZIB1_Ctrl:      ctrlSem[i].ZIB1_Ctrl,
                ZIB2_Ctrl:      ctrlSem[i].ZIB2_Ctrl,
                ZPB1_Ctrl:      ctrlSem[i].ZPB1_Ctrl,
                ZPB2_Ctrl:      ctrlSem[i].ZPB2_Ctrl,
                ZIB1_BG_Iso: ctrlSem[i].ZIB1_BG_Iso,
                ZIB2_BG_Iso: ctrlSem[i].ZIB2_BG_Iso,
                ZPB1_BG_Iso: ctrlSem[i].ZPB1_BG_Iso,
                ZPB2_BG_Iso: ctrlSem[i].ZPB2_BG_Iso,
                ZIB1_BM_Iso: ctrlSem[i].ZIB1_BM_Iso,
                ZIB2_BM_Iso: ctrlSem[i].ZIB2_BM_Iso,
                ZPB1_BM_Iso: ctrlSem[i].ZPB1_BM_Iso,
                ZPB2_BM_Iso: ctrlSem[i].ZPB2_BM_Iso,

                ZIB1_R1_RPL: ctrlSem[i].ZIB1_R1_RPL,
                ZIB1_R2_RPL: ctrlSem[i].ZIB1_R2_RPL,
                ZIB1_R3_RPL: ctrlSem[i].ZIB1_R3_RPL,
                ZIB1_R4_RPL: ctrlSem[i].ZIB1_R4_RPL,
                ZIB2_R1_RPL: ctrlSem[i].ZIB2_R1_RPL,
                ZIB2_R2_RPL: ctrlSem[i].ZIB2_R2_RPL,
                ZIB2_R3_RPL: ctrlSem[i].ZIB2_R3_RPL,
                ZIB2_R4_RPL: ctrlSem[i].ZIB2_R4_RPL,
                ZPB1_R1_RPL: ctrlSem[i].ZPB1_R1_RPL,
                ZPB1_R2_RPL: ctrlSem[i].ZPB1_R2_RPL,
                ZPB1_R3_RPL: ctrlSem[i].ZPB1_R3_RPL,
                ZPB1_R4_RPL: ctrlSem[i].ZPB1_R4_RPL,
                ZPB2_R1_RPL: ctrlSem[i].ZPB2_R1_RPL,
                ZPB2_R2_RPL: ctrlSem[i].ZPB2_R2_RPL,
                ZPB2_R3_RPL: ctrlSem[i].ZPB2_R3_RPL,
                ZPB2_R4_RPL: ctrlSem[i].ZPB2_R4_RPL,

                ZIB1_R1_VISUEL: ctrlSem[i].ZIB1_R1_VISUEL,
                ZIB1_R2_VISUEL: ctrlSem[i].ZIB1_R2_VISUEL,
                ZIB1_R3_VISUEL: ctrlSem[i].ZIB1_R3_VISUEL,
                ZIB1_R4_VISUEL: ctrlSem[i].ZIB1_R4_VISUEL,
                ZIB2_R1_VISUEL: ctrlSem[i].ZIB2_R1_VISUEL,
                ZIB2_R2_VISUEL: ctrlSem[i].ZIB2_R2_VISUEL,
                ZIB2_R3_VISUEL: ctrlSem[i].ZIB2_R3_VISUEL,
                ZIB2_R4_VISUEL: ctrlSem[i].ZIB2_R4_VISUEL,
                ZPB1_R1_VISUEL: ctrlSem[i].ZPB1_R1_VISUEL,
                ZPB1_R2_VISUEL: ctrlSem[i].ZPB1_R2_VISUEL,
                ZPB1_R3_VISUEL: ctrlSem[i].ZPB1_R3_VISUEL,
                ZPB1_R4_VISUEL: ctrlSem[i].ZPB1_R4_VISUEL,
                ZPB2_R1_VISUEL: ctrlSem[i].ZPB2_R1_VISUEL,
                ZPB2_R2_VISUEL: ctrlSem[i].ZPB2_R2_VISUEL,
                ZPB2_R3_VISUEL: ctrlSem[i].ZPB2_R3_VISUEL,
                ZPB2_R4_VISUEL: ctrlSem[i].ZPB2_R4_VISUEL,

                ZIB1_R1_MESURE: ctrlSem[i].ZIB1_R1_MESURE,
                ZIB1_R2_MESURE: ctrlSem[i].ZIB1_R2_MESURE,
                ZIB1_R3_MESURE: ctrlSem[i].ZIB1_R3_MESURE,
                ZIB1_R4_MESURE: ctrlSem[i].ZIB1_R4_MESURE,
                ZIB2_R1_MESURE: ctrlSem[i].ZIB2_R1_MESURE,
                ZIB2_R2_MESURE: ctrlSem[i].ZIB2_R2_MESURE,
                ZIB2_R3_MESURE: ctrlSem[i].ZIB2_R3_MESURE,
                ZIB2_R4_MESURE: ctrlSem[i].ZIB2_R4_MESURE,
                ZPB1_R1_MESURE: ctrlSem[i].ZPB1_R1_MESURE,
                ZPB1_R2_MESURE: ctrlSem[i].ZPB1_R2_MESURE,
                ZPB1_R3_MESURE: ctrlSem[i].ZPB1_R3_MESURE,
                ZPB1_R4_MESURE: ctrlSem[i].ZPB1_R4_MESURE,
                ZPB2_R1_MESURE: ctrlSem[i].ZPB2_R1_MESURE,
                ZPB2_R2_MESURE: ctrlSem[i].ZPB2_R2_MESURE,
                ZPB2_R3_MESURE: ctrlSem[i].ZPB2_R3_MESURE,
                ZPB2_R4_MESURE: ctrlSem[i].ZPB2_R4_MESURE,

                ZIB1_R1_CONSO: ctrlSem[i].ZIB1_R1_CONSO,
                ZIB1_R2_CONSO: ctrlSem[i].ZIB1_R2_CONSO,
                ZIB1_R3_CONSO: ctrlSem[i].ZIB1_R3_CONSO,
                ZIB1_R4_CONSO: ctrlSem[i].ZIB1_R4_CONSO,
                ZIB2_R1_CONSO: ctrlSem[i].ZIB2_R1_CONSO,
                ZIB2_R2_CONSO: ctrlSem[i].ZIB2_R2_CONSO,
                ZIB2_R3_CONSO: ctrlSem[i].ZIB2_R3_CONSO,
                ZIB2_R4_CONSO: ctrlSem[i].ZIB2_R4_CONSO,
                ZPB1_R1_CONSO: ctrlSem[i].ZPB1_R1_CONSO,
                ZPB1_R2_CONSO: ctrlSem[i].ZPB1_R2_CONSO,
                ZPB1_R3_CONSO: ctrlSem[i].ZPB1_R3_CONSO,
                ZPB1_R4_CONSO: ctrlSem[i].ZPB1_R4_CONSO,
                ZPB2_R1_CONSO: ctrlSem[i].ZPB2_R1_CONSO,
                ZPB2_R2_CONSO: ctrlSem[i].ZPB2_R2_CONSO,
                ZPB2_R3_CONSO: ctrlSem[i].ZPB2_R3_CONSO,
                ZPB2_R4_CONSO: ctrlSem[i].ZPB2_R4_CONSO,
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jCtrl);
    });

});

webmat.get('/getAllCtrlsSemelles', function (request, response) {
    var _rameId = request.query.Idame;

    var req = "SELECT  T_SemellesData.ID, T_SemellesData.DateCtrl, T_SemellesData.DateSaisi, T_SemellesData.StfId, T_SemellesData.UserCtrl, T_SemellesData.SiteId, T_SemellesData.InterventionId, T_SemellesData.RameId, T_SemellesData.NumRame, T_SemellesData.SerieId, T_SemellesData.SousSerieId, T_SemellesData.TracaId, ";
    req += "T_SemellesData.ZIB1_Ctrl, T_SemellesData.ZIB2_Ctrl, T_SemellesData.ZPB1_Ctrl, T_SemellesData.ZPB2_Ctrl, ";
    req += "T_SemellesData.ZIB1_BG_Iso, T_SemellesData.ZIB2_BG_Iso, T_SemellesData.ZPB1_BG_Iso, T_SemellesData.ZPB2_BG_Iso, ";
    req += "T_SemellesData.ZIB1_BM_Iso, T_SemellesData.ZIB2_BM_Iso, T_SemellesData.ZPB1_BM_Iso, T_SemellesData.ZPB2_BM_Iso, ";

    req += "T_SemellesData.ZIB1_R1_RPL, T_SemellesData.ZIB1_R2_RPL, T_SemellesData.ZIB1_R3_RPL, T_SemellesData.ZIB1_R4_RPL, ";
    req += "T_SemellesData.ZIB2_R1_RPL, T_SemellesData.ZIB2_R2_RPL, T_SemellesData.ZIB2_R3_RPL, T_SemellesData.ZIB2_R4_RPL, ";
    req += "T_SemellesData.ZPB1_R1_RPL, T_SemellesData.ZPB1_R2_RPL, T_SemellesData.ZPB1_R3_RPL, T_SemellesData.ZPB1_R4_RPL, ";
    req += "T_SemellesData.ZPB2_R1_RPL, T_SemellesData.ZPB2_R2_RPL, T_SemellesData.ZPB2_R3_RPL, T_SemellesData.ZPB2_R4_RPL, ";

    req += "T_SemellesData.ZIB1_R1_VISUEL, T_SemellesData.ZIB1_R2_VISUEL, T_SemellesData.ZIB1_R3_VISUEL, T_SemellesData.ZIB1_R4_VISUEL, ";
    req += "T_SemellesData.ZIB2_R1_VISUEL, T_SemellesData.ZIB2_R2_VISUEL, T_SemellesData.ZIB2_R3_VISUEL, T_SemellesData.ZIB2_R4_VISUEL, ";
    req += "T_SemellesData.ZPB1_R1_VISUEL, T_SemellesData.ZPB1_R2_VISUEL, T_SemellesData.ZPB1_R3_VISUEL, T_SemellesData.ZPB1_R4_VISUEL, ";
    req += "T_SemellesData.ZPB2_R1_VISUEL, T_SemellesData.ZPB2_R2_VISUEL, T_SemellesData.ZPB2_R3_VISUEL, T_SemellesData.ZPB2_R4_VISUEL, ";

    req += "T_SemellesData.ZIB1_R1_MESURE, T_SemellesData.ZIB1_R2_MESURE, T_SemellesData.ZIB1_R3_MESURE, T_SemellesData.ZIB1_R4_MESURE, ";
    req += "T_SemellesData.ZIB2_R1_MESURE, T_SemellesData.ZIB2_R2_MESURE, T_SemellesData.ZIB2_R3_MESURE, T_SemellesData.ZIB2_R4_MESURE, ";
    req += "T_SemellesData.ZPB1_R1_MESURE, T_SemellesData.ZPB1_R2_MESURE, T_SemellesData.ZPB1_R3_MESURE, T_SemellesData.ZPB1_R4_MESURE, ";
    req += "T_SemellesData.ZPB2_R1_MESURE, T_SemellesData.ZPB2_R2_MESURE, T_SemellesData.ZPB2_R3_MESURE, T_SemellesData.ZPB2_R4_MESURE, ";

    req += "T_SemellesData.ZIB1_R1_CONSO, T_SemellesData.ZIB1_R2_CONSO, T_SemellesData.ZIB1_R3_CONSO, T_SemellesData.ZIB1_R4_CONSO, ";
    req += "T_SemellesData.ZIB2_R1_CONSO, T_SemellesData.ZIB2_R2_CONSO, T_SemellesData.ZIB2_R3_CONSO, T_SemellesData.ZIB2_R4_CONSO, ";
    req += "T_SemellesData.ZPB1_R1_CONSO, T_SemellesData.ZPB1_R2_CONSO, T_SemellesData.ZPB1_R3_CONSO, T_SemellesData.ZPB1_R4_CONSO, ";
    req += "T_SemellesData.ZPB2_R1_CONSO, T_SemellesData.ZPB2_R2_CONSO, T_SemellesData.ZPB2_R3_CONSO, T_SemellesData.ZPB2_R4_CONSO, ";

    req += "T_Sem_Sites.Site, T_Sem_Interventions.Intervention ";
    req += "FROM T_SemellesData INNER JOIN ";
    req += "T_Sem_Sites ON T_SemellesData.SiteId = T_Sem_Sites.ID INNER JOIN ";
    req += "T_Sem_Interventions ON T_SemellesData.InterventionId = T_Sem_Interventions.ID ";
    req += "WHERE (T_SemellesData.RameId = " + _rameId + ") ";
    req += "ORDER BY DateCtrl DESC, ID DESC";

    //console.log( req);
    var jCtrl = new Array();
    var stmtSemelle = sql.query(conn_str, req, function (err, ctrlSem) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < ctrlSem.length; i++) {
            jCtrl.push({
                ID:             ctrlSem[i].ID,
                DateCtrl:       new Date(new Date(ctrlSem[i].DateCtrl).getTime() + (new Date(ctrlSem[i].DateCtrl).getTimezoneOffset() * 60000)),
                DateSaisi:      ctrlSem[i].DateSaisi == null ? null : new Date(new Date(ctrlSem[i].DateSaisi).getTime() + (new Date(ctrlSem[i].DateSaisi).getTimezoneOffset() * 60000)),
                StfId:          ctrlSem[i].StfId,
                UserCtrl:       ctrlSem[i].UserCtrl,
                SiteId:         ctrlSem[i].SiteId,
                InterventionId: ctrlSem[i].InterventionId,
                RameId:         ctrlSem[i].RameId,
                NumRame:        ctrlSem[i].NumRame,
                SerieId:        ctrlSem[i].SerieId,
                SousSerieId:    ctrlSem[i].SousSerieId,
                Site:           ctrlSem[i].Site,
                Intervention:   ctrlSem[i].Intervention,
                TracaId:        ctrlSem[i].TracaId,

                ZIB1_Ctrl: ctrlSem[i].ZIB1_Ctrl,
                ZIB2_Ctrl: ctrlSem[i].ZIB2_Ctrl,
                ZPB1_Ctrl: ctrlSem[i].ZPB1_Ctrl,
                ZPB2_Ctrl: ctrlSem[i].ZPB2_Ctrl,
                ZIB1_BG_Iso: ctrlSem[i].ZIB1_BG_Iso,
                ZIB2_BG_Iso: ctrlSem[i].ZIB2_BG_Iso,
                ZPB1_BG_Iso: ctrlSem[i].ZPB1_BG_Iso,
                ZPB2_BG_Iso: ctrlSem[i].ZPB2_BG_Iso,
                ZIB1_BM_Iso: ctrlSem[i].ZIB1_BM_Iso,
                ZIB2_BM_Iso: ctrlSem[i].ZIB2_BM_Iso,
                ZPB1_BM_Iso: ctrlSem[i].ZPB1_BM_Iso,
                ZPB2_BM_Iso: ctrlSem[i].ZPB2_BM_Iso,

                ZIB1_R1_RPL: ctrlSem[i].ZIB1_R1_RPL,
                ZIB1_R2_RPL: ctrlSem[i].ZIB1_R2_RPL,
                ZIB1_R3_RPL: ctrlSem[i].ZIB1_R3_RPL,
                ZIB1_R4_RPL: ctrlSem[i].ZIB1_R4_RPL,
                ZIB2_R1_RPL: ctrlSem[i].ZIB2_R1_RPL,
                ZIB2_R2_RPL: ctrlSem[i].ZIB2_R2_RPL,
                ZIB2_R3_RPL: ctrlSem[i].ZIB2_R3_RPL,
                ZIB2_R4_RPL: ctrlSem[i].ZIB2_R4_RPL,
                ZPB1_R1_RPL: ctrlSem[i].ZPB1_R1_RPL,
                ZPB1_R2_RPL: ctrlSem[i].ZPB1_R2_RPL,
                ZPB1_R3_RPL: ctrlSem[i].ZPB1_R3_RPL,
                ZPB1_R4_RPL: ctrlSem[i].ZPB1_R4_RPL,
                ZPB2_R1_RPL: ctrlSem[i].ZPB2_R1_RPL,
                ZPB2_R2_RPL: ctrlSem[i].ZPB2_R2_RPL,
                ZPB2_R3_RPL: ctrlSem[i].ZPB2_R3_RPL,
                ZPB2_R4_RPL: ctrlSem[i].ZPB2_R4_RPL,

                ZIB1_R1_VISUEL: ctrlSem[i].ZIB1_R1_VISUEL,
                ZIB1_R2_VISUEL: ctrlSem[i].ZIB1_R2_VISUEL,
                ZIB1_R3_VISUEL: ctrlSem[i].ZIB1_R3_VISUEL,
                ZIB1_R4_VISUEL: ctrlSem[i].ZIB1_R4_VISUEL,
                ZIB2_R1_VISUEL: ctrlSem[i].ZIB2_R1_VISUEL,
                ZIB2_R2_VISUEL: ctrlSem[i].ZIB2_R2_VISUEL,
                ZIB2_R3_VISUEL: ctrlSem[i].ZIB2_R3_VISUEL,
                ZIB2_R4_VISUEL: ctrlSem[i].ZIB2_R4_VISUEL,
                ZPB1_R1_VISUEL: ctrlSem[i].ZPB1_R1_VISUEL,
                ZPB1_R2_VISUEL: ctrlSem[i].ZPB1_R2_VISUEL,
                ZPB1_R3_VISUEL: ctrlSem[i].ZPB1_R3_VISUEL,
                ZPB1_R4_VISUEL: ctrlSem[i].ZPB1_R4_VISUEL,
                ZPB2_R1_VISUEL: ctrlSem[i].ZPB2_R1_VISUEL,
                ZPB2_R2_VISUEL: ctrlSem[i].ZPB2_R2_VISUEL,
                ZPB2_R3_VISUEL: ctrlSem[i].ZPB2_R3_VISUEL,
                ZPB2_R4_VISUEL: ctrlSem[i].ZPB2_R4_VISUEL,

                ZIB1_R1_MESURE: ctrlSem[i].ZIB1_R1_MESURE,
                ZIB1_R2_MESURE: ctrlSem[i].ZIB1_R2_MESURE,
                ZIB1_R3_MESURE: ctrlSem[i].ZIB1_R3_MESURE,
                ZIB1_R4_MESURE: ctrlSem[i].ZIB1_R4_MESURE,
                ZIB2_R1_MESURE: ctrlSem[i].ZIB2_R1_MESURE,
                ZIB2_R2_MESURE: ctrlSem[i].ZIB2_R2_MESURE,
                ZIB2_R3_MESURE: ctrlSem[i].ZIB2_R3_MESURE,
                ZIB2_R4_MESURE: ctrlSem[i].ZIB2_R4_MESURE,
                ZPB1_R1_MESURE: ctrlSem[i].ZPB1_R1_MESURE,
                ZPB1_R2_MESURE: ctrlSem[i].ZPB1_R2_MESURE,
                ZPB1_R3_MESURE: ctrlSem[i].ZPB1_R3_MESURE,
                ZPB1_R4_MESURE: ctrlSem[i].ZPB1_R4_MESURE,
                ZPB2_R1_MESURE: ctrlSem[i].ZPB2_R1_MESURE,
                ZPB2_R2_MESURE: ctrlSem[i].ZPB2_R2_MESURE,
                ZPB2_R3_MESURE: ctrlSem[i].ZPB2_R3_MESURE,
                ZPB2_R4_MESURE: ctrlSem[i].ZPB2_R4_MESURE,

                ZIB1_R1_CONSO: ctrlSem[i].ZIB1_R1_CONSO,
                ZIB1_R2_CONSO: ctrlSem[i].ZIB1_R2_CONSO,
                ZIB1_R3_CONSO: ctrlSem[i].ZIB1_R3_CONSO,
                ZIB1_R4_CONSO: ctrlSem[i].ZIB1_R4_CONSO,
                ZIB2_R1_CONSO: ctrlSem[i].ZIB2_R1_CONSO,
                ZIB2_R2_CONSO: ctrlSem[i].ZIB2_R2_CONSO,
                ZIB2_R3_CONSO: ctrlSem[i].ZIB2_R3_CONSO,
                ZIB2_R4_CONSO: ctrlSem[i].ZIB2_R4_CONSO,
                ZPB1_R1_CONSO: ctrlSem[i].ZPB1_R1_CONSO,
                ZPB1_R2_CONSO: ctrlSem[i].ZPB1_R2_CONSO,
                ZPB1_R3_CONSO: ctrlSem[i].ZPB1_R3_CONSO,
                ZPB1_R4_CONSO: ctrlSem[i].ZPB1_R4_CONSO,
                ZPB2_R1_CONSO: ctrlSem[i].ZPB2_R1_CONSO,
                ZPB2_R2_CONSO: ctrlSem[i].ZPB2_R2_CONSO,
                ZPB2_R3_CONSO: ctrlSem[i].ZPB2_R3_CONSO,
                ZPB2_R4_CONSO: ctrlSem[i].ZPB2_R4_CONSO,
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jCtrl);
    });

});
webmat.post('/SetConso', urlencodedParser, function (request, response) {
    var ctrl = request.body.ctrl;
    var query = "INSERT INTO T_Tmp_Conso VALUES " + ctrl.join(',');


    sql.open(conn_str, function (err, conn) {
        if (err) { console.log("Error opening the connection!"); return; }
        conn.queryRaw(query, function (err, results) {
            if (err) console.log("Erreur : " + err);
            else { console.log('Set Conso : ' + ctrl.length + ' Conso calculées..'); }
        });

        var req = "UPDATE T_SemellesData SET ";
        req += "ZIB1_R1_CONSO = B.ZIB1R1,";
        req += "ZIB1_R2_CONSO = B.ZIB1R2,";
        req += "ZIB1_R3_CONSO = B.ZIB1R3,";
        req += "ZIB1_R4_CONSO = B.ZIB1R4,";
        req += "ZIB2_R1_CONSO = B.ZIB2R1,";
        req += "ZIB2_R2_CONSO = B.ZIB2R2,";
        req += "ZIB2_R3_CONSO = B.ZIB2R3,";
        req += "ZIB2_R4_CONSO = B.ZIB2R4,";
        req += "ZPB1_R1_CONSO = B.ZPB1R1,";
        req += "ZPB1_R2_CONSO = B.ZPB1R2,";
        req += "ZPB1_R3_CONSO = B.ZPB1R3,";
        req += "ZPB1_R4_CONSO = B.ZPB1R4,";
        req += "ZPB2_R1_CONSO = B.ZPB2R1,";
        req += "ZPB2_R2_CONSO = B.ZPB2R2,";
        req += "ZPB2_R3_CONSO = B.ZPB2R3,";
        req += "ZPB2_R4_CONSO = B.ZPB2R4 ";
        req += " FROM T_Tmp_Conso B WHERE B.CtrlId = T_SemellesData.ID"

        conn.queryRaw(req, function (err, results2) {
            if (err) console.log("Erreur : " + err);
            else {
                response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
                response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
                response.type('json');
                response.status(200).jsonp("OK");
            }
            conn.close();
        });

    });
});

webmat.post('/SaveTracaSemelle', urlencodedParser, function (request, response) {
    var traca = request.body.traca;

    var query = "INSERT INTO T_Sem_Traca (";
    query += "CreateDate, ";
    query += "StfId, ";
    query += "CreateBy, ";
    query += "Site, ";
    query += "Interv, ";
    query += "Rame, ";
    query += "Title, ";
    query += "MessageBM, ";
    query += "ZIB1, ";
    query += "ZIB2, ";
    query += "ZPB1, ";
    query += "ZPB2, ";
    query += "Utilised, ";
    query += "UtilisedBy, ";
    query += "UtilisedDate) ";

    query += " OUTPUT Inserted.ID ";

    query += " VALUES ( ";
    query += "CONVERT(DATETIME, '" + traca.tracaDate + "', 102) ,";
    query += traca.stfId + " ,";
    query += "'" + traca.createBy + "' ,";
    query += "'" + traca.site + "' ,";
    query += "'" + traca.inter + "' ,";
    query += "'" + traca.rame + "' ,";
    query += "'" + traca.title + "' ,";
    query += "'" + traca.messBm + "' ,";
    query += "'" + traca.ZIB1 + "' ,";
    query += "'" + traca.ZIB2 + "' ,";
    query += "'" + traca.ZPB1 + "' ,";
    query += "'" + traca.ZPB2 + "' ,";
    query += 0 + " ,";
    query += "NULL ,";
    query += "NULL";
    query += " )";

    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp({ "ID": results.rows[0][0] });
        });
    });
});
webmat.get('/getTracaSemelles', function (request, response) {
    if (!request.query.stfId) { response.send('Check the params'); return; }
    var stfId = request.query.stfId;
    //console.log("STF : " + stfId + " " + request.query.stfId);

    var req = "SELECT  * FROM T_Sem_Traca ";
    req += "WHERE (StfId = " + stfId + ") AND (Utilised = 0)";
    req += "ORDER BY CreateDate DESC, ID DESC";

    //console.log( req);
    var jTraca = new Array();
    var stmt = sql.query(conn_str, req, function (err, traca) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < traca.length; i++) {
            jTraca.push({
                ID:             traca[i].ID,
                CreateDate:     new Date(new Date(traca[i].CreateDate).getTime() + (new Date(traca[i].CreateDate).getTimezoneOffset() * 60000)),
                StfId:          traca[i].StfId,
                CreateBy:       traca[i].CreateBy,
                Site:           traca[i].Site,
                Interv:         traca[i].Interv,
                Rame:           traca[i].Rame,
                Title:          traca[i].Tiltle,
                MessageBM:      traca[i].MessageBM,
                ZIB1:           traca[i].ZIB1,
                ZIB2:           traca[i].ZIB2,
                ZPB1:           traca[i].ZPB1,
                ZPB2:           traca[i].ZPB2,
                Utilised:       traca[i].Utilised,
                UtilisedBy:     traca[i].UtilisedBy,
                UtilisedDate:   traca[i].UtilisedDate == null ? null : new Date(new Date(traca[i].DeletedDate).getTime() + (new Date(traca[i].DeletedDate).getTimezoneOffset() * 60000))
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jTraca);
    });

});
webmat.get('/getOneTracaByID', function (request, response) {
    var _Id = request.query.id;

    var query = "SELECT * ";
    query += " FROM T_Sem_Traca WHERE(ID = " + _Id + ")";

    var stmt = sql.query(conn_str, query, function (err, traca) {
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(traca[0]);
    });
});
webmat.get('/updtUtilisedTraca', function (request, response) {
    var _Id = request.query.id;
    var _user = request.query.user;
    var _date = request.query.date;

    var query = "UPDATE T_Sem_Traca ";
    query += " SET Utilised = 1, UtilisedBy = '" + _user + "', UtilisedDate = CONVERT(DATETIME, '" + _date + "', 102)";
    query += " WHERE(ID = " + _Id + ")";

    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});

/* Région Appli */
webmat.get('/getMotricesByRame', function (request, response) {
    var _rameId     = request.query.rameId;
    var _serieId    = request.query.serieId;
    var query       = "";
    var jMotrices   = new Array();

    // Z2N
    if (_serieId == 1) {
        query = "SELECT ID, NumVehicule FROM T_SNCF_Compo ";
        query += " WHERE (IdRame = " + _rameId + ") AND (TypeVehicule = 'M') ORDER BY NumOrder";
    }

    // 5300
    if (_serieId == 2) {
        query = "SELECT ID, NumVehicule FROM T_SNCF_Compo ";
        query += " WHERE (IdRame = " + _rameId + ") AND (TypeVehicule = 'M') AND (NumOrder = 1)";
    }

    var stmt = sql.query(conn_str, query, function (err, motrices) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < motrices.length; i++) {
            jMotrices.push({
                ID:         motrices[i].ID,
                Motrice:    motrices[i].NumVehicule,
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jMotrices);
    });
});
webmat.get('/getAllStfs', function (request, response) {
    var _pSemelle = request.query.pSemelle;
    var req = "SELECT ID, STF,  ModSemelle, StfIdRM, CodeOsmose, LibelleOsmose FROM T_SNCF_STF";
    if (_pSemelle) req += " WHERE ModSemelle = " + _pSemelle;
    var jSTF = new Array();
    var stmt_stf = sql.query(conn_str, req, function (err, STFs) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < STFs.length; i++) {
            jSTF.push({
                ID:         STFs[i].ID,
                IDrexmat:   STFs[i].StfIdRM,
                IDosmose:   STFs[i].CodeOsmose,
                STF:        STFs[i].STF,
                STFosmose:  STFs[i].LibelleOsmose,
                Semelle:    STFs[i].ModSemelle
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jSTF);
    });
});
webmat.get('/getSitesSemelle', function (request, response) {
    var _stfId = request.query.stfId;
    var req = "SELECT ID, Site, StfId FROM T_Sem_Sites";
    if (_stfId) req += " WHERE StfId = " + _stfId;

    var jRetours = new Array();
    var stmt = sql.query(conn_str, req, function (err, retours) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < retours.length; i++) {
            jRetours.push({
                ID:     retours[i].ID,
                Site:   retours[i].Site,
                StfId:  retours[i].StfId
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jRetours);
    });
});
webmat.get('/getIntervSemelle', function (request, response) {
    var _stfId = request.query.stfId;
    var req = "SELECT ID, Intervention, StfId FROM T_Sem_Interventions";
    if (_stfId) req += " WHERE StfId = " + _stfId;
    
    var jRetour = new Array();
    var stmt = sql.query(conn_str, req, function (err, retours) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < retours.length; i++) {
            jRetour.push({
                ID:     retours[i].ID,
                Interv: retours[i].Intervention,
                StfId:  retours[i].StfId
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jRetour);
    });
});
webmat.get('/getRameByID', function (request, response) {
    var _Idrame = request.query.rameID;
    var req = "SELECT * FROM T_SNCF_Rames";
    req += " WHERE ID = " + _Idrame;

    var stmt = sql.query(conn_str, req, function (err, retour) {
        if (err) { console.log('database error:' + err); return; }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(retour[0]);
    });
});

webmat.get('/getStfs', function (request, response) {
    var _id = request.query.pID;
	var _pSemelle = request.query.pSemelle;
    var query = "SELECT ID, STF,  ModSemelle, StfIdRM, CodeOsmose, LibelleOsmose, CodeSecteur FROM T_SNCF_STF WHERE ID > 0 ";
    if (_id > 0)    query += " AND ID = " + _id;
    if (_pSemelle)  query += " AND ModSemelle = " + _pSemelle;
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:         results[i].ID,
                IDrexmat:   results[i].StfIdRM,
                IDosmose:   results[i].CodeOsmose.trim(),
                STF:        results[i].STF.trim(),
                STFosmose:  results[i].LibelleOsmose.trim(),
                Semelle:    results[i].ModSemelle,
                CodeSecteur:results[i].CodeSecteur.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({NbRows:jResults.length, data:jResults});
    });
});
webmat.get('/getRames', function (request, response) {
    var _id             = request.query.id;
    var _stfid          = request.query.stfid;
    var _serieid        = request.query.serieid;
    var _sousserieid    = request.query.sousserieid;
    var _num_rame       = request.query.num_rame;
    var _num_ef         = request.query.num_ef;

    var query = "SELECT T_SNCF_Rames.ID, T_SNCF_Rames.IdSTF, T_SNCF_Rames.IdSérie, T_SNCF_Rames.IdSousSérie, T_SNCF_Rames.CodeSerie, T_SNCF_Rames.IdRexmat, T_SNCF_Rames.IdSerieRm, T_SNCF_Rames.IdSousSerieRm, T_SNCF_Rames.IdStfRm, T_SNCF_Rames.OsmEF, T_SNCF_Rames.OsmSerieId, T_SNCF_Rames.OsmStf, T_SNCF_Rames.OsmFlotteId, T_SNCF_Rames.EAB, T_SNCF_Séries.Série, T_SNCF_SousSéries.SousSérie ";
    query += "FROM T_SNCF_Rames INNER JOIN ";
	query += "T_SNCF_Séries ON T_SNCF_Rames.IdSérie = T_SNCF_Séries.ID LEFT OUTER JOIN ";
	query += "T_SNCF_SousSéries ON T_SNCF_Rames.IdSousSérie = T_SNCF_SousSéries.ID AND T_SNCF_Rames.IdSérie = T_SNCF_SousSéries.IdSérie ";
	query += "WHERE T_SNCF_Rames.ID > 0 ";
    if (_id && _id > 0)                         query += " AND T_SNCF_Rames.ID = " + _id;
    if (_stfid && _stfid > 0)                   query += " AND T_SNCF_Rames.IdSTF = " + _stfid;
    if (_serieid && _serieid > 0)               query += " AND T_SNCF_Rames.IdSérie = " + _serieid;
    if (_sousserieid && _sousserieid > 0)       query += " AND T_SNCF_Rames.IdSousSérie = " + _sousserieid;
    if (_num_ef && _num_ef != '')               query += " AND T_SNCF_Rames.OsmEF = '" + _num_ef + "'";
    if (_num_rame && _num_rame != '')           query += " AND T_SNCF_Rames.EAB = '" + _num_rame + "'";

    //console.log(query);

    var jResults = [];
    var stmt = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < results.length; i++)
        {
            jResults.push({
                ID:             results[i].ID,
                IdSTF:          results[i].IdSTF,
                IdSerie:        results[i].IdSérie,
                IdSousSérie:    results[i].IdSousSérie,
                CodeSerie:      results[i].CodeSerie.trim(),
                IdRexmat:       results[i].IdRexmat,
                IdStfRm:        results[i].IdStfRm,
                IdSerieRm:      results[i].IdSerieRm,
                NumEF:          results[i].OsmEF.trim(),
                EAB:            results[i].EAB.trim(),
                StfOsm:         results[i].OsmStf.trim(),
                OsmSerie:       results[i].OsmSerieId,
                FlotteOsmId:    results[i].OsmFlotteId,
				Serie: 			results[i].Série.trim(),
				SousSerie:      results[i].SousSérie == null ? results[i].Série.trim() : results[i].SousSérie.trim(),
				Serie_Ss:       results[i].SousSérie == null ? results[i].Série.trim() + " - ()" : results[i].Série.trim() + " - ("+ results[i].SousSérie.trim() + ")"
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({NbRows:jResults.length, data:jResults});
    });
});
webmat.get('/getSeries', function (request, response) {
    var _id = request.query.ID;
    var _idStf = request.query.IdStf;

    var query = "SELECT DISTINCT  T_SNCF_Séries.ID, T_SNCF_Séries.Série, T_SNCF_Séries.ModSemelle, T_SNCF_Séries.LcnRacine, T_Sncf_LinkSerie.IdStf ";
    query += "FROM T_SNCF_Séries INNER JOIN T_Sncf_LinkSerie ON T_SNCF_Séries.ID = T_Sncf_LinkSerie.IdSerie WHERE T_SNCF_Séries.ID > 0";
    if (_id > 0)    query += " AND T_SNCF_Séries.ID = " + _id;
    if (_idStf > 0) query += " AND T_Sncf_LinkSerie.IdStf = " + _idStf;

    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:         results[i].ID,
                Serie:      results[i].Série.trim(),
                ModSem:     results[i].ModSemelle,
                LCN:        results[i].LcnRacine.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});
webmat.get('/getSousSeries', function (request, response) {
    var _idStf = request.query.IdStf;
    var _idSerie = request.query.IdSerie;

    var query = "SELECT DISTINCT T_SNCF_SousSéries.ID, T_SNCF_SousSéries.IdSérie, T_SNCF_SousSéries.SousSérie, T_SNCF_SousSéries.LCN ";
    query += "FROM  T_Sncf_LinkSerie INNER JOIN T_SNCF_SousSéries ON T_Sncf_LinkSerie.IdSerie = T_SNCF_SousSéries.IdSérie AND T_Sncf_LinkSerie.IdSousSerie = T_SNCF_SousSéries.ID WHERE T_SNCF_SousSéries.ID > 0 ";
    if (_idStf > 0) query += " AND T_Sncf_LinkSerie.IdStf = " + _idStf;
    if (_idSerie > 0) query += " AND T_SNCF_SousSéries.IdSérie = " + _idSerie;

    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:         results[i].ID,
                IdSerie:    results[i].IdSérie,
                SousSerie:  results[i].SousSérie.trim(),
                LCN:        results[i].LCN.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});

webmat.get('/getLibellesRestriction', function (request, response) {
    var _idStf          = request.query.IdStf;
    var _idserie        = request.query.IdSerie;
    var _idsousserie    = request.query.IdSousSerie;
    var _idrame         = request.query.IdRame;

    var query = "SELECT DISTINCT  libelle_reduit, famille ";//code_serie,
    query += "FROM T_GR_TypeRestrictionV2";
    query += " WHERE (code_serie IN (SELECT DISTINCT CodeSerie FROM T_SNCF_Rames WHERE (IdSTF = " + _idStf + ") ";
    if (_idserie > 0)       query += " AND ( IdSérie = " + _idserie + ")";
    if (_idsousserie > 0)   query += " AND ( IdSousSérie = " + _idsousserie + ")";
    if (_idrame > 0)        query += " AND ( ID = " + _idrame + ")";
    query += " ))";
    //console.log("getLibellesRestriction : " + query);
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('getLibellesRestriction >> database error:' + err); return; }
        for (var i = 0; i < results.length; i++) {
            jResults.push({
                Famille: results[i].famille.trim(),
                Libelle: results[i].libelle_reduit.trim()
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});

webmat.get('/GetAspUserByCpt', function (request, response) {
    var _user = request.query.User;
    var query = "SELECT aspnet_Users.UserId, aspnet_Users.LoweredUserName, aspnet_Users.IsAnonymous, aspnet_Membership.Comment, aspnet_Membership.IsApproved, aspnet_Membership.IsLockedOut, aspnet_Users.ApplicationId ";
    query += "FROM aspnet_Users INNER JOIN aspnet_Membership ON aspnet_Users.UserId = aspnet_Membership.UserId WHERE LoweredUserName = '" + _user + "'";

    var jUser       = {}; 
    var jRoles      = new Array(); 
    var strPref     = ""; 
    var jStfsSet    = new Array(); 
    var jAllStfs    = new Array();
    var stmt_user = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }
        jUser = {
            AppliID:        results[0].ApplicationId,
            UserID:         results[0].UserId,
            isAnonymous:    results[0].IsAnonymous,
            isApproved:     results[0].IsApproved,
            isLockedOut:    results[0].IsLockedOut,
            cptWin:         results[0].LoweredUserName.trim(),
            username:       results[0].Comment.trim(),
        };

        var queryStfPref = "SELECT PropertyValuesString AS pref  FROM aspnet_Profile WHERE (UserId = '" + jUser.UserID + "')";
        var stmt_pref = sql.query(conn_str, queryStfPref, function (errStfPref, Pref) {
            if (typeof (Pref[0]) == 'undefined') strPref = '0';
            else { strPref = (Pref == null || Pref[0].pref == null || Pref.length == 0) ? '0' : Pref[0].pref; }

            var queryRoles = "SELECT aspnet_Roles.RoleName FROM aspnet_UsersInRoles INNER JOIN aspnet_Roles ON aspnet_UsersInRoles.RoleId = aspnet_Roles.RoleId ";
            queryRoles += "WHERE (aspnet_UsersInRoles.UserId = '" + jUser.UserID + "') AND (aspnet_Roles.ApplicationId = '" + jUser.AppliID + "')";
            var stmt_roles = sql.query(conn_str, queryRoles, function (err, roles) {
                for (var i = 0; i < roles.length; i++) { jRoles.push(roles[i].RoleName); }

                var queryStfSet = "SELECT StfId FROM T_Stf_LinkSetStf WHERE  (IdUserSET = '" + jUser.UserID + "')";
                var stmt_stfset = sql.query(conn_str, queryStfSet, function (err, stfset) {
                    for (var i = 0; i < stfset.length; i++) { jStfsSet.push(stfset[i].StfId); }

                    var queryAllStf = "SELECT ID, STF,  ModSemelle, StfIdRM, CodeOsmose, LibelleOsmose, CodeSecteur FROM T_SNCF_STF WHERE ID > 0 ";
                    var stmt_allstf = sql.query(conn_str, queryAllStf, function (err, allstfs) {
                        if (err) { console.log('database error:' + err); return; }

                        for (var i = 0; i < allstfs.length; i++) {
                            jAllStfs.push({
                                ID:             allstfs[i].ID,
                                IdStfRm:        allstfs[i].StfIdRM,
                                OsmStf:         allstfs[i].CodeOsmose.trim(),
                                STF:            allstfs[i].STF.trim(),
                                LibOsmose:      allstfs[i].LibelleOsmose.trim(),
                                Semelle:        allstfs[i].ModSemelle,
                                CodeSecteur:    allstfs[i].CodeSecteur.trim()
                            });
                        }
                        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
                        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
                        response.type('json');
                        response.status(200).jsonp({ UserInfo: jUser, RolesUser: jRoles, STFpref: strPref, StfsSET: jStfsSet, AllStfs: jAllStfs });
                    });
                });
            });
        });
    });
});
webmat.get('/getSites', function (request, response) {
    var _idstf  = request.query.IdStf;
    var _type   = request.query.TypeSite;
    var query = "SELECT ID, StfId, Site, CodeSite, TypeSite FROM T_STF_SITES WHERE ID > 0 ";
    if (_idstf > 0) query += " AND StfId = " + _idstf;
    if (_type != '') query += " AND TypeSite = '" + _type + "'";
    query += " ORDER BY Site";
    //console.log(query);
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:         results[i].ID,
                StfId:      results[i].StfId,
                Site:       results[i].Site.trim(),
                CodeGrf:    results[i].CodeSite.trim(),
                TypeSite:   results[i].TypeSite.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});

webmat.get('/getFctRevidive', function (request, response) {
    var _idstf = request.query.IdStf;
    var query = "SELECT T_Stf_FctRecidives.Fonction AS Fonction, T_STF_Recidives.LibGRIFFE AS LibGrf, T_Stf_FctRecidives.IdStf";
    query += " FROM T_STF_Recidives INNER JOIN T_Stf_FctRecidives ON T_STF_Recidives.FonctionID = T_Stf_FctRecidives.ID WHERE T_Stf_FctRecidives.IdStf = " + _idstf;
    //console.log(query);
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                Libelle:    results[i].LibGrf.trim(),
                Fonction:   results[i].Fonction.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});
webmat.get('/getVersionsWebMat', function (request, response) {
    var query = "SELECT Version, DateVersion, Modification FROM T_Versions WHERE ID > 0 ORDER BY ID DESC";
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                Version:        results[i].Version.trim(),
                DateVersion:    new Date(new Date(results[i].DateVersion).getTime() + (new Date(results[i].DateVersion).getTimezoneOffset() * 60000)),
                Modification:   results[i].Modification.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});

webmat.get('/TraceUser', function (request, response) {
    var _date   = request.query.date;
    var _user   = request.query.user;
    var _module = request.query.module;
    var _navig  = request.query.navig;
    

    var query = "INSERT INTO T_UsersCnx ( UserName,  Module,  DateCnx,  Navigateur) ";
    query += " VALUES (  '" + _user + "' , '" + _module + "' , CONVERT(DATETIME, '" + _date + "', 102) , '" + _navig + "')";

    sql.open(conn_str, function (err, conn) {
        if (err) { console.log("Error opening the connection!"); return; }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp("OK");
        });
    });
});

/* Région EtatSanitaire */
webmat.post('/AddEtatMbyLot', urlencodedParser, function (request, response) {
    var ctrl = request.body.ctrl;
    var query = "INSERT INTO T_STF_CtrlStf_V3 OUTPUT Inserted.ID VALUES " + ctrl.join(',');
    //console.log(query);

    sql.open(conn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection!");
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) { console.log("err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});
webmat.get('/getEtatMbyStf', function (request, response) {
    var _stfId      = request.query.idStf;
    var _source     = request.query.source;
    var _clos       = request.query.clos;
    var _deleted    = request.query.deleted;

    var jResultOsm = new Array();
    var jResultGrf = new Array();

    var qSupDoublon = "DELETE FROM T_STF_CtrlStf_V3 FROM T_STF_CtrlStf_V3 LEFT OUTER JOIN ";
    qSupDoublon += " (SELECT MIN(ID) AS ID, SourceId, Source, RameId FROM T_STF_CtrlStf_V3 AS subq GROUP BY SourceId, Source, RameId) AS t1 ON T_STF_CtrlStf_V3.ID = t1.ID WHERE (t1.ID IS NULL)";

    var CloseOsm = "UPDATE WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 SET Clos = 1, DateClos = IMPORT_WEBZ2N_PROD.dbo.OSM_INT.DT_UPD ";
    CloseOsm += "FROM  IMPORT_WEBZ2N_PROD.dbo.OSM_INT INNER JOIN WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 ON IMPORT_WEBZ2N_PROD.dbo.OSM_INT.N_INT = WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId ";
    CloseOsm += "WHERE (IMPORT_WEBZ2N_PROD.dbo.OSM_INT.STATUT IN ('VALIDE','CLOTURE','ANNULE')) AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source = 'OSM') AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId = " + _stfId + ")";

    //console.log(CloseOsm);
    var query = "";

    if (!_source || _source == '') {
        query = "SELECT WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.RameId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SousLibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DateMiseSsCtrl, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceNum, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceDate, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Commentaire, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.AttPiece, T_STF_CtrlStf_V3.DateClos, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DepCplx, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.LibCourt, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.GroupEm, '' AS Localisation, '' AS Poseur, '' AS Comment, ";
        query += "WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.DatePrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.VacPrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.Commentaire AS CommPrev, WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.PiloteRest AS SR ";
        query += "FROM WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire INNER JOIN WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 ON WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.ID = WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId LEFT OUTER JOIN WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest INNER JOIN WEBMAT_DEV.dbo.T_Stf_PlanifEtatM ON WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.SrId ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.IdEtatM ";
        query += "WHERE (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos = " + _clos + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source = 'GRF') ";
        if (_deleted) query += "AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted = " + _deleted + ") ";
        query += " UNION ";
        query += "SELECT  WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.RameId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SousLibelleId, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DateMiseSsCtrl, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceNum, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceDate, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Commentaire, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.AttPiece, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DepCplx, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos, T_STF_CtrlStf_V3.DateClos, ";
        query += "WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.LibCourt, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.GroupEm, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.DS_INT AS Localisation, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.SR_ORIG AS Poseur, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.CMT_DI AS Comment, ";
        query += "WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.DatePrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.VacPrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.Commentaire AS CommPrev, WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.PiloteRest AS SR ";
        query += "FROM WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest INNER JOIN WEBMAT_DEV.dbo.T_Stf_PlanifEtatM ON WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.SrId RIGHT OUTER JOIN WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 INNER JOIN WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId = WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.ID INNER JOIN IMPORT_WEBZ2N_PROD.dbo.OSM_INT ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId = IMPORT_WEBZ2N_PROD.dbo.OSM_INT.N_INT ON WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.IdEtatM = WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID ";
        query += "WHERE (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source = 'OSM') AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos = " + _clos + ")";
        if (_deleted) query += "AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted = " + _deleted + ") ";
    }
    if (_source == 'OSM') {
        query += "SELECT  WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.RameId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SousLibelleId, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DateMiseSsCtrl, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceNum, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceDate, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Commentaire, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.AttPiece, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DepCplx, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos, T_STF_CtrlStf_V3.DateClos, ";
        query += "WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.LibCourt, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.GroupEm, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.DS_INT AS Localisation, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.SR_ORIG AS Poseur, IMPORT_WEBZ2N_PROD.dbo.OSM_INT.CMT_DI AS Comment, ";
        query += "WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.DatePrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.VacPrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.Commentaire AS CommPrev, WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.PiloteRest AS SR ";
        query += "FROM WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest INNER JOIN WEBMAT_DEV.dbo.T_Stf_PlanifEtatM ON WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.SrId RIGHT OUTER JOIN WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 INNER JOIN WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId = WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.ID INNER JOIN IMPORT_WEBZ2N_PROD.dbo.OSM_INT ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId = IMPORT_WEBZ2N_PROD.dbo.OSM_INT.N_INT ON WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.IdEtatM = WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID ";
        query += "WHERE (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source = 'OSM') AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos = " + _clos + ")";
        if (_deleted) query += "AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted = " + _deleted + ") ";
    }
    if (_source == 'GRF') {
        query = "SELECT WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.RameId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SousLibelleId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DateMiseSsCtrl, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceId, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted, ";
        query += "WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceNum, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.SourceDate, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Commentaire, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.AttPiece, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.DepCplx, WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos, T_STF_CtrlStf_V3.DateClos, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.LibCourt, WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.GroupEm, '' AS Localisation, '' AS Poseur, '' AS Comment, ";
        query += "WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.DatePrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.VacPrevision, WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.Commentaire AS CommPrev, WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.PiloteRest AS SR ";
        query += "FROM WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire INNER JOIN WEBMAT_DEV.dbo.T_STF_CtrlStf_V3 ON WEBMAT_DEV.dbo.T_Stf_LibEtatSanitaire.ID = WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.LibelleId LEFT OUTER JOIN WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest INNER JOIN WEBMAT_DEV.dbo.T_Stf_PlanifEtatM ON WEBMAT_DEV.dbo.T_Stf_PilotesSuiviRest.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.SrId ON WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.ID = WEBMAT_DEV.dbo.T_Stf_PlanifEtatM.IdEtatM ";
        query += "WHERE (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Clos = " + _clos + ") AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Source = 'GRF') ";
        if (_deleted) query += "AND (WEBMAT_DEV.dbo.T_STF_CtrlStf_V3.Deleted = " + _deleted + ") ";
    }


    //console.log(query);
    sql.open(conn_str, function (err, conn) {
        if (err) { console.log("Error opening the connection!"); return; }
        conn.queryRaw(qSupDoublon, function (err, _supp) {
            if (err) { console.log("getEtatMbyStf - SuupDoublons >> err : " + err); return; }
            sql.open(conn_Osm, function (err, conn) {
                if (err) { console.log("Error opening the connection!"); return; }
                conn.queryRaw(CloseOsm, function (err, results) {
                    if (err) { console.log("getEtatMbyStf - CloseOsm >> err : " + err); return; }
                    var stmt = sql.query(conn_Osm, query, function (err, Results) {
                        if (err) { console.log('getEtatMbyStf - GetEtatM >> database error:' + err); return; }

                        for (var i = 0; i < Results.length; i++) {
                            if (Results[i].Source.trim() == 'OSM') {
                                jResultOsm.push({
                                    ID:                 Results[i].ID,
                                    RameId:             Results[i].RameId,
                                    LibelleId:          Results[i].LibelleId,
                                    SsLibelleId:        Results[i].SousLibelleId,
                                    DateMiseSsCtrl:     new Date(new Date(Results[i].DateMiseSsCtrl).getTime() + (new Date(Results[i].DateMiseSsCtrl).getTimezoneOffset() * 60000)),
                                    SourceId:           Results[i].SourceId,
                                    SourceNum:          Results[i].SourceNum,
                                    Source:             'OSM',
                                    SourceDate:         new Date(new Date(Results[i].SourceDate).getTime() + (new Date(Results[i].SourceDate).getTimezoneOffset() * 60000)),
                                    AttPiece:           Results[i].AttPiece,
                                    DepCplx:            Results[i].DepCplx,
                                    Clos:               Results[i].Clos,
                                    Lib:                Results[i].LibCourt.trim(),
                                    poseur:             Results[i].Poseur.trim(),
                                    localisation:       Results[i].Localisation.trim(),
                                    Comment:            Results[i].Comment.trim(),
                                    DatePrev:           Results[i].SR == null ? null : new Date(new Date(Results[i].DatePrevision).getTime() + (new Date(Results[i].DatePrevision).getTimezoneOffset() * 60000)),
                                    Vac:                Results[i].VacPrevision == null ? '' : (Results[i].VacPrevision == 1 ? 'Jour' : 'Nuit'),
                                    CommentPrev:        Results[i].CommPrev == null ? '' : Results[i].CommPrev.trim(),
                                    SR:                 Results[i].SR == null ? '' : Results[i].SR.trim(),
                                    Deleted:            Results[i].Deleted,
                                    DtClos:             new Date(new Date(Results[i].DateClos).getTime() + (new Date(Results[i].DateClos).getTimezoneOffset() * 60000)),
                                    Group:              Results[i].GroupEm.trim()

                                });
                            }
                            else {
                                jResultGrf.push({
                                    ID:                 Results[i].ID,
                                    RameId:             Results[i].RameId,
                                    LibelleId:          Results[i].LibelleId,
                                    SsLibelleId:        Results[i].SousLibelleId,
                                    DateMiseSsCtrl:     new Date(new Date(Results[i].DateMiseSsCtrl).getTime() + (new Date(Results[i].DateMiseSsCtrl).getTimezoneOffset() * 60000)),
                                    SourceId:           Results[i].SourceId,
                                    SourceNum:          Results[i].SourceNum,
                                    Source:             'GRF',
                                    SourceDate:         new Date(new Date(Results[i].SourceDate).getTime() + (new Date(Results[i].SourceDate).getTimezoneOffset() * 60000)),
                                    AttPiece:           Results[i].AttPiece,
                                    DepCplx:            Results[i].DepCplx,
                                    Clos:               Results[i].Clos,
                                    Lib:                Results[i].LibCourt.trim(),
                                    poseur:             Results[i].Poseur.trim(),
                                    localisation:       Results[i].Localisation.trim(),
                                    Comment:            Results[i].Comment.trim(),
                                    DatePrev:           Results[i].SR == null ? null : new Date(new Date(Results[i].DatePrevision).getTime() + (new Date(Results[i].DatePrevision).getTimezoneOffset() * 60000)),
                                    Vac:                Results[i].VacPrevision == null ? '' : (Results[i].VacPrevision == 1 ? 'Jour' : 'Nuit'),
                                    CommentPrev:        Results[i].CommPrev == null ? '' : Results[i].CommPrev.trim(),
                                    SR:                 Results[i].SR == null ? '' : Results[i].SR.trim(),
                                    Deleted:            Results[i].Deleted,
                                    DtClos:             new Date(new Date(Results[i].DateClos).getTime() + (new Date(Results[i].DateClos).getTimezoneOffset() * 60000)),
                                    Group:              Results[i].GroupEm.trim()
                                });
                            }
                        }
                        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
                        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
                        response.type('json');
                        response.status(200).jsonp({ Osm: jResultOsm, Grf: jResultGrf });
                    });
                });
            });
        });
    });
});
webmat.get('/getEtatMbyRame', function (request, response) {
    var _stfId = request.query.idStf;
    var _source = request.query.source;
    var _clos = request.query.clos;
    var _rameid = request.query.rameid;
    var _libId = request.query.libId;
    var _sslibId = request.query.sslibId;

    console.log(_rameid);

    var query = "SELECT T_STF_CtrlStf_V3.ID, T_STF_CtrlStf_V3.StfId, T_STF_CtrlStf_V3.RameId, T_STF_CtrlStf_V3.LibelleId, T_STF_CtrlStf_V3.SousLibelleId, T_STF_CtrlStf_V3.DateMiseSsCtrl, T_STF_CtrlStf_V3.SourceId, ";
    query += "T_STF_CtrlStf_V3.SourceNum, T_STF_CtrlStf_V3.Source, T_STF_CtrlStf_V3.SourceDate, T_STF_CtrlStf_V3.Commentaire, T_STF_CtrlStf_V3.AttPiece, T_STF_CtrlStf_V3.DepCplx, T_STF_CtrlStf_V3.Clos, T_Stf_LibEtatSanitaire.LibCourt ";
    query += "FROM T_STF_CtrlStf_V3  INNER JOIN T_Stf_LibEtatSanitaire ON T_STF_CtrlStf_V3.LibelleId = T_Stf_LibEtatSanitaire.ID";
    query += " WHERE (Deleted = 0) AND StfId = " + _stfId + " AND Clos = " + _clos;
    if (_source) query += " AND Source = '" + _source + "'";
    if (_rameid > 0) query += " AND RameId = " + _rameid;
    if (_libId > 0) query += " AND LibelleId = " + _libId;
    if (_sslibId > 0) query += " AND SousLibelleId = " + _sslibId;

    console.log("getEtatMbyRame : ");

    var jResult = new Array();
    var stmt = sql.query(conn_str, query, function (err, Results) {
        if (err) { console.log('getEtatMbyRame >> database error:' + err); return; }
        console.log(Results.length);

        for (var i = 0; i < Results.length; i++) {
            jResult.push({
                ID:             Results[i].ID,
                RameId:         Results[i].RameId,
                LibelleId:      Results[i].LibelleId,
                SsLibelleId:    Results[i].SousLibelleId,
                DateMiseSsCtrl: new Date(new Date(Results[i].DateMiseSsCtrl).getTime() + (new Date(Results[i].DateMiseSsCtrl).getTimezoneOffset() * 60000)),
                SourceId:       Results[i].SourceId,
                SourceNum:      Results[i].SourceNum,
                Source:         Results[i].Source.trim(),
                SourceDate:     new Date(new Date(Results[i].SourceDate).getTime() + (new Date(Results[i].SourceDate).getTimezoneOffset() * 60000)),
                AttPiece:       Results[i].AttPiece,
                DepCplx:        Results[i].DepCplx,
                Clos:           Results[i].Clos,
                Lib:            Results[i].LibCourt.trim(),
                poseur:         '',
                localisation:   '',
                Comment:        ''
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jResult);
    });
});
webmat.get('/SetEtatMbyRame', function (request, response) {
    var _sourceId       = request.query.sourceId;
    var _sourceNum      = request.query.sourceNum;
    var _source         = request.query.source;
    var _libelleId      = request.query.libelleId;
    var _sslibelleId    = request.query.sslibelleId;
    var _rameId         = request.query.rameId;
    var _stfId          = request.query.stfId;
    var _dtCreate       = request.query.dtCreate;
    var _dtSource       = request.query.dtSource;
    var _user           = request.query.userName;
    var _mode           = request.query.mode;
    var _id = 0;

    var query = "SELECT ID, StfId, RameId, LibelleId, SousLibelleId, DateMiseSsCtrl, SourceId, SourceNum, Source, SourceDate, Commentaire, AttPiece, DepCplx, Clos FROM T_STF_CtrlStf_V3 ";
    query += " WHERE (Source = '" + _source + "') AND (SourceId = " + _sourceId + ") AND (SourceNum = " + _sourceNum + ") AND (StfId = " + _stfId + ") AND (RameId = " + _rameId + ")";
    var stmt = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('SetEtatMbyRame.1 >> database error:' + err); return; }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');

        if (results.length > 0) {
            _id = results[0].ID;
            if (_libelleId == 0) {
                var delQuery = "UPDATE T_STF_CtrlStf_V3 SET Deleted = 1, DeletedBy = '" + _user + "'  WHERE (ID = " + _id + ")";
                sql.open(conn_str, function (err, conn) {
                    if (err) { console.log("Error opening the connection!"); return; }
                    conn.queryRaw(delQuery, function (err, _delete) { if (err) { console.log("'SetEtatMbyRame.2 >> err : " + err); return; } });
                    console.log("Ctrl : " + _id + " Supprimé...");
                    response.status(200).jsonp("Ctrl Supprimé");
                });
            }
            else {
                var updtQuery = "UPDATE T_STF_CtrlStf_V3 SET ";
                updtQuery += " LibelleId = " + _libelleId + ", SousLibelleId = " + _sslibelleId + ", DateMiseSsCtrl = CONVERT(DATETIME, '" + _dtCreate + "', 104), Deleted = 0, DeletedBy = '', CreateMode = 'Manu', CreateBy = '" + _user + "' ";
                updtQuery += " WHERE ID = " + _id;

                sql.open(conn_str, function (err, conn) {
                    if (err) { console.log("Error opening the connection!"); return; }
                    conn.queryRaw(updtQuery, function (err, ajouts) { if (err) { console.log("'SetEtatMbyRame.3 >> err : " + err); return; } });
                    console.log("SetEtatMbyRame - Ctrl : " + _id + " modifié...");
                    response.status(200).jsonp("Ctrl Modifié");
                });
            }
        }
        else {
            var addQuery = "INSERT INTO T_STF_CtrlStf_V3 ( StfId, RameId, LibelleId, SousLibelleId, DateMiseSsCtrl, SourceId, SourceNum, Source, SourceDate, Commentaire, AttPiece, DepCplx, Clos, Deleted, CreateBy, CreateMode, DeletedBy )";
            addQuery += " VALUES (" + _stfId + ", " + _rameId + ", " + _libelleId + ", " + _sslibelleId + ", CONVERT(DATETIME, '" + _dtCreate + "', 104), " + _sourceId + " , " + _sourceNum + ", '" + _source + "', CONVERT(DATETIME, '" + _dtSource + "', 104), '', 0, 0, 0, 0, '" + _user + "', '" + _mode + "', '' )";
            sql.open(conn_str, function (err, conn) {
                if (err) { console.log("Error opening the connection!"); return; }
                conn.queryRaw(addQuery, function (err, ajouts) { if (err) { console.log("SetEtatMbyRame.4 >> err : " + err); return; } });
                console.log("SetEtatMbyRame - Ctrl ajouté...");
                response.status(200).jsonp("Ctrl Ajouté");
            });
        }
    });
});
webmat.get('/CloseEtatMbyIds', function (request, response) {
    var _Ids = request.query.Ids;
    var _Dts = request.query.Dts;
    var _source = request.query.Source;

    var tabIds = _Ids.split(',');
    var tabDts = _Dts.split(',');

    //console.log(tabIds[0] + " - " + tabDts[0]);

    var query = "declare  @arr table (id int, dtcl varchar(50)); ";
    query += "SET NOCOUNT OFF; ";
    for (var i = 0; i < tabIds.length; i++)
        query += "INSERT INTO @arr (id, dtcl) values (" + tabIds[i] + ",  '" + tabDts[i] + "');";
    query += "SET NOCOUNT ON; ";

    query += "UPDATE T_STF_CtrlStf_V3 SET Clos = 1, DateClos = CONVERT(DATETIME, (SELECT dtcl FROM @arr WHERE (id = T_STF_CtrlStf_V3.SourceId)), 103) ";
    query += "WHERE (SourceId IN (" + _Ids + ")) AND (Source = 'GRF')";

    //console.log(query);

    var stmt = sql.query(conn_str, query);
    stmt.on('done', function () {
        //console.log("All done!");
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp('OK');
    });
    stmt.on('error', function (err) { console.log("We had an error :-( " + err); });

});
webmat.get('/getLibEtatMbyStf', function (request, response) {
    var _stfId = request.query.idStf;

    var query = "SELECT ID, LibelleEtatSanitaire, LibCourt, zImpact, GroupEm FROM T_Stf_LibEtatSanitaire WHERE  IdStf = " + _stfId;

    var jResult = new Array();
    var stmt = sql.query(conn_str, query, function (err, Results) {
        if (err) { console.log('getLibEtatMbyStf >> database error:' + err); return; }

        for (var i = 0; i < Results.length; i++) {
            jResult.push({
                ID:             Results[i].ID,
                Libelle:        Results[i].LibelleEtatSanitaire.trim(),
                LibCourt:       Results[i].LibCourt.trim(),
                GroupEm:        Results[i].GroupEm.trim(),
                ImpactLigne:    Results[i].zImpact
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jResult);
    });
});
webmat.get('/getDetailLibEtatMbyLibId', function (request, response) {
    var _libId = request.query.idLib;
    var _stfId = request.query.idStf;

    var query = "SELECT ID, DetailState, IdLibState FROM T_Stf_DetailLibEtatM WHERE  IdStf = " + _stfId;
    if (_libId > 0) query += " AND IdLibState = " + _libId;

    var jResult = new Array();
    var stmt = sql.query(conn_str, query, function (err, Results) {
        if (err) { console.log('getDetailLibEtatMbyLibId >> database error:' + err); return; }

        for (var i = 0; i < Results.length; i++) {
            jResult.push({
                ID:             Results[i].ID,
                IdLibState:     Results[i].IdLibState,
                DetailState:    Results[i].DetailState.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp(jResult);
    });
});
webmat.get('/UpdEtatMbyId', function (request, response) {
    var _sourceId       = request.query.sourceId;
    var _sourceNum      = request.query.sourceNum;
    var _source         = request.query.source;
    var _libelleId      = request.query.libelleId;
    var _sslibelleId    = request.query.sslibelleId;
    var _rameId         = request.query.rameId;
    var _stfId          = request.query.stfId;
    var _dtCreate       = request.query.dtCreate;
    var _dtSource       = request.query.dtSource;
    var _user           = request.query.userName;
    var _mode           = request.query.mode;
    var _id             = request.query.id;

    var updtQuery = "UPDATE T_STF_CtrlStf_V3 SET ";
    updtQuery += " LibelleId = " + _libelleId + ", SousLibelleId = " + _sslibelleId + ", DateMiseSsCtrl = CONVERT(DATETIME, '" + _dtCreate + "', 104), Deleted = 0, DeletedBy = '', CreateMode = 'Manu', CreateBy = '" + _user + "', ";
    updtQuery += " SourceId = " + _sourceId + ", SourceNum = " + _sourceNum + ", Source = '" + _source + "' ";
    updtQuery += " WHERE ID = " + _id;
    console.log("UpdEtatMbyId >> " + updtQuery);
    sql.open(conn_str, function (err, conn) {
        if (err) { console.log("Error opening the connection!"); return; }
        conn.queryRaw(updtQuery, function (err, results) {
            if (err) { console.log("UpdEtatMbyId >> err : " + err); return; }
            response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
            response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
            response.type('json');
            response.status(200).jsonp(results);
        });
    });
});

webmat.get('/getSiteReals', function (request, response) {
    var _idstf = request.query.IdStf;
    var query = "SELECT ID, StfId, PiloteRest FROM T_Stf_PilotesSuiviRest WHERE StfId = 0 OR StfId = " + _idstf + " ORDER BY PiloteRest";
    //console.log(query);
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('getSiteReals >> database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:     results[i].ID,
                StfID:  results[i].StfId,
                SR:     results[i].PiloteRest.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});
webmat.get('/getRameReformebyStf', function (request, response) {
    var _stfId = request.query.idStf;
    var _date = request.query.date;

    var query = "SELECT TOP (1) ID, StfId, Date, Immob FROM T_Stf_V3_Immobs WHERE  StfId = " + _stfId + " AND Date = CONVERT(DATETIME, '" + _date + "', 102)"; 

    var jResult = new Array();
    var stmt = sql.query(conn_str, query, function (err, Results) {
        if (err) { console.log('getRameReformebyStf >> database error:' + err); return; }

        if( Results.length == 1) {
            jResult.push({
                ID:     Results[0].ID,
                Date:   Results[0].Date,
                Immob:  Results[0].Immob.trim()
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResult.length, data: jResult });
    });
});
webmat.get('/setReformeRame', function (request, response) {
    var _IdStf = request.query.IdStf;
    var _dateupd = request.query.DateUdt;
    var _lstimmo = request.query.ListImmo;
    var _user = request.query.User;

    // EtatM déjà Planifié ?
    var query = "Select ID FROM T_Stf_V3_Immobs WHERE (StfId = " + _IdStf + ") AND (Date = CONVERT(DATETIME, '" + dateFormat(new Date(), "yyyy-mm-dd 00:00:00") + "', 102))";

    var stmt = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('setReformeRame.1 >> database error:' + err); return; }

        // OUI ==> Mise à jour
        if (results.length > 0) {
            console.log('Update...');
            _id = results[0].ID;
            query = "UPDATE T_Stf_V3_Immobs SET Immob = '" + _lstimmo + "', UserName = '" + _user + "', DateUpt = CONVERT(DATETIME, '" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 102)  WHERE (ID = " + _id + ")";
        }
            // NON ==> Ajout
        else {
            console.log('Insert...');
            query = "INSERT INTO T_Stf_V3_Immobs  (StfId, Date, DateUpt, UserName, Immob) VALUES (";
            query += _IdStf + ", CONVERT(DATETIME, '" + dateFormat(new Date(), "yyyy-mm-dd 00:00:00") + "', 102) , CONVERT(DATETIME, '" + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + "', 102), '" + _user + "', '" + _lstimmo.trim() + "')";
        }
        console.log(query);

        sql.open(conn_str, function (err, conn) {
            if (err) { console.log("setReformeRame.2 - Error opening the connection!"); return; }
            conn.queryRaw(query, function (err, result) { if (err) { console.log("setReformeRame.2 >> err : " + err); return; } });
            response.status(200).jsonp("OK");
        });
    });
});


webmat.get('/importEtatMv2', function (request, response) {
    // Il faut configurer les datePose de la vue cCtrlStf pour sélectionner les données à récupérer.
    var jResult = new Array();
    var query = "SELECT * FROM vCtrlStf ";

    response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
    response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
    response.type('json');

    var strLigne = "";

    var stmt = sql.query(conn_str, query, function (err, Results) {
        if (err) { console.log('importEtatMv2 - GetEtatM >> database error:' + err); return; }
        console.log(jResult.length);
        for (var i = 0; i < Results.length; i++) {
            strLigne = "( 1 , " + Results[i].RameId + ", " + Results[i].LibId + ", " + Results[i].SsLibId + ", '";
            strLigne += dateFormat(new Date(new Date(Results[i].CtrlDate).getTime() + (new Date(Results[i].CtrlDate).getTimezoneOffset() * 60000)), "dd/mm/yyyy HH:MM:ss");
            strLigne += "', " + Results[i].IdRest + "," + Results[i].NoRest + ", 'GRF', '";
            strLigne += dateFormat(new Date(new Date(Results[i].PoseDate).getTime() + (new Date(Results[i].PoseDate).getTimezoneOffset() * 60000)), "dd/mm/yyyy HH:MM:ss") + "', '";
            strLigne += dateFormat(new Date(new Date(Results[i].AmortDate).getTime() + (new Date(Results[i].AmortDate).getTimezoneOffset() * 60000)), "dd/mm/yyyy HH:MM:ss");
            strLigne += "' , '', " + (Results[i].AttPiece ? 1 : 0) + ", 0, 1, '" + Results[i].Mode.trim() + "', 'ImportV2' , 0 , '' )";
            console.log(strLigne);
            jResult.push(strLigne);
        }
        while (jResult.length != Results.length) { }
        var queryImp = "INSERT INTO T_Stf_CtrlStf_V3  (StfId, RameId, LibelleId, SousLibelleId, DateMiseSsCtrl, SourceId, SourceNum, Source, SourceDate, DateClos, Commentaire, AttPiece, DepCplx, Clos, CreateMode, CreateBy, Deleted, DeletedBy) ";
        queryImp+= " VALUES " + jResult.join(',');

        var stmtImport = sql.query(conn_str, queryImp);
        stmtImport.on('error', function (err) { console.log(" Import CtrlStf V2 >>  We had an error :-( " + err); });
        stmtImport.on('done', function () {
            response.status(200).jsonp( jResult.length + ' CtrlStf importés....');
        });
    });

});

webmat.get('/setPlanif', function (request, response) {
    var _etatmId    = request.query.IdEtatM;
    var _srId       = request.query.IdSr;
    var _vac        = request.query.Vac;
    var _dtPlanif   = request.query.DtPlanif;
    var _comment    = request.query.Comment;

    // EtatM déjà Planifié ?
    var query = "Select ID FROM T_Stf_PlanifEtatM WHERE (EnCours = 1) AND (IdEtatM = " + _etatmId + ")";
    
    var stmt = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('setPlanif.1 >> database error:' + err); return; }

        // OUI ==> Mise à jour
        if (results.length > 0) {
            _id = results[0].ID;
            query = "UPDATE T_Stf_PlanifEtatM SET SrId = " + _srId + ", VacPrevision = " + _vac + ", DatePrevision = CONVERT(DATETIME, '" + _dtPlanif + "', 104), Commentaire = '" + _comment.trim() + "'  WHERE (ID = " + _id + ")";
        }
        // NON ==> Ajout
        else {
            query = "INSERT INTO T_Stf_PlanifEtatM (IdEtatM, SrId, DatePrevision, VacPrevision, Commentaire, CodeRealisation, EnCours) VALUES (";
            query += _etatmId + ", " + _srId + " , CONVERT(DATETIME, '" + _dtPlanif + "', 104), " + _vac + ", '" + _comment.trim() + "', 0, 1)";
        }
        console.log(query);

        sql.open(conn_str, function (err, conn) {
            if (err) { console.log("setPlanif.2 - Error opening the connection!"); return; }
            conn.queryRaw(query, function (err, result) { if (err) { console.log("setPlanif.2 >> err : " + err); return; } });
            response.status(200).jsonp("OK");
        });
    });
});

webmat.get('/getObjectifByStf', function (request, response) {
    var _idstf = request.query.IdStf;
    var query = "SELECT ID, StfId, LibGraphEtatM, Obj, Color, ColorOut FROM T_Stf_ObjectifEtatM WHERE  StfId = " + _idstf;
    //console.log(query);
    var jResults = new Array();
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('getObjectifByStf >> database error:' + err); console.log(query); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                ID:         results[i].ID,
                StfID:      results[i].StfId,
                LibGroup:   results[i].LibGraphEtatM.trim(),
                Objectif:   results[i].Obj,
                color:      results[i].Color.trim(),
                colorOut:   results[i].ColorOut.trim(),
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});
webmat.get('/getdataChartPass', function (request, response) {
    var _stfId      = request.query.IdStf;
    var _dtDebut    = request.query.dtDebut;
    var jResults    = new Array();
    var query = "SELECT T_STF_CtrlStf_V3.LibelleId, T_STF_CtrlStf_V3.DateClos, T_STF_CtrlStf_V3.Clos, T_Stf_LibEtatSanitaire.LibelleEtatSanitaire, T_Stf_LibEtatSanitaire.GroupEm, T_STF_CtrlStf_V3.SourceDate, T_STF_CtrlStf_V3.SourceId ";
    query += "FROM T_STF_CtrlStf_V3 INNER JOIN T_Stf_LibEtatSanitaire ON T_STF_CtrlStf_V3.LibelleId = T_Stf_LibEtatSanitaire.ID ";
    query += "WHERE (T_Stf_LibEtatSanitaire.GroupEm <> '') AND (T_STF_CtrlStf_V3.Deleted = 0) AND (((T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (T_STF_CtrlStf_V3.Clos = 0)) ";
    if (_dtDebut) query += " OR ((T_STF_CtrlStf_V3.StfId = " + _stfId + ") AND (T_STF_CtrlStf_V3.Clos = 1) AND (T_STF_CtrlStf_V3.DateClos > CONVERT(DATETIME, '" + _dtDebut + "', 102))))";
    else query += ")";
    //console.log(query);
    var stmt_stf = sql.query(conn_str, query, function (err, results) {
        if (err) { console.log('getdataChart >> database error:' + err); return; }

        for (var i = 0; i < results.length; i++) {
            jResults.push({
                LibId:      results[i].LibelleId,
                DtClos:     new Date(new Date(results[i].DateClos).getTime() + (new Date(results[i].DateClos).getTimezoneOffset() * 60000)),
                Lib:        results[i].LibelleEtatSanitaire.trim(),
                Group:      results[i].GroupEm.trim(),
                Clos:       results[i].Clos,
                DtSource:   new Date(new Date(results[i].SourceDate).getTime() + (new Date(results[i].SourceDate).getTimezoneOffset() * 60000)),
                SourceId:   results[i].SourceId
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ NbRows: jResults.length, data: jResults });
    });
});


/* Région Admin */
webmat.get('/getAspRoles', function (request, response) {
    var appliId = '59386b6d-fe16-4b54-ba97-fbfc78dc6155';
    var req = "SELECT [t0].[RoleId], LTRIM(RTRIM([t0].[RoleName])) AS RoleName, LTRIM(RTRIM([t0].[Description])) AS Description,";
    req += " (SELECT COUNT(*) FROM [aspnet_UsersInRoles] AS [t1] WHERE [t1].[RoleId] = [t0].[RoleId]) AS [Nb]";
    req += " FROM [aspnet_Roles] AS [t0] WHERE [t0].[ApplicationId] = '" + appliId + "' ORDER BY [t0].[RoleName]";
    var jRole = new Array();
    var stmtroles = sql.query(conn_str, req, function (err, Roles) {
        if (err) { console.log('database error:' + err); return; }

        for (var i = 0; i < Roles.length; i++) {
            jRole.push({
                RoleName:       Roles[i].RoleName,
                RoleId:         Roles[i].RoleId,
                Description:    Roles[i].Description,
                NbUsersInRole : Roles[i].Nb
            });
        }

        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jRole });
    });
});
webmat.get('/getAspUsers', function (request, response) {
    var roleId = request.query.RoleId;
    var req = "SELECT";    
    req += " aspnet_Membership.UserId,";
    req += " LTRIM(RTRIM(aspnet_Membership.Email)) AS Email,";
    req += " aspnet_Membership.IsApproved,";
    req += " aspnet_Membership.IsLockedOut,";
    req += " aspnet_Membership.CreateDate,";
    req += " aspnet_Membership.LastLoginDate,";
    req += " aspnet_Membership.Comment,";
    req += " LTRIM(RTRIM(aspnet_Users.UserName)) AS UserName,";
    req += " aspnet_Users.IsAnonymous, ";
    req += " aspnet_Users.LastActivityDate";
    req += " FROM aspnet_Membership INNER JOIN aspnet_Users ON aspnet_Membership.UserId = aspnet_Users.UserId";
    if (roleId != null && roleId != '00000000-0000-0000-0000-000000000000' && roleId != '')
        req += " INNER JOIN aspnet_UsersInRoles ON aspnet_Users.UserId = aspnet_UsersInRoles.UserId WHERE aspnet_UsersInRoles.RoleId = '" + roleId + "'";

    var jUsers = new Array();

    var stmtusers = sql.query(conn_str, req, function (err, users) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < users.length; i++) {
            jUsers.push({
                UserId:         users[i].UserId,
                UserName:       users[i].UserName,
                Comment:        users[i].Comment,
                UserMail:       users[i].Email,
                DateCreate:     new Date(users[i].CreateDate),     
                LastLog:        new Date(users[i].LastLoginDate),   
                LastActivity:   new Date(users[i].LastActivityDate),
                IsLocked:       users[i].IsLockedOut,
                IsApproved:     users[i].IsApproved,
                IsAnonymous:    users[i].IsAnonymous,
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jUsers });
    });
});
webmat.get('/getLogsUsers', function (request, response) {
    var dtPeriode = request.query.dperiode.split(' - ');
    var dtPeriodeS = dtPeriode[0]; var dtPeriodeE = dtPeriode[1];
    dtPeriodeStr = " AND (CONVERT(datetime, DateCnx, 103) BETWEEN CONVERT(datetime, '" + dtPeriodeS + " 00:00:00', 103) AND CONVERT(datetime, '" + dtPeriodeE + " 23:59:59', 103))";

    var req = "SELECT UserName, Module, DateCnx, Navigateur";
    req += " FROM T_UsersCnx";
    req += " WHERE ID >= 0 " + dtPeriodeStr;

    var jLogs = new Array();

    var stmtlogs = sql.query(conn_str, req, function (err, logs) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < logs.length; i++) {
            jLogs.push({
                User:       logs[i].UserName,
                Module:     logs[i].Module,
                Navigateur: logs[i].Navigateur,
                DateLog:    new Date(new Date(logs[i].DateCnx).getTime() + (new Date(logs[i].DateCnx).getTimezoneOffset() * 60000))
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jLogs });
    });
});

webmat.get('/getParcRame', function (request, response) {
    var StfId       = request.query.IdStf;
    var SerieId     = request.query.IdSerie;
    var SousSerieId = request.query.IdSousSerie;

    var jRetours = new Array();

    var query = "SELECT T_SNCF_Rames.ID, RTRIM(T_SNCF_STF.STF) AS STF, RTRIM(T_SNCF_Séries.Série) AS Serie, RTRIM(T_SNCF_SousSéries.SousSérie) AS SousSerie, RTRIM(T_SNCF_Rames.EAB) AS EAB, RTRIM(T_SNCF_Rames.CodeSerie) AS CS, T_SNCF_STF.StfIdRM, T_SNCF_Rames.IdRexmat, T_SNCF_Rames.IdSerieRm, T_SNCF_Rames.IdSousSerieRm,  RTRIM(T_SNCF_Rames.OsmStf) AS OsmStf, RTRIM(T_SNCF_Rames.OsmEF) AS OsmEF, RTRIM(T_SNCF_Rames.OsmSerieId) AS OsmSerieId ";
    query += "FROM T_SNCF_Rames INNER JOIN ";
    query += "T_SNCF_Séries ON T_SNCF_Rames.IdSérie = T_SNCF_Séries.ID LEFT OUTER JOIN ";
    query += "T_SNCF_STF ON T_SNCF_Rames.IdSTF = T_SNCF_STF.ID LEFT OUTER JOIN ";
    query += "T_SNCF_SousSéries ON T_SNCF_Rames.IdSousSérie = T_SNCF_SousSéries.ID ";
    query += " WHERE T_SNCF_Rames.ID > 0 ";
    if (StfId > 0)          query += " AND T_SNCF_Rames.IdSTF = " + StfId;
    if (SerieId > 0)        query += " AND T_SNCF_Rames.IdSérie = " + SerieId;
    if (SousSerieId > 0)    query += " AND T_SNCF_Rames.IdSousSérie = " + SousSerieId;

    query += " ORDER BY T_SNCF_Rames.EAB";

    //console.log(query);

    var stmt = sql.query(conn_str, query, function (err, retours) {
        if (err) { console.log('database error:' + err); return; }
        for (var i = 0; i < retours.length; i++) {
            jRetours.push({
                ID:             retours[i].ID,
                STF:            retours[i].STF,
                Serie:          retours[i].Serie,
                SousSerie:      retours[i].SousSerie == null ? "" : retours[i].SousSerie,
                EAB:            retours[i].EAB,
                CS:             retours[i].CS,
                StfIdRM:        retours[i].StfIdRM,
                IdRexmat:       retours[i].IdRexmat,
                IdSerieRm:      retours[i].IdSerieRm,
                IdSousSerieRm:  retours[i].IdSousSerieRm,
                OsmStf:         retours[i].OsmStf,
                OsmEF:          retours[i].OsmEF,
                OsmSerieId:     retours[i].OsmSerieId
            });
        }
        response.setHeader('Access-Control-Allow-Origin', '*'); //--- important
        response.setHeader('Access-Control-Allow-Methods', ['OPTIONS', 'GET', 'POST']);
        response.type('json');
        response.status(200).jsonp({ "data": jRetours });
    });

});

webmat.get('/ImportDataSemelle', function (request, response) {
});

webmat.listen(port);
console.log('App listening on port ' + port);

