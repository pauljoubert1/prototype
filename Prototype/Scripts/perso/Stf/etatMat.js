$(function () {
    var StfSelected = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD", CodeSecteur: "CLD" };
    var stfS = [];
    var tabAllRame = [];
    var tabEtatMatGrf = [];
    var tabEtatMatOsm = [];
    var tabEtatMat = [];
    var tabToRemoveIdR = [];
    var tabToRemoveDtA = [];
    var dataEtatMat = [];
    var tblSR = []; 
    var nameTbl = "";
    var tblConf = [];
    var _currentRame = '';
    var _currentPlanifId = 0; rowInd = 0; 
    var _dtprev = moment();
    var _tblObjectif = []; _tbRef = [];
    var _siteSelected = 0; _site = '';
    var seriesChart = []; categChart = [];
    var _dataChartFoPdf = { serie: [], category: [] };
    var lstRamesEnt = [];

    var optionsChart = {
        lang: { noData: "Aucune donnée disponible..." },
        navigation: { buttonOptions: { enabled: true, symbolStroke: 'blue', text: 'Export' }, menuItemStyle: { fontWeight: 'normal', background: 'none' }, menuItemHoverStyle: { fontWeight: 'bold', background: 'none', color: 'black' } },
        noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } },
        chart: { renderTo: 'container', type: 'spline', backgroundColor: '#DCDCDC', width: null, height: null, plotShadow: true },
        yAxis: [{ title: { text: '' } }],
        xAxis: {
            tickInterval: 1, categories: [], plotLines: [{
                color: 'red',          // Color value
                dashStyle: 'longdashdot',  // Style of the plot line. Default to solid
                value: 9,              // Value of where the line will appear
                width: 2               // Width of the line    
            }]
        },
        title: { text: "" }, credits: { enabled: false }
    };
    
    var optionsGauge = {
        chart: { renderTo: 'ctnGauge', type: 'solidgauge' },
        title: { text: "" }, credits: { enabled: false },
        pane: {
            center: ['50%', '85%'], size: '140%', startAngle: -90, endAngle: 90,
            background: { backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE', innerRadius: '60%', outerRadius: '100%', shape: 'arc' }
        },
        tooltip: { enabled: false },
        yAxis: {
            stops: [
                [0.1, '#55BF3B'],   // green
                [0.4, '#DDDF0D'],   // yellow
                [0.5, '#DF5353']    // red
            ],
            lineWidth: 0, minorTickInterval: null, tickAmount: 2, title: {  y: -70 },  labels: { y: 16 }
        },
        plotOptions: { solidgauge: { dataLabels: { y: 5, borderWidth: 0, useHTML: true } } }
    };

    // Init
    $('#etatmProcessing').css('display', 'block');
    $.when(InitAsp()).then(function (_init) {
        stfS = _init.AllStfs;
        var iStfPref = parseInt(_init.STFpref);
        $.each(stfS, function (i, item) { $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>'); }); $('#stfsList').selectpicker('refresh');

        if (iStfPref == 0) { $('#stfsList').selectpicker('val', "1"); }
        else {
            GetFilterTable(stfS, 'ID', iStfPref).then(function (stfFilter) {
                StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
                $('#stfsList').selectpicker('val', stfFilter[0].ID);
            })
        }
        $('#stfsList').selectpicker('refresh');

        $.getJSON("http://localhost:3000/getRameReformebyStf", { idStf: StfSelected.ID, date: moment().format('YYYY-MM-DD 00:00:00') })
            .done(function (json) {
                if (json.NbRows == 1) {
                    var _tblTmp = json.data[0].Immob.split('|');
                    $.each(_tblTmp, function (i, item) { lstRamesEnt.push({ Rame: item.split('/')[0], Site: item.split('/')[1], Code: item.split('/')[2] }); });
                }
            });

        getConfigEtatM(); getRames(); getSitesReal();
        TraceUser("V3. Etat-Mat", _init.UserInfo.username, moment().format('YYYY-MM-DD HH:mm:ss'));
    })
    // Fin Init

    /* bootstrap multi-select */
    $('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });
    $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' });
    $('#srsList').selectpicker({ style: 'btn-primary', size: 'auto', width: '100%', dropupAuto: false, title: 'Site...' });

    /* onChange stf */
    $('#stfsList').change(function () {
        $('#_tabHeader').empty();
        $('#_tabContent').empty();
        optionsChart.series = [];
        chart = new Highcharts.Chart(optionsChart);

        dataEtatMat = [];
        $('#etatmProcessing').css('display', 'block');
        GetFilterTable(stfS, 'ID', parseInt($('#stfsList').val())).then(function (stfFilter) {
            StfSelected = { ID: stfFilter[0].ID, STF: stfFilter[0].STF, IdStfRm: stfFilter[0].IdStfRm, OsmStf: stfFilter[0].OsmStf, CodeSecteur: stfFilter[0].CodeSecteur };
            $('#stfsList').selectpicker('val', stfFilter[0].ID);

            $.getJSON("http://localhost:3000/getRameReformebyStf", { idStf: StfSelected.ID, date: moment().format('YYYY-MM-DD 00:00:00') })
            .done(function (json) {
                if (json.NbRows == 1) {
                    var _tblTmp = json.data[0].Immob.split('|');
                    $.each(_tblTmp, function (i, item) { lstRamesEnt.push({ Rame: item.split('/')[0], Site: item.split('/')[1], Code: item.split('/')[2] }); });
                }
                getConfigEtatM(); getRames(); getSitesReal();
            });
        });
    });
    /* onChange site */
    $('#srsList').change(function (event) {
        var _siteSelected = parseInt(event.target.value);
        if (_siteSelected > 0) {
            $('#btnValidPlanif')[0].innerHTML = 'Valider la planification';
            $('#btnValidPlanif')[0].className = 'btn btn-success';
        }
    });
    // Validation Planification
    $('#btnValidPlanif').on('click', function () {
        var _ind = _.findIndex(tabEtatMat, function (o) { return o.ID == _currentPlanifId });
        if (_ind > -1) {
            _siteSelected = parseInt($('#srsList').val());
            _site = _.filter(tblSR, ['ID', _siteSelected])[0].SR;
            var _dt = new Date(new Date(_dtprev).getTime() + (new Date(_dtprev).getTimezoneOffset() * 60000));
            // MAJ du dataTable et du tableau tabEtatMat
            tabEtatMat[_ind].DatePrev = moment(_dtprev).format('DD/MM/YYYY'); etatmTble.cell(rowInd, 8, { order: 'applied' }).data(_dtprev).draw();
            tabEtatMat[_ind].Vac = $('#vacJ').is(':checked') ? 1 : 2; etatmTble.cell(rowInd, 9, { order: 'applied' }).data($('#vacJ').is(':checked') ? 'Jour' : 'Nuit').draw();
            tabEtatMat[_ind].CommentPrev = $('#txtComment').val();
            tabEtatMat[_ind].SR = _site; etatmTble.cell(rowInd, 10, { order: 'applied' }).data(_site).draw();

            // Ajout en BDD
            var _add = AddPlanif(_currentPlanifId, _siteSelected, $('#vacJ').is(':checked') ? 1 : 2, moment(_dtprev).format('DD/MM/YYYY'), $('#txtComment').val());

        }
        // Ferme la modal
        $('#modalDetail').modal('hide');
        // MAJ du graph
        loadChart();
    });

    function getSitesReal() {
        $('#srsList').get(0).options.length = 0;

        $.getJSON("http://localhost:3000/getSiteReals", { IdStf: StfSelected.ID }).done(function (json) {
            tblSR = json.data;
            $.each(tblSR, function (i, item) { $('#srsList').append('<option value ="' + item.ID + '">' + item.SR + '</option>'); });
            $('#srsList').selectpicker('refresh');
        });
    }
    function getConfigEtatM() {
        var dRef;
        categChart = []; _tbRef = []; seriesChart = [];
        for (var j = -9; j <= 7; j++) {
            if (j < 1) {
                dRef = moment().subtract(-j, 'day');
                dRef = moment({ y: dRef.year(), M: dRef.month(), d: dRef.date(), h: 6, m: 0, s: 0 });
                _tbRef.push(dRef);
            }
            else { dRef = moment().add(j, 'day'); }

            categChart.push(moment(dRef).format("DD/MM"));
        }

        $.getJSON("http://localhost:3000/getLibEtatMbyStf", { idStf: StfSelected.ID }).done(function (json) { tblConf = json; });
        $.getJSON("http://localhost:3000/getObjectifByStf", { IdStf: StfSelected.ID }).done(function (_objs) {
            _tblObjectif = _objs; 
            $.each(_objs.data, function (i, _obj) {
                seriesChart.push({
                    name: _obj.LibGroup, color: _obj.color,
                    data: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }],
                    dashStyle: 'solid',
                    zoneAxis: 'y', zones: [{ value: _obj.Objectif, color: _obj.color }, { color: _obj.colorOut }]
                },
                {
                    name: _obj.LibGroup + '_prev', color: _obj.color,
                    data: [{ x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 }, { x: 12, y: 0 }, { x: 13, y: 0 }, { x: 14, y: 0 }, { x: 15, y: 0 }, { x: 16, y: 0 }],
                    dashStyle: 'dot',
                    zoneAxis: 'y', zones: [{ value: _obj.Objectif, color: _obj.color }, { color: _obj.colorOut }]
                });
            });
        });
    }
    function getRames() {
        $.when(util_GetRames(0, StfSelected.ID, 0, 0, '', '')).then(function (_rames) { tabAllRame = _rames.data; getEtatMat(); });
    }
    function getEtatMat() {
        $.getJSON("http://localhost:3000/getEtatMbyStf", { idStf: StfSelected.ID, clos: 0, deleted: 0 })
            .done(function (json) {
                // Alimenttion des 2 tableaux de l'ETat Mat : Source OSm et Source Grf
                tabEtatMatOsm = json.Osm; tabEtatMatGrf = json.Grf;
                tabToRemoveIdR = []; tabToRemoveDtA = [];
                // Mise à jour du tableau tabEtatMatGrf en supprimant celles qui sont amorties depuis le dernier enregistrement.
                GetUniqOfTable(tabEtatMatGrf, 'SourceId').then(function (_tabIdRest) {
                    $.ajax({
                        // Récup des Restrictions GRIFFE inclues dans l'EtatM
                        type: "POST", contentType: "application/json", url: "GetRestrictionsSsCtrl",
                        data: JSON.stringify({ lstIdRest: _tabIdRest }),
                        success: function (rests) {
                            var _NbRest = rests.length;
                            $.each(rests, function (i, rest) {
                                GetFindIndexTable(tabEtatMatGrf, 'SourceId', rest.IdRest).then(function (_index) {
                                    // Si la Restriction est amortie, on supprime de l'etatM
                                    if (_index > -1) {
                                        if (rest.Amorti) {
                                            tabEtatMatGrf.splice(_index, 1);                                                        // Rest Amortie, on supprime donc du tableau
                                            tabToRemoveIdR.push(rest.IdRest);                                                       // Alimente (Avec IdRest) le tableau de cloture pour maj de la BDD
                                            tabToRemoveDtA.push(moment(rest.DateAmortissement, 'x').format('DD/MM/YYYY HH:mm'));    // Alimente (Avec IdRest) le tableau de cloture pour maj de la BDD
                                        }
                                        else { // Restriction non amortie...
                                            tabEtatMatGrf[_index].SourceDate = moment(rest.DatePose);   // Complète l'information avec les info de la restriction actuelle (Info Temps Réel)
                                            tabEtatMatGrf[_index].Comment = rest.CommentaireTotal;      // Complète l'information avec les info de la restriction actuelle (Info Temps Réel)
                                            tabEtatMatGrf[_index].poseur = rest.LogPoseur;              // Complète l'information avec les info de la restriction actuelle (Info Temps Réel)
                                            tabEtatMatGrf[_index].localisation = rest.Localisation;     // Complète l'information avec les info de la restriction actuelle (Info Temps Réel)
                                        }
                                    }
                                });
                            });

                            // Regroupement des 2 tableaux OSM et GRF avec le tableau tabEtatMatGrf mise à jour ci dessus
                            tabEtatMat = tabEtatMatOsm.concat(tabEtatMatGrf);

                            $.when(Enumerable.From(tabEtatMat).GroupBy(function (p) { return p.Lib }).Select(function (p) { return { Key: p.Key(), Nb: p.source.length, Contents: p.source } }).ToArray()).then(function (_group) {
                                $.each(_group, function (i, itemLib) {
                                    /*  Elaboration des Contrôles  */
                                    itemLib.Key = itemLib.Key.replace(' ', '_');
                                    var _li = ""; _div = "";
                                    if (i == 0)
                                        _li = "<li role='presentation' class='active'><a href='#" + itemLib.Key + "' aria-controls='" + itemLib.Key + "' role='tab' data-toggle='tab'>" + itemLib.Key + "&emsp;<span class='bdgEM'>" + itemLib.Nb + "</span></a></li>";
                                    else
                                        _li = "<li role='presentation'><a href='#" + itemLib.Key + "' aria-controls='" + itemLib.Key + "' role='tab' data-toggle='tab'>" + itemLib.Key + "&emsp;<span class='bdgEM'>" + itemLib.Nb + "</span></a></li>";
                                    $('#_tabHeader').append(_li);
                                    if (i == 0)
                                        _div = "<div role='tabpanel' class='tab-pane fade in active' id='" + itemLib.Key + "'></div>";
                                    else
                                        _div = "<div role='tabpanel' class='tab-pane fade' id='" + itemLib.Key + "'></div>";
                                    $('#_tabContent').append(_div);
                                    if (i == 0) {
                                        nameTbl = itemLib.Key;
                                        dataEtatMat = itemLib.Contents;
                                        var _tbl = "<table id='tbl" + itemLib.Key + "' class='table table-striped table-bordered table-hover' style='width: 100%;'><thead><tr>";
                                        _tbl += "<th><span style='margin-left:10px;' class='glyphicon glyphicon-zoom-in btn-primary' aria-hidden='true'></span></th>";
                                        _tbl += "<th>Source</th><th>Rame</th><th>Poseur</th><th>Date Pose</th><th>Item</th><th>Commentaire</th><th>Nb. J</th><th>Prévision</th><th>Vac</th><th>Site</th></tr></thead></table>";
                                        $('#' + itemLib.Key).append(_tbl);
                                    }
                                    /*  Elaboration des Contrôles  */
                                });

                                loadData(dataEtatMat, "tbl" + nameTbl.trim());
                                loadChart(); loadGauge();
                                $('#etatmProcessing').css('display', 'none');

                                // change active tab
                                $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                                    tabActive = e.target.firstChild.data.trim(); //e.target.textContent.trim(); // newly activated tab
                                    var nodes = document.getElementById(tabActive);
                                    if (nodes) while (nodes.firstChild) nodes.removeChild(nodes.firstChild);

                                    var _tbl = "<table id='tbl" + tabActive + "' class='table table-striped table-bordered table-hover' style='width: 100%;'><thead><tr>";
                                    _tbl += "<th><span style='margin-left:10px;' class='glyphicon glyphicon-zoom-in btn-primary' aria-hidden='true'></span></th>";
                                    _tbl += "<th>Source</th><th>Rame</th><th>Poseur</th><th>Date Pose</th><th>Item</th><th>Commentaire</th><th>Nb. J</th><th>Prévision</th><th>Vac</th><th>Site</th></tr></thead></table>";
                                    $('#' + tabActive).append(_tbl);

                                    var libOrigine = tabActive.replace('_', ' ');
                                    $.when(GetFilterTable(tabEtatMat, 'Lib', libOrigine)).then(function (_dataSelect) { loadData(_dataSelect, "tbl" + tabActive); });
                                });
                            });
                            //Clos les EtatMat Amortie
                            if (tabToRemoveIdR.length > 0)
                                $.getJSON("http://localhost:3000/CloseEtatMbyIds", { Ids: tabToRemoveIdR.join(','), Dts: tabToRemoveDtA.join(','), Source: 'GRF' })
                                    .done(function (json) { tabToRemoveIdR = []; tabToRemoveDtA = []; }).fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Error On CloseEtatM: " + err); });
                        },
                        error: function (e) { $('#etatmProcessing').css('display', 'none'); alert("Erreur GetRestrictionsSsCtrl" + "\r\n" + e.error); }

                    });
                });
            });
    }

    function loadData(data, tbl) {
        etatmTble = $('#' + tbl)
            .on('error.dt', function (e, settings, techNote, message) { $('#etatmProcessing').css('display', 'none'); alert(message); })
            .on('draw.dt', function () {
                //$('#etatmProcessing').css('display', 'none');
            })
            .DataTable({
                dom: 'irf<t>p',
                processing: true,
                deferRender: true,
                jQueryUI: true,
                paging: false,
                order: [[2, "asc"]],
                language: languageOptions,
                data: data,
                columns: [
                    { data: null, className: 'dtTables-details', orderable: false, defaultContent: '<i class="fa fa-lg"></i>' },
                    { data: "Source", searchable: true, orderable: true },
                    { data: null, searchable: true, orderable: true, render: function (data, type, full, meta) { return tabAllRame.filter(function (item) { return item.ID == full.RameId })[0].EAB; } },
                    { data: "poseur", searchable: true, orderable: true },
                    {
                        data: "SourceDate", orderable: true, className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) {
                            if (full.Source == 'GRF') return data == null ? null : moment(data, 'x').format('DD/MM/YYYY HH:mm');
                            else return data == null ? null : moment(data).format('DD/MM/YYYY HH:mm');
                        }
                    },
                    { data: "localisation", searchable: true, orderable: true },
                    { data: "Comment", searchable: true, orderable: true },
                    {
                        data: null, orderable: true, searchable: false,
                        render: function (data, type, full, meta) {
                            var nbjour = full.SourceDate == null ? '?' : moment().diff(moment(full.SourceDate), 'days');
                            if (nbjour != '?') {
                                var _intNbJour = parseInt(nbjour);
                                switch (true) {
                                    case (_intNbJour < 1):
                                        return '<span class="bdgYellowEM">' + _intNbJour + '</span>';
                                        break;
                                    case (_intNbJour > 0 && _intNbJour < 10):
                                        return '<span class="bdgOrangeEM">' + _intNbJour + '</span>';
                                        break;
                                    case (_intNbJour > 9 && _intNbJour < 15):
                                        return '<span class="bdgRedEM">' + _intNbJour + '</span>';
                                        break;
                                    case (_intNbJour > 14):
                                        return '<span class="bdgBlackEM">' + _intNbJour + '</span>';
                                        break;
                                    default:
                                        return nbjour;
                                        break;
                                }
                            }
                        }
                    },
                    { data: "DatePrev", searchable: true, orderable: true, className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return data == null ? null : moment(data).format('DD/MM/YYYY'); } },
                    { data: "Vac", searchable: true, orderable: true },
                    { data: "SR", searchable: true, orderable: true }
                ],
                drawCallback: function (settings) { },
                createdRow: function (row, data, index) { }
            });
        $('#' + tbl + ' tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr'); var row = etatmTble.row(tr); rowData = row.data(); rowSelect = row; rowInd = row.index();
            _currentRame = tr[0].children[2].innerHTML.trim(); _currentPlanifId = rowData.ID;
            
            $('#modalDetail').modal({ keyboard: true, backdrop: 'static', show: true });

        });
    }

    function loadChart() {
        optionsChart.xAxis.categories = categChart; optionsChart.series = seriesChart;
        chart = new Highcharts.Chart(optionsChart);
        $.getJSON("http://localhost:3000/getdataChartPass", { IdStf: StfSelected.ID, dtDebut: moment().subtract(9, 'day').format('YYYY-MM-DD 00:00:00') })
       .done(function (json) {
           $.each(categChart, function (j, _jour) {
               // De J-9 à J
               if (j <= 9) {
                   // Premier filtre par rapport à la date de Référence
                   $.when(json.data.filter(function (x) { return (x.Clos && moment(x.DtClos) > _tbRef[j] && moment(x.DtSource) <= _tbRef[j]) || (!x.Clos && moment(x.DtSource) <= _tbRef[j]) }))
                    .then(function (_tabJour) {
                        $.each(_tblObjectif.data, function (ob, _obj) {
                            // Second filtre par rapport au groupe d'Item (BM/TV/etc...)
                            $.when(_tabJour.filter(function (y) { return y.Group.trim() == _obj.LibGroup })).then(function (_tab) {
                                optionsChart.series[ob * 2].data[j].y = _tab.length;
                                if (j == 9) {
                                    optionsChart.series[ob * 2 + 1].data[0].y = _tab.length;
                                }
                            });
                        });
                    });
               }
                   // Prévisions De J+1 à J+7
               else {
                   $.when(tabEtatMat.filter(function (x) { return x.Group.trim().length > 0 && moment(x.DatePrev).format("DD/MM") == _jour })).then(function (_tabPrev) {
                       $.each(_tblObjectif.data, function (ob, _obj) {
                           $.when(_tabPrev.filter(function (x) { return x.Group.trim() == _obj.LibGroup })).then(function (_tab) {
                               optionsChart.series[ob * 2 + 1].data[j - 9].y = optionsChart.series[ob * 2 + 1].data[j - 10].y - _tab.length;
                               if (j == 16 && ob == _tblObjectif.NbRows - 1) {
                                   chart = new Highcharts.Chart(optionsChart);
                                   _dataChartFoPdf = { series: optionsChart.series, category: categChart };
                                   $.ajax({
                                       type: "POST",
                                       url: "setPdf",
                                       data: JSON.stringify({ model: _dataChartFoPdf }),
                                       contentType: "application/json; charset=utf-8",
                                       dataType: "html",
                                       success: function (msg) { $('#btn-etatmToPdf').prop('disabled', false); },
                                       error: function (err) { }
                                   });
                                   $('#etatmProcessing').css('display', 'none');
                               }
                           });
                       });
                   });
               }
           });
       });
        
    }
    function loadGauge() {
        // Add Containe pour chaque Item
        $('#ctnGauge').empty();
        var _div = "";
        $.getJSON("http://localhost:3000/getdataChartPass", { IdStf: StfSelected.ID })
       .done(function (json) {
           $.each(_tblObjectif.data, function (i, _obj) {
               $.when(json.data.filter(function (x) { return x.Group.trim() == _obj.LibGroup })).then(function (_dataNow) {
                   _div = '<div id="container-' + _obj.LibGroup + '" style="width: 300px; height: 200px; float: left"></div>';
                   $('#ctnGauge').append(_div);
                   $('#container-' + _obj.LibGroup).highcharts(Highcharts.merge(optionsGauge, {
                       yAxis: { min: 0, max: _obj.Objectif * 2, title: { text: _obj.LibGroup } },
                       credits: { enabled: false },
                       series: [{
                           name: _obj.LibGroup, data: [_dataNow.length],
                           dataLabels: {
                               format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                                   ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' + '<span style="font-size:12px;color:silver">Obj. : ' + _obj.Objectif + '</span></div>'
                           },
                           //tooltip: { valueSuffix: ' km/h' }
                       }]
                   }));
               });
           });
       })
    }

    function AddPlanif(idEtatM, idSr, vac, dtPlanif, comment) {
        return $.getJSON("http://localhost:3000/setPlanif", { IdEtatM: idEtatM, IdSr: idSr, DtPlanif: dtPlanif, Vac: vac, Comment: comment.trim() })
           .done(function (json) { }).fail(function (jqxhr, textStatus, error) { });
    }

    // Activation du DatePicker
    $('.date-picker-icon').on('click', function () {
        var data = $(this).data('input-name');
        $('input[name="' + data + '"]').focus();
    });

    $('#modalDetail').on('show.bs.modal', function (event) {
        $('.modal,.modal-backdrop').addClass('toPrint');
        $('body').addClass('non-print');

        $('#srsList').get(0).options.length = 0;
        $.each(tblSR, function (i, item) { $('#srsList').append('<option value ="' + item.ID + '">' + item.SR + '</option>'); });
        $('#srsList').selectpicker('refresh');
        $('#btnValidPlanif')[0].innerHTML = 'Attente Choix du site...';
        $('#btnValidPlanif')[0].className = 'btn btn-primary';

        _dtprev = moment();
        $('#dtPrev').daterangepicker({ locale: localType, singleDatePicker: true, showDropdowns: true, startDate: moment(), showWeekNumbers: true, minDate: moment() });
        $('#dtPrev').on('apply.daterangepicker', function (ev, picker) { _dtprev = moment(picker.startDate); });
        $('#modalDetailLabel')[0].textContent =_currentRame + ' - Planification de la Restricion ...';
        GetRlt();
    });

    $('#tblRltTable').on('processing.dt', function (e, settings, processing) { $('#tblRltProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsRltTable = {
        dom: '<t>',
        processing: true,
        deferRender: true,
        jQueryUI: true,
        order: [[3, "asc"]],
        paging: false,
        language: languageOptions,
        ajax: { url: "DetailEtatMjson", data: function (d) { d.stfId = StfSelected.ID; d.rame = _currentRame; } },
        columns: [
            { data: "NumTrain" }, { data: "Nature" }, { data: "Depart" },
            { data: "DateDepart", className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } },
            { data: "Arrivee" },
            { data: "DateArrivee", className: "clsWrap", type: 'date-euro', render: function (data, type, full, meta) { return moment(data, "x").format('DD/MM/YYYY HH:mm'); } }
        ],
        createdRow: function (row, data, index) { if (data.rowSelected) { $('td', row).addClass("RltSelect"); } }
    };

    var GetRlt = function () {
        if (typeof _outTable != 'undefined') { _outTable.destroy(); } // destroy table if exist
        _outTable = $('#tblRltTable').on('xhr.dt', function (e, settings, json, xhr) {
            //$('#_i_refresh').removeClass("fa-spin");
            $('#_idpgh')[0].textContent = 'PGH : ' + json.pgh;
            $('#_idRlt')[0].textContent = 'Roulement... : ' + json.cheminRame;
        }).DataTable(optionsRltTable);
    }


});