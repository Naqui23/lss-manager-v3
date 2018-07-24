(($, win, I18n) => {
    if (!document.URL.match(/(leitstellenspiel|missionchief|meldkamerspel)(.de|.com)\/#?$/)) {
        return;
    }

    I18n.translations.de.lssm.verbandserweiterung = {
        name: 'Verwaltung',
        allianceFunds: 'Verbandskasse',
        earnedCredits: 'Verdiente Credits',
        onlineUsers: 'Mitglieder online',
        updateMessage: 'Werte aktualisieren sich<br>automatisch alle 5 Minuten.'
    };
    I18n.translations.en.lssm.verbandserweiterung = {
        name: 'administration',
        allianceFunds: 'Alliance Funds',
        earnedCredits: 'Earned Credits',
        onlineUsers: 'Members online',
        updateMessage: 'Values update automatically<br>every 5 minutes.'
    };
    I18n.translations.nl.lssm.verbandserweiterung = {
        name: 'toediening',
        allianceFunds: 'Teamkas',
        earnedCredits: 'Verdiende Credits',
        onlineUsers: 'Leden online',
        updateMessage: 'Waarden worden elke<br>5 minuten automatisch bijgewerkt.'
    };

    function getAllianceFundsCredits() {
        let response = $.ajax({
            type: "GET",
            url: "./verband/kasse",
            async: false
        }).responseText;
        if ($(response).find('h1')[0]) {
            return parseInt($(response).find('h1')[0].innerText.replace(/\./g, "").replace(/,/g, ""));
        } else {
            return;
        }
    }

    function getAllianceName() {
        let response = $.ajax({
            type: "GET",
            url: "./verband",
            async: false
        }).responseText;
        if ($(response).find('.navbar-header a')[0]) {
            return $(response).find('.navbar-header a')[0].innerText;
        } else {
            return "?!";
        }
    }

    function getAllianceListEntry() {
        let allianceName = getAllianceName();
        let response = $.ajax({
            type: "GET",
            url: "./alliances?utf8=%E2%9C%93&caption=" + encodeURIComponent(allianceName),
            async: false
        }).responseText;
        if ($(response).find('table tbody tr:first')) {
            let datas = $(response).find('table tbody tr:first').children();
            return [datas[1], datas[2], datas[3]];
        } else {
            return ["", "", ""];
        }
    }

    function getOnlineUsers() {
        let online = 0;
        let response = $.ajax({
            type: "GET",
            url: "./verband/mitglieder?online=true",
            async: false
        }).responseText;
        let pageControl = $(response).find('table ~ ul.pagination');
        if (pageControl.length != 0) {
            for (let i = 1; i < pageControl.children().length - 1; i++) {
                if (i != pageControl.children().length - 2) {
                    online += 20;
                } else {
                    let response = $.ajax({
                        type: "GET",
                        url: "./verband/mitglieder/2481?online=true&page=" + pageControl.children()[i].innerText,
                        async: false
                    }).responseText;
                    let rows = $(response).find('tbody tr');
                    online += rows.length;
                }
            }
        } else {
            let rows = $(response).find('tbody tr');
            online += rows.length;
        }
        return online;
    }

    function updateValues() {
        let allianceFundsCredits = getAllianceFundsCredits();

        if (allianceFundsCredits) {
            $("#verbandserweiterungAllianceFunds").html(I18n.t('lssm.verbandserweiterung.allianceFunds') + ': ' + allianceFundsCredits.toLocaleString() + ' Credits');
        } else {
            $("#verbandserweiterungAllianceFunds").remove();
        }

        let allianceListEntry = getAllianceListEntry();

        let earnedCredits = parseInt(allianceListEntry[1].innerText.replace(/[\D]/g, ''));
        $('#verbandserweiterungAllianceCredits').html(I18n.t('lssm.verbandserweiterung.earnedCredits') + ': ' + earnedCredits.toLocaleString() + ' Credits');

        let users = parseInt(allianceListEntry[2].innerText.replace(/[\D]/g, ''));
        let onlineUsers = getOnlineUsers();
        $('#verbandserweiterungUsers').html(I18n.t('lssm.verbandserweiterung.onlineUsers') + ': ' + onlineUsers.toLocaleString() + '/' + users + ' (' + Math.round((100 / users) * onlineUsers) + '%)');
    }

    let markup = '<li role="presentation"  id="alliance_extension" class="alliance_true"><a href="#" role="button" class="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + I18n.t('lssm.verbandserweiterung.name') + '&nbsp;<b class="caret"></b></a><ul id="alliance_extension_dropdown"><li role="presentation" id="verbandserweiterungUsers">Mitglieder online: 0</li><li role="presentation" id="verbandserweiterungAllianceFunds">Verbandskasse: 0 Credits</li><li role="presentation" id="verbandserweiterungAllianceCredits">Verdiente Credits: 0 Credits</li><li class="divider" role="presentation"></li><li role="presentation">' + I18n.t('lssm.verbandserweiterung.updateMessage') + '</li></ul></li>';

    $("#menu_alliance ~ ul li:first").before(markup);

    $('#alliance_extension_dropdown').hide();

    $('#alliance_extension').hover(function() {
        $('#alliance_extension_dropdown').toggle();
    });

    $('#alliance_extension_dropdown').css('position', 'absolute');
    $('#alliance_extension_dropdown').css('z-index', '999');
    $('#alliance_extension_dropdown').css('background', '#c9302c');

    updateValues();
    setInterval(updateValues, 300000);
})($, window, I18n);
