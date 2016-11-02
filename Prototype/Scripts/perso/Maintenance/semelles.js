$(function () {
    var STFs            = [];
    var userName        = "";
    var RameSelected    = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
    var StfSelected     = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
    var _SaisieValide   = false;
    var _tabMotrice     = ['I', 'P'];
    var _tabNumBogie    = [1, 2];
    var _lstSites       = [];
    var _lstIntervs     = [];
    var _lstTracas      = [];
    var tbRames         = [];
    var tbParamUsure    = [];
    var currentTracaId  = 0;
    var IdCrtl          = 0;
    var currentCtrl     = {};
    var zImpaire        = "";
    var zPaire          = "";
    var boolTracaPrete  = false;


    var _Controle = { ZP: "", ZI: "", LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", kmzib1: 0, kmzib2: 0, kmzpb1: 0, kmzpb2: 0, MessBM: "" };
    var _LastDate = { LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", LastIdZIB1: "", LastIdZIB2: "", LastIdZPB1: "", LastIdZPB2: "" };
    var _LastZIB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
    var _LastZIB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
    var _LastZPB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
    var _LastZPB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };

    var _EstimZIB1 = { estR1: 0, estR2: 0, estR3: 0, estR4: 0, estMiniR1: 0, estMiniR2: 0, estMiniR3: 0, estMiniR4: 0 };
    var _EstimZIB2 = { estR1: 0, estR2: 0, estR3: 0, estR4: 0, estMiniR1: 0, estMiniR2: 0, estMiniR3: 0, estMiniR4: 0 };
    var _EstimZPB1 = { estR1: 0, estR2: 0, estR3: 0, estR4: 0, estMiniR1: 0, estMiniR2: 0, estMiniR3: 0, estMiniR4: 0 };
    var _EstimZPB2 = { estR1: 0, estR2: 0, estR3: 0, estR4: 0, estMiniR1: 0, estMiniR2: 0, estMiniR3: 0, estMiniR4: 0 };

    var _zib1Ok = false; _zib2Ok = false; _zpb1Ok = false; _zpb2Ok = false;
    var _RecupZIB1 = false; _RecupZIB2 = false; _RecupZPB1 = false; _RecupZPB2 = false;

    var CtrlBuild = { userName: "", rame: "", site: "", interv: "", ctrl: _Controle, zib1: _LastZIB1, zib2: _LastZIB2, zpb1: _LastZPB1, zpb2: _LastZPB2, estimzib1: _EstimZIB1, estimzib2: _EstimZIB2, estimzpb1: _EstimZPB1, estimzpb2: _EstimZPB2 };
    var _Traca = { ID: 0, DtCreate: "", StfId: 0, SerieId: 0, CreateBy: "", Rame: "", Site: "", Interv: "", Title: "", MessageBM: "", ZIB1: "", ZIB2: "", ZPB1: "", ZPB2: "" };

    // Config STF par défaut, Roles de l'user, Stfs de l'user
    function RootSet() {
        $('#RameInput').css('disabled', true)
        $.getJSON("/Home/GetStfPreference")
            .done(function (json) {
                STFs        = json.Stfs;
                RolesUser   = json.RolesUser;
                StfsUser    = json.StfsIdUser;
                STfPrefUser = json.iStfSelect;
                userName    = json.UserName;

                CtrlBuild.userName = userName;

                if (json.iStfSelect == "0") StfSelected = { ID: 1, STF: "STF D/R", IdStfRm: 2, OsmStf: "SLD" };
                else {
                    var tabFilter = json.Stfs.filter(function (item) { return item.ID == json.iStfSelect });
                    StfSelected = { ID: tabFilter[0].ID, STF: tabFilter[0].STF, IdStfRm: tabFilter[0].IdStfRm, OsmStf: tabFilter[0].OsmStf };
                }

                // Alimentation du SelectPicker stfsList...
                $('#stfsList').get(0).options.length = 0;
                $.each(STFs, function (i, item) {
                    if (!item.ModSemelle || $.inArray(item.ID, StfsUser) < 0)   $('#stfsList').append('<option value ="' + item.ID + '" disabled="disabled">' + item.STF + '</option>');
                    else                                                        $('#stfsList').append('<option value ="' + item.ID + '">' + item.STF + '</option>');
                });
                $('#stfsList').selectpicker('refresh'); $('#stfsList').selectpicker('val', StfSelected.ID);

                GetSeriesByStf();
                getSites();
                getInterventions();
                getCrtlSemelle();
                getTraca();

            }).fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Ereur Recup Stf Default: " + err); });
    }
    function getSites() {
        $.getJSON("http://localhost:3000/getSitesSemelle", { stfId: StfSelected.ID })
        .done(function (_sites) {
            _lstSites = _sites;

            $('#sites').get(0).options.length = 0;
            $('#sites').append('<option value ="0">Site...</option>');
            $.each(_sites, function (i, item) { $('#sites').append('<option value ="' + item.ID + '">' + item.Site + '</option>'); });
            $('#sites').selectpicker('refresh');
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Erreur Récupération Sites : " + err);
        });
    }
    function getInterventions() {
        $.getJSON("http://localhost:3000/getIntervSemelle", { stfId: StfSelected.ID })
            .done(function (_intervs) {
                _lstIntervs = _intervs;

                $('#inters').get(0).options.length = 0;
                $('#inters').append('<option value ="0">Intervention...</option>');
                $.each(_intervs, function (i, item) { $('#inters').append('<option value ="' + item.ID + '">' + item.Interv + '</option>'); });
                $('#inters').selectpicker('refresh');
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Erreur Récupération Interventions : " + err);
            });
    }
    function GetParamUsure() {
        tbParamUsure = [];
        $.getJSON("http://localhost:3000/getLoiUsure", { stfId: StfSelected.ID })
            .done(function (_param) {
                $.each(_param, function (key, param) {
                    tbParamUsure.push({ IdSerie: param.SerieId, IdSousSerie: param.SousSerieId, BMiso: param.BmIso, BMes: param.BmEs, Max3SigBmIso: param.Max3SigBmIso, Max3SigBmEs: param.Max3SigBmEs });
                });
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Erreur Paramètre Usure : " + err);
            });
    }
    function GetSeriesByStf() {
        // Récupération des paramètre Usure pour la STF sélectionnée...
        GetParamUsure();

        $.getJSON("/Home/GetSeriesByStf", { IDstf: StfSelected.ID })
        .done(function (json) {
            //StfSelected = { ID: json.STF.ID, STF: json.STF.STF, IdStfRm: json.STF.IdStfRm, OsmStf: json.STF.OsmStf };
            //$('#seriesList').get(0).options.length = 0;
            //$('#seriesList').append('<option value ="0">Série...</option>');
            //$.each(json.series, function (i, item) { $('#seriesList').append('<option value ="' + item.ID + '">' + item.Serie + '</option>'); });
            //$('#seriesList').selectpicker('refresh');
            GetSousseriesByStf();
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Ereur Recup Séries : " + err);
        });
    }
    function GetSousseriesByStf() {
        $.getJSON("/Home/GetSousSeriesBySerie", { IDstf: StfSelected.ID, IDserie: 0 })//IDserie: $('#seriesList').val()
        .done(function (json) {
            //$('#sousseriesList').get(0).options.length = 0;
            //$('#sousseriesList').append('<option value ="0">Sous-Série...</option>');
            //$.each(json, function (i, item) { $('#sousseriesList').append('<option value ="' + item.ID + '">' + item.SousSerie + '</option>'); });
            //$('#sousseriesList').selectpicker('refresh');
            getRames();
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Ereur Recup Séries : " + err);
        });
    }
    function getRames() {
        $.getJSON("/Home/GetRames", { IDstf: StfSelected.ID, IDserie: 0, IDsousserie: 0 })
        .done(function (json) {
            tbRames = json;
            $('#RameInput').val('');
            RameSelected = { ID: 0, EAB: "0", NumEF: "0", IdRexM: 0, IdSerie: 0, IdSousSerie: 0, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };

            $('.typeahead-hint, .typeahead-result, .typeahead-filter-button, .typeahead-filter').remove();

            // Récup des Différents IdFlotte pour les requettes Osmose
            //tabFlotteId = _.chain(json.data).pluck('IdFlotteOsm').unique().value();
            tabFlotteId = _.uniq(_.map(json.data, 'IdFlotteOsm'));
            for (var i = 0; i <= tabFlotteId.length - 1; i++) { tabFlotteId[i] = "'" + tabFlotteId[i] + "'"; }

            $.typeahead({
                input: "#RameInput",
                offset: true,
                searchOnFocus: true,
                highlight: true,
                minLength: 1,
                maxItem: 8,
                maxItemPerGroup: 6,
                order: "asc",
                hint: true,
                emptyTemplate: "Aucune rame n'existe avec {{query}}",
                group: ["SousSerie", "Sous-Série : {{group}} "],
                display: ["EAB", "NumEF"],
                template: "{{EAB}}",
                source: json.data,
                //dropdownFilter: tabFilter,
                callback: {
                    onClickAfter: function (node, a, item, event) {
                        RameSelected = item;
                        $('#spRameText').removeClass('error-input');
                        rameselected();
                    },
                    onResult: function (node, query, result, resultCount) { RameSelected = result[0]; },
                    onNavigate: function (node, query, event) {
                        if (event.keyCode == 13) {
                            $("#RameInput").val(RameSelected.EAB);
                            $('#spRameText').removeClass('error-input');
                            rameselected();
                        }
                    }
                }
            });
            $('#RameInput').css('disabled', false)
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });
    }
    function rameselected() {
        boolTracaPrete = false;

        $('#btn-tracaCtrl').prop('disabled', true);
        IdCrtl = 0; currentTracaId = 0; currentCtrl = {};
        $('#btn-editCtrl').prop('disabled', true);  // Desactivation du bouton d'édition
        $('#_LoadData').addClass("fa-spin");    // Lance animation
        _Controle = { ZP: "", ZI: "", LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", kmzib1: 0, kmzib2: 0, kmzpb1: 0, kmzpb2: 0, MessBM: "" };
        _LastDate = { LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", LastIdZIB1: "", LastIdZIB2: "", LastIdZPB1: "", LastIdZPB2: "" };
        _LastZIB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
        _LastZIB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
        _LastZPB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
        _LastZPB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
        _zib1Ok = false; _zib2Ok = false; _zpb1Ok = false; _zpb2Ok = false;
        _RecupZIB1 = false; _RecupZIB2 = false; _RecupZPB1 = false; _RecupZPB2 = false;
        zImpaire = "";
        zPaire = "";
        _SaisieValide = false;

        CtrlBuild.rame = RameSelected.ID + '/' + RameSelected.IdSerie + '/' + RameSelected.IdSousSerie + '/' + RameSelected.EAB;

        $('#_idLegend').text('Récup date derniers Ctrl...');
        // Sur S71P12DMBQX >> dateref:moment().format('DD-MM-YYYY HH:mm:ss') Sinon le SQL retourne Out of mémory...
        $.getJSON("http://localhost:3000/getLastDateCtrlByEab", { rameId: RameSelected.ID, dateRef: moment().format('DD-MM-YYYY HH:mm:ss') })
            .done(function (_lastctrl) {
                _LastDate = {
                    LastDateZIB1: _lastctrl.data.LastDateZIB1 == null ? null : _lastctrl.data.LastDateZIB1.split('-')[0],
                    LastDateZIB2: _lastctrl.data.LastDateZIB2 == null ? null : _lastctrl.data.LastDateZIB2.split('-')[0],
                    LastDateZPB1: _lastctrl.data.LastDateZPB1 == null ? null : _lastctrl.data.LastDateZPB1.split('-')[0],
                    LastDateZPB2: _lastctrl.data.LastDateZPB2 == null ? null : _lastctrl.data.LastDateZPB2.split('-')[0],
                    LastIdZIB1: _lastctrl.data.LastDateZIB1 == null ? 0 : _lastctrl.data.LastDateZIB1.split('-')[1],
                    LastIdZIB2: _lastctrl.data.LastDateZIB2 == null ? 0 : _lastctrl.data.LastDateZIB2.split('-')[1],
                    LastIdZPB1: _lastctrl.data.LastDateZPB1 == null ? 0 : _lastctrl.data.LastDateZPB1.split('-')[1],
                    LastIdZPB2: _lastctrl.data.LastDateZPB2 == null ? 0 : _lastctrl.data.LastDateZPB2.split('-')[1],
                };

                $.each($('#tracas').get(0).options, function (i, item) {
                    if (item.text.split('-')[0].trim() == RameSelected.EAB && item.text.split('-')[1].trim() == moment().format('DD/MM/YY')) {
                        $.alert({
                            theme: 'bootstrap',
                            title: RameSelected.EAB,
                            content: 'Il existe déjà un <strong>Contrôle en Attente</strong> pour cette rame',
                            confirmButton: 'Fermer...',
                            confirmButtonClass: 'btn-primary',
                            icon: 'fa fa-info-circle btn-primary',
                            animation: 'zoom',
                            confirm: function () { }
                        });
                    }
                });

                if (_LastDate.LastDateZIB1 == moment().format('DD/MM/YYYY') || _LastDate.LastDateZIB2 == moment().format('DD/MM/YYYY') || _LastDate.LastDateZPB1 == moment().format('DD/MM/YYYY') || _LastDate.LastDateZPB2 == moment().format('DD/MM/YYYY')) {
                    alert("Un ctrl à déjà été saisi aujourd'hui sur la rame " + RameSelected.EAB);
                    $.alert({
                        theme: 'bootstrap',
                        title: RameSelected.EAB,
                        content: "Un Contrôle semelle existe déjà sur cette rame, saisi aujourd'hui",
                        confirmButton: 'Fermer...',
                        confirmButtonClass: 'btn-primary',
                        icon: 'fa fa-info-circle btn-primary',
                        animation: 'zoom',
                        confirm: function () { }
                    });
                }

                GetLastCtrlOfRame();
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error; alert("Erreur Récupération LastCtrl " + err);
                $('#_LoadData').removeClass("fa-spin");
                $('#RameInput').val('');
            });
    }
    function GetLastCtrlOfRame() {
        _RecupZIB1 = false; _RecupZIB2 = false; _RecupZPB1 = false; _RecupZPB2 = false;
        $.getJSON("http://localhost:3000/getMotricesByRame", { rameId: RameSelected.ID, serieId: RameSelected.IdSerie })
            .done(function (_motrices) {
                zImpaire = _motrices[0].Motrice;
                if (_motrices.length == 2) zPaire = _motrices[1].Motrice;

                var SemNeuve = RameSelected.IdSerie == 2 ? 50 : 60;

                // Get KM depuis dernier ctrl de chaque bogie
                $.getJSON("/Semelle/GetKmBogies", {
                    rame: RameSelected.EAB, RameID: RameSelected.ID, dZiB1: _LastDate.LastDateZIB1, dZiB2: _LastDate.LastDateZIB2, dZpB1: _LastDate.LastDateZPB1, dZpB2: _LastDate.LastDateZPB2,
                    dateRef: moment().format('DD/MM/YYYY')
                })
                    .done(function (json) {
                        // Init de l'object _Controle
                        _Controle = {
                            ZP: zPaire, ZI: zImpaire, MessBM: json.messagebm,
                            LastDateZIB1: _LastDate.LastDateZIB1,
                            LastDateZIB2: _LastDate.LastDateZIB2,
                            LastDateZPB1: _LastDate.LastDateZPB1,
                            LastDateZPB2: _LastDate.LastDateZPB2,
                            kmzib1: json.kmZiB1, kmzib2: json.kmZiB2, kmzpb1: json.kmZpB1, kmzpb2: json.kmZpB2
                        };

                        CtrlBuild.ctrl = _Controle;

                        //Récup des dernier ctrl 
                        $('#_idLegend').text('Récup valeurs derniers Ctrl...');
                        if (_Controle.LastDateZIB1) {
                            $.getJSON("http://localhost:3000/getLastCtrlByID", { id: _LastDate.LastIdZIB1, zb: 'ZIB1' })
                            .done(function (_last_ctrl) {
                                _LastZIB1 = {
                                    BmIso: _last_ctrl.ZIB1_BM_Iso, cvR1: _last_ctrl.ZIB1_R1_VISUEL, cvR2: _last_ctrl.ZIB1_R2_VISUEL, cvR3: _last_ctrl.ZIB1_R3_VISUEL, cvR4: _last_ctrl.ZIB1_R4_VISUEL, rplR1: _last_ctrl.ZIB1_R1_RPL, rplR2: _last_ctrl.ZIB1_R2_RPL, rplR3: _last_ctrl.ZIB1_R3_RPL, rplR4: _last_ctrl.ZIB1_R4_RPL,
                                    mesuR1: _last_ctrl.ZIB1_R1_RPL ? SemNeuve : (_last_ctrl.ZIB1_R1_VISUEL || _last_ctrl.ZIB1_R1_MESURE == 0 ? "..." : _last_ctrl.ZIB1_R1_MESURE),
                                    mesuR2: _last_ctrl.ZIB1_R2_RPL ? SemNeuve : (_last_ctrl.ZIB1_R2_VISUEL || _last_ctrl.ZIB1_R2_MESURE == 0 ? "..." : _last_ctrl.ZIB1_R2_MESURE),
                                    mesuR3: _last_ctrl.ZIB1_R3_RPL ? SemNeuve : (_last_ctrl.ZIB1_R3_VISUEL || _last_ctrl.ZIB1_R3_MESURE == 0 ? "..." : _last_ctrl.ZIB1_R3_MESURE),
                                    mesuR4: _last_ctrl.ZIB1_R4_RPL ? SemNeuve : (_last_ctrl.ZIB1_R4_VISUEL || _last_ctrl.ZIB1_R4_MESURE == 0 ? "..." : _last_ctrl.ZIB1_R4_MESURE),
                                };
                                CtrlBuild.zib1 = _LastZIB1;
                                _RecupZIB1 = true;
                                if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                $('#btn-tracaCtrl').prop('disabled', true);
                                $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Dernier Ctrl ZIB1 : " + err);
                            });
                        }
                        else {
                            _RecupZIB1 = true;
                            if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                        }

                        if (_Controle.LastDateZIB2) {
                            $.getJSON("http://localhost:3000/getLastCtrlByID", { id: _LastDate.LastIdZIB2, zb: 'ZIB2' })
                            .done(function (_last_ctrl) {
                                _LastZIB2 = {
                                    BmIso: _last_ctrl.ZIB2_BM_Iso, cvR1: _last_ctrl.ZIB2_R1_VISUEL, cvR2: _last_ctrl.ZIB2_R2_VISUEL, cvR3: _last_ctrl.ZIB2_R3_VISUEL, cvR4: _last_ctrl.ZIB2_R4_VISUEL, rplR1: _last_ctrl.ZIB2_R1_RPL, rplR2: _last_ctrl.ZIB2_R2_RPL, rplR3: _last_ctrl.ZIB2_R3_RPL, rplR4: _last_ctrl.ZIB2_R4_RPL,
                                    mesuR1: _last_ctrl.ZIB2_R1_RPL ? SemNeuve : (_last_ctrl.ZIB2_R1_VISUEL || _last_ctrl.ZIB2_R1_MESURE == 0 ? "..." : _last_ctrl.ZIB2_R1_MESURE),
                                    mesuR2: _last_ctrl.ZIB2_R2_RPL ? SemNeuve : (_last_ctrl.ZIB2_R2_VISUEL || _last_ctrl.ZIB2_R2_MESURE == 0 ? "..." : _last_ctrl.ZIB2_R2_MESURE),
                                    mesuR3: _last_ctrl.ZIB2_R3_RPL ? SemNeuve : (_last_ctrl.ZIB2_R3_VISUEL || _last_ctrl.ZIB2_R3_MESURE == 0 ? "..." : _last_ctrl.ZIB2_R3_MESURE),
                                    mesuR4: _last_ctrl.ZIB2_R4_RPL ? SemNeuve : (_last_ctrl.ZIB2_R4_VISUEL || _last_ctrl.ZIB2_R4_MESURE == 0 ? "..." : _last_ctrl.ZIB2_R4_MESURE),
                                };
                                CtrlBuild.zib2 = _LastZIB2;
                                _RecupZIB2 = true;
                                if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                $('#btn-tracaCtrl').prop('disabled', true);
                                $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Dernier Ctrl ZIB2 : " + err);
                            });
                        }
                        else {
                            _RecupZIB2 = true;
                            if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                        }

                        if (_Controle.LastDateZPB1) {
                            $.getJSON("http://localhost:3000/getLastCtrlByID", { id: _LastDate.LastIdZPB1, zb: 'ZPB1' })
                            .done(function (_last_ctrl) {
                                _LastZPB1 = {
                                    BmIso: _last_ctrl.ZPB1_BM_Iso, cvR1: _last_ctrl.ZPB1_R1_VISUEL, cvR2: _last_ctrl.ZPB1_R2_VISUEL, cvR3: _last_ctrl.ZPB1_R3_VISUEL, cvR4: _last_ctrl.ZPB1_R4_VISUEL, rplR1: _last_ctrl.ZPB1_R1_RPL, rplR2: _last_ctrl.ZPB1_R2_RPL, rplR3: _last_ctrl.ZPB1_R3_RPL, rplR4: _last_ctrl.ZPB1_R4_RPL,
                                    mesuR1: _last_ctrl.ZPB1_R1_RPL ? SemNeuve : (_last_ctrl.ZPB1_R1_VISUEL || _last_ctrl.ZPB1_R1_MESURE == 0 ? "..." : _last_ctrl.ZPB1_R1_MESURE),
                                    mesuR2: _last_ctrl.ZPB1_R2_RPL ? SemNeuve : (_last_ctrl.ZPB1_R2_VISUEL || _last_ctrl.ZPB1_R2_MESURE == 0 ? "..." : _last_ctrl.ZPB1_R2_MESURE),
                                    mesuR3: _last_ctrl.ZPB1_R3_RPL ? SemNeuve : (_last_ctrl.ZPB1_R3_VISUEL || _last_ctrl.ZPB1_R3_MESURE == 0 ? "..." : _last_ctrl.ZPB1_R3_MESURE),
                                    mesuR4: _last_ctrl.ZPB1_R4_RPL ? SemNeuve : (_last_ctrl.ZPB1_R4_VISUEL || _last_ctrl.ZPB1_R4_MESURE == 0 ? "..." : _last_ctrl.ZPB1_R4_MESURE),
                                };
                                CtrlBuild.zpb1 = _LastZPB1;
                                _RecupZPB1 = true;
                                if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                $('#btn-tracaCtrl').prop('disabled', true);
                                $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Dernier Ctrl ZPB1 : " + err);
                            });
                        }
                        else {
                            _RecupZPB1 = true;
                            if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                        }

                        if (_Controle.LastDateZPB2) {
                            $.getJSON("http://localhost:3000/getLastCtrlByID", { id: _LastDate.LastIdZPB2, zb: 'ZPB2' })
                            .done(function (_last_ctrl) {
                                _LastZPB2 = {
                                    BmIso: _last_ctrl.ZPB2_BM_Iso, cvR1: _last_ctrl.ZPB2_R1_VISUEL, cvR2: _last_ctrl.ZPB2_R2_VISUEL, cvR3: _last_ctrl.ZPB2_R3_VISUEL, cvR4: _last_ctrl.ZPB2_R4_VISUEL, rplR1: _last_ctrl.ZPB2_R1_RPL, rplR2: _last_ctrl.ZPB2_R2_RPL, rplR3: _last_ctrl.ZPB2_R3_RPL, rplR4: _last_ctrl.ZPB2_R4_RPL,
                                    mesuR1: _last_ctrl.ZPB2_R1_RPL ? SemNeuve : (_last_ctrl.ZPB2_R1_VISUEL || _last_ctrl.ZPB2_R1_MESURE == 0 ? "..." : _last_ctrl.ZPB2_R1_MESURE),
                                    mesuR2: _last_ctrl.ZPB2_R2_RPL ? SemNeuve : (_last_ctrl.ZPB2_R2_VISUEL || _last_ctrl.ZPB2_R2_MESURE == 0 ? "..." : _last_ctrl.ZPB2_R2_MESURE),
                                    mesuR3: _last_ctrl.ZPB2_R3_RPL ? SemNeuve : (_last_ctrl.ZPB2_R3_VISUEL || _last_ctrl.ZPB2_R3_MESURE == 0 ? "..." : _last_ctrl.ZPB2_R3_MESURE),
                                    mesuR4: _last_ctrl.ZPB2_R4_RPL ? SemNeuve : (_last_ctrl.ZPB2_R4_VISUEL || _last_ctrl.ZPB2_R4_MESURE == 0 ? "..." : _last_ctrl.ZPB2_R4_MESURE),
                                };
                                CtrlBuild.zpb2 = _LastZPB2;
                                _RecupZPB2 = true;
                                if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                            })
                            .fail(function (jqxhr, textStatus, error) {
                                $('#btn-tracaCtrl').prop('disabled', true);
                                $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Dernier Ctrl ZPB2 : " + err);
                            });
                        }
                        else {
                            _RecupZPB2 = true;
                            if (IdCrtl == 0 && _RecupZIB1 && _RecupZIB2 && _RecupZPB1 && _RecupZPB2) { calcEstim(); }
                        }


                    })
                    .fail(function (jqxhr, textStatus, error) {
                        $('#btn-tracaCtrl').prop('disabled', true);
                        $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Get KM/BM Failed : " + err);
                    });
            })
            .fail(function (jqxhr, textStatus, error) {
                $('#btn-tracaCtrl').prop('disabled', true);
                $('#_LoadData').removeClass("fa-spin"); var err = textStatus + ", " + error; alert("Get Motrices Failed : " + err);
            }); 
    }
    function calcEstim() {
        $('#_idLegend').text('Calcul des estimations...');
        var _usureZIB1 = 0; _usureZIB2 = 0; _usureZPB1 = 0; _usureZPB2 = 0;
        var _usureMaxiZIB1 = 0; _usureMaxiZIB2 = 0; _usureMaxiZPB1 = 0; _usureMaxiZPB2 = 0;

        var _ParamUsureFilter = tbParamUsure.filter(function (item) { return item.IdSerie == RameSelected.IdSerie && item.IdSousSerie == RameSelected.IdSousSerie });

        if (_ParamUsureFilter.length == 1) {
            _usureZIB1 = _LastZIB1.BmIso ? _ParamUsureFilter[0].BMiso : _ParamUsureFilter[0].BMes;
            _usureZIB2 = _LastZIB2.BmIso ? _ParamUsureFilter[0].BMiso : _ParamUsureFilter[0].BMes;
            _usureMaxiZIB1 = _LastZIB1.BmIso ? _ParamUsureFilter[0].Max3SigBmIso : _ParamUsureFilter[0].Max3SigBmEs;
            _usureMaxiZIB2 = _LastZIB2.BmIso ? _ParamUsureFilter[0].Max3SigBmIso : _ParamUsureFilter[0].Max3SigBmEs;
            if (RameSelected.IdSerie != 2) {
                _usureZPB1 = _LastZPB1.BmIso ? _ParamUsureFilter[0].BMiso : _ParamUsureFilter[0].BMes;
                _usureZPB2 = _LastZPB2.BmIso ? _ParamUsureFilter[0].BMiso : _ParamUsureFilter[0].BMes;
                _usureMaxiZPB1 = _LastZPB1.BmIso ? _ParamUsureFilter[0].Max3SigBmIso : _ParamUsureFilter[0].Max3SigBmEs;
                _usureMaxiZPB2 = _LastZPB2.BmIso ? _ParamUsureFilter[0].Max3SigBmIso : _ParamUsureFilter[0].Max3SigBmEs;
            }
        }

        // Estimation
        _EstimZIB1.estR1 = _LastZIB1.mesuR1 == '...' ? '...' : Math.floor(_LastZIB1.mesuR1 - (_usureZIB1 * _Controle.kmzib1));
        _EstimZIB1.estR2 = _LastZIB1.mesuR2 == '...' ? '...' : Math.floor(_LastZIB1.mesuR2 - (_usureZIB1 * _Controle.kmzib1));
        _EstimZIB1.estR3 = _LastZIB1.mesuR3 == '...' ? '...' : Math.floor(_LastZIB1.mesuR3 - (_usureZIB1 * _Controle.kmzib1));
        _EstimZIB1.estR4 = _LastZIB1.mesuR4 == '...' ? '...' : Math.floor(_LastZIB1.mesuR4 - (_usureZIB1 * _Controle.kmzib1));

        _EstimZIB2.estR1 = _LastZIB2.mesuR1 == '...' ? '...' : Math.floor(_LastZIB2.mesuR1 - (_usureZIB2 * _Controle.kmzib2));
        _EstimZIB2.estR2 = _LastZIB2.mesuR2 == '...' ? '...' : Math.floor(_LastZIB2.mesuR2 - (_usureZIB2 * _Controle.kmzib2));
        _EstimZIB2.estR3 = _LastZIB2.mesuR3 == '...' ? '...' : Math.floor(_LastZIB2.mesuR3 - (_usureZIB2 * _Controle.kmzib2));
        _EstimZIB2.estR4 = _LastZIB2.mesuR4 == '...' ? '...' : Math.floor(_LastZIB2.mesuR4 - (_usureZIB2 * _Controle.kmzib2));

        if (RameSelected.IdSerie != 2) {
            _EstimZPB1.estR1 = _LastZPB1.mesuR1 == '...' ? '...' : Math.floor(_LastZPB1.mesuR1 - (_usureZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estR2 = _LastZPB1.mesuR2 == '...' ? '...' : Math.floor(_LastZPB1.mesuR2 - (_usureZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estR3 = _LastZPB1.mesuR3 == '...' ? '...' : Math.floor(_LastZPB1.mesuR3 - (_usureZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estR4 = _LastZPB1.mesuR4 == '...' ? '...' : Math.floor(_LastZPB1.mesuR4 - (_usureZPB1 * _Controle.kmzpb1));

            _EstimZPB2.estR1 = _LastZPB2.mesuR1 == '...' ? '...' : Math.floor(_LastZPB2.mesuR1 - (_usureZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estR2 = _LastZPB2.mesuR2 == '...' ? '...' : Math.floor(_LastZPB2.mesuR2 - (_usureZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estR3 = _LastZPB2.mesuR3 == '...' ? '...' : Math.floor(_LastZPB2.mesuR3 - (_usureZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estR4 = _LastZPB2.mesuR4 == '...' ? '...' : Math.floor(_LastZPB2.mesuR4 - (_usureZPB2 * _Controle.kmzpb2));
        }

        _EstimZIB1.estMiniR1 = _LastZIB1.mesuR1 == '...' ? '...' : Math.floor(_LastZIB1.mesuR1 - (_usureMaxiZIB1 * _Controle.kmzib1));
        _EstimZIB1.estMiniR2 = _LastZIB1.mesuR2 == '...' ? '...' : Math.floor(_LastZIB1.mesuR2 - (_usureMaxiZIB1 * _Controle.kmzib1));
        _EstimZIB1.estMiniR3 = _LastZIB1.mesuR3 == '...' ? '...' : Math.floor(_LastZIB1.mesuR3 - (_usureMaxiZIB1 * _Controle.kmzib1));
        _EstimZIB1.estMiniR4 = _LastZIB1.mesuR4 == '...' ? '...' : Math.floor(_LastZIB1.mesuR4 - (_usureMaxiZIB1 * _Controle.kmzib1));

        _EstimZIB2.estMiniR1 = _LastZIB2.mesuR1 == '...' ? '...' : Math.floor(_LastZIB2.mesuR1 - (_usureMaxiZIB2 * _Controle.kmzib2));
        _EstimZIB2.estMiniR2 = _LastZIB2.mesuR2 == '...' ? '...' : Math.floor(_LastZIB2.mesuR2 - (_usureMaxiZIB2 * _Controle.kmzib2));
        _EstimZIB2.estMiniR3 = _LastZIB2.mesuR3 == '...' ? '...' : Math.floor(_LastZIB2.mesuR3 - (_usureMaxiZIB2 * _Controle.kmzib2));
        _EstimZIB2.estMiniR4 = _LastZIB2.mesuR4 == '...' ? '...' : Math.floor(_LastZIB2.mesuR4 - (_usureMaxiZIB2 * _Controle.kmzib2));

        if (RameSelected.IdSerie != 2) {
            _EstimZPB1.estMiniR1 = _LastZPB1.mesuR1 == '...' ? '...' : Math.floor(_LastZPB1.mesuR1 - (_usureMaxiZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estMiniR2 = _LastZPB1.mesuR2 == '...' ? '...' : Math.floor(_LastZPB1.mesuR2 - (_usureMaxiZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estMiniR3 = _LastZPB1.mesuR3 == '...' ? '...' : Math.floor(_LastZPB1.mesuR3 - (_usureMaxiZPB1 * _Controle.kmzpb1));
            _EstimZPB1.estMiniR4 = _LastZPB1.mesuR4 == '...' ? '...' : Math.floor(_LastZPB1.mesuR4 - (_usureMaxiZPB1 * _Controle.kmzpb1));

            _EstimZPB2.estMiniR1 = _LastZPB2.mesuR1 == '...' ? '...' : Math.floor(_LastZPB2.mesuR1 - (_usureMaxiZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estMiniR2 = _LastZPB2.mesuR2 == '...' ? '...' : Math.floor(_LastZPB2.mesuR2 - (_usureMaxiZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estMiniR3 = _LastZPB2.mesuR3 == '...' ? '...' : Math.floor(_LastZPB2.mesuR3 - (_usureMaxiZPB2 * _Controle.kmzpb2));
            _EstimZPB2.estMiniR4 = _LastZPB2.mesuR4 == '...' ? '...' : Math.floor(_LastZPB2.mesuR4 - (_usureMaxiZPB2 * _Controle.kmzpb2));
        }

        CtrlBuild.estimzib1 = _EstimZIB1;
        CtrlBuild.estimzib2 = _EstimZIB2;
        CtrlBuild.estimzpb1 = _EstimZPB1;
        CtrlBuild.estimzpb2 = _EstimZPB2;

        $('#_LoadData').removeClass("fa-spin");
        $('#_idLegend').text('Nouveau Contrôle Semelle...');
        boolTracaPrete = true;
        ActiveNewTraca();
    }
    function ActiveNewTraca() {
        $('#btn-tracaCtrl').prop('disabled', !($('#RameInput').val() != '' && $("#sites").val() != '0' && $("#inters").val() != '0' && boolTracaPrete));
    }
    function ClearModal() {
        // Remise à 0 
        ActiveNewTraca();
        IdCrtl = 0;
        $('#btn-save-ctrl').css("display", "none");
        _Traca = { ID: 0, DtCreate: "", StfId: 0, SerieId: 0, CreateBy: "", Rame: "", Site: "", Interv: "", Title: "", MessageBM: "", ZIB1: "", ZIB2: "", ZPB1: "", ZPB2: "" };
        $('#RameInput').val('');
        $("#chkZIB1,#chkZIB2,#chkZPB1,#chkZPB2").prop("checked", false); 

        // Vide Toutes saisies éventuelles sur les 4 bogies
        $('*[aria-label="ZIB1"]').prop("checked", false); $('*[aria-label="ZIB1"]').val(""); $('*[aria-label="ZIB1"]').prop("disabled", true);
        $('*[aria-label="ZIB2"]').prop("checked", false); $('*[aria-label="ZIB2"]').val(""); $('*[aria-label="ZIB2"]').prop("disabled", true);
        $('*[aria-label="ZPB1"]').prop("checked", false); $('*[aria-label="ZPB1"]').val(""); $('*[aria-label="ZPB1"]').prop("disabled", true);
        $('*[aria-label="ZPB2"]').prop("checked", false); $('*[aria-label="ZPB2"]').val(""); $('*[aria-label="ZPB2"]').prop("disabled", true);

        
        $('*[data-content="visuel"]').prop("checked", false);   // Uncheck tous les Ctrl Visuel
        $('*[data-content="mesure"]').val('');                 // Vide toutes les mesures
        $('*[data-content="consomation"]').val('');            // Vide toutes les consos
        $('*[data-content="estimation"]').val('');            // Vide toutes les estimations
        $('*[data-content="consomation"]').removeClass('alert-input').removeClass('valid-input').removeClass('error-input');
        $('*[data-content="mesure"]').removeClass('alert-input').removeClass('valid-input').removeClass('error-input');

        $('#txtbadgeBM').text(''); $('#badgeBM').css('display', 'none'); // Clear Message BM
    }
    function CheckSaisie() {
        var checkBmIso = true;
        // ZIB1
        _zib1Ok = (($("#chkZIB1").is(':checked') == false) ||
            (($("#chkZIB1").is(':checked')) && ($('#zib1mes1').data('mesureOK') && $('#zib1mes2').data('mesureOK') && $('#zib1mes3').data('mesureOK') && $('#zib1mes4').data('mesureOK')) &&
            (($('#zib1ctvs1').is(':checked') || $('#zib1mes1').val() != '') && ($('#zib1ctvs2').is(':checked') || $('#zib1mes2').val() != '') && ($('#zib1ctvs3').is(':checked') || $('#zib1mes3').val() != '') && ($('#zib1ctvs4').is(':checked') || $('#zib1mes4').val() != ''))))

        if (_zib1Ok)    $('#leg_zib1').removeClass('error-input').addClass('valid-input'); 
        else            $('#leg_zib1').removeClass('valid-input').addClass('error-input'); 

        // ZIB2
        _zib2Ok = (($("#chkZIB2").is(':checked') == false) ||
            (($("#chkZIB2").is(':checked')) && ($('#zib2mes1').data('mesureOK') && $('#zib2mes2').data('mesureOK') && $('#zib2mes3').data('mesureOK') && $('#zib2mes4').data('mesureOK')) &&
            (($('#zib2ctvs1').is(':checked') || $('#zib2mes1').val() != '') && ($('#zib2ctvs2').is(':checked') || $('#zib2mes2').val() != '') && ($('#zib2ctvs3').is(':checked') || $('#zib2mes3').val() != '') && ($('#zib2ctvs4').is(':checked') || $('#zib2mes4').val() != ''))))

        if (_zib2Ok)    $('#leg_zib2').removeClass('error-input').addClass('valid-input'); 
        else            $('#leg_zib2').removeClass('valid-input').addClass('error-input'); 

        // ZPB1
        _zpb1Ok = (($("#chkZPB1").is(':checked') == false) ||
            (($("#chkZPB1").is(':checked')) && ($('#zpb1mes1').data('mesureOK') && $('#zpb1mes2').data('mesureOK') && $('#zpb1mes3').data('mesureOK') && $('#zpb1mes4').data('mesureOK')) &&
            (($('#zpb1ctvs1').is(':checked') || $('#zpb1mes1').val() != '') && ($('#zpb1ctvs2').is(':checked') || $('#zpb1mes2').val() != '') && ($('#zpb1ctvs3').is(':checked') || $('#zpb1mes3').val() != '') && ($('#zpb1ctvs4').is(':checked') || $('#zpb1mes4').val() != ''))))

        if (_zpb1Ok)    $('#leg_zpb1').removeClass('error-input').addClass('valid-input'); 
        else            $('#leg_zpb1').removeClass('valid-input').addClass('error-input'); 

        // ZPB2
        _zpb2Ok = (($("#chkZPB2").is(':checked') == false) ||
            (($("#chkZPB2").is(':checked')) && ($('#zpb2mes1').data('mesureOK') && $('#zpb2mes2').data('mesureOK') && $('#zpb2mes3').data('mesureOK') && $('#zpb2mes4').data('mesureOK')) &&
            (($('#zpb2ctvs1').is(':checked') || $('#zpb2mes1').val() != '') && ($('#zpb2ctvs2').is(':checked') || $('#zpb2mes2').val() != '') && ($('#zpb2ctvs3').is(':checked') || $('#zpb2mes3').val() != '') && ($('#zpb2ctvs4').is(':checked') || $('#zpb2mes4').val() != ''))))

        if (_zpb2Ok)    $('#leg_zpb2').removeClass('error-input').addClass('valid-input'); 
        else            $('#leg_zpb2').removeClass('valid-input').addClass('error-input'); 


        // Activation - Desactivation du bouton 'Sauvegarder' (_identiteOK && )
        if (_Traca.MessageBM.length != 0) {
            var _motrice = _Traca.MessageBM.split('-')[0].trim();
            checkBmIso = (
                (_motrice == _Traca.Title.split(';')[0].split(' ')[0] && ($("#chkzib1bmiso").is(':checked') == true || $("#chkzib2bmiso").is(':checked') == true)) ||
                (_Traca.Rame.split('/')[1] != 2 && _motrice == _Traca.Title.split(';')[3].split(' ')[0] && ($("#chkzpb1bmiso").is(':checked') == true || $("#chkzpb2bmiso").is(':checked') == true)))
        }
        else { checkBmIso = $("#chkzib1bmiso").is(':checked') == false && $("#chkzib2bmiso").is(':checked') == false && $("#chkzpb1bmiso").is(':checked') == false && $("#chkzpb2bmiso").is(':checked') == false }

        _SaisieValide = checkBmIso && _zib1Ok && _zib2Ok && _zpb1Ok && _zpb2Ok && (_zib1Ok || _zib2Ok || _zpb1Ok || _zpb2Ok)
        && ($("#chkZIB1").is(':checked') == true || $("#chkZIB2").is(':checked') == true || $("#chkZPB1").is(':checked') == true || $("#chkZPB2").is(':checked') == true);

        $('#btn-save-ctrl').css("display", _SaisieValide ? "inline-block" : "none");
    }

    function getTraca() {
        $.getJSON("http://localhost:3000/getTracaSemelles", { stfId: StfSelected.ID })
        .done(function (_tracas) {
            _lstTracas = _tracas;

            $('#tracas').get(0).options.length = 0;
            $('#tracas').append('<option value ="0">' + _lstTracas .length + ' Ctrl(s) en attente...</option>');
            $.each(_lstTracas, function (i, item) { $('#tracas').append('<option value ="' + item.ID + '">' + item.Rame.split('/')[3] + ' - ' + moment(item.CreateDate).format("DD/MM/YY") + ' - ' + item.Site.split('/')[1] + ' - ' + item.Interv.split('/')[1] + '</option>'); });
            $('#tracas').selectpicker('refresh');
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Erreur Récupération Traças... : " + err);
        });
        currentTracaId = 0;
    }

    /* onChange stf */
    $('#stfsList').change(function () {
        $("#sites").val('0'); $("#inters").val('0');
        var tabFilter = STFs.filter(function (item) { return item.ID == $('#stfsList').val(); });
        StfSelected = { ID: tabFilter[0].ID, STF: tabFilter[0].STF, IdStfRm: tabFilter[0].IdStfRm, OsmStf: tabFilter[0].OsmStf };

        getSites();
        getInterventions();

        GetSeriesByStf();
        GetParamUsure();
        ActiveNewTraca();
        getTraca();

        semelleTable1.ajax.reload();
    });
    // Events Change BAndeau Identité
    $("#sites,#inters").on('change', function () { ActiveNewTraca(); });
    $('#tracas').on('change', function () {
        currentTracaId = 0;
        if ($("#tracas").val() != 0) {
            currentTracaId = $("#tracas").val();
            $('#modal-Ctrl').modal({ keyboard: true, show: true });
        }
    });

    // Events Check/Uncheck Ctrl Bogie
    $("#chkZIB1,#chkZIB2,#chkZPB1,#chkZPB2").on('change', function () {
        var _arialabel = $(this).data('input-name');    // aria-label lié à ce checkbox
        $('*[aria-label="' + _arialabel + '"]').prop("disabled", !$(this).prop('checked'));

        // Réinitialise les Checkbox et les Texbox à 0
        $('*[aria-label="' + _arialabel + '"]').prop("checked", false);
        $('*[aria-label="' + _arialabel + '"]').val("");
    });
    // Saisie des mesures
    $('*[data-content="mesure"]').on('change', function () {
        //var semelleNeuve = RameSelected.IdSerie = 2 ? 50 : 60;

        if (!$.isNumeric(this.value)) { $('#' + this.id).addClass('error-input'); $('#' + this.id).data('mesureOK', false); }
        else {
            var _id_conso = this.dataset.conso;    // id conso lié a ce textbox
            $('#' + this.id).data('mesureOK', true);
            $('#' + this.id).removeClass('error-input');
            $('#' + _id_conso).removeClass('alert-input').removeClass('valid-input').removeClass('error-input');
            
            $('#' + _id_conso).val($('#' + this.id).data('oldmesure') == '...' ? '' :  $('#' + this.id).data('oldmesure') - this.value);
            if (Number(this.value) > $('#' + this.id).data('estim') || Number(this.value) < $('#' + this.id).data('estimMini'))
                $('#' + _id_conso).removeClass('error-input').removeClass('valid-input').addClass('alert-input');
            else
                $('#' + _id_conso).removeClass('error-input').removeClass('alert-input').addClass('valid-input');

            if (Number($('#' + _id_conso).val()) < 0) $('#' + _id_conso).removeClass('alert-input').removeClass('valid-input').addClass('error-input');

            if (Number(this.value) > 60) {
                $('#' + _id_conso).removeClass('alert-input').removeClass('valid-input').addClass('error-input');
                $('#' + this.id).data('mesureOK', false);
            }
        }
    });
    // Saisie des CtrlVisuel
    $('*[data-content="visuel"]').on('change', function () {
        var _id_mesure = this.dataset.mesure;    // id mesure lié a ce textbox
        var _id_conso = this.dataset.conso;    // id conso lié a ce textbox

        $('#' + _id_mesure).prop("disabled", $(this).prop('checked'));

        $('#' + _id_mesure).data('mesureOK', $(this).prop('checked'));
        $('#' + _id_conso).removeClass('alert-input').removeClass('error-input').removeClass('valid-input');

        $('#' + _id_conso).val("...");
        $('#' + _id_mesure).val("");
    });
    $('[data-input-name="ZIB1"],[data-input-name="ZIB2"],[data-input-name="ZPB1"],[data-input-name="ZPB2"]').on('change', function () { CheckSaisie();});

    // OnClick Bouton
    $('#btn-impCtrl').on('click', function (e) { ImportDataV2(); });
    $('#btn-tracaCtrl').on('click', function (e) {
        var tabBG = [];
        tabBG.push({
            titreBogie: CtrlBuild.ctrl.ZI + ' Bogie 1 - Dernier Ctrl : ' + CtrlBuild.ctrl.LastDateZIB1 + ' - ' + CtrlBuild.ctrl.kmzib1 + ' km parcourus',
            Estimation: CtrlBuild.zib1.mesuR1 + ' - [' + CtrlBuild.estimzib1.estR1 + '/' + CtrlBuild.estimzib1.estMiniR1 + '];' +
                CtrlBuild.zib1.mesuR2 + ' - [' + CtrlBuild.estimzib1.estR2 + '/' + CtrlBuild.estimzib1.estMiniR2 + '];' +
                CtrlBuild.zib1.mesuR3 + ' - [' + CtrlBuild.estimzib1.estR3 + '/' + CtrlBuild.estimzib1.estMiniR3 + '];' +
                CtrlBuild.zib1.mesuR4 + ' - [' + CtrlBuild.estimzib1.estR4 + '/' + CtrlBuild.estimzib1.estMiniR4 + ']'
        });
        tabBG.push({
            titreBogie: CtrlBuild.ctrl.ZI + ' Bogie 2 - Dernier Ctrl : ' + CtrlBuild.ctrl.LastDateZIB2 + ' - ' + CtrlBuild.ctrl.kmzib2 + ' km parcourus',
            Estimation: CtrlBuild.zib2.mesuR1 + ' - [' + CtrlBuild.estimzib2.estR1 + '/' + CtrlBuild.estimzib2.estMiniR1 + '];' +
                CtrlBuild.zib2.mesuR2 + ' - [' + CtrlBuild.estimzib2.estR2 + '/' + CtrlBuild.estimzib2.estMiniR2 + '];' +
                CtrlBuild.zib2.mesuR3 + ' - [' + CtrlBuild.estimzib2.estR3 + '/' + CtrlBuild.estimzib2.estMiniR3 + '];' +
                CtrlBuild.zib2.mesuR4 + ' - [' + CtrlBuild.estimzib2.estR4 + '/' + CtrlBuild.estimzib2.estMiniR4 + ']'
        });
        if (RameSelected.IdSerie != 2) {
            tabBG.push({
                titreBogie: CtrlBuild.ctrl.ZP + ' Bogie 1 - Dernier Ctrl : ' + CtrlBuild.ctrl.LastDateZPB1 + ' - ' + CtrlBuild.ctrl.kmzpb1 + ' km parcourus',
                Estimation: CtrlBuild.zpb1.mesuR1 + ' - [' + CtrlBuild.estimzpb1.estR1 + '/' + CtrlBuild.estimzpb1.estMiniR1 + '];' +
                    CtrlBuild.zpb1.mesuR2 + ' - [' + CtrlBuild.estimzpb1.estR2 + '/' + CtrlBuild.estimzpb1.estMiniR2 + '];' +
                    CtrlBuild.zpb1.mesuR3 + ' - [' + CtrlBuild.estimzpb1.estR3 + '/' + CtrlBuild.estimzpb1.estMiniR3 + '];' +
                    CtrlBuild.zpb1.mesuR4 + ' - [' + CtrlBuild.estimzpb1.estR4 + '/' + CtrlBuild.estimzpb1.estMiniR4 + ']'
            });
            tabBG.push({
                titreBogie: CtrlBuild.ctrl.ZP + ' Bogie 2 - Dernier Ctrl : ' + CtrlBuild.ctrl.LastDateZPB2 + ' - ' + CtrlBuild.ctrl.kmzpb2 + ' km parcourus',
                Estimation: CtrlBuild.zpb2.mesuR1 + ' - [' + CtrlBuild.estimzpb2.estR1 + '/' + CtrlBuild.estimzpb2.estMiniR1 + '];' +
                    CtrlBuild.zpb2.mesuR2 + ' - [' + CtrlBuild.estimzpb2.estR2 + '/' + CtrlBuild.estimzpb2.estMiniR2 + '];' +
                    CtrlBuild.zpb2.mesuR3 + ' - [' + CtrlBuild.estimzpb2.estR3 + '/' + CtrlBuild.estimzpb2.estMiniR3 + '];' +
                    CtrlBuild.zpb2.mesuR4 + ' - [' + CtrlBuild.estimzpb2.estR4 + '/' + CtrlBuild.estimzpb2.estMiniR4 + ']'
            });
        }
        var _SiteSelect = (_lstSites.filter(function (item) { return item.ID == $("#sites").val() }))[0];
        var _IntvSelect = (_lstIntervs.filter(function (item) { return item.ID == $("#inters").val() }))[0];

        var obj = {
            sem_UserName:   CtrlBuild.userName,
            sem_Site:       _SiteSelect.ID + "/" + _SiteSelect.Site,
            sem_Interv:     _IntvSelect.ID + "/" + _IntvSelect.Interv,
            sem_Rame:       CtrlBuild.rame,
            bogie:          tabBG,
            messBm:         CtrlBuild.ctrl.MessBM,
            tracaDate:      moment().format('DD/MM/YYYY HH:mm')
        };
        var sendToNode = true;
        $.ajax({
            type: "POST",
            url: "Semelle/SetTraca",
            data: JSON.stringify({ model: obj }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (msg) {
                var txtInTraca = CtrlBuild.rame.split('/')[3].trim() + " - " + moment().format("DD/MM/YY") + " - " + _SiteSelect.Site.trim() + " - " + _IntvSelect.Interv.trim()
                $.each($('#tracas').get(0).options, function (i, item) {
                    if (item.text == txtInTraca) {
                        sendToNode = false;
                        return false;
                    }
                });

                // Save in BDD
                var TracaObj = {
                    tracaDate:  moment().format('YYYY-MM-DD HH:mm:ss'),
                    stfId:      StfSelected.ID,
                    createBy:   obj.sem_UserName,
                    site:       obj.sem_Site,
                    inter:      obj.sem_Interv,
                    rame:       obj.sem_Rame,
                    title:      RameSelected.IdSerie == 2 ? obj.bogie[0].titreBogie + ';' + obj.bogie[1].titreBogie : obj.bogie[0].titreBogie + ';' + obj.bogie[1].titreBogie + ';' + obj.bogie[2].titreBogie + ';' + obj.bogie[3].titreBogie,
                    messBm:     obj.messBm,
                    ZIB1:       obj.bogie[0].Estimation,
                    ZIB2:       obj.bogie[1].Estimation,
                    ZPB1:       RameSelected.IdSerie == 2 ? '' : obj.bogie[2].Estimation,
                    ZPB2:       RameSelected.IdSerie == 2 ? '' : obj.bogie[3].Estimation
                };
                if (sendToNode) {
                    $.post('http://localhost:3000/SaveTracaSemelle', { traca: TracaObj }).done(function (retour) {
                        $('#RameInput').val('');
                        ActiveNewTraca();
                        getTraca();
                    });
                }
                // Open Pdf
                window.open("Semelle/TracaToPdf");
            },
            error: function (err) { alert("Erreur Call Traça... : " + err); }
        });
    });
    $('#btn-save-ctrl').on('click', function (e) {
        // Elaboration de l'object CTRL 
        var ctrlObj = {
            //datectrl:       moment($('#dtCtrl').data('daterangepicker').startDate).format("YYYY-MM-DD HH:mm:ss"),
            datectrl:       moment(_Traca.strDate).format("YYYY-MM-DD"),
            datesaisi:      moment().format('YYYY-MM-DD HH:mm:ss'),
            stfId:          _Traca.StfId,
            userctrl:       userName,
            siteId:         IdCrtl == 0 ? _Traca.Site.split('/')[0] : 0,
            interId:        IdCrtl == 0 ? _Traca.Interv.split('/')[0] : 0,
            rameId:         IdCrtl == 0 ? _Traca.Rame.split('/')[0] : 0,
            rameNum:        IdCrtl == 0 ? _Traca.Rame.split('/')[3] : 0,
            serieID:        IdCrtl == 0 ? _Traca.Rame.split('/')[1] : 0,
            sousserieId:    IdCrtl == 0 ? _Traca.Rame.split('/')[2] : 0,
            tracaId:        _Traca.ID,
            nonconform:     $('#chkNC').prop('checked'),
            comment:        $('#txtComment').val().replace("'","''"),
            // Ctrl du bogie
            zib1ctrl: $('#chkZIB1').prop('checked'),
            zib2ctrl: $('#chkZIB2').prop('checked'),
            zpb1ctrl: $('#chkZPB1').prop('checked'),
            zpb2ctrl: $('#chkZPB2').prop('checked'),
            //Bogie Isolé
            zib1BgIso: $('#chkzib1bgiso').prop('checked'),
            zib2BgIso: $('#chkzib2bgiso').prop('checked'),
            zpb1BgIso: $('#chkzpb1bgiso').prop('checked'),
            zpb2BgIso: $('#chkzpb2bgiso').prop('checked'),
            // BM Isolé
            zib1BmIso: $('#chkzib1bmiso').prop('checked'),
            zib2BmIso: $('#chkzib2bmiso').prop('checked'),
            zpb1BmIso: $('#chkzpb1bmiso').prop('checked'),
            zpb2BmIso: $('#chkzpb2bmiso').prop('checked'),
            // Remplacement Semelle
            zib1RplR1: $('#zib1rpl1').prop('checked'),
            zib1RplR2: $('#zib1rpl2').prop('checked'),
            zib1RplR3: $('#zib1rpl3').prop('checked'),
            zib1RplR4: $('#zib1rpl4').prop('checked'),
            zib2RplR1: $('#zib2rpl1').prop('checked'),
            zib2RplR2: $('#zib2rpl2').prop('checked'),
            zib2RplR3: $('#zib2rpl3').prop('checked'),
            zib2RplR4: $('#zib2rpl4').prop('checked'),
            zpb1RplR1: $('#zpb1rpl1').prop('checked'),
            zpb1RplR2: $('#zpb1rpl2').prop('checked'),
            zpb1RplR3: $('#zpb1rpl3').prop('checked'),
            zpb1RplR4: $('#zpb1rpl4').prop('checked'),
            zpb2RplR1: $('#zpb2rpl1').prop('checked'),
            zpb2RplR2: $('#zpb2rpl2').prop('checked'),
            zpb2RplR3: $('#zpb2rpl3').prop('checked'),
            zpb2RplR4: $('#zpb2rpl4').prop('checked'),
            // Ctrl Visuel
            zib1VisuR1: $('#zib1ctvs1').prop('checked'),
            zib1VisuR2: $('#zib1ctvs2').prop('checked'),
            zib1VisuR3: $('#zib1ctvs3').prop('checked'),
            zib1VisuR4: $('#zib1ctvs4').prop('checked'),
            zib2VisuR1: $('#zib2ctvs1').prop('checked'),
            zib2VisuR2: $('#zib2ctvs2').prop('checked'),
            zib2VisuR3: $('#zib2ctvs3').prop('checked'),
            zib2VisuR4: $('#zib2ctvs4').prop('checked'),
            zpb1VisuR1: $('#zpb1ctvs1').prop('checked'),
            zpb1VisuR2: $('#zpb1ctvs2').prop('checked'),
            zpb1VisuR3: $('#zpb1ctvs3').prop('checked'),
            zpb1VisuR4: $('#zpb1ctvs4').prop('checked'),
            zpb2VisuR1: $('#zpb2ctvs1').prop('checked'),
            zpb2VisuR2: $('#zpb2ctvs2').prop('checked'),
            zpb2VisuR3: $('#zpb2ctvs3').prop('checked'),
            zpb2VisuR4: $('#zpb2ctvs4').prop('checked'),
            // Mesures
            zib1MesuR1: $('#zib1mes1').val() == '' ? 0 : $('#zib1mes1').val(),
            zib1MesuR2: $('#zib1mes2').val() == '' ? 0 : $('#zib1mes2').val(),
            zib1MesuR3: $('#zib1mes3').val() == '' ? 0 : $('#zib1mes3').val(),
            zib1MesuR4: $('#zib1mes4').val() == '' ? 0 : $('#zib1mes4').val(),
            zib2MesuR1: $('#zib2mes1').val() == '' ? 0 : $('#zib2mes1').val(),
            zib2MesuR2: $('#zib2mes2').val() == '' ? 0 : $('#zib2mes2').val(),
            zib2MesuR3: $('#zib2mes3').val() == '' ? 0 : $('#zib2mes3').val(),
            zib2MesuR4: $('#zib2mes4').val() == '' ? 0 : $('#zib2mes4').val(),
            zpb1MesuR1: $('#zpb1mes1').val() == '' ? 0 : $('#zpb1mes1').val(),
            zpb1MesuR2: $('#zpb1mes2').val() == '' ? 0 : $('#zpb1mes2').val(),
            zpb1MesuR3: $('#zpb1mes3').val() == '' ? 0 : $('#zpb1mes3').val(),
            zpb1MesuR4: $('#zpb1mes4').val() == '' ? 0 : $('#zpb1mes4').val(),
            zpb2MesuR1: $('#zpb2mes1').val() == '' ? 0 : $('#zpb2mes1').val(),
            zpb2MesuR2: $('#zpb2mes2').val() == '' ? 0 : $('#zpb2mes2').val(),
            zpb2MesuR3: $('#zpb2mes3').val() == '' ? 0 : $('#zpb2mes3').val(),
            zpb2MesuR4: $('#zpb2mes4').val() == '' ? 0 : $('#zpb2mes4').val(),
            // Conso
            zib1ConsoR1: $('#zib1cnsm1').val() == '...' || $('#zib1cnsm1').val() == '' ? 'NULL' : $('#zib1cnsm1').val(),
            zib1ConsoR2: $('#zib1cnsm2').val() == '...' || $('#zib1cnsm2').val() == '' ? 'NULL' : $('#zib1cnsm2').val(),
            zib1ConsoR3: $('#zib1cnsm3').val() == '...' || $('#zib1cnsm3').val() == '' ? 'NULL' : $('#zib1cnsm3').val(),
            zib1ConsoR4: $('#zib1cnsm4').val() == '...' || $('#zib1cnsm4').val() == '' ? 'NULL' : $('#zib1cnsm4').val(),

            zib2ConsoR1: $('#zib2cnsm1').val() == '...' || $('#zib2cnsm1').val() == '' ? 'NULL' : $('#zib2cnsm1').val(),
            zib2ConsoR2: $('#zib2cnsm2').val() == '...' || $('#zib2cnsm2').val() == '' ? 'NULL' : $('#zib2cnsm2').val(),
            zib2ConsoR3: $('#zib2cnsm3').val() == '...' || $('#zib2cnsm3').val() == '' ? 'NULL' : $('#zib2cnsm3').val(),
            zib2ConsoR4: $('#zib2cnsm4').val() == '...' || $('#zib2cnsm4').val() == '' ? 'NULL' : $('#zib2cnsm4').val(),

            zpb1ConsoR1: $('#zpb1cnsm1').val() == '...' || $('#zpb1cnsm1').val() == '' ? 'NULL' : $('#zpb1cnsm1').val(),
            zpb1ConsoR2: $('#zpb1cnsm2').val() == '...' || $('#zpb1cnsm2').val() == '' ? 'NULL' : $('#zpb1cnsm2').val(),
            zpb1ConsoR3: $('#zpb1cnsm3').val() == '...' || $('#zpb1cnsm3').val() == '' ? 'NULL' : $('#zpb1cnsm3').val(),
            zpb1ConsoR4: $('#zpb1cnsm4').val() == '...' || $('#zpb1cnsm4').val() == '' ? 'NULL' : $('#zpb1cnsm4').val(),

            zpb2ConsoR1: $('#zpb2cnsm1').val() == '...' || $('#zpb2cnsm1').val() == '' ? 'NULL' : $('#zpb2cnsm1').val(),
            zpb2ConsoR2: $('#zpb2cnsm2').val() == '...' || $('#zpb2cnsm2').val() == '' ? 'NULL' : $('#zpb2cnsm2').val(),
            zpb2ConsoR3: $('#zpb2cnsm3').val() == '...' || $('#zpb2cnsm3').val() == '' ? 'NULL' : $('#zpb2cnsm3').val(),
            zpb2ConsoR4: $('#zpb2cnsm4').val() == '...' || $('#zpb2cnsm4').val() == '' ? 'NULL' : $('#zpb2cnsm4').val()
        };


        // Call NodeJS 
        if (IdCrtl == 0) {
            $.post('http://localhost:3000/SaveCtrlSemelle', { ctrl: ctrlObj }).done(function (retour) {
                // Mise à jour des Champs 'Utilised' de la Traca...
                if (retour == "OK") {
                    $.get('http://localhost:3000/updtUtilisedTraca', { id: _Traca.ID, user: userName, date: moment().format('YYYY-MM-DD HH:mm:ss') })
                        .done(function (retourUpd) {
                            $('#modal-Ctrl').modal('hide');
                            semelleTable1.ajax.reload();
                            $('#RameInput').val('');
                            ActiveNewTraca();
                            getTraca();
                        })
                    .fail(function (jqxhr, textStatus, error) {
                        var err = textStatus + ", " + error; alert("Maj Traca : " + err);
                    });
                }
                //alert("Un nouveau contôle semelle a été enregistré sous l'Identifiant " + retour.ID);
            });
        }
        else {
            $.post('http://localhost:3000/updtCtrlSemelle', { ctrl: ctrlObj, id: IdCrtl }).done(function (retour) {
                alert("Le Contrôle Semelle N° " + IdCrtl + " vient d'être mis à jour avec succès...");
                $('#modal-Ctrl').modal('hide');
                semelleTable1.ajax.reload();
            });
        }
    });

    RootSet();
    ClearModal();
    /* ---------------------------------------------------- Région Modal ---------------------------------------------------------------------------------------- */
    // Event Opening Modal
    $('#modal-Ctrl').on('show.bs.modal', function (event) {
        var modal = $(this)
        $('#id_zp').css('display', RameSelected.IdSerie != 2 ? 'inline' : 'none');

        $('#chkNC').prop('checked', false),
        $('#txtComment').val('');


        $.getJSON("http://localhost:3000/getOneTracaByID", { id: currentTracaId })
            .done(function (_traca) {
                _Traca = {
                    ID:         _traca.ID,
                    AffCreate:  moment(_traca.CreateDate).subtract(-(new Date().getTimezoneOffset() / 60), 'hour').format("DD/MM/YYYY HH:mm"), //moment(_traca.CreateDate).format("DD/MM/YYYY HH:mm"),
                    strDate:    moment(_traca.CreateDate).subtract(-(new Date().getTimezoneOffset() / 60), 'hour').format("YYYY-MM-DD HH:mm:ss"),
                    StfId:      _traca.StfId,
                    CreateBy:   _traca.CreateBy,
                    Rame:       _traca.Rame,
                    Site:       _traca.Site,
                    Interv:     _traca.Interv,
                    Title:      _traca.Title,
                    MessageBM:  _traca.MessageBM,
                    ZIB1:       _traca.ZIB1,
                    ZIB2:       _traca.ZIB2,
                    ZPB1:       _traca.ZPB1,
                    ZPB2:       _traca.ZPB2
                };
                // Recherche dernière Mesure
                $('#zib1mes1').data('oldmesure', _traca.ZIB1.split(';')[0].split(' - ')[0]);
                $('#zib1mes2').data('oldmesure', _traca.ZIB1.split(';')[1].split(' - ')[0]);
                $('#zib1mes3').data('oldmesure', _traca.ZIB1.split(';')[2].split(' - ')[0]);
                $('#zib1mes4').data('oldmesure', _traca.ZIB1.split(';')[3].split(' - ')[0]);

                $('#zib2mes1').data('oldmesure', _traca.ZIB2.split(';')[0].split(' - ')[0]);
                $('#zib2mes2').data('oldmesure', _traca.ZIB2.split(';')[1].split(' - ')[0]);
                $('#zib2mes3').data('oldmesure', _traca.ZIB2.split(';')[2].split(' - ')[0]);
                $('#zib2mes4').data('oldmesure', _traca.ZIB2.split(';')[3].split(' - ')[0]);

                // Estimation
                $('#zib1mes1').data('estim', _traca.ZIB1.split(';')[0].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib1mes2').data('estim', _traca.ZIB1.split(';')[1].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib1mes3').data('estim', _traca.ZIB1.split(';')[2].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib1mes4').data('estim', _traca.ZIB1.split(';')[3].split(' - ')[1].split('/')[0].substring(1, 3));

                $('#zib2mes1').data('estim', _traca.ZIB2.split(';')[0].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib2mes2').data('estim', _traca.ZIB2.split(';')[1].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib2mes3').data('estim', _traca.ZIB2.split(';')[2].split(' - ')[1].split('/')[0].substring(1, 3));
                $('#zib2mes4').data('estim', _traca.ZIB2.split(';')[3].split(' - ')[1].split('/')[0].substring(1, 3));


                // Estimation Mini
                $('#zib1mes1').data('estimMini', _traca.ZIB1.split(';')[0].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib1mes2').data('estimMini', _traca.ZIB1.split(';')[1].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib1mes3').data('estimMini', _traca.ZIB1.split(';')[2].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib1mes4').data('estimMini', _traca.ZIB1.split(';')[3].split(' - ')[1].split('/')[1].substring(0, 2));

                $('#zib2mes1').data('estimMini', _traca.ZIB2.split(';')[0].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib2mes2').data('estimMini', _traca.ZIB2.split(';')[1].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib2mes3').data('estimMini', _traca.ZIB2.split(';')[2].split(' - ')[1].split('/')[1].substring(0, 2));
                $('#zib2mes4').data('estimMini', _traca.ZIB2.split(';')[3].split(' - ')[1].split('/')[1].substring(0, 2));


                // Ecriture
                $('#zib1OldEst1').val(_traca.ZIB1.split(';')[0]);
                $('#zib1OldEst2').val(_traca.ZIB1.split(';')[1]);
                $('#zib1OldEst3').val(_traca.ZIB1.split(';')[2]);
                $('#zib1OldEst4').val(_traca.ZIB1.split(';')[3]);

                $('#zib2OldEst1').val(_traca.ZIB2.split(';')[0]);
                $('#zib2OldEst2').val(_traca.ZIB2.split(';')[1]);
                $('#zib2OldEst3').val(_traca.ZIB2.split(';')[2]);
                $('#zib2OldEst4').val(_traca.ZIB2.split(';')[3]);


                if (_traca.Rame.split('/')[1] != 2) {
                    $('#zpb1mes1').data('oldmesure', _traca.ZPB1.split(';')[0].split(' - ')[0]);
                    $('#zpb1mes2').data('oldmesure', _traca.ZPB1.split(';')[1].split(' - ')[0]);
                    $('#zpb1mes3').data('oldmesure', _traca.ZPB1.split(';')[2].split(' - ')[0]);
                    $('#zpb1mes4').data('oldmesure', _traca.ZPB1.split(';')[3].split(' - ')[0]);

                    $('#zpb2mes1').data('oldmesure', _traca.ZPB2.split(';')[0].split(' - ')[0]);
                    $('#zpb2mes2').data('oldmesure', _traca.ZPB2.split(';')[1].split(' - ')[0]);
                    $('#zpb2mes3').data('oldmesure', _traca.ZPB2.split(';')[2].split(' - ')[0]);
                    $('#zpb2mes4').data('oldmesure', _traca.ZPB2.split(';')[3].split(' - ')[0]);

                    // Estimation
                    $('#zpb1mes1').data('estim', _traca.ZPB1.split(';')[0].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb1mes2').data('estim', _traca.ZPB1.split(';')[1].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb1mes3').data('estim', _traca.ZPB1.split(';')[2].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb1mes4').data('estim', _traca.ZPB1.split(';')[3].split(' - ')[1].split('/')[0].substring(1, 3));

                    $('#zpb2mes1').data('estim', _traca.ZPB2.split(';')[0].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb2mes2').data('estim', _traca.ZPB2.split(';')[1].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb2mes3').data('estim', _traca.ZPB2.split(';')[2].split(' - ')[1].split('/')[0].substring(1, 3));
                    $('#zpb2mes4').data('estim', _traca.ZPB2.split(';')[3].split(' - ')[1].split('/')[0].substring(1, 3));

                    // Estimation Mini
                    $('#zpb1mes1').data('estimMini', _traca.ZPB1.split(';')[0].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb1mes2').data('estimMini', _traca.ZPB1.split(';')[1].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb1mes3').data('estimMini', _traca.ZPB1.split(';')[2].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb1mes4').data('estimMini', _traca.ZPB1.split(';')[3].split(' - ')[1].split('/')[1].substring(0, 2));

                    $('#zpb2mes1').data('estimMini', _traca.ZPB2.split(';')[0].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb2mes2').data('estimMini', _traca.ZPB2.split(';')[1].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb2mes3').data('estimMini', _traca.ZPB2.split(';')[2].split(' - ')[1].split('/')[1].substring(0, 2));
                    $('#zpb2mes4').data('estimMini', _traca.ZPB2.split(';')[3].split(' - ')[1].split('/')[1].substring(0, 2));

                    // Ecriture
                    $('#zpb1OldEst1').val(_traca.ZPB1.split(';')[0]);
                    $('#zpb1OldEst2').val(_traca.ZPB1.split(';')[1]);
                    $('#zpb1OldEst3').val(_traca.ZPB1.split(';')[2]);
                    $('#zpb1OldEst4').val(_traca.ZPB1.split(';')[3]);

                    $('#zpb2OldEst1').val(_traca.ZPB2.split(';')[0]);
                    $('#zpb2OldEst2').val(_traca.ZPB2.split(';')[1]);
                    $('#zpb2OldEst3').val(_traca.ZPB2.split(';')[2]);
                    $('#zpb2OldEst4').val(_traca.ZPB2.split(';')[3]);
                }

                // Init du popup + Affichage du Message BM (Cas d'un BM isolé)
                if (_traca.MessageBM.trim().length > 0) {
                    $('#badgeBM').css('display', 'inline-block');
                    $('#txtbadgeBM').text(_traca.MessageBM.trim());
                }

                // Init des Textes de chaque Bogie
                $('#leg_zib1').text(_traca.Title.split(';')[0]);
                $('#leg_zib2').text(_traca.Title.split(';')[1]);
                if (_traca.Rame.split('/')[1] != 2) {
                    $('#leg_zpb1').text(_traca.Title.split(';')[2]);
                    $('#leg_zpb2').text(_traca.Title.split(';')[3]);
                }

                // Add New Ctrl
                if (IdCrtl == 0) {
                    $('#dtCtrl').prop('disabled', false);
                    modal.find('.modal-title').text("Ajout d'un Contrôle Semelle... [" + _traca.Rame.split('/')[3] + "] - [" + _traca.Site.split('/')[1] + "] - [" + _traca.Interv.split('/')[1] + "] - [" + _Traca.AffCreate + "]");
                    //$('#dtCtrl').daterangepicker({ locale: localType, singleDatePicker: true, showDropdowns: true, showWeekNumbers: true, startDate: moment(), minDate: moment(_Traca.strDate).format("DD/MM/YYYY"), maxDate: moment() });
                }
                    // Edit Present Ctrl
                else {
                    modal.find('.modal-title').text("Edition du Contrôle Semelle N° " + IdCrtl + "  [" + RameSelected.EAB + "] du " + moment(currentCtrl.DateCtrl).format("DD/MM/YYYY"));//moment(_dtCtrl).format("DD/MM/YYYY")
                    //$('#dtCtrl').daterangepicker({ locale: localType, singleDatePicker: true, showDropdowns: true, showWeekNumbers: true, startDate: moment(), minDate: moment(currentCtrl.DateCtrl).format("DD/MM/YYYY"), maxDate: moment() });
                    //$('#dtCtrl').prop('disabled', true);

                    $('#chkNC').prop('checked', currentCtrl.NonConf),
                    $('#txtComment').val(currentCtrl.Comment);


                    $("#chkZIB1").prop('checked', currentCtrl.ZIB1_Ctrl); $("#chkzib1bgiso").prop('checked', currentCtrl.ZIB1_Ctrl && currentCtrl.ZIB1_BG_Iso); $("#chkzib1bmiso").prop('checked', currentCtrl.ZIB1_Ctrl && currentCtrl.ZIB1_BM_Iso);
                    $("#chkZIB2").prop('checked', currentCtrl.ZIB2_Ctrl); $("#chkzib2bgiso").prop('checked', currentCtrl.ZIB2_Ctrl && currentCtrl.ZIB2_BG_Iso); $("#chkzib2bmiso").prop('checked', currentCtrl.ZIB2_Ctrl && currentCtrl.ZIB2_BM_Iso);

                    if (currentCtrl.ZIB1_Ctrl) {
                        $('*[aria-label="ZIB1"]').prop("disabled", false);
                        $('#zib1mes1').data('mesureOK', true); $('#zib1mes2').data('mesureOK', true); $('#zib1mes3').data('mesureOK', true); $('#zib1mes4').data('mesureOK', true);
                        $('#zib1mes1').val(currentCtrl.ZIB1_R1_MESURE); $('#zib1mes2').val(currentCtrl.ZIB1_R2_MESURE); $('#zib1mes3').val(currentCtrl.ZIB1_R3_MESURE); $('#zib1mes4').val(currentCtrl.ZIB1_R4_MESURE);
                        $('#zib1ctvs1').prop('checked', currentCtrl.ZIB1_R1_VISUEL); $('#zib1ctvs2').prop('checked', currentCtrl.ZIB1_R2_VISUEL); $('#zib1ctvs3').prop('checked', currentCtrl.ZIB1_R3_VISUEL); $('#zib1ctvs4').prop('checked', currentCtrl.ZIB1_R4_VISUEL);
                        $('#zib1rpl1').prop('checked', currentCtrl.ZIB1_R1_RPL); $('#zib1rpl2').prop('checked', currentCtrl.ZIB1_R2_RPL); $('#zib1rpl3').prop('checked', currentCtrl.ZIB1_R3_RPL); $('#zib1rpl4').prop('checked', currentCtrl.ZIB1_R4_RPL);
                        $('#zib1cnsm1').val(currentCtrl.ZIB1_R1_CONSO); $('#zib1cnsm2').val( currentCtrl.ZIB1_R2_CONSO); $('#zib1cnsm3').val(currentCtrl.ZIB1_R3_CONSO); $('#zib1cnsm4').val( currentCtrl.ZIB1_R4_CONSO);
                    }
                    if (currentCtrl.ZIB2_Ctrl) {
                        $('*[aria-label="ZIB2"]').prop("disabled", false);
                        $('#zib2mes1').data('mesureOK', true); $('#zib2mes2').data('mesureOK', true); $('#zib2mes3').data('mesureOK', true); $('#zib2mes4').data('mesureOK', true);
                        $('#zib2mes1').val(currentCtrl.ZIB2_R1_MESURE); $('#zib2mes2').val(currentCtrl.ZIB2_R2_MESURE); $('#zib2mes3').val(currentCtrl.ZIB2_R3_MESURE); $('#zib2mes4').val(currentCtrl.ZIB2_R4_MESURE);
                        $('#zib2ctvs1').prop('checked', currentCtrl.ZIB2_R1_VISUEL); $('#zib2ctvs2').prop('checked', currentCtrl.ZIB2_R2_VISUEL); $('#zib2ctvs3').prop('checked', currentCtrl.ZIB2_R3_VISUEL); $('#zib2ctvs4').prop('checked', currentCtrl.ZIB2_R4_VISUEL);
                        $('#zib2rpl1').prop('checked', currentCtrl.ZIB2_R1_RPL); $('#zib2rpl2').prop('checked', currentCtrl.ZIB2_R2_RPL); $('#zib2rpl3').prop('checked', currentCtrl.ZIB2_R3_RPL); $('#zib2rpl4').prop('checked', currentCtrl.ZIB2_R4_RPL);
                        $('#zib2cnsm1').val(currentCtrl.ZIB2_R1_CONSO); $('#zib2cnsm2').val(currentCtrl.ZIB2_R2_CONSO); $('#zib2cnsm3').val(currentCtrl.ZIB2_R3_CONSO); $('#zib2cnsm4').val(currentCtrl.ZIB2_R4_CONSO);
                    }

                    if (RameSelected.IdSerie != 2) {
                        $('#leg_zpb1').val(zPaire + ' Bogie 1');
                        $('#leg_zpb2').val(zPaire + ' Bogie 2');

                        $("#chkZPB1").prop('checked', currentCtrl.ZPB1_Ctrl); $("#chkzpb1bgiso").prop('checked', currentCtrl.ZPB1_Ctrl && currentCtrl.ZPB1_BG_Iso); $("#chkzpb1bmiso").prop('checked', currentCtrl.ZPB1_Ctrl && currentCtrl.ZPB1_BM_Iso);
                        $("#chkZPB2").prop('checked', currentCtrl.ZPB2_Ctrl); $("#chkzpb2bgiso").prop('checked', currentCtrl.ZPB2_Ctrl && currentCtrl.ZPB2_BG_Iso); $("#chkzpb2bmiso").prop('checked', currentCtrl.ZPB2_Ctrl && currentCtrl.ZPB2_BM_Iso);

                        if (currentCtrl.ZPB1_Ctrl) {
                            $('*[aria-label="ZPB1"]').prop("disabled", false);
                            $('#zpb1mes1').data('mesureOK', true); $('#zpb1mes2').data('mesureOK', true); $('#zpb1mes3').data('mesureOK', true); $('#zpb1mes4').data('mesureOK', true);
                            $('#zpb1mes1').val(currentCtrl.ZPB1_R1_MESURE); $('#zpb1mes2').val(currentCtrl.ZPB1_R2_MESURE); $('#zpb1mes3').val(currentCtrl.ZPB1_R3_MESURE); $('#zpb1mes4').val(currentCtrl.ZPB1_R4_MESURE);
                            $('#zpb1ctvs1').prop('checked', currentCtrl.ZPB1_R1_VISUEL); $('#zpb1ctvs2').prop('checked', currentCtrl.ZPB1_R2_VISUEL); $('#zpb1ctvs3').prop('checked', currentCtrl.ZPB1_R3_VISUEL); $('#zpb1ctvs4').prop('checked', currentCtrl.ZPB1_R4_VISUEL);
                            $('#zpb1rpl1').prop('checked', currentCtrl.ZPB1_R1_RPL); $('#zpb1rpl2').prop('checked', currentCtrl.ZPB1_R2_RPL); $('#zpb1rpl3').prop('checked', currentCtrl.ZPB1_R3_RPL); $('#zpb1rpl4').prop('checked', currentCtrl.ZPB1_R4_RPL);
                            $('#zpb1cnsm1').val(currentCtrl.ZPB1_R1_CONSO); $('#zpb1cnsm2').val(currentCtrl.ZPB1_R2_CONSO); $('#zpb1cnsm3').val(currentCtrl.ZPB1_R3_CONSO); $('#zpb1cnsm4').val(currentCtrl.ZPB1_R4_CONSO);
                        }
                        if (currentCtrl.ZPB2_Ctrl) {
                            $('*[aria-label="ZPB2"]').prop("disabled", false);
                            $('#zpb2mes1').data('mesureOK', true); $('#zpb2mes2').data('mesureOK', true); $('#zpb2mes3').data('mesureOK', true); $('#zpb2mes4').data('mesureOK', true);
                            $('#zpb2mes1').val(currentCtrl.ZPB2_R1_MESURE); $('#zpb2mes2').val(currentCtrl.ZPB2_R2_MESURE); $('#zpb2mes3').val(currentCtrl.ZPB2_R3_MESURE); $('#zpb2mes4').val(currentCtrl.ZPB2_R4_MESURE);
                            $('#zpb2ctvs1').prop('checked', currentCtrl.ZPB2_R1_VISUEL); $('#zpb2ctvs2').prop('checked', currentCtrl.ZPB2_R2_VISUEL); $('#zpb2ctvs3').prop('checked', currentCtrl.ZPB2_R3_VISUEL); $('#zpb2ctvs4').prop('checked', currentCtrl.ZPB2_R4_VISUEL);
                            $('#zpb2rpl1').prop('checked', currentCtrl.ZPB2_R1_RPL); $('#zpb2rpl2').prop('checked', currentCtrl.ZPB2_R2_RPL); $('#zpb2rpl3').prop('checked', currentCtrl.ZPB2_R3_RPL); $('#zpb2rpl4').prop('checked', currentCtrl.ZPB2_R4_RPL);
                            $('#zpb2cnsm1').val(currentCtrl.ZPB2_R1_CONSO); $('#zpb2cnsm2').val(currentCtrl.ZPB2_R2_CONSO); $('#zpb2cnsm3').val(currentCtrl.ZPB2_R3_CONSO); $('#zpb2cnsm4').val(currentCtrl.ZPB2_R4_CONSO);
                        }
                    }
                    CheckSaisie();
                }

            })
            .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Récupération Traças... : " + err); });
        
    })
    // Event Close Modal
    $('#modal-Ctrl').on('hide.bs.modal', function (event) {  $('#tracas').selectpicker('val', 0); ClearModal(); $('#SemelleProcessing').css('display','none'); });
    /* ---------------------------------------------------- Fin Région Modal ------------------------------------------------------------------------------------- */

    /* datatables */
    $('#semelleTable').on('processing.dt', function (e, settings, processing) { $('#SemelleProcessing').css('display', processing ? 'block' : 'none'); });
    var optionsCtrlSem = {
        "dom": domOptions,
        "processing": true,
        "deferRender": true,
        "jQueryUI": true,
        "order": [[1, "desc"]],
        "filter": true,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Toutes"]],
        "iDisplayLength": 25,
        "language": languageOptions,
        "ajax": {
            "url": "http://localhost:3000/getCtrlsSemelles",
            "data": function (d) {
                d.stf   = StfSelected.ID;
                d.date = moment().format('YYYY-MM-DD');
            }
        },
        "columns": [
            { "data": null, "className": 'dtTables-details', "orderable": false, "defaultContent": '<i class="fa fa-lg"></i>' },
            
            { "data": "DateSaisi", "className": "clsWrap", "type": 'date-euro', "render": function (data, type, full, meta) { return moment(data).format('DD/MM/YYYY HH:mm'); } },
            { "data": "NumRame", "className": "clsWrap" },
            { "data": "Site", "className": "clsWrap", "searchable": true },
            {
                "data": "ZIB1_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R1_VISUEL ?
                     (full.ZIB1_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R2_VISUEL ?
                     (full.ZIB1_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R3_VISUEL ?
                     (full.ZIB1_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB1_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB1_R4_VISUEL ?
                     (full.ZIB1_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB1_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB1_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB1_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R1_VISUEL ?
                     (full.ZIB2_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R2_VISUEL ?
                     (full.ZIB2_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R3_VISUEL ?
                     (full.ZIB2_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZIB2_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZIB2_R4_VISUEL ?
                     (full.ZIB2_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZIB2_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZIB2_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZIB2_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R1_VISUEL ?
                     (full.ZPB1_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R2_VISUEL ?
                     (full.ZPB1_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R3_VISUEL ?
                     (full.ZPB1_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB1_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB1_R4_VISUEL ?
                     (full.ZPB1_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB1_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB1_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB1_R4_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R1_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R1_VISUEL ?
                     (full.ZPB2_R1_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R1_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R1_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R1_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R2_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R2_VISUEL ?
                     (full.ZPB2_R2_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R2_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R2_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R2_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R3_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R3_VISUEL ?
                     (full.ZPB2_R3_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R3_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R3_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R3_CONSO + '</span>'))));
                }
            },
            {
                "data": "ZPB2_R4_MESURE", "render": function (data, type, full, meta) {
                    return (full.ZPB2_R4_VISUEL ?
                     (full.ZPB2_R4_RPL ? '<span class="bdg"><i class="fa fa-eye fa-lg ctrl-visuel"></i></span>' : '<i class="fa fa-eye fa-lg ctrl-visuel"></i>')
                     :
                     (data == '0' ? ('') :
                     (full.ZPB2_R4_RPL ? ('<span class="bdg">' + data + '</span>' + '<span class="bdgConso">' + full.ZPB2_R4_CONSO + '</span>') : (data + '<span class="bdgConso">' + full.ZPB2_R4_CONSO + '</span>'))));
                }
            }
        ],
        "drawCallback": function (settings) { },
        "createdRow": function (row, data, index) {
            if (data.ZIB1_BM_Iso) { for (var i = 4; i <= 7; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZIB2_BM_Iso) { for (var i = 8; i <= 11; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZPB1_BM_Iso) { for (var i = 12; i <= 15; i++) { row.cells[i].className = "bmIso"; } }
            if (data.ZPB2_BM_Iso) { for (var i = 16; i <= 19; i++) { row.cells[i].className = "bmIso"; } }
        }
    };

    var getCrtlSemelle = function () {
        if (typeof semelleTable1 != "undefined")  semelleTable1.destroy();  // destroy table if exist
        semelleTable1 = $('#semelleTable')
            .on('error.dt', function (e, settings, techNote, message) { console.log('An error has been reported by DataTables: ', message); })
            //.on('xhr.dt', function (e, settings, json, xhr) { $('#_i_refresh').removeClass("fa-spin"); })
            .DataTable(optionsCtrlSem);

        // Add event listener for opening and closing details
        $('#semelleTable tbody').on('click', 'td.dtTables-details', function () {
            var tr = $(this).closest('tr');
            var row = semelleTable1.row(tr);
            var rowData = row.data();

            if (row.child.isShown()) {
                // This row is already open - close it
                IdCrtl      = 0;
                currentCtrl = {};
                currentTracaId = 0;
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                $('#SemelleProcessing').css('display', 'block');
                $.ajax({
                    type: "POST",
                    url: 'Semelle/DetailCtrl',
                    data: { ID: rowData.ID },
                    success: function (data) {
                        $('#SemelleProcessing').css('display', 'none');
                        row.child(data).show();
                        tr.addClass('shown'); // Modifie l'icone de l'oeil

                        IdCrtl = rowData.ID; currentCtrl = rowData;
                        currentTracaId = rowData.TracaId;
                        $('#btn-editCtrl').prop('disabled', currentTracaId == 0);

                        $('#sites_detail').get(0).options.length = 0;
                        $.each(_lstSites, function (i, item) { $('#sites_detail').append('<option value ="' + item.ID + '">' + item.Site + '</option>'); });
                        $('#sites_detail').selectpicker('refresh');

                        $('#inters_detail').get(0).options.length = 0;
                        $.each(_lstIntervs, function (i, item) { $('#inters_detail').append('<option value ="' + item.ID + '">' + item.Interv + '</option>'); });
                        $('#inters_detail').selectpicker('refresh');

                        $('#sites_detail').selectpicker('val', rowData.SiteId);
                        $('#inters_detail').selectpicker('val', rowData.InterventionId);
                        //$('input[name="dtCtrl_detail"]').daterangepicker({ locale: localType, startDate: moment(rowData.DateCtrl), singleDatePicker: true, showDropdowns: false, showWeekNumbers: true, maxDate: moment() });
                        $('#_lblName').text("Saisi par " + rowData.UserCtrl)

                        /* CSS ------------- */
                        // Mise en forme CSS des SelectPicker
                        $('.single-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%' }); $('.multi-select').selectpicker({ style: 'btn-sm', size: 'auto', width: '100%', selectedTextFormat: 'count>3', liveSearch: true });
                        /* FIN CSS --------- */

                        // Edition
                        $('#btn-editCtrl').on('click', function (e) {
                            _Controle = { ZP: "", ZI: "", LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", kmzib1: 0, kmzib2: 0, kmzpb1: 0, kmzpb2: 0, MessBM: "" };
                            _LastDate = { LastDateZIB1: "", LastDateZIB2: "", LastDateZPB1: "", LastDateZPB2: "", LastIdZIB1: "", LastIdZIB2: "", LastIdZPB1: "", LastIdZPB2: "" };
                            _LastZIB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZIB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZPB1 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _LastZPB2 = { BmIso: false, cvR1: false, cvR2: false, cvR3: false, cvR4: false, rplR1: false, rplR2: false, rplR3: false, rplR4: false, mesuR1: 0, mesuR2: 0, mesuR3: 0, mesuR4: 0 };
                            _zib1Ok = false; _zib2Ok = false; _zpb1Ok = false; _zpb2Ok = false;
                            _RecupZIB1 = false; _RecupZIB2 = false; _RecupZPB1 = false; _RecupZPB2 = false;
                            zImpaire = "";
                            zPaire = "";
                            _SaisieValide = false;

                            CtrlBuild.rame = rowData.RameId + '/' + rowData.SerieId + '/' + rowData.SousSerieId + '/' + rowData.NumRame;
                            RameSelected = { ID: rowData.RameId, EAB: rowData.NumRame, NumEF: "0", IdRexM: 0, IdSerie: rowData.SerieId, IdSousSerie: rowData.SousSerieId, Serie: "0", SousSerie: "0", CodeSerie: "0", IdFlotteOsm: 0 };
                            $('#modal-Ctrl').modal({ keyboard: true, show: true });

                        });

                        // Delete
                        $('#btn-delCtrl').on('click', function (e) {
                            $.confirm({
                                theme: 'bootstrap',
                                icon: 'fa fa-exclamation-triangle btn-danger',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: 'Suppression Contrôle',
                                content: '<strong>Attention</strong>, vous êtes sur le point de supprimer un Contrôle semelle. <br> Veuillez Confirmer ou Annuler SVP...',
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/deleteCtrlByID', { id: rowData.ID })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur de la suppression du Ctrl : " + err); });
                                },
                                cancel: function () { }
                            });
                        });
                        $("#sites_detail").on('change', function () {
                            $.confirm({
                                theme:'bootstrap',
                                icon: 'fa fa-question-circle btn-primary',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: 'Mofification du site',
                                content: 'Confirmez-vous le changement du site ?',
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/updtValueCtrlByID', { id: rowData.ID, field: 'SiteId', value: $("#sites_detail").val() })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur dans la mise à jour du Ctrl : " + err); });
                                },
                                cancel: function () { $('#sites_detail').selectpicker('val', rowData.SiteId); }
                            });
                        });
                        $("#inters_detail").on('change', function () {
                            $.confirm({
                                theme: 'bootstrap',
                                icon: 'fa fa-question-circle btn-primary',
                                confirmButton: 'Confirmer',
                                cancelButton: 'Annuler',
                                confirmButtonClass: 'btn-primary',
                                cancelButtonClass: 'btn-warning',
                                title: "Mofification de l'intervention",
                                content: "Confirmez-vous le changement de l'intervention ?",
                                animation: 'zoom',
                                closeAnimation: 'scale',
                                animationSpeed: 500,
                                animationBounce: 1.2,
                                confirm: function () {
                                    $.get('http://localhost:3000/updtValueCtrlByID', { id: rowData.ID, field: 'InterventionId', value: $("#inters_detail").val() })
                                        .done(function (retour) { semelleTable1.ajax.reload(); })
                                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur dans la mise à jour du Ctrl : " + err); });
                                },
                                cancel: function () { $('#inters_detail').selectpicker('val', rowData.InterventionId); }
                            });
                        });
                    },
                    error: function (e) { alert("Erreur Ouverture Détail" + "\r\n" + e.error); $('#SemelleProcessing').css('display', 'none'); }
                });
            }

        });

    }

    function ImportDataV2() {
        $('#SemelleProcessing').css('display', 'block' );
        datasetSemelle = [];
        var lstCtrl = [];
        $.getJSON("http://localhost:3000/getCtrlSemelle", { periode: " WHERE     (DateCtrl >= CONVERT(DATETIME, '2016-04-28 00:00:00', 102))" })
            .done(function (_ctrl) {
                var tabIdCtrl = new Array();
                var tabCtrl = new Array();
                var tabBogie = new Array();
                var tabData = new Array();
                $.each(_ctrl.data, function (key, ctrl) {
                    tabIdCtrl.push(ctrl.ID);
                    tabCtrl.push({ ID: ctrl.ID, DateCtrl: ctrl.DateCtrl, IdRame: ctrl.IdRame, IdIntervention: ctrl.IdIntervention, IdSite: ctrl.IdSite, ControlerName: ctrl.ControlerName, SerieId: ctrl.SerieId, StfId: ctrl.StfId, Site: ctrl.Site, Intervention: ctrl.Intervention, EAB: ctrl.EAB });
                });

                if (tabCtrl.length > 0) {

                    $.getJSON("http://localhost:3000/getBogie", { IdCtrl: tabIdCtrl.join(',') })
                        .done(function (_bogie) {
                            var tabIdBogie = new Array();
                            $.each(_bogie.data, function (key, bogie) {
                                tabIdBogie.push(bogie.ID);
                                tabBogie.push({
                                    ID: bogie.ID, ControleId: bogie.ControleId, CompoId: bogie.CompoId, BogieId: bogie.BogieId, BogieIsole: bogie.BogieIsole, BMisole: bogie.BMisole, NumVehicule: bogie.NumVehicule, Parite:
                                        bogie.NumVehicule % 2 == 0 ? "p" : "i"
                                });
                            });

                            $.getJSON("http://localhost:3000/getMesures", { IdBogie: tabIdBogie.join(',') })
                                .done(function (_data) {
                                    $.each(_data.data, function (key, mesure) {
                                        tabData.push({ ID: mesure.ID, NumRoue: mesure.NumRoue, BogieId: mesure.BogieId, Conformite: mesure.Conformite, Remplacement: mesure.Remplacement, CtrlVisuel: mesure.CtrlVisuel, Mesure: mesure.Mesure, ValiditeMesure: mesure.ValiditeMesure });
                                    });

                                    for (var i = 0; i < tabCtrl.length; i++) {
                                        var zib1 = false; var zib2 = false; var zpb1 = false; var zpb2 = false;
                                        var zib1Mes = null; var zib2Mes = null; var zpb1Mes = null; var zpb2Mes = null;
                                        var zib1Rpl = false; var zib2Rpl = false; var zpb1Rpl = false; var zpb2Rpl = false;
                                        var zib1Cv = false; var zib2Cv = false; var zpb1Cv = false; var zpb2Cv = false;
                                        var zib1Iso = false; var zib2Iso = false; var zpb1Iso = false; var zpb2Iso = false;
                                        var zib1BgIso = false; var zib2BgIso = false; var zpb1BgIso = false; var zpb2BgIso = false;

                                        var tabBogieFilter = tabBogie.filter(function (item) { return item.ControleId == tabCtrl[i].ID });

                                        for (var j = 0; j < tabBogieFilter.length; j++) {
                                            var tabDataFilter = tabData.filter(function (item) { return item.BogieId == tabBogieFilter[j].ID });

                                            if (tabBogieFilter[j].Parite == "i")
                                                if (tabBogieFilter[j].BogieId == 1) {
                                                    zib1 = true;
                                                    zib1Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zib1Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zib1Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zib1Iso = tabBogieFilter[j].BMisole;
                                                    zib1BgIso = tabBogieFilter[j].BogieIsole;
                                                }
                                            if (tabBogieFilter[j].Parite == "i")
                                                if (tabBogieFilter[j].BogieId == 2) {
                                                    zib2 = true;
                                                    zib2Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zib2Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zib2Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zib2Iso = tabBogieFilter[j].BMisole;
                                                    zib2BgIso = tabBogieFilter[j].BogieIsole;
                                                }
                                            if (tabBogieFilter[j].Parite == "p")
                                                if (tabBogieFilter[j].BogieId == 1) {
                                                    zpb1 = true;
                                                    zpb1Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zpb1Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zpb1Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zpb1Iso = tabBogieFilter[j].BMisole;
                                                    zpb1BgIso = tabBogieFilter[j].BogieIsole;
                                                }
                                            if (tabBogieFilter[j].Parite == "p")
                                                if (tabBogieFilter[j].BogieId == 2) {
                                                    zpb2 = true;
                                                    zpb2Mes = { R1: tabDataFilter[0].Mesure, R2: tabDataFilter[1].Mesure, R3: tabDataFilter[2].Mesure, R4: tabDataFilter[3].Mesure };
                                                    zpb2Rpl = { R1: tabDataFilter[0].Remplacement, R2: tabDataFilter[1].Remplacement, R3: tabDataFilter[2].Remplacement, R4: tabDataFilter[3].Remplacement };
                                                    zpb2Cv = { R1: tabDataFilter[0].CtrlVisuel, R2: tabDataFilter[1].CtrlVisuel, R3: tabDataFilter[2].CtrlVisuel, R4: tabDataFilter[3].CtrlVisuel };
                                                    zpb2Iso = tabBogieFilter[j].BMisole;
                                                    zpb2BgIso = tabBogieFilter[j].BogieIsole;
                                                }
                                        }

                                        // Elaboration de l'object CTRL
                                        var eab = tbRames.data.filter(function (item) { return item.ID == tabCtrl[i].IdRame });
                                        var lineStr = "(";

                                        lineStr += "'" + moment(new Date(tabCtrl[i].DateCtrl)).format('YYYY-MM-DD 00:00:00') + "',";
                                        lineStr += "'" + moment(new Date(tabCtrl[i].DateCtrl)).format('YYYY-MM-DD 00:00:00') + "',";
                                        lineStr += tabCtrl[i].StfId + ",";
                                        lineStr += "'" + tabCtrl[i].ControlerName.replace("'", " ") + "',";
                                        lineStr += tabCtrl[i].IdSite + ",";
                                        lineStr += tabCtrl[i].IdIntervention + ",";
                                        lineStr += tabCtrl[i].IdRame + ",";
                                        lineStr += eab.length == 0 ? "'---'," : "'" + eab[0].EAB + "',";
                                        lineStr += tabCtrl[i].SerieId + ",";
                                        lineStr += eab.length == 0 ? 0 + "," : eab[0].IdSousSerie + ",";
                                        // Ctrl du bogie
                                        lineStr += (zib1 ? 1 : 0) + ",";
                                        lineStr += (zib2 ? 1 : 0) + ",";
                                        lineStr += (zpb1 ? 1 : 0) + ",";
                                        lineStr += (zpb2 ? 1 : 0) + ",";
                                        //Bogie Isolé
                                        lineStr += (zib1BgIso ? 1 : 0) + ",";
                                        lineStr += (zib2BgIso ? 1 : 0) + ",";
                                        lineStr += (zpb1BgIso ? 1 : 0) + ",";
                                        lineStr += (zpb2BgIso ? 1 : 0) + ",";
                                        // BM Isolé
                                        lineStr += (zib1Iso ? 1 : 0) + ",";
                                        lineStr += (zib2Iso ? 1 : 0) + ",";
                                        lineStr += (zpb1Iso ? 1 : 0) + ",";
                                        lineStr += (zpb2Iso ? 1 : 0) + ",";
                                        // Remplacement Semelle
                                        lineStr += (zib1 ? zib1Rpl.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Rpl.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Rpl.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Rpl.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Rpl.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Rpl.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Rpl.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Rpl.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Rpl.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Rpl.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Rpl.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Rpl.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Rpl.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Rpl.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Rpl.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Rpl.R4 ? 1 : 0 : 0) + ",";
                                        // Ctrl Visuel
                                        lineStr += (zib1 ? zib1Cv.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Cv.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Cv.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib1 ? zib1Cv.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Cv.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Cv.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Cv.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zib2 ? zib2Cv.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Cv.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Cv.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Cv.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Cv.R4 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Cv.R1 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Cv.R2 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Cv.R3 ? 1 : 0 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Cv.R4 ? 1 : 0 : 0) + ",";
                                        // Mesures
                                        lineStr += (zib1 ? zib1Mes.R1 : 0) + ",";
                                        lineStr += (zib1 ? zib1Mes.R2 : 0) + ",";
                                        lineStr += (zib1 ? zib1Mes.R3 : 0) + ",";
                                        lineStr += (zib1 ? zib1Mes.R4 : 0) + ",";
                                        lineStr += (zib2 ? zib2Mes.R1 : 0) + ",";
                                        lineStr += (zib2 ? zib2Mes.R2 : 0) + ",";
                                        lineStr += (zib2 ? zib2Mes.R3 : 0) + ",";
                                        lineStr += (zib2 ? zib2Mes.R4 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Mes.R1 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Mes.R2 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Mes.R3 : 0) + ",";
                                        lineStr += (zpb1 ? zpb1Mes.R4 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Mes.R1 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Mes.R2 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Mes.R3 : 0) + ",";
                                        lineStr += (zpb2 ? zpb2Mes.R4 : 0) + ",";
                                        // Conso
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += null + ",";
                                        lineStr += 0 + ",";
                                        lineStr += tabCtrl[i].ID + ")";

                                        lstCtrl.push(lineStr);
                                    }

                                    // Call NodeJS
                                    $.post('http://localhost:3000/ImportDataV2', { ctrl: lstCtrl })
                                    .done(function (__data) {
                                        $('#SemelleProcessing').css('display', 'none');
                                        alert(lstCtrl.length + " Ctrls importés...");
                                        getCrtlSemelle();
                                    });

                                })
                                .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur Récupération Mesures Semelles : " + err); });
                        })
                        .fail(function (jqxhr, textStatus, error) { var err = textStatus + ", " + error; alert("Erreur de récupération des Bogies : " + err); });
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Erreur de récupération des Ctrl Semelles : " + err);
            });

    }
    GetNavigator("V3. CtrlSemelle");
});