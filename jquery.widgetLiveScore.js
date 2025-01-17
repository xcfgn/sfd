// ---------------------------------
// ---------- widgetLiveScore ----------
// ---------------------------------
// Widget for LiveScore Display
// ------------------------
;
(function($, window, document, undefined) {

    var widgetLiveScore = 'widgetLiveScore';

    function Plugin(element, options) {
        this.element = element;
        this._name = widgetLiveScore;
        this._defaults = $.fn.widgetLiveScore.defaults;
        this.options = $.extend({}, this._defaults, options);

        this.init();
    }

    $.extend(Plugin.prototype, {

        // Initialization logic
        init: function() {
            this.buildCache();
            this.bindEvents();
            this.initialContent(this.options.liveScoreDetailsAjaxURL, this.options.method, this.options.widgetKey, this.options.timezone, this.options.displayCalendar, this.options.justLiveScore);
        },

        // Remove plugin instance completely
        destroy: function() {
            this.unbindEvents();
            this.$element.removeData();
        },

        // Cache DOM nodes for performance
        buildCache: function() {
            this.$element = $(this.element);
        },

        // Bind events that trigger methods
        bindEvents: function() {
            var plugin = this;
        },

        // Unbind events that trigger methods
        unbindEvents: function() {
            this.$element.off('.' + this._name);
        },

        initialContent: function(liveScoreDetailsAjaxURL, method, widgetKey, timezone, displayCalendar, justLiveScore) {

            // Get widget location
            var liveScoreLocation = $(this.element);

            // If justLiveScore is set to false these HTML will be displayed
            if (justLiveScore === false) {
                if (displayCalendar === true) {
                    // Construct the Callendar select for mobile
                    $('<select id="callendar-select-for-mobile" class="callendar-select-for-mobile"></select>').prependTo($(liveScoreLocation));
                }
                // Construct the Live Games Tab click
                $('<a href="#liveGame" class="titleWidget nav-tab">Live Games</a>').prependTo($(liveScoreLocation));
                // Construct the All Games Tab click
                $('<a href="#allGame" class="titleWidget nav-tab nav-tab-active">All Games</a>').prependTo($(liveScoreLocation));
                // Add hook in HTML for All Games Tab content infos and make it active
                $(liveScoreLocation).append('<div id="allGame" class="allGame-nav-tab-wrapper tab-content active"></div>');
            }

            // Construct the Calendar Tab click
            $('<div id="liveScoreCalendarContainer"></div>').prependTo($(liveScoreLocation));

            // Adding loading screen
            $('<div class="loading">Loading&#8230;</div>').prependTo($(liveScoreLocation));

            // Adding the "widgetLiveScore" class for styling and easyer targeting
            liveScoreLocation.addClass('widgetLiveScore');

            // If backgroundColor setting is set, here we activate the color
            if (this.options.backgroundColor) {
                liveScoreLocation.css('background-color', this.options.backgroundColor);
            }

            // If widgetWidth setting is set, here we set the width of the list
            if (this.options.widgetWidth) {
                liveScoreLocation.css('width', this.options.widgetWidth);
            }

            // Get window width
            var windowWidthSize = $(window).width();

            // Check if we got time for fixtures
            var fi = setInterval(function() {

                if (timeForFixtures.length > 0) {

                    // If displayCalendar is set to true and justLiveScore to false these HTML will be displayed
                    if (displayCalendar === true && justLiveScore === false) {
                        // Adding callendar with All Games for 3 days before and after current day
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'threeDayAfter', 3, 'addDateCalendar');
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'twoDayAfter', 2, 'addDateCalendar');
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'oneDayAfter', 1, 'addDateCalendar');
                        $('<a href="#" onclick="windowPreventOpening()" id="currentDayCalendar" class="thisDateForSelect callendarDays callendarDaysActive" data-dateclicked="' + timeForFixtures + '">Current Day</a>').prependTo($('#liveScoreCalendarContainer'));
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'oneDayBefore', 1, 'substractDateCalendar');
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'twoDayBefore', 2, 'substractDateCalendar');
                        getDateCalendar('liveScoreCalendarContainer', timeForFixtures, 'threeDayBefore', 3, 'substractDateCalendar');

                        if (windowWidthSize < 769) {
                            var headerMenuDisplay = getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'threeDayAfter', 3, 'addDateCalendar');
                            headerMenuDisplay += getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'twoDayAfter', 2, 'addDateCalendar');
                            headerMenuDisplay += getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'oneDayAfter', 1, 'addDateCalendar');
                            headerMenuDisplay += $('<option class="thisDateForSelect" value="' + timeForFixtures + '" data-dateclicked="' + timeForFixtures + '" selected>Current Day</option>').prependTo($('#callendar-select-for-mobile'));
                            headerMenuDisplay += getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'oneDayBefore', 1, 'substractDateCalendar');
                            headerMenuDisplay += getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'twoDayBefore', 2, 'substractDateCalendar');
                            headerMenuDisplay += getDateCalendarMobile('callendar-select-for-mobile', timeForFixtures, 'threeDayBefore', 3, 'substractDateCalendar');
                            $('#callendar-select-for-mobile').prepend(headerMenuDisplay);

                            // Trigger data select on mobile and populate with new information
                            $('#callendar-select-for-mobile').on('change', function() {
                                // Adding loading screen and remove all active classes
                                $('#allGame').html('<div class="loading">Loading&#8230;</div>').addClass('active').siblings().removeClass('active');
                                // Remove active tab and switch to firs one after click
                                $('.widgetLiveScore .titleWidget').removeClass('nav-tab-active').first().addClass('nav-tab-active');
                                // Call Fixtures Data from server
                                $.ajax({
                                    url: liveScoreDetailsAjaxURL,
                                    cache: false,
                                    data: {
                                        action: 'get_events',
                                        Widgetkey: Widgetkey,
                                        from: $(this).val(),
                                        to: $(this).val(),
                                        timezone: getTimeZone(),
                                        withOutDetails: true
                                    },
                                    dataType: 'json'
                                }).done(function(res) {
                                    // If server send data, hide loading sreen
                                    $('.loading').hide();
                                    // Construct the section for All Games in that specific day
                                    $('#allGame').append('<section id="allGameContentTable"></section>');

                                    // If server send results we populate HTML with sended information
                                    if (!res.error) {
                                        // Order information by Event Time and then group them by Country Name
                                        var windowWidthSize = $(window).width();
                                        var sorted = sortByKey(res, 'key');
                                        var sorted_array = sortByKeyAsc(sorted, "match_time");
                                        var groubedByTeam = groupBy(sorted_array, 'country_name');
                                        const orderedLeagues = {};
                                        Object.keys(groubedByTeam).sort().forEach(function(key) {
                                            orderedLeagues[key] = groubedByTeam[key];
                                        });
                                        var htmlConstructor = '<div class="tablele-container">';
                                        $.each(orderedLeagues, function(keyes, valuees) {
                                            var sortedValuess = groupBy(valuees, 'league_name');
                                            $.each(sortedValuess, function(key, value) {
                                                htmlConstructor += '<div class="flex-table header" role="rowgroup">';
                                                htmlConstructor += '<div class="countryListDisplays"><div class="countryLogo" style="background-image: url(\'' + ((value[0].country_logo == '' || value[0].country_logo == null) ? 'img/no-img.png' : value[0].country_logo) + '\');"></div>';
                                                htmlConstructor += '<div title="' + ((key) ? key : 'Team') + '" class="flex-row keyOfTeam" onclick="windowOpenLeagueInfo(\'' + value[0].league_id + '\',\'' + value[0].league_name +'\', \'' + value[0].league_logo + '\')" role="columnheader">' + ((value[0].country_name) ? '<span class="countryOfTeams">' + value[0].country_name + ':</span>' : '') + ' ' + ((key) ? key : 'Team') + '</div>';
                                                htmlConstructor += '</div>';
                                                htmlConstructor += '</div>';
                                                htmlConstructor += '<div class="table__body_fixtures">';
                                                $.each(value, function(keys, values) {
                                                    if (values.match_hometeam_score == null || values.match_awayteam_score == null) {
                                                        var event_final_result_class_away = '';
                                                        var event_final_result_class_home = '';
                                                    } else {
                                                        var event_final_result_class_away = values.match_awayteam_score;
                                                        var event_final_result_class_home = values.match_hometeam_score;
                                                    }
                                                    if (values.match_status) {
                                                        var removeNumericAdd = values.match_status.replace('+', '');
                                                    } else {
                                                        var removeNumericAdd = values.match_status;
                                                    }
                                                    var generatedLink = values.country_name+'/'+values.league_name+'/'+values.match_hometeam_name+'-vs-'+values.match_awayteam_name+'/'+values.match_date+'/'+values.match_id;
                                                    var newGeneratedLink = generatedLink.replace(/\s/g,'-');
                                                    htmlConstructor += '<a href="widgetMatchResults.html?'+newGeneratedLink+'" class="' + ((windowWidthSize < 769) ? 'container-mobile-grid' : '') + ' flex-table row ' + values.match_id + '" role="rowgroup" onclick="event.preventDefault(); windowOpenMatch(' + values.match_id + ', false, \'' + values.match_date + '\', \'' + values.country_name + '\', \'' + values.league_name + '\', \'' + values.match_hometeam_name + '\', \'' + values.match_awayteam_name + '\')" title="Click for match detail!">';
                                                    htmlConstructor += '<div class="' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell"> ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? values.match_status + ((removeNumericAdd == 'Half Time') ? '' : '\'') : values.match_time) + '</div>';
                                                    htmlConstructor += '<div class="' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? 'd-none-mobile-div' : (((values.match_status == null) || values.match_status == '') ? 'd-none-mobile-div' : '')) + ' ' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails secondMatchDetails" role="cell">' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? '' : ((values.match_status == null) ? '' : values.match_status)) + '</div>';
                                                    htmlConstructor += ((windowWidthSize < 769) ? '<div class="break-mobile-grid"></div>' : '');
                                                    if (event_final_result_class_home > event_final_result_class_away) {
                                                        htmlConstructor += '<div class="flex-row matchHomeTeam winningMatchStyle" role="cell">' + values.match_hometeam_name + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchDelimiter" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                                    } else if (event_final_result_class_home < event_final_result_class_away) {
                                                        htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchDelimiter" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchAwayTeam winningMatchStyle" role="cell">' + values.match_awayteam_name + '</div>';
                                                    } else if (event_final_result_class_home == event_final_result_class_away) {
                                                        htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchDelimiter" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                        htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                                    }
                                                    htmlConstructor += '<div class="' + ((((windowWidthSize < 769) && (values.match_hometeam_score == '') && (values.match_awayteam_score == '')) || ((windowWidthSize < 769) && (values.match_hometeam_score == null) && (values.match_awayteam_score == null))) ? 'd-none-mobile-div' : '') + ' flex-row matchAwayTeam firstHalfStyle ' + ((windowWidthSize < 769) ? 'mobile-firstHalfStyle d-none-mobile-div' : '') + '" role="cell">' + (((values.match_hometeam_score) && (values.match_awayteam_score)) ? '(' + (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) + ')' : '') + '</div>';
                                                    htmlConstructor += '</div>';
                                                });
                                                htmlConstructor += '</div>';
                                            });
                                        });
                                        htmlConstructor += '</div>';
                                        $('#allGameContentTable').append(htmlConstructor);

                                    } else {

                                        // If server dont send results we populate HTML with "Sorry, no data!"
                                        var htmlConstructor = '<div class="tablele-container">';
                                        htmlConstructor += '<p class="" style="border-left: solid 0px transparent; margin-left:auto; margin-right:auto; margin-top: 5px;">Sorry, no data!</p>';
                                        htmlConstructor += '</div>';
                                        $('#allGameContentTable').append(htmlConstructor);
                                    }
                                }).fail(function(error) {

                                });
                            });
                        }

                        // When a day is clicked we make it active and populate All Games tab
                        $('#liveScoreCalendarContainer').find('.thisDateForSelect').unbind('click').on('click', function() {
                            $(this).addClass('callendarDaysActive');
                            $(this).siblings().removeClass('callendarDaysActive');
                            $('#allGame').html('<div class="loading">Loading&#8230;</div>').addClass('active').siblings().removeClass('active');
                            $('.widgetLiveScore .titleWidget').removeClass('nav-tab-active').first().addClass('nav-tab-active');
                            // Aditionally we send a request to server for infos
                            $.ajax({
                                url: liveScoreDetailsAjaxURL,
                                cache: false,
                                data: {
                                    action: 'get_events',
                                    Widgetkey: Widgetkey,
                                    from: $(this).attr("data-dateclicked"),
                                    to: $(this).attr("data-dateclicked"),
                                    timezone: getTimeZone(),
                                    withOutDetails: true
                                },
                                dataType: 'json'
                            }).done(function(res) {
                                // Hide loading screen
                                $('.loading').hide();
                                // Construct the section for All Games in that specific day
                                $('#allGame').append('<section id="allGameContentTable"></section>');
                                // If server send results we populate HTML with sended information
                                if (!res.error) {
                                    // Order information by Event Time and then group them by Country Name
                                    var windowWidthSize = $(window).width();
                                    var sorted = sortByKey(res, 'key');
                                    var sorted_array = sortByKeyAsc(sorted, "match_time");
                                    var groubedByTeam = groupBy(sorted_array, 'country_name');
                                    const orderedLeagues = {};
                                    Object.keys(groubedByTeam).sort().forEach(function(key) {
                                        orderedLeagues[key] = groubedByTeam[key];
                                    });
                                    var htmlConstructor = '<div class="tablele-container">';
                                    $.each(orderedLeagues, function(keyes, valuees) {
                                        var sortedValuess = groupBy(valuees, 'league_name');
                                        $.each(sortedValuess, function(key, value) {
                                            htmlConstructor += '<div class="flex-table header" role="rowgroup">';
                                            htmlConstructor += '<div class="countryListDisplays"><div class="countryLogo" style="background-image: url(\'' + ((value[0].country_logo == '' || value[0].country_logo == null) ? 'img/no-img.png' : value[0].country_logo) + '\');"></div>';
                                            htmlConstructor += '<div title="' + ((key) ? key : 'Team') + '" class="flex-row keyOfTeam" onclick="windowOpenLeagueInfo(\'' + value[0].league_id + '\',\'' + value[0].league_name +'\', \'' + value[0].league_logo + '\')" role="columnheader">' + ((value[0].country_name) ? '<span class="countryOfTeams">' + value[0].country_name + ':</span>' : '') + ' ' + ((key) ? key : 'Team') + '</div>';
                                            htmlConstructor += '</div>';
                                            htmlConstructor += '</div>';
                                            htmlConstructor += '<div class="table__body_fixtures">';
                                            $.each(value, function(keys, values) {
                                                if (values.match_hometeam_score == null || values.match_awayteam_score == null) {
                                                    var event_final_result_class_away = '';
                                                    var event_final_result_class_home = '';
                                                } else {
                                                    var event_final_result_class_away = values.match_awayteam_score;
                                                    var event_final_result_class_home = values.match_hometeam_score;
                                                }
                                                if (values.match_status) {
                                                    var removeNumericAdd = values.match_status.replace('+', '');
                                                } else {
                                                    var removeNumericAdd = values.match_status;
                                                }
                                                var generatedLink = values.country_name+'/'+values.league_name+'/'+values.match_hometeam_name+'-vs-'+values.match_awayteam_name+'/'+values.match_date+'/'+values.match_id;
                                                var newGeneratedLink = generatedLink.replace(/\s/g,'-');
                                                htmlConstructor += '<a href="widgetMatchResults.html?'+newGeneratedLink+'" class="' + ((windowWidthSize < 769) ? 'container-mobile-grid' : '') + ' flex-table row ' + values.match_id + '" role="rowgroup" onclick="event.preventDefault(); windowOpenMatch(' + values.match_id + ', false, \'' + values.match_date + '\', \'' + values.country_name + '\', \'' + values.league_name + '\', \'' + values.match_hometeam_name + '\', \'' + values.match_awayteam_name + '\')" title="Click for match detail!">';
                                                htmlConstructor += '<div class="' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell"> ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? values.match_status + ((removeNumericAdd == 'Half Time') ? '' : '\'') : values.match_time) + '</div>';
                                                htmlConstructor += '<div class="' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? 'd-none-mobile-div' : (((values.match_status == null) || values.match_status == '') ? 'd-none-mobile-div' : '')) + ' ' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails secondMatchDetails" role="cell">' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? '' : ((values.match_status == null) ? '' : values.match_status)) + '</div>';
                                                htmlConstructor += ((windowWidthSize < 769) ? '<div class="break-mobile-grid"></div>' : '');
                                                if (event_final_result_class_home > event_final_result_class_away) {
                                                    htmlConstructor += '<div class="flex-row matchHomeTeam winningMatchStyle" role="cell">' + values.match_hometeam_name + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                                } else if (event_final_result_class_home < event_final_result_class_away) {
                                                    htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchAwayTeam winningMatchStyle" role="cell">' + values.match_awayteam_name + '</div>';
                                                } else if (event_final_result_class_home == event_final_result_class_away) {
                                                    htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                    htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                                }
                                                htmlConstructor += '<div class="' + ((((windowWidthSize < 769) && (values.match_hometeam_score == '') && (values.match_awayteam_score == '')) || ((windowWidthSize < 769) && (values.match_hometeam_score == null) && (values.match_awayteam_score == null))) ? 'd-none-mobile-div' : '') + ' flex-row matchAwayTeam firstHalfStyle ' + ((windowWidthSize < 769) ? 'mobile-firstHalfStyle d-none-mobile-div' : '') + '" role="cell">' + (((values.match_hometeam_score) && (values.match_awayteam_score)) ? '(' + (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) + ')' : '') + '</div>';
                                                htmlConstructor += '</a>';
                                            });
                                            htmlConstructor += '</div>';
                                        });
                                    });
                                    htmlConstructor += '</div>';
                                    $('#allGameContentTable').append(htmlConstructor);

                                } else {

                                    // If server dont send results we populate HTML with "Sorry, no data!"
                                    var htmlConstructor = '<div class="tablele-container">';
                                    htmlConstructor += '<p class="" style="border-left: solid 0px transparent; margin-left:auto; margin-right:auto; margin-top: 5px;">Sorry, no data!</p>';
                                    htmlConstructor += '</div>';
                                    $('#allGameContentTable').append(htmlConstructor);
                                }

                            }).fail(function(error) {

                            });

                        });
                    }

                    // If justLiveScore is set to false these HTML will be displayed
                    if (justLiveScore === false) {
                        // We send a request to server for All Games infos
                        $.ajax({
                            url: liveScoreDetailsAjaxURL,
                            cache: false,
                            data: {
                                action: 'get_events',
                                Widgetkey: Widgetkey,
                                from: timeForFixtures,
                                to: timeForFixtures,
                                timezone: getTimeZone(),
                                withOutDetails: true
                            },
                            dataType: 'json'
                        }).done(function(res) {

                            // Hide loading screen
                            $('.loading').hide();
                            // Construct the section for today Games
                            $('#allGame').append('<section id="allGameContentTable"></section>');
                            // If server send results we populate HTML with sended information
                            if (!res.error) {
                                // Order information by Event Time and then group them by Country Name
                                var windowWidthSize = $(window).width();
                                var sorted = sortByKey(res, 'key');
                                var sorted_array = sortByKeyAsc(sorted, "match_time");
                                var groubedByTeam = groupBy(sorted_array, 'country_name');
                                const orderedLeagues = {};
                                Object.keys(groubedByTeam).sort().forEach(function(key) {
                                    orderedLeagues[key] = groubedByTeam[key];
                                });
                                var htmlConstructor = '<div class="tablele-container">';
                                $.each(orderedLeagues, function(keyes, valuees) {
                                    var sortedValuess = groupBy(valuees, 'league_name');
                                    $.each(sortedValuess, function(key, value) {
                                        htmlConstructor += '<div class="flex-table header" role="rowgroup">';
                                        htmlConstructor += '<div class="countryListDisplays"><div class="countryLogo" style="background-image: url(\'' + ((value[0].country_logo == '' || value[0].country_logo == null) ? 'img/no-img.png' : value[0].country_logo) + '\');"></div>';
                                        htmlConstructor += '<div title="' + ((key) ? key : 'Team') + '" class="flex-row keyOfTeam" onclick="windowOpenLeagueInfo(\'' + value[0].league_id + '\',\'' + value[0].league_name +'\', \'' + value[0].league_logo + '\')" role="columnheader">' + ((value[0].country_name) ? '<span class="countryOfTeams">' + value[0].country_name + ':</span>' : '') + ' ' + ((key) ? key : 'Team') + '</div>';
                                        htmlConstructor += '</div>';
                                        htmlConstructor += '</div>';
                                        htmlConstructor += '<div class="table__body_fixtures">';
                                        $.each(value, function(keys, values) {
                                            if (values.match_hometeam_score == null || values.match_awayteam_score == null) {
                                                var event_final_result_class_away = '';
                                                var event_final_result_class_home = '';
                                            } else {
                                                var event_final_result_class_away = values.match_awayteam_score;
                                                var event_final_result_class_home = values.match_hometeam_score;
                                            }
                                            if (values.match_status) {
                                                var removeNumericAdd = values.match_status.replace('+', '');
                                            } else {
                                                var removeNumericAdd = values.match_status;
                                            }
                                            var generatedLink = values.country_name+'/'+values.league_name+'/'+values.match_hometeam_name+'-vs-'+values.match_awayteam_name+'/'+values.match_date+'/'+values.match_id;
                                            var newGeneratedLink = generatedLink.replace(/\s/g,'-');
                                            htmlConstructor += '<a href="widgetMatchResults.html?'+newGeneratedLink+'" class="' + ((windowWidthSize < 769) ? 'container-mobile-grid' : '') + ' flex-table row ' + values.match_id + '" role="rowgroup" onclick="event.preventDefault(); windowOpenMatch(' + values.match_id + ', false, \'' + values.match_date + '\', \'' + values.country_name + '\', \'' + values.league_name + '\', \'' + values.match_hometeam_name + '\', \'' + values.match_awayteam_name + '\')" title="Click for match detail!">';
                                            htmlConstructor += '<div class="' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell"> ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? values.match_status + ((removeNumericAdd == 'Half Time') ? '' : '\'') : values.match_time) + '</div>';
                                            htmlConstructor += '<div class="' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? 'd-none-mobile-div' : (((values.match_status == null) || values.match_status == '') ? 'd-none-mobile-div' : '')) + ' ' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails secondMatchDetails" role="cell">' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? '' : ((values.match_status == null) ? '' : values.match_status)) + '</div>';
                                            htmlConstructor += ((windowWidthSize < 769) ? '<div class="break-mobile-grid"></div>' : '');
                                            if (event_final_result_class_home > event_final_result_class_away) {
                                                htmlConstructor += '<div class="flex-row matchHomeTeam winningMatchStyle" role="cell">' + values.match_hometeam_name + '</div>';
                                                htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                            } else if (event_final_result_class_home < event_final_result_class_away) {
                                                htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                htmlConstructor += '<div class="flex-row matchAwayTeam winningMatchStyle" role="cell">' + values.match_awayteam_name + '</div>';
                                            } else if (event_final_result_class_home == event_final_result_class_away) {
                                                htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                                htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                                htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                            }
                                            htmlConstructor += '<div class="' + ((((windowWidthSize < 769) && (values.match_hometeam_score == '') && (values.match_awayteam_score == '')) || ((windowWidthSize < 769) && (values.match_hometeam_score == null) && (values.match_awayteam_score == null))) ? 'd-none-mobile-div' : '') + ' flex-row matchAwayTeam firstHalfStyle ' + ((windowWidthSize < 769) ? 'mobile-firstHalfStyle d-none-mobile-div' : '') + '" role="cell">' + (((values.match_hometeam_score) && (values.match_awayteam_score)) ? '(' + (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) + ')' : '') + '</div>';
                                            htmlConstructor += '</a>';
                                        });
                                        htmlConstructor += '</div>';
                                    });
                                });
                                htmlConstructor += '</div>';
                                $('#allGameContentTable').append(htmlConstructor);

                            } else {

                                // If server dont send results we populate HTML with "Sorry, no data!"
                                var htmlConstructor = '<div class="tablele-container">';
                                htmlConstructor += '<p class="" style="border-left: solid 0px transparent; margin-left:auto; margin-right:auto; margin-top: 5px;">Sorry, no data!</p>';
                                htmlConstructor += '</div>';
                                $('#allGameContentTable').append(htmlConstructor);
                            }
                        }).fail(function(error) {

                        });
                    }

                    // Add hook in HTML for Live Games Tab content infos
                    var htmlConstructorResults = '<div id="liveGame" class="liveGame-nav-tab-wrapper tab-content '+((justLiveScore === true) ? 'active' : '')+'">';
                function loadLivescore(){
                    // Get previous day for live score
                    var getPreviousDay = new Date(timeForFixtures + "T00:00");
                    getPreviousDay.setDate(getPreviousDay.getDate() - 1);
                    var d = getPreviousDay.getDate();
                    var m = getPreviousDay.getMonth() + 1;
                    var y = getPreviousDay.getFullYear();
                    var previousDay = y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);

                    // Call Livescore Data from server
                    $.ajax({
                        url: liveScoreDetailsAjaxURL,
                        cache: false,
                        data: {
                            action: 'get_events',
                            match_live : '1',
                            from: previousDay,
                            to: timeForFixtures,
                            Widgetkey: Widgetkey,
                            timezone: getTimeZone(),
                            withOutDetails: true
                        },
                        dataType: 'json'
                    }).done(function(res) {
                        // If justLiveScore is set to true will hide loading screen
                        if (justLiveScore === true) {
                            // If server send data, hide loading sreen
                            $('.loading').hide();
                        }
                        // Clear the Live Games HTML
                        $('#liveGame').html('');

                        // Construct the section for Live Games
                        $('#liveGame').append('<section id="liveGameContentTable"></section>');
                        // If server send results we populate HTML with sended information
                        if (!res.error) {
                            // Order information by Event Time and then group them by Country Name
                            var windowWidthSize = $(window).width();
                            var sorted = sortByKey(res, 'key');
                            var sorted_array = sortByKeyAsc(sorted, "match_time");
                            var groubedByTeam = groupBy(sorted_array, 'country_name');
                            const orderedLeagues = {};
                            Object.keys(groubedByTeam).sort().forEach(function(key) {
                                orderedLeagues[key] = groubedByTeam[key];
                            });
                            var htmlConstructor = '<div class="tablele-container">';
                            $.each(orderedLeagues, function(keyes, valuees) {
                                var sortedValuess = groupBy(valuees, 'league_name');
                                $.each(sortedValuess, function(key, value) {
                                    htmlConstructor += '<div class="flex-table header" role="rowgroup">';
                                    htmlConstructor += '<div class="countryListDisplays"><div class="countryLogo" style="background-image: url(\'' + ((value[0].country_logo == '' || value[0].country_logo == null) ? 'img/no-img.png' : value[0].country_logo) + '\');"></div>';
                                    htmlConstructor += '<div title="' + ((key) ? key : 'Team') + '" class="flex-row keyOfTeam" onclick="windowOpenLeagueInfo(\'' + value[0].league_id + '\',\'' + value[0].league_name +'\', \'' + value[0].league_logo + '\')" role="columnheader">' + ((value[0].country_name) ? '<span class="countryOfTeams">' + value[0].country_name + ':</span>' : '') + ' ' + ((key) ? key : 'Team') + '</div>';
                                    htmlConstructor += '</div>';
                                    htmlConstructor += '</div>';
                                    htmlConstructor += '<div class="table__body_fixtures">';
                                    $.each(value, function(keys, values) {
                                        if (values.match_hometeam_score == null || values.match_awayteam_score == null) {
                                            var event_final_result_class_away = '';
                                            var event_final_result_class_home = '';
                                        } else {
                                            var event_final_result_class_away = values.match_awayteam_score;
                                            var event_final_result_class_home = values.match_hometeam_score;
                                        }
                                        if (values.match_status) {
                                            var removeNumericAdd = values.match_status.replace('+', '');
                                        } else {
                                            var removeNumericAdd = values.match_status;
                                        }
                                        var generatedLink = values.country_name+'/'+values.league_name+'/'+values.match_hometeam_name+'-vs-'+values.match_awayteam_name+'/'+values.match_date+'/'+values.match_id;
                                        var newGeneratedLink = generatedLink.replace(/\s/g,'-');
                                        htmlConstructor += '<a href="widgetMatchResults.html?'+newGeneratedLink+'" class="' + ((windowWidthSize < 769) ? 'container-mobile-grid' : '') + ' flex-table row ' + values.match_id + '" role="rowgroup" onclick="event.preventDefault(); windowOpenMatch(' + values.match_id + ', false, \'' + values.match_date + '\', \'' + values.country_name + '\', \'' + values.league_name + '\', \'' + values.match_hometeam_name + '\', \'' + values.match_awayteam_name + '\')" title="Click for match detail!">';
                                        htmlConstructor += '<div class="' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell"> ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? values.match_status + ((removeNumericAdd == 'Half Time') ? '' : '\'') : values.match_time) + '</div>';
                                        htmlConstructor += '<div class="' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? 'd-none-mobile-div' : ((values.match_status == null) ? 'd-none-mobile-div' : '')) + ' ' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails secondMatchDetails" role="cell">' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? '' : ((values.match_status == null) ? '' : values.match_status)) + '</div>';
                                        htmlConstructor += ((windowWidthSize < 769) ? '<div class="break-mobile-grid"></div>' : '');
                                        if (event_final_result_class_home > event_final_result_class_away) {
                                            htmlConstructor += '<div class="flex-row matchHomeTeam winningMatchStyle" role="cell">' + values.match_hometeam_name + '</div>';
                                            htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                            htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                        } else if (event_final_result_class_home < event_final_result_class_away) {
                                            htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                            htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                            htmlConstructor += '<div class="flex-row matchAwayTeam winningMatchStyle" role="cell">' + values.match_awayteam_name + '</div>';
                                        } else if (event_final_result_class_home == event_final_result_class_away) {
                                            htmlConstructor += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                            htmlConstructor += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                            htmlConstructor += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                        }
                                        htmlConstructor += '<div class="' + ((((windowWidthSize < 769) && (values.match_hometeam_score == '') && (values.match_awayteam_score == '')) || ((windowWidthSize < 769) && (values.match_hometeam_score == null) && (values.match_awayteam_score == null))) ? 'd-none-mobile-div' : '') + ' flex-row matchAwayTeam firstHalfStyle ' + ((windowWidthSize < 769) ? 'mobile-firstHalfStyle d-none-mobile-div' : '') + '" role="cell">' + (((values.match_hometeam_score) && (values.match_awayteam_score)) ? '(' + (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) + ')' : '') + '</div>';
                                        htmlConstructor += '</a>';
                                    });
                                    htmlConstructor += '</div>';
                                });
                            });
                            htmlConstructor += '</div>';
                            $('#liveGameContentTable').append(htmlConstructor);

                        } else {

                            // If server dont send results we populate HTML with "Sorry, no data!"
                            var htmlConstructor = '<div class="tablele-container">';
                            htmlConstructor += '<p class="" style="border-left: solid 0px transparent; margin-left:auto; margin-right:auto; margin-top: 5px;">Sorry, no data!</p>';
                            htmlConstructor += '</div>';
                            $('#liveGameContentTable').append(htmlConstructor);
                        }
                    }).fail(function(error) {

                    });
                    setTimeout(function(){
                        loadLivescore();
                    }, 300000);
                }

                    loadLivescore();

                    htmlConstructorResults += '</div>';
                    $(liveScoreLocation).append(htmlConstructorResults);
                    // Switching tabs on click
                    $('.widgetLiveScore .nav-tab').unbind('click').on('click', function(e) {
                        e.preventDefault();
                        //Toggle tab link
                        $(this).addClass('nav-tab-active').siblings().removeClass('nav-tab-active');
                        //Toggle target tab
                        $($(this).attr('href')).addClass('active').siblings().removeClass('active');
                    });
                    clearInterval(fi);
                }

            }, 10);
        },

        callback: function() {

        }

    });

    $.fn.widgetLiveScore = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + widgetLiveScore)) {
                $.data(this, "plugin_" + widgetLiveScore, new Plugin(this, options));
            }
        });
        return this;
    };

    $.fn.widgetLiveScore.defaults = {
        // Widgetkey will be set in jqueryGlobals.js and can be obtained from your account
        Widgetkey: Widgetkey,
        // Action for this widget
        action: 'get_events',
        // Link to server data
        liveScoreDetailsAjaxURL: 'https://apiv3.apifootball.com/?',
        // Background color for your Leagues Widget
        backgroundColor: null,
        // Width for your widget
        widgetWidth: null,
        // Get the time zone of your location
        timezone: getTimeZone(),
        // Display calendar
        displayCalendar: true,
        // Display only the Live Score
        justLiveScore: false
    };

    socketsLive();

    function socketsLive(){
      var socket  = new WebSocket('wss://wss.apifootball.com/livescore?Widgetkey='+Widgetkey+'&timezone='+getTimeZone());
      // Define the
      socket.onmessage = function(e) {
//                alert( e.data );

          if (e.data) {
            var data = JSON.parse(e.data);

                                var windowWidthSize = $(window).width();
            $.each(data, function(keys, values) {
                                    if (values.match_hometeam_score == null || values.match_awayteam_score == null) {
                                        var event_final_result_class_away = '';
                                        var event_final_result_class_home = '';
                                    } else {
                                        var event_final_result_class_away = values.match_awayteam_score;
                                        var event_final_result_class_home = values.match_hometeam_score;
                                    }
                                    if (values.match_status) {
                                        var removeNumericAdd = values.match_status.replace('+', '');
                                    } else {
                                        var removeNumericAdd = values.match_status;
                                    }
                                    var newDataForMatch = '<div class="' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell"> ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? values.match_status + ((removeNumericAdd == 'Half Time') ? '' : '\'') : values.match_time) + '</div>';
                                    newDataForMatch += '<div class="' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? 'd-none-mobile-div' : ((values.match_status == null) ? 'd-none-mobile-div' : '')) + ' ' + ((windowWidthSize < 769) ? 'item-mobile-grid' : '') + ' flex-row matchDetails secondMatchDetails" role="cell">' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? '' : ((values.match_status == null) ? '' : values.match_status)) + '</div>';
                                    newDataForMatch += ((windowWidthSize < 769) ? '<div class="break-mobile-grid"></div>' : '');
                                    if (event_final_result_class_home > event_final_result_class_away) {
                                        newDataForMatch += '<div class="flex-row matchHomeTeam winningMatchStyle" role="cell">' + values.match_hometeam_name + '</div>';
                                        newDataForMatch += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                        newDataForMatch += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                    } else if (event_final_result_class_home < event_final_result_class_away) {
                                        newDataForMatch += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                        newDataForMatch += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                        newDataForMatch += '<div class="flex-row matchAwayTeam winningMatchStyle" role="cell">' + values.match_awayteam_name + '</div>';
                                    } else if (event_final_result_class_home == event_final_result_class_away) {
                                        newDataForMatch += '<div class="flex-row matchHomeTeam" role="cell">' + values.match_hometeam_name + '</div>';
                                        newDataForMatch += '<div class="flex-row matchDelimiter ' + (($.isNumeric(removeNumericAdd) || (removeNumericAdd == 'Half Time')) ? ' matchIsLive' : '') + '" role="cell">' + ((values.match_hometeam_score && values.match_awayteam_score ) ? (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) : '-') + '</div>';
                                        newDataForMatch += '<div class="flex-row matchAwayTeam" role="cell">' + values.match_awayteam_name + '</div>';
                                    }
                                    newDataForMatch += '<div class="' + ((((windowWidthSize < 769) && (values.match_hometeam_score == '') && (values.match_awayteam_score == '')) || ((windowWidthSize < 769) && (values.match_hometeam_score == null) && (values.match_awayteam_score == null))) ? 'd-none-mobile-div' : '') + ' flex-row matchAwayTeam firstHalfStyle ' + ((windowWidthSize < 769) ? 'mobile-firstHalfStyle d-none-mobile-div' : '') + '" role="cell">' + (((values.match_hometeam_score) && (values.match_awayteam_score)) ? '(' + (values.match_hometeam_score + ' - ' + values.match_awayteam_score ) + ')' : '') + '</div>';
                                    $('.' + values.match_id).html('').html(newDataForMatch);
                                });
                            } else {
                                // If server dont send new data we populate console.log with "No new data!"
                                console.log('No new data!');
                            }
                }
      socket.onclose = function(){
        // connection closed, discard old websocket and create a new one in 5s
        socket = null;
        setTimeout(socketsLive, 5000);
        }

            }

})(jQuery, window, document);