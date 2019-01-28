const app = angular.module("esd-app", ["ngAnimate", "ngSanitize", "ui.bootstrap", "ngRoute", "toastr", "ui.select"]);

app.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "views/user/home.html",
        activeTab: "home"
    }).when("/contact", {
        templateUrl: "views/user/contact.html",
        activeTab: "contact"
    }).when("/about", {
        templateUrl: "views/user/about.html",
        activeTab: "about"
    }).when("/news", {
        templateUrl: "views/user/news.html",
        activeTab: "news"
    }).when("/news/article/:id", {
        templateUrl: "views/user/article-single.html",
        activeTab: "news"
    }).when("/events", {
        templateUrl: "views/user/events.html",
        activeTab: "events"
    }).when("/events/:id", {
        templateUrl: "views/user/event-single.html",
        activeTab: "events"
    });
})

/* Controllers */
app.controller("latestNewsController", latestNewsController);
app.controller("mapController", mapController);
app.controller("linksController", linksController);
app.controller("membersController", membersController);
app.controller("pageController", pageController);
app.controller("awardsController", awardsController);
app.controller("loginController", loginController);
app.controller("newsPreviewController", newsPreviewController);
app.controller("singleArticleController", singleArticleController);
app.controller("registerController", registerController);
app.controller("latestEventsController", latestEventsController);
app.controller("eventsPreviewController", eventsPreviewController);
app.controller("singleEventController", singleEventController);
app.controller("contactController", contactController);

/* Filters */
app.filter('trustAsHtml', ['$sce', function($sce) {
    return $sce.trustAsHtml;
}]);

app.filter('limitHtml', function() {
    return function(text, limit, ellipsis) {
        var _getClosedTagsString = function(_tagArray) {
            var _returnArray = [],
            _getTagType = function(_string) {
                return _string.replace(/<[\/]?([^>]*)>/,"$1");
            };

            angular.forEach(_tagArray,function(_tag,_i) {
                if(/<\//.test(_tag)) {
                    if(_i === 0) {
                        _returnArray.push(_tag);
                    } else if(_getTagType(_tag) !== _getTagType(_tagArray[_i - 1])) {
                        _returnArray.push(_tag);
                    }
                }
            });
            return _returnArray.join('');
        },
        _countNonHtmlCharToLimit = function(_text,_limit) {
            var _isMarkup = false,
            _isSpecialChar = false,
            _break = false,
            _underLimit = false,
            _totalText = 0,
            _totalChar = 0,
            _element,
            _return = {
                textCounter   : 0,
                offsetCounter : 0,
                setEllipsis   : false,
                overElementArray : []
            };
            angular.forEach(_text,function(_c) {
                _underLimit = _return.textCounter < _limit;
                if(_c === '<' && !_isMarkup && !_isSpecialChar) {
                    (!_underLimit) && (_element = '<');
                    _isMarkup = true;
                } else if(_c === '&' && !_isMarkup && !_isSpecialChar) {
                    _isSpecialChar = true;
                } else if(_isMarkup) {
                    //tracking html elements that are beyond the text limit
                    (!_underLimit) && (_element = _element + _c);
                    if(_c === '>') {
                        //push element in array if it is complete, and we are
                        //beyond text limit, to close any html that is unclosed
                        (!_underLimit) && (_return.overElementArray.push(_element));
                        _break = true;
                        _isMarkup = false;
                    }
                } else if(_c === ';' && _isSpecialChar) {
                    _isSpecialChar = false;
                    //count as one character
                    _return.textCounter++;
                    _break = true;
                }

                if(_underLimit) {
                    if(!_isMarkup && !_isSpecialChar && !_break) {
                        //counting number of characters in non html string
                        _return.textCounter++;
                    }
                    _return.offsetCounter++;
                } else {
                    _return.setEllipsis = true
                }
                _break = false;

            });

            //returns offset within html of number of non html characters found
            return _return;
        },
        _charToLimitOutput = _countNonHtmlCharToLimit(text.toString(),limit);

        return text.toString().substr(0, _charToLimitOutput.offsetCounter) +
            ellipsis + _getClosedTagsString(_charToLimitOutput.overElementArray);
    }
})