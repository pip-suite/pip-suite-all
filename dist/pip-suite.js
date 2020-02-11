(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).rest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
configureAuthState.$inject = ['$httpProvider'];
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedRedirect = 'pipUnauthorizedRedirect';
exports.AccessDenyRedirect = 'pipAccessDenyRedirect';
var AuthHttpResponseInterceptor = (function () {
    AuthHttpResponseInterceptor.$inject = ['$q', '$rootScope', '$location', '$log'];
    function AuthHttpResponseInterceptor($q, $rootScope, $location, $log) {
        "ngInject";
        var _this = this;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$log = $log;
        this.responseError = function (rejection) {
            var toState = _this.$rootScope[pip.services.StateVar] && _this.$rootScope[pip.services.StateVar].name ? _this.$rootScope[pip.services.StateVar].name : null;
            var toParams = _this.$rootScope[pip.services.StateVar] && _this.$rootScope[pip.services.StateVar].params ? _this.$rootScope[pip.services.StateVar].params : null;
            switch (rejection.status) {
                case 401:
                case 440:
                    _this.$log.error("Response Error 401", rejection);
                    _this.$rootScope.$emit(exports.UnauthorizedRedirect, {
                        redirect_to: toState && toParams && toParams.redirect_to ? '' : _this.$location.url(),
                        toState: toState,
                        toParams: toParams
                    });
                    break;
                case 403:
                    _this.$log.error("Response Error 403", rejection);
                    _this.$rootScope.$emit(exports.AccessDenyRedirect);
                    break;
                default:
                    _this.$log.error("errors_unknown", rejection);
                    break;
            }
            return _this.$q.reject(rejection);
        };
    }
    return AuthHttpResponseInterceptor;
}());
function configureAuthState($httpProvider) {
    $httpProvider.interceptors.push('pipAuthHttpResponseInterceptor');
}
angular
    .module('pipAuthState')
    .config(configureAuthState)
    .service('pipAuthHttpResponseInterceptor', AuthHttpResponseInterceptor);
},{}],2:[function(require,module,exports){
"use strict";
decorateStatesAuthStateService.$inject = ['$delegate', '$timeout'];
addStatesAuthtateDecorator.$inject = ['$provide'];
Object.defineProperty(exports, "__esModule", { value: true });
var IAuthStateService_1 = require("./IAuthStateService");
function decorateStatesAuthStateService($delegate, $timeout) {
    "ngInject";
    $delegate.config = new IAuthStateService_1.AuthStateConfig();
    $delegate.signinState = signinState;
    $delegate.signoutState = signoutState;
    $delegate.authorizedState = authorizedState;
    $delegate.unauthorizedState = unauthorizedState;
    $delegate.goToSignin = goToSignin;
    $delegate.goToSignout = goToSignout;
    $delegate.goToAuthorized = goToAuthorized;
    $delegate.goToUnauthorized = goToUnauthorized;
    return $delegate;
    function signinState(value) {
        if (value) {
            this._config.signinState = value;
        }
        return this._config.signinState;
    }
    function signoutState(value) {
        if (value) {
            this._config.signoutState = value;
        }
        return this._config.signoutState;
    }
    function authorizedState(value) {
        if (value) {
            this._config.authorizedState = value;
        }
        return this._config.authorizedState;
    }
    function unauthorizedState(value) {
        if (value) {
            this._config.unauthorizedState = value;
        }
        return this._config.unauthorizedState;
    }
    function setSigninParams(params) {
        if (!params)
            return params;
        if (!params.toParams)
            return params;
        params.server_url = params.toParams.server_url ? params.toParams.server_url : null;
        params.email = params.toParams.email ? params.toParams.email : null;
        params.language = params.toParams.language ? params.toParams.language : 'en';
        return params;
    }
    function goToSignin(params) {
        if (this._config.signinState == null) {
            throw new Error('Signin state was not defined');
        }
        params = setSigninParams(params);
        this.go(this._config.signinState, params);
    }
    function goToSignout(params) {
        if (this._config.signoutState == null) {
            throw new Error('Signout state was not defined');
        }
        this.go(this._config.signoutState, params);
    }
    function goToAuthorized(params) {
        if (this._config.authorizedState == null) {
            throw new Error('Authorized state was not defined');
        }
        this.go(this._config.authorizedState, params);
    }
    function goToUnauthorized(params) {
        if (this._config.unauthorizedState == null) {
            throw new Error('Signin state was not defined');
        }
        this.go(this._config.unauthorizedState, params);
    }
}
function addStatesAuthtateDecorator($provide) {
    "ngInject";
    $provide.decorator('pipAuthState', decorateStatesAuthStateService);
}
angular
    .module('pipAuthState')
    .config(addStatesAuthtateDecorator);
},{"./IAuthStateService":5}],3:[function(require,module,exports){
"use strict";
configureAuthState.$inject = ['pipTranslateProvider'];
initAuthState.$inject = ['$log', '$rootScope', '$state', 'pipSession', 'pipAuthState'];
Object.defineProperty(exports, "__esModule", { value: true });
function initAuthState($log, $rootScope, $state, pipSession, pipAuthState) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('pipUnauthorizedRedirect', unauthorizedRedirect);
    $rootScope.$on('$stateChangeSuccess', stateChange);
    function stateChange(event, toState, toParams, fromState, fromParams) {
        $rootScope[pip.services.RoutingVar] = false;
    }
    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
        if (pipAuthState.redirect && pipAuthState.redirect(event, toState, toParams, $rootScope)) {
            return;
        }
        if ((toState.auth || toState.auth === undefined) && !pipSession.isOpened()) {
            event.preventDefault();
            var redirectTo = pipAuthState.href(toState.name, toParams);
            if (redirectTo.length > 0 && redirectTo[0] == '#') {
                redirectTo = redirectTo.substring(1);
            }
            pipAuthState.goToSignin({ redirect_to: redirectTo, toState: toState, toParams: toParams });
            return;
        }
        if (toState.name == pipAuthState.unauthorizedState() && pipSession.isOpened()) {
            event.preventDefault();
            pipAuthState.goToAuthorized({});
            return;
        }
    }
    function unauthorizedRedirect(event, params) {
        pipAuthState.goToSignout(params);
    }
}
function configureAuthState(pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'ERROR_SWITCHING': 'Error while switching route. Try again.'
    });
    pipTranslateProvider.translations('ru', {
        'ERROR_SWITCHING': 'Ошибка при переходе. Попробуйте ещё раз.'
    });
}
angular
    .module('pipAuthState')
    .config(configureAuthState)
    .run(initAuthState);
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAuthStateService_1 = require("./IAuthStateService");
var AuthStateProvider = (function () {
    AuthStateProvider.$inject = ['$stateProvider'];
    function AuthStateProvider($stateProvider) {
        "ngInject";
        var _this = this;
        this.$stateProvider = $stateProvider;
        this._redirectedStates = {};
        this._config = new IAuthStateService_1.AuthStateConfig();
        this.state = function (stateName, stateConfig) {
            if (stateName == null) {
                throw new Error('stateName cannot be null');
            }
            if (stateConfig == null) {
                throw new Error('stateConfig cannot be null');
            }
            if (stateConfig && (stateConfig.auth || stateConfig.authenticate)) {
                stateConfig.resolve = stateConfig.resolve || {};
            }
            _this.$stateProvider.state(stateName, stateConfig);
            return _this;
        };
    }
    AuthStateProvider.prototype.redirect = function (fromState, toState) {
        this._redirectedStates[fromState] = toState;
    };
    Object.defineProperty(AuthStateProvider.prototype, "signinState", {
        get: function () {
            return this._config.signinState;
        },
        set: function (value) {
            this._config.signinState = value || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "signoutState", {
        get: function () {
            return this._config.signoutState;
        },
        set: function (value) {
            this._config.signoutState = value || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "authorizedState", {
        get: function () {
            return this._config.authorizedState;
        },
        set: function (value) {
            this._config.authorizedState = value || '/';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "unauthorizedState", {
        get: function () {
            return this._config.unauthorizedState;
        },
        set: function (value) {
            this._config.unauthorizedState = value || '/';
        },
        enumerable: true,
        configurable: true
    });
    AuthStateProvider.prototype.$get = ['$state', '$timeout', function ($state, $timeout) {
        "ngInject";
        if (this._service == null) {
            $state['_config'] = this._config;
            $state['_redirectedStates'] = this._redirectedStates;
            $state['redirect'] = redirect;
        }
        this._service = $state;
        return this._service;
        function redirect(event, state, params) {
            var _this = this;
            var toState = this._redirectedStates[state.name];
            if (_.isFunction(toState)) {
                toState = toState(state.name, params);
                if (_.isNull(toState))
                    throw new Error('Redirected toState cannot be null');
            }
            if (!!toState) {
                $timeout(function () {
                    event.preventDefault();
                    _this.transitionTo(toState, params, { location: 'replace' });
                });
                return true;
            }
            return false;
        }
    }];
    return AuthStateProvider;
}());
angular
    .module('pipAuthState')
    .provider('pipAuthState', AuthStateProvider);
},{"./IAuthStateService":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthStateConfig = (function () {
    function AuthStateConfig() {
        this.signinState = null;
        this.signoutState = null;
        this.authorizedState = '/';
        this.unauthorizedState = '/';
    }
    return AuthStateConfig;
}());
exports.AuthStateConfig = AuthStateConfig;
},{}],6:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipAuthState', [
    'ngResource',
    'pipServices',
    'LocalStorageModule'
]);
require("./AuthHttpResponseInterceptor");
require("./AuthStateDecorator");
require("./AuthStateInit");
require("./IAuthStateService");
require("./AuthStateService");
__export(require("./AuthHttpResponseInterceptor"));
__export(require("./IAuthStateService"));
},{"./AuthHttpResponseInterceptor":1,"./AuthStateDecorator":2,"./AuthStateInit":3,"./AuthStateService":4,"./IAuthStateService":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataCache = (function () {
    DataCache.$inject = ['$q', 'pipDataModel'];
    function DataCache($q, pipDataModel) {
        "ngInject";
        this.$q = $q;
        this.pipDataModel = pipDataModel;
        this.CACHE_TIMEOUT = 10 * 60000;
        this._cache = {};
    }
    DataCache.prototype.hash = function (data) {
        var filteredData = {};
        if (data != null) {
            filteredData.filter = data.filter;
            filteredData.search = data.search;
            filteredData.start = data.start;
            filteredData.take = data.take;
            filteredData.skip = data.skip;
        }
        var serializedFilter = angular.toJson(filteredData);
        if (serializedFilter == null || serializedFilter.length === 0)
            return 0;
        var h = 0;
        for (var i = 0, len = serializedFilter.length; i < len; i++) {
            var chr = serializedFilter.charCodeAt(i);
            h = ((h << 5) - h) + chr;
            h |= 0;
        }
        return h;
    };
    DataCache.prototype.generateKey = function (resource, params) {
        var h = this.hash(params);
        return resource + (h != 0 ? '_' + h : '');
    };
    ;
    DataCache.prototype.clear = function (resource) {
        if (resource == null) {
            this._cache = {};
        }
        else {
            for (var key in this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    delete this._cache[key];
                }
            }
        }
    };
    DataCache.prototype.retrieve = function (resource, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        var key = this.generateKey(resource, params);
        var holder = this._cache[key];
        if (holder == null)
            return null;
        if (holder.expire && _.now() - holder.expire > this.CACHE_TIMEOUT) {
            delete this._cache[key];
            return null;
        }
        return holder.data;
    };
    DataCache.prototype.store = function (resource, data, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        this._cache[this.generateKey(resource, params)] = {
            expire: _.now(),
            data: data
        };
    };
    DataCache.prototype.storePermanently = function (resource, data, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        this._cache[this.generateKey(resource, params)] = {
            expire: null,
            data: data
        };
    };
    DataCache.prototype.remove = function (resource, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        delete this._cache[this.generateKey(resource, params)];
    };
    ;
    DataCache.prototype.updateOne = function (resource, item, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (item == null)
            return;
        var data = this.retrieve(resource, params);
        if (data != null) {
            var isAdded = false;
            var size = data.length;
            for (var i = 0; i < size; i++) {
                if (data[i].id == item.id) {
                    data[i] = item;
                    isAdded = true;
                    return;
                }
            }
            if (!isAdded)
                data.push(item);
            this.store(resource, data, params);
        }
    };
    DataCache.prototype.retrieveOrLoad = function (params, successCallback, errorCallback) {
        var _this = this;
        if (params == null)
            throw new Error('params cannot be null');
        var resource = params.resource;
        var filter = params.filter;
        var force = !!params.force;
        var result = !force ? this.retrieve(resource, params) : null;
        var deferred = this.$q.defer();
        var method;
        if (!!params.paging) {
            method = 'page';
        }
        else {
            method = params.singleResult ? 'readOne' : 'read';
        }
        if (result) {
            if (filter) {
                if (result.data) {
                    result.data = filter(result.data);
                }
                else {
                    result = filter(result);
                }
            }
            if (_.isFunction(successCallback)) {
                successCallback(result);
            }
            deferred.resolve(result);
            return deferred.promise;
        }
        this.pipDataModel[method](params, function (data) {
            params.updatedItem ?
                _this.updateOne(resource, data, params) :
                _this.store(resource, data, params);
            if (filter)
                data = filter(data);
            deferred.resolve(data);
            if (_.isFunction(successCallback)) {
                successCallback(data);
            }
        }, function (err) {
            deferred.reject(err);
            if (_.isFunction(errorCallback))
                errorCallback(err);
        });
        return deferred.promise;
    };
    DataCache.prototype.removeOne = function (resource, item) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (item == null)
            return;
        for (var key in this._cache) {
            if (key == resource || key.startsWith(resource + '_')) {
                var data = this._cache[key].data;
                if (angular.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == item.id) {
                            data.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
    };
    DataCache.prototype.decorateAddCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            if (!params || !params.notClearedCache) {
                _this.clear(resource);
            }
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.decorateRemoveCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            _this.removeOne(resource, params);
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.decorateUpdateCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            for (var key in _this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    var data = _this._cache[key].data;
                    if (angular.isArray(data)) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].id == item.id) {
                                data[i] = item;
                            }
                        }
                    }
                }
            }
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.setTimeout = function (newTimeout) {
        if (newTimeout) {
            this.CACHE_TIMEOUT = newTimeout;
        }
        return this.CACHE_TIMEOUT;
    };
    return DataCache;
}());
var DataCacheProvider = (function () {
    function DataCacheProvider() {
    }
    DataCacheProvider.prototype.$get = ['$q', 'pipDataModel', function ($q, pipDataModel) {
        "ngInject";
        if (this._service == null) {
            this._service = new DataCache($q, pipDataModel);
        }
        return this._service;
    }];
    return DataCacheProvider;
}());
angular
    .module('pipDataCache', [])
    .provider('pipDataCache', DataCacheProvider);
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheParams = (function () {
    function CacheParams() {
    }
    return CacheParams;
}());
exports.CacheParams = CacheParams;
},{}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipDataCache', ['pipDataModel']);
require("./DataCacheService");
require("./IDataCacheService");
__export(require("./IDataCacheService"));
},{"./DataCacheService":7,"./IDataCacheService":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataModel = (function () {
    DataModel.$inject = ['$stateParams', 'pipRest'];
    function DataModel($stateParams, pipRest) {
        "ngInject";
        this.$stateParams = $stateParams;
        this.pipRest = pipRest;
        this.save = this.update;
        this.remove = this.delete;
        this.query = this.read;
        this.get = this.readOne;
        this.readPage = this.page;
        this.queryPage = this.page;
    }
    DataModel.prototype.execute = function (params, successCallback, errorCallback) {
        var t = params.transaction, tid;
        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(params.transactionOperation || 'PROCESSING');
            if (!tid)
                return;
        }
        return this.pipRest.getResource(params.resource)[params.operation](params.item, function (result) {
            if (t && tid && t.aborted(tid))
                return;
            if (t && !params.skipTransactionEnd)
                t.end();
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (t)
                t.end(error);
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.create = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'save';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                params.itemCollection.push(result);
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.update = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'update';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                var index = _.findIndex(params.itemCollection, function (item) {
                    return item.id == result.id;
                });
            if (index > -1) {
                params.itemCollection[index] = result;
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.delete = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'remove';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                _.remove(params.itemCollection, { id: result.id || (params.object || {}).id || (params.item || {}).id });
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.read = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'query';
        return this.execute(params, function (result) {
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.readOne = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';
        return this.execute(params, function (result) {
            if (params.itemCollection && result) {
                var index = _.findIndex(params.itemCollection, { id: result.id });
                if (index >= 0)
                    params.itemCollection[index] = result;
                else
                    params.itemCollection.push(result);
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.page = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';
        return this.execute(params, function (result) {
            if (params.itemCollection && result.data) {
                for (var i = 0; i < result.data.length; i++)
                    params.itemCollection.push(result.data[i]);
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.uploadFiles = function (params, successCallback, errorCallback) {
        var t = params.transaction, tid;
        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(params.transactionOperation || 'SAVING');
            if (!tid)
                return;
        }
        var uploadFiles = [{
                pictures: params.pictures,
                documents: params.documents
            }];
        if (params.item && params.item.content) {
            var saveResult = true;
            async.eachSeries(_.union(params.item.content, uploadFiles), function (obj, callback) {
                if (!obj.pictures && !obj.documents) {
                    callback();
                }
                else {
                    if (obj.pictures) {
                        obj.pictures.save(function () {
                            if (t && tid && t.aborted(tid)) {
                                saveResult = false;
                                callback('aborted');
                            }
                            if (obj.documents) {
                                obj.documents.save(function () {
                                    if (t && tid && t.aborted(tid)) {
                                        saveResult = false;
                                        callback('aborted');
                                    }
                                    callback();
                                }, function (error) {
                                    saveResult = false;
                                    callback(error);
                                });
                            }
                            else {
                                callback();
                            }
                        }, function (error) {
                            saveResult = false;
                            callback(error);
                        });
                    }
                    else {
                        if (obj.documents) {
                            obj.documents.save(function () {
                                if (t && tid && t.aborted(tid)) {
                                    saveResult = false;
                                    callback('aborted');
                                }
                                callback();
                            }, function (error) {
                                saveResult = false;
                                callback(error);
                            });
                        }
                    }
                }
            }, function (error) {
                if (!error && saveResult) {
                    if (t && !params.skipTransactionEnd)
                        t.end();
                    _.each(params.item.content, function (item) {
                        delete item.pictures;
                        delete item.documents;
                    });
                    if (successCallback)
                        successCallback();
                }
                else {
                    if (t)
                        t.end(error);
                    if (errorCallback) {
                        errorCallback(error);
                    }
                }
            });
        }
        else {
            if (params.pictures) {
                params.pictures.save(function () {
                    if (t && tid && t.aborted(tid))
                        return;
                    if (params.documents) {
                        params.documents.save(function () {
                            if (t && tid && t.aborted(tid))
                                return;
                            if (t && !params.skipTransactionEnd)
                                t.end();
                            if (successCallback)
                                successCallback();
                        }, function (error) {
                            if (t)
                                t.end(error);
                            if (errorCallback)
                                errorCallback(error);
                        });
                    }
                    else {
                        if (t && !params.skipTransactionEnd)
                            t.end();
                        if (successCallback)
                            successCallback();
                    }
                }, function (error) {
                    if (t)
                        t.end(error);
                    if (errorCallback)
                        errorCallback(error);
                });
            }
            else if (params.documents) {
                params.documents.save(function () {
                    if (t && tid && t.aborted(tid))
                        return;
                    if (t && !params.skipTransactionEnd)
                        t.end();
                    if (successCallback)
                        successCallback();
                }, function (error) {
                    if (t)
                        t.end(error);
                    if (errorCallback)
                        errorCallback(error);
                });
            }
            else {
                if (t && !params.skipTransactionEnd)
                    t.end();
                if (successCallback)
                    successCallback();
            }
        }
    };
    DataModel.prototype.abortFilesUpload = function (params) {
        if (params.pictures)
            params.pictures.abort();
        if (params.documents)
            params.documents.abort();
        if (params.transaction)
            params.transaction.abort();
    };
    return DataModel;
}());
var DataModelProvider = (function () {
    function DataModelProvider() {
        "ngInject";
    }
    DataModelProvider.prototype.$get = ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
        "ngInject";
        if (this._service == null) {
            this._service = new DataModel($stateParams, pipRest);
        }
        return this._service;
    }];
    return DataModelProvider;
}());
angular
    .module('pipDataModel')
    .provider('pipDataModel', DataModelProvider);
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipDataModel', ['pipRest']);
require("./IDataModelService");
require("./DataModelService");
},{"./DataModelService":10,"./IDataModelService":11}],13:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./rest");
require("./data");
require("./cache");
require("./auth_state");
angular
    .module('pipCommonRest', [
    'pipDataCache',
    'pipRest',
    'pipDataModel',
    'pipAuthState'
]);
__export(require("./cache"));
__export(require("./auth_state"));
},{"./auth_state":6,"./cache":9,"./data":12,"./rest":16}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RestResourceConfig = (function () {
    function RestResourceConfig() {
    }
    return RestResourceConfig;
}());
;
var RestService = (function () {
    RestService.$inject = ['$resource', '$http', '$stateParams', 'serverUrl', 'lockServerUrl', 'resourceConfigs'];
    function RestService($resource, $http, $stateParams, serverUrl, lockServerUrl, resourceConfigs) {
        "ngInject";
        this.$resource = $resource;
        this.$http = $http;
        this.$stateParams = $stateParams;
        this.resourceConfigs = resourceConfigs;
        this._resources = {};
        this._serverUrl = serverUrl;
        this._lockServerUrl = lockServerUrl;
        this.initResources(resourceConfigs);
    }
    RestService.prototype.reInitResource = function () {
        this._resources = {};
        this.initResources(this.resourceConfigs);
    };
    RestService.prototype.initResources = function (resourceConfigs) {
        var _this = this;
        _.each(resourceConfigs, function (resourceConfig) {
            var resource;
            switch (resourceConfig.operation) {
                case 'createResource':
                    resource = _this.createResource(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams, resourceConfig.actions);
                    break;
                case 'createOperation':
                    resource = _this.createOperation(_this._serverUrl, resourceConfig.path);
                    break;
                case 'createCollection':
                    resource = _this.createCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
                case 'createPagedCollection':
                    resource = _this.createPagedCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
                case 'createPartyCollection':
                    resource = _this.createPartyCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
            }
            if (resource) {
                _this._resources[resourceConfig.name] = resource;
            }
        });
    };
    RestService.prototype.createResource = function (url, path, defaultParams, actions) {
        url = url || this._serverUrl;
        return this.$resource(this._serverUrl + path, defaultParams, actions);
    };
    RestService.prototype.createOperation = function (url, path) {
        url = url || this._serverUrl;
        return this.$resource(url + path, {}, {
            call: { method: 'POST' }
        });
    };
    RestService.prototype.createCollection = function (url, path, defaultParams) {
        url = url || this._serverUrl;
        return this.$resource(url + path, defaultParams || { id: '@id' }, {
            update: { method: 'PUT' }
        });
    };
    RestService.prototype.createPagedCollection = function (url, path, defaultParams) {
        url = url || this._serverUrl;
        return this.$resource(url + path, defaultParams || { id: '@id' }, {
            page: { method: 'GET', isArray: false },
            update: { method: 'PUT' }
        });
    };
    RestService.prototype.createPartyCollection = function (url, path, paramDefaults) {
        return this.createPagedCollection(url, path, paramDefaults ||
            {
                id: '@id',
                party_id: '@party_id'
            });
    };
    Object.defineProperty(RestService.prototype, "serverUrl", {
        get: function () {
            return this._serverUrl;
        },
        set: function (value) {
            this._serverUrl = value;
            this.reInitResource();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestService.prototype, "lockServerUrl", {
        get: function () {
            return this._lockServerUrl;
        },
        set: function (value) {
            this._lockServerUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    RestService.prototype.setHeaders = function (headers) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header) && !_.isObject(headers[header])) {
                this.$http.defaults.headers.common[header] = headers[header];
            }
        }
    };
    RestService.prototype.getResource = function (name) {
        var resource = this._resources[name];
        if (!resource)
            throw new Error('Resource not found');
        return resource;
    };
    return RestService;
}());
var RestProvider = (function () {
    RestProvider.$inject = ['$httpProvider'];
    function RestProvider($httpProvider) {
        this._resourceConfigs = [];
        this._http = $httpProvider;
    }
    Object.defineProperty(RestProvider.prototype, "serverUrl", {
        get: function () {
            return this._serverUrl;
        },
        set: function (value) {
            this._serverUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestProvider.prototype, "lockServerUrl", {
        get: function () {
            return this._lockServerUrl;
        },
        set: function (value) {
            this._lockServerUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    RestProvider.prototype.setHeaders = function (headers) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header))
                this._http.defaults.headers.common[header] = headers[header];
        }
    };
    RestProvider.prototype.registerResource = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createResource',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerOperation = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createOperation',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerPagedCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createPagedCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerPartyCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createPartyCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.$get = ['$resource', '$http', '$stateParams', function ($resource, $http, $stateParams) {
        "ngInject";
        if (this._service == null)
            this._service = new RestService($resource, $http, $stateParams, this._serverUrl, this._lockServerUrl, this._resourceConfigs);
        return this._service;
    }];
    return RestProvider;
}());
angular
    .module('pipRest')
    .provider('pipRest', RestProvider);
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipRest', ['ngResource']);
require("./IRestService");
require("./RestService");
},{"./IRestService":14,"./RestService":15}]},{},[13])(13)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).entry = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChangePasswordController = (function () {
    ChangePasswordController.$inject = ['$state', 'pipChangePasswordViewModel', 'pipEntryCommon', 'pipEntry', 'pipAuthState', 'pipSession', '$window'];
    function ChangePasswordController($state, pipChangePasswordViewModel, pipEntryCommon, pipEntry, pipAuthState, pipSession, $window) {
        "ngInject";
        this.pipChangePasswordViewModel = pipChangePasswordViewModel;
        this.$window = $window;
        pipEntryCommon.configureAppBar();
        if (pipEntry.passwordExpire === false || !pipSession.isOpened()) {
            $state.go(pipAuthState.signinState(), {});
        }
    }
    ChangePasswordController.prototype.goBack = function () {
        this.$window.history.back();
    };
    Object.defineProperty(ChangePasswordController.prototype, "config", {
        get: function () {
            return this.pipChangePasswordViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    ChangePasswordController.prototype.onChange = function () {
        this.pipChangePasswordViewModel.onChange();
    };
    return ChangePasswordController;
}());
exports.ChangePasswordController = ChangePasswordController;
{
    angular.module('pipEntry.ChangePassword', ['pipEntry.Common', 'pipChangePasswordPanel']);
}
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ChangePasswordDialogService = (function () {
        ChangePasswordDialogService.$inject = ['$mdDialog'];
        function ChangePasswordDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        ChangePasswordDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'change_password/ChangePasswordDialog.html',
                controller: ChangePasswordDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: false
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return ChangePasswordDialogService;
    }());
    var ChangePasswordDialogController_1 = (function () {
        ChangePasswordDialogController_1.$inject = ['$mdDialog', 'pipChangePasswordViewModel'];
        function ChangePasswordDialogController_1($mdDialog, pipChangePasswordViewModel) {
            "ngInject";
            this.pipChangePasswordViewModel = pipChangePasswordViewModel;
            this.goBack = $mdDialog.cancel;
        }
        Object.defineProperty(ChangePasswordDialogController_1.prototype, "config", {
            get: function () {
                return this.pipChangePasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        ChangePasswordDialogController_1.prototype.onChange = function () {
            var _this = this;
            this.pipChangePasswordViewModel.onChange(function () {
                _this.goBack();
            });
        };
        return ChangePasswordDialogController_1;
    }());
    angular.module('pipEntry.ChangePasswordDialog', ['pipEntry.Common', "pipChangePasswordPanel"])
        .service('pipChangePasswordDialog', ChangePasswordDialogService);
}
},{}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var ChangePasswordModel = (function (_super) {
    __extends(ChangePasswordModel, _super);
    ChangePasswordModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipEntry', 'pipToasts'];
    function ChangePasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipEntry, pipToasts) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipTranslate = pipTranslate;
        _this.pipEntryData = pipEntryData;
        _this.pipEntry = pipEntry;
        _this.pipToasts = pipToasts;
        _this.transaction = pipTransaction.create('entry.change_password');
        return _this;
    }
    ChangePasswordModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    ChangePasswordModel.prototype.setElementVisability = function () {
        this.hideObject.subTitle = new Boolean(this.hideObject.subTitle) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    ChangePasswordModel.prototype.onShowToast = function (message, type) {
        if (!message)
            return;
        message = this.pipTranslate.translate(message);
        type = type || 'message';
        if (type == 'message') {
            this.pipToasts.showMessage(message, null, null, null);
            return;
        }
        if (type == 'error') {
            this.pipToasts.showError(message, null, null, null, null);
            return;
        }
    };
    ChangePasswordModel.prototype.onChange = function (callback) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipEntryData.expireChangePassword({
            login: this.config.data.login,
            old_password: this.config.data.password,
            new_password: this.config.data.passwordNew,
            user_id: this.pipEntryData.getUserId()
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            var message = String() + 'CHANGE_PWD_SUCCESS_TEXT';
            _this.onShowToast(message, 'message');
            _this.transaction.end();
            if (callback)
                callback();
            _this.pipEntry.signout(function () {
                _this.$state.go('signin', {
                    server_url: _this.config.data.serverUrl,
                    login: _this.config.data.login
                });
            });
        }, function (error) {
            _this.transaction.end(error);
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'NO_LOGIN': 'login',
                'WRONG_LOGIN': 'login',
                'LOGIN_NOT_FOUND': 'login',
                'WRONG_PASSWORD': 'password',
                'act_execute': 'form',
                'UNKNOWN': 'form',
                '-1': 'form'
            });
        });
    };
    return ChangePasswordModel;
}(EntryModel_1.EntryModel));
exports.ChangePasswordModel = ChangePasswordModel;
},{"../common/EntryModel":10}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ChangePasswordPanelBindings = {};
    var ChangePasswordPanelController = (function () {
        ChangePasswordPanelController.$inject = ['$scope', 'pipFormErrors', 'pipRest', 'pipChangePasswordViewModel'];
        function ChangePasswordPanelController($scope, pipFormErrors, pipRest, pipChangePasswordViewModel) {
            "ngInject";
            this.$scope = $scope;
            this.pipFormErrors = pipFormErrors;
            this.pipRest = pipRest;
            this.pipChangePasswordViewModel = pipChangePasswordViewModel;
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            pipChangePasswordViewModel.initModel($scope);
        }
        ChangePasswordPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
            this.config.data.password = null;
            this.config.data.passwordNew = null;
        };
        Object.defineProperty(ChangePasswordPanelController.prototype, "config", {
            get: function () {
                return this.pipChangePasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChangePasswordPanelController.prototype, "transaction", {
            get: function () {
                return this.pipChangePasswordViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChangePasswordPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipChangePasswordViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChangePasswordPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipChangePasswordViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        ChangePasswordPanelController.prototype.onShowToast = function (message, type) {
            this.pipChangePasswordViewModel.onShowToast(message, type);
        };
        ChangePasswordPanelController.prototype.onServerUrlChanged = function () {
            this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
        };
        ChangePasswordPanelController.prototype.onChanged = function () {
            this.pipFormErrors.resetFormErrors(this.config.form, false);
            this.pipFormErrors.resetFieldsErrors(this.config.form, null);
            this.pipRest.serverUrl = this.config.selected.searchURLs;
            this.config.data.serverUrl = this.config.selected.searchURLs;
        };
        ChangePasswordPanelController.prototype.onChangePassword = function () {
            this.pipFormErrors.resetFieldsErrors(this.config.form, 'passwordNew');
        };
        ChangePasswordPanelController.prototype.onChangePasswordNew = function () {
            this.pipFormErrors.resetFieldsErrors(this.config.form, 'password');
            this.pipFormErrors.resetFieldsErrors(this.config.form, 'passwordConfirm');
        };
        ChangePasswordPanelController.prototype.onChangePasswordConfirm = function () {
            this.pipFormErrors.resetFieldsErrors(this.config.form, 'passwordNew');
        };
        return ChangePasswordPanelController;
    }());
    var ChangePasswordPanel = {
        bindings: ChangePasswordPanelBindings,
        controller: ChangePasswordPanelController,
        templateUrl: 'change_password/ChangePasswordPanel.html'
    };
    angular.module("pipChangePasswordPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipChangePasswordPanel', ChangePasswordPanel);
}
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChangePasswordModel_1 = require("./ChangePasswordModel");
var ChangePasswordViewModel = (function () {
    ChangePasswordViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntry', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function ChangePasswordViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntry, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        this.pipTranslate = pipTranslate;
        this.pipEntryData = pipEntryData;
        this.pipToasts = pipToasts;
        this.model = new ChangePasswordModel_1.ChangePasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipEntry, pipToasts);
    }
    Object.defineProperty(ChangePasswordViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChangePasswordViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChangePasswordViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChangePasswordViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    ChangePasswordViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    ChangePasswordViewModel.prototype.onShowToast = function (message, type) {
        this.model.onShowToast(message, type);
    };
    ChangePasswordViewModel.prototype.onChange = function (callback) {
        this.model.onChange(callback);
    };
    return ChangePasswordViewModel;
}());
exports.ChangePasswordViewModel = ChangePasswordViewModel;
angular.module('pipEntry.ChangePassword')
    .service('pipChangePasswordViewModel', ChangePasswordViewModel);
},{"./ChangePasswordModel":3}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var LinkEmailUnique_1 = (function () {
        LinkEmailUnique_1.$inject = ['$scope', '$element', '$attrs', 'ngModel', '$http', 'pipEntryData'];
        function LinkEmailUnique_1($scope, $element, $attrs, ngModel, $http, pipEntryData) {
            "ngInject";
            var _this = this;
            this.oldEmail = $attrs['pipEmailUnique'];
            $scope.$watch($attrs['ngModel'], _.throttle(function (newValue) {
                var oldHint = ngModel.$validators.emailUnique;
                if (!newValue || newValue.length == 0 || _this.oldEmail == newValue) {
                    ngModel.$setValidity('emailUnique', oldHint);
                    return;
                }
                if (!newValue)
                    ngModel.$setValidity('emailUnique', true);
                pipEntryData.signupValidate(newValue, function (data) {
                    ngModel.$setValidity('emailUnique', true);
                }, function (err) {
                    ngModel.$setValidity('emailUnique', false);
                });
            }, 500));
        }
        return LinkEmailUnique_1;
    }());
    angular.module('pipEmailUnique', ['ngResource', 'pipEntryData'])
        .directive('pipEmailUnique', ['$http', 'pipEntryData', function ($http, pipEntryData) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                new LinkEmailUnique_1($scope, $element, $attrs, ngModel, $http, pipEntryData);
            }
        };
    }]);
}
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntryPageConfig_1 = require("./EntryPageConfig");
var EntryCommonService = (function () {
    EntryCommonService.$inject = ['$rootScope', '$state', 'pipAppBar', 'pipNavService', 'pipRest', 'pipEntry', 'pipFormErrors', 'pipIdentity', 'pipTranslate', 'localStorageService'];
    function EntryCommonService($rootScope, $state, pipAppBar, pipNavService, pipRest, pipEntry, pipFormErrors, pipIdentity, pipTranslate, localStorageService) {
        "ngInject";
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.pipAppBar = pipAppBar;
        this.pipNavService = pipNavService;
        this.pipRest = pipRest;
        this.pipEntry = pipEntry;
        this.pipFormErrors = pipFormErrors;
        this.pipIdentity = pipIdentity;
        this.pipTranslate = pipTranslate;
        this.localStorageService = localStorageService;
        this._config = new EntryPageConfig_1.EntryPageConfig();
    }
    EntryCommonService.prototype.getLastUsedLogin = function (serverUrl) {
        var servers = this.localStorageService.get('servers');
        if (servers && servers[serverUrl]) {
            return servers[serverUrl].login;
        }
        return undefined;
    };
    EntryCommonService.prototype.getPastSessions = function () {
        var servers = this.localStorageService.get('servers') || {};
        return servers;
    };
    EntryCommonService.prototype.getUsedServerUrls = function () {
        var servers = this.localStorageService.get('servers') || {};
        var serverUrls = [];
        var serverUrl;
        for (var prop in servers) {
            if (servers.hasOwnProperty(prop)) {
                serverUrl = servers[prop].serverUrl;
                if (serverUrl) {
                    serverUrls.push(serverUrl);
                }
            }
        }
        return serverUrls;
    };
    EntryCommonService.prototype.configureAppBar = function () {
        this.pipNavService.sidenav.hide();
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.part('menu', false);
        if (this.pipEntry.showLanguage) {
            this.pipNavService.appbar.part('actions', 'language');
        }
        if (this.pipEntry.appbarTitle) {
            this.pipNavService.appbar.part('title', 'breadcrumb');
        }
        else {
            this.pipNavService.appbar.part('title', false);
        }
        this.pipNavService.breadcrumb.text = this.pipEntry.appbarTitle;
        this.pipNavService.appbar.addShadow();
        this.pipNavService.icon.hide();
        this.pipNavService.search.close();
        this.pipAppBar.part('icon', this.pipEntry.showIcon);
        if (this.pipEntry.showIcon) {
            this.pipNavService.icon.showIcon(this.pipEntry.appbarIcon);
        }
    };
    ;
    EntryCommonService.prototype.initScope = function ($scope) {
        var _this = this;
        this._config.appbarTitle = this.pipEntry.appbarTitle;
        this._config.showIcon = this.pipEntry.showIcon;
        this._config.showLanguage = this.pipEntry.showLanguage;
        this._config.adminOnly = this.pipEntry.adminOnly;
        this._config.fixedServerUrl = this.pipEntry.fixedServerUrl;
        this._config.enableAvatar = this.pipEntry.enableAvatar;
        this._config.useEmailAsLogin = this.pipEntry.useEmailAsLogin;
        this._config.entryHideObject = this.pipEntry.entryHideObject;
        var language = this.$state.params.language;
        if (language)
            this.pipTranslate.use(language);
        var email = null;
        if (this._config.useEmailAsLogin) {
            email = this.$state.params.email ? decodeURIComponent(this.$state.params.email) : this.$state.params.login ? decodeURIComponent(this.$state.params.login) : null;
        }
        else {
            email = this.$state.params.email ? decodeURIComponent(this.$state.params.email) : null;
        }
        var login = null;
        login = (this.$state.params.login) ? decodeURIComponent(this.$state.params.login) : null;
        if (this.$state['current'].auth) {
            if (this.pipIdentity.identity && this.pipIdentity.identity.user) {
                email = this.pipIdentity.identity.user.email || this.pipIdentity.identity.user.login;
                login = this.pipIdentity.identity.user.login;
            }
        }
        this._config.data = {
            serverUrl: this.$state.params.server_url ? decodeURIComponent(this.$state.params.server_url) : this.pipRest.serverUrl,
            login: login,
            email: email,
            password: '',
            remember: false,
            adminOnly: this._config.adminOnly,
            name: (this.$state.name != 'signup' && this.$state.params.name) ? this.$state.params.name : null,
            code: this.$state.params.code || null,
            resetCode: this.$state.params.reset_code || null
        };
        if (this._config.data.email && !this._config.data.login) {
            this._config.data.login = this._config.data.email;
        }
        if (!this._config.data.serverUrl) {
            throw new Error('Server url can not be empty!');
        }
        this._config.showServerUrl = false;
        this._config.fixedServerUrl = false;
        this._config.data.serverUrl = this._config.data.serverUrl || this.pipRest.serverUrl;
        if (this.pipEntry.fixedServerUrl) {
            this._config.data.serverUrl = this.pipRest.serverUrl;
            this._config.fixedServerUrl = true;
        }
        if (this.$state.name != 'signup') {
            this._config.data.login = this._config.data.login || this.getLastUsedLogin(this._config.data.serverUrl);
        }
        this._config.serverUrls = this.getUsedServerUrls();
        this._config.servers = this.getPastSessions();
        this._config.selected = {};
        this._config.selected.searchURLs = this._config.data.serverUrl;
        if (!this.$state['current'].auth) {
            if (this._config.data.serverUrl && !this._config.data.login && this.$state.name != 'signup') {
                var server = this._config.servers[this._config.data.serverUrl];
                this._config.data.login = (server || {}).login;
            }
        }
        this._config.filterItem = function (item) { return _this.filterItem(item); };
        this._config.getMatches = function (query) { return _this.getMatches(query); };
        this._config.onServerUrlChanged = function (form, url) { _this.onServerUrlChanged(form, url); };
        this._config.isEmpty = _.isEmpty;
        return _.cloneDeep(this._config);
    };
    EntryCommonService.prototype.filterItem = function (item) {
        var result = (this._config.selected.searchURLs && item
            && item.toLowerCase().indexOf(this._config.selected.searchURLs.toLowerCase()) >= 0);
        return result;
    };
    EntryCommonService.prototype.getMatches = function (query) {
        if (!query)
            return this._config.showServerUrl;
        this._config.data.serverUrl = query;
        this._config.selected.searchURLs = query;
        return _.filter(this._config.serverUrls, this._config.filterItem);
    };
    EntryCommonService.prototype.onServerUrlChanged = function (form, url) {
        form = form ? form : this._config.form;
        url = url ? url : this._config.selected.searchURLs;
        if (!url)
            return;
        var server = this._config.servers[url];
        if (server && this.$state.name != 'signup') {
            this._config.data.login = server.login;
            this.pipRest.serverUrl = url;
            this._config.data.serverUrl = url;
        }
        if (form) {
            this.pipFormErrors.resetFormErrors(form, false);
            this.pipFormErrors.resetFieldsErrors(form, null);
        }
    };
    return EntryCommonService;
}());
angular.module('pipEntry.CommonService', [])
    .service('pipEntryCommon', EntryCommonService);
},{"./EntryPageConfig":11}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntryHideObject = (function () {
    function EntryHideObject() {
        this.remember = false;
    }
    return EntryHideObject;
}());
exports.EntryHideObject = EntryHideObject;
},{}],9:[function(require,module,exports){
"use strict";
initEntry.$inject = ['pipEntry', '$rootScope', 'pipSession', 'pipDataCache', 'pipTimer'];
Object.defineProperty(exports, "__esModule", { value: true });
function initEntry(pipEntry, $rootScope, pipSession, pipDataCache, pipTimer) {
    $rootScope.$on(pip.services.SessionOpenedEvent, function (event, data) {
        pipDataCache.clear();
        pipTimer.start();
    });
    $rootScope.$on(pip.services.SessionClosedEvent, function (event, data) {
        pipDataCache.clear();
    });
    pipEntry.reopenSession();
}
angular.module('pipEntry.Service')
    .run(initEntry);
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel = (function () {
    EntryModel.$inject = ['pipEntryCommon'];
    function EntryModel(pipEntryCommon) {
        "ngInject";
        this.pipEntryCommon = pipEntryCommon;
        this.showServerError = true;
    }
    EntryModel.prototype.initModel = function ($scope) {
        this.config = this.pipEntryCommon.initScope($scope);
        this.config.form = this.config.form || $scope.form;
        this.hideObject = this.config.entryHideObject;
    };
    return EntryModel;
}());
exports.EntryModel = EntryModel;
},{}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryService_1 = require("./EntryService");
var EntryPageConfig = (function (_super) {
    __extends(EntryPageConfig, _super);
    function EntryPageConfig() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.showServerUrl = false;
        return _this;
    }
    return EntryPageConfig;
}(EntryService_1.EntryConfig));
exports.EntryPageConfig = EntryPageConfig;
var EntryDataConfig = (function () {
    function EntryDataConfig() {
    }
    return EntryDataConfig;
}());
exports.EntryDataConfig = EntryDataConfig;
var SigninParams = (function () {
    function SigninParams() {
    }
    return SigninParams;
}());
exports.SigninParams = SigninParams;
var SignupParams = (function () {
    function SignupParams() {
    }
    return SignupParams;
}());
exports.SignupParams = SignupParams;
var AuthSessionData = (function () {
    function AuthSessionData() {
        this.serverUrl = undefined;
        this.sessionId = undefined;
        this.userId = undefined;
    }
    return AuthSessionData;
}());
exports.AuthSessionData = AuthSessionData;
var PastSession = (function () {
    function PastSession() {
    }
    return PastSession;
}());
exports.PastSession = PastSession;
},{"./EntryService":12}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntryPageConfig_1 = require("./EntryPageConfig");
var EntryHideObject_1 = require("./EntryHideObject");
var EntryConfig = (function () {
    function EntryConfig() {
    }
    return EntryConfig;
}());
exports.EntryConfig = EntryConfig;
var EntryService = (function () {
    EntryService.$inject = ['config', 'pipRest', 'localStorageService', '$cookies', '$cookieStore', 'pipSession', 'pipIdentity', 'pipTimer', 'pipTranslate', 'pipTheme', '$timeout', 'pipAuthState'];
    function EntryService(config, pipRest, localStorageService, $cookies, $cookieStore, pipSession, pipIdentity, pipTimer, pipTranslate, pipTheme, $timeout, pipAuthState) {
        "ngInject";
        var _this = this;
        this.config = config;
        this.pipRest = pipRest;
        this.localStorageService = localStorageService;
        this.$cookies = $cookies;
        this.$cookieStore = $cookieStore;
        this.pipSession = pipSession;
        this.pipIdentity = pipIdentity;
        this.pipTimer = pipTimer;
        this.pipTranslate = pipTranslate;
        this.pipTheme = pipTheme;
        this.$timeout = $timeout;
        this.pipAuthState = pipAuthState;
        this.pipSession.addOpenListener(function (callback) {
            _this.restoreSession(callback);
        });
    }
    EntryService.prototype.restore = function (data) {
        var result = new EntryPageConfig_1.AuthSessionData();
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                if (!_.isObject(data[property])) {
                    result[property] = this.$cookies.get(property) || this.localStorageService.get(property);
                }
                else {
                    result[property] = data[property];
                }
            }
        }
        return result;
    };
    EntryService.prototype.storeToLocal = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property) && !_.isObject(data[property])) {
                this.localStorageService.set(property, data[property]);
            }
        }
    };
    EntryService.prototype.removeLocal = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property) && !_.isObject(data[property])) {
                this.localStorageService.remove(property);
            }
        }
    };
    EntryService.prototype.storeToCookie = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property) && !_.isObject(data[property])) {
                this.$cookies.put(property, data[property], { path: '/' });
            }
        }
    };
    EntryService.prototype.removeCookie = function (data) {
        for (var property in data) {
            if (data.hasOwnProperty(property) && !_.isObject(data[property])) {
                this.$cookies.remove(property);
            }
        }
    };
    EntryService.prototype.storeKnownServer = function (value) {
        if (!value)
            return;
        this.$cookies.put(value, value, { path: '/' });
        this.localStorageService.set(value, value);
    };
    Object.defineProperty(EntryService.prototype, "appbarIcon", {
        get: function () {
            return this.config.appbarIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "appbarTitle", {
        get: function () {
            return this.config.appbarTitle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "showIcon", {
        get: function () {
            return this.config.showIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "showLanguage", {
        get: function () {
            return this.config.showLanguage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "adminOnly", {
        get: function () {
            return this.config.adminOnly;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "fixedServerUrl", {
        get: function () {
            return this.config.fixedServerUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "passwordExpire", {
        get: function () {
            return this.config.passwordExpire;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "entryHideObject", {
        get: function () {
            return this.config.entryHideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "enableAvatar", {
        get: function () {
            return this.config.enableAvatar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "useEmailAsLogin", {
        get: function () {
            return this.config.useEmailAsLogin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryService.prototype, "isPostSignup", {
        get: function () {
            return this.config.isPostSignup;
        },
        enumerable: true,
        configurable: true
    });
    EntryService.prototype.openSession = function (data, remember) {
        var session = new EntryPageConfig_1.AuthSessionData();
        session.sessionId = data ? data.id : null;
        session.userId = this.getUserId(data);
        session.serverUrl = this.pipRest.serverUrl;
        if (!session.sessionId) {
            throw new Error('Error: session Id not found');
        }
        if (!session.userId) {
            throw new Error('Error: user Id not found');
        }
        this.sessionState = 'open';
        this.pipRest.setHeaders({
            'x-session-id': session.sessionId
        });
        if (remember) {
            var servers = this.localStorageService.get('servers') || {};
            servers[session.serverUrl] = {
                serverUrl: session.serverUrl,
                login: data.user.login
            };
            this.localStorageService.set('servers', servers);
            this.storeToLocal(session);
        }
        this.storeKnownServer(session.serverUrl);
        this.storeToCookie(session);
        this.pipIdentity.identity = data;
        this.pipSession.open(session);
        this.pipTranslate.use(data.user.language);
        if (data.user.theme && data.user.theme != this.pipTheme.theme) {
            this.pipTheme.use(data.user.theme);
        }
    };
    EntryService.prototype.getUserId = function (data) {
        if (!data) {
            return null;
        }
        var id;
        id = data.user_id ? data.user_id : data.user ? data.user.id : null;
        return id;
    };
    EntryService.prototype.checkEmailVerification = function (data) {
        return (data.user && data.user.settings &&
            data.user.settings['verified_email'] && data.user.settings['verified_email'] == "true");
    };
    EntryService.prototype.restoreSessionComplete = function (data, callback) {
        if (angular.isFunction(callback)) {
            callback();
        }
        this.pipIdentity.identity = data;
        this.pipTranslate.use(data.user.language);
    };
    EntryService.prototype.restoreSession = function (callback) {
        var _this = this;
        if (this.sessionState === 'open') {
            if (angular.isFunction(callback)) {
                callback();
            }
            return;
        }
        var session = new EntryPageConfig_1.AuthSessionData();
        session = this.restore(session);
        if (!session || !session.sessionId) {
            this.signout(function () {
                _this.pipAuthState.goToUnauthorized({});
            });
            return;
        }
        this.pipRest.getResource('restoreSessions').call({
            session_id: session.sessionId
        }, function (data) {
            if (!data || !data.id) {
                _this.signout(function () {
                    _this.pipAuthState.goToUnauthorized({});
                });
                return;
            }
            session.userId = _this.getUserId(data);
            session.serverUrl = _this.pipRest.serverUrl;
            _this.storeToCookie(session);
            if (_this.checkEmailVerification(data)) {
                _this.restoreSessionComplete(data, callback);
            }
            else {
                _this.pipRest.getResource('email_settings').get({
                    user_id: data.user.id
                }, function (setting) {
                    if (setting && setting.verified && setting.email == data.user.login) {
                        _this.restoreSessionComplete(data, callback);
                    }
                    else {
                        _this.restoreSessionComplete(data, function () {
                            if (callback)
                                callback();
                            _this.pipAuthState.go('verify_email', { email: data.user.login || data.user['email'], serverUrl: _this.pipRest.serverUrl });
                        });
                    }
                }, function (error) {
                });
            }
        }, function (error) {
            if (angular.isFunction(callback)) {
                callback(error);
            }
            _this.signout(function () {
                _this.pipAuthState.goToUnauthorized({});
            });
        });
    };
    EntryService.prototype.reopenSession = function () {
        var _this = this;
        var session = new EntryPageConfig_1.AuthSessionData();
        session = this.restore(session);
        if (!session || !session.sessionId) {
            this.signout(function () {
                _this.pipAuthState.goToUnauthorized({});
            });
            return;
        }
        this.sessionState = 'reopen';
        this.pipRest.setHeaders({
            'x-session-id': session.sessionId
        });
        if ((!this.pipRest.lockServerUrl || !this.pipRest.serverUrl) && session.serverUrl) {
            this.pipRest.serverUrl = session.serverUrl;
        }
        this.pipSession.open(session);
    };
    EntryService.prototype.closeSession = function () {
        var session = new EntryPageConfig_1.AuthSessionData();
        session.sessionId = null;
        session.userId = null;
        session.serverUrl = null;
        this.pipRest.setHeaders({
            'x-session-id': undefined
        });
        this.pipIdentity.identity = null;
        this.removeLocal(session);
        this.removeCookie(session);
        this.pipTimer.stop();
        this.pipSession.close();
    };
    EntryService.prototype.signout = function (successCallback) {
        if (this.pipSession.isOpened()) {
            this.pipRest.getResource('signout').call({}, successCallback, successCallback);
        }
        this.closeSession();
    };
    return EntryService;
}());
var EntryProvider = (function () {
    function EntryProvider() {
        this.config = new EntryConfig();
        this.config.appbarTitle = '';
        this.config.appbarIcon = '';
        this.config.adminOnly = false;
        this.config.showIcon = false;
        this.config.showLanguage = true;
        this.config.adminOnly = false;
        this.config.fixedServerUrl = null;
        this.config.passwordExpire = false;
        this.config.enableAvatar = false;
        this.config.useEmailAsLogin = false;
        this.config.isPostSignup = true;
        this.config.entryHideObject = new EntryHideObject_1.EntryHideObject();
    }
    Object.defineProperty(EntryProvider.prototype, "appbarIcon", {
        set: function (newAppbarIcon) {
            this.config.appbarIcon = newAppbarIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "appbarTitle", {
        set: function (newAppbarTitle) {
            this.config.appbarTitle = newAppbarTitle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "showIcon", {
        set: function (newShowIcon) {
            this.config.showIcon = newShowIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "showLanguage", {
        set: function (newShowLanguage) {
            this.config.showLanguage = newShowLanguage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "adminOnly", {
        set: function (newAdminOnly) {
            this.config.adminOnly = newAdminOnly;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "fixedServerUrl", {
        set: function (newFixedServerUrl) {
            this.config.fixedServerUrl = newFixedServerUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "passwordExpire", {
        set: function (value) {
            this.config.passwordExpire = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "entryHideObject", {
        set: function (entryHideObject) {
            this.config.entryHideObject = entryHideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "enableAvatar", {
        set: function (value) {
            this.config.enableAvatar = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "useEmailAsLogin", {
        set: function (value) {
            this.config.useEmailAsLogin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntryProvider.prototype, "isPostSignup", {
        set: function (value) {
            this.config.isPostSignup = value;
        },
        enumerable: true,
        configurable: true
    });
    EntryProvider.prototype.$get = ['pipRest', 'localStorageService', '$cookies', '$cookieStore', 'pipSession', 'pipIdentity', 'pipTimer', 'pipTranslate', 'pipTheme', '$timeout', 'pipAuthState', function (pipRest, localStorageService, $cookies, $cookieStore, pipSession, pipIdentity, pipTimer, pipTranslate, pipTheme, $timeout, pipAuthState) {
        "ngInject";
        if (_.isNull(this._service) || _.isUndefined(this._service)) {
            this._service = new EntryService(this.config, pipRest, localStorageService, $cookies, $cookieStore, pipSession, pipIdentity, pipTimer, pipTranslate, pipTheme, $timeout, pipAuthState);
        }
        return this._service;
    }];
    return EntryProvider;
}());
angular.module('pipEntry.Service', [])
    .provider('pipEntry', EntryProvider);
},{"./EntryHideObject":8,"./EntryPageConfig":11}],13:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipEntry.Strings', [])
        .config(['pipTranslateProvider', function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'FULLNAME': 'First and last name',
            'EMAIL': 'Email',
            'LOGIN': 'Login',
            'PASSWORD': 'Password',
            'LANGUAGE': 'Language',
            'GENDER': 'Gender',
            'BIRTHDAY': 'Birthday',
            'LOCATION': 'Location',
            'VERIFY': 'Verify',
            'CONTINUE': 'Continue',
            'HINT_FULLNAME': "Use your real name, so others know who you are",
            'HINT_PASSWORD': 'Minimum 6 characters',
            'SIGNIN_HINT_PASSWORD': 'Please, type password',
            'HINT_ABOUT': 'Few words about yourself',
            'VERIFY_EMAIL': 'Please, verify your email address. ',
            'HINT_EMAIL': 'Enter your email address, please',
            'VERIFY_LOGIN': 'Please, verify your login address. ',
            'HINT_LOGIN': 'Enter your login, please',
            'SIGNIN_TITLE': 'Sign in',
            'SIGNIN_NOT_MEMBER': 'Not a member?',
            'SIGNIN_REMEMBER': 'Remember',
            'SIGNIN_FORGOT_PASSWORD': 'Forgot password?',
            'SIGNIN_SIGNUP_HERE': ' Sign up here',
            'SIGNUP_TITLE': 'Sign up',
            'SIGNUP_NOT_MEMBER': 'Not a member? Sign up now',
            'SIGNUP_TEXT_11': 'By clicking Sign up, you agree to the',
            'SIGNUP_PRIVACY': 'privacy statement',
            'SIGNUP_TEXT_12': 'and',
            'SIGNUP_SERVICES': 'services agreement',
            'SIGNUP_TEXT_2': 'Do you have an account?',
            'SIGNUP_SIGNIN_HERE': ' Sign in here',
            'SIGNUP_EMAIL_REGISTERED': 'This email is already registered',
            'SIGNUP_LOGIN_REGISTERED': 'This login is already registered',
            'SIGNUP_FULLNAME_WRONG': 'xxxx',
            'SIGNUP_EMAIL_WRONG': 'xxxx',
            'SIGNUP_LOGIN_WRONG': 'xxxx',
            'POST_SIGNUP_TITLE': 'Welcome to Pip.Life',
            'POST_SIGNUP_TEXT_1': 'Your account was successfully created.',
            'POST_SIGNUP_TEXT_2': 'Tell us some more about yourself.',
            'RECOVER_PWD_TITLE': 'Forgot password?',
            'RECOVER_PWD_TEXT_1_LOGIN': "Enter the login you used when you joined and we'll send you instructions to reset your password.",
            'RECOVER_PWD_TEXT_1_EMAIL': "Enter the e-mail you used when you joined and we'll send you instructions to reset your password.",
            'RECOVER_PWD_TEXT_2': 'For security reasons, we do NOT store your password. So rest assured that we will never send your password via email.',
            'RECOVER_PWD_RECOVER': 'Recover password',
            'RESET_PWD_PASSWORD': 'Reset password',
            'RESET_PWD_TEXT_LOGIN': 'Enter the login together with the reset code you received in email from. Remember the code is only active for 24 hours.',
            'RESET_PWD_TEXT_EMAIL': 'Enter the e-mail together with the reset code you received in email from. Remember the code is only active for 24 hours.',
            'RESET_PWD_SUCCESS_TEXT': 'Your password was successfully changed',
            'VERIFY_EMAIL_WAIT': 'Email verification. Please, wait.',
            'VERIFY_EMAIL_TITLE': 'Email verification',
            'VERIFY_EMAIL_TEXT_1': 'Confirm your email address using verification code',
            'VERIFY_EMAIL_TEXT_21': "If you haven't received the code, press ",
            'VERIFY_EMAIL_RESEND': 'resend',
            'VERIFY_EMAIL_TEXT_22': 'to send it again.',
            'VERIFY_EMAIL_SUCCESS_TEXT': 'Your email address was successfully verified. Thank you!',
            'PASSWORD_MATCH': 'Passwords don\'t match',
            'PASSWORD_CONFIRM': 'Confirm the password',
            'PASSWORD_SET': 'Set a password',
            'ENTRY_CHANGE_SERVER': 'Change server',
            'ENTRY_SERVER_URL': 'Server URL',
            'ENTRY_RESET_CODE': 'Reset code',
            'ENTRY_VERIFICATION_CODE': 'Verification code',
            'ENTRY_NEW_PASSWORD': 'New password',
            'ENTRY_SET_PASSWORD': 'Set Password',
            'ENTRY_RESET_PASSWORD': 'Set',
            'ENTRY_FREE': 'Free',
            'ENTRY_REPEAT': 'Repeat',
            'CHANGE_PWD_PASSWORD': 'Change password',
            'EXPIRE_CHANGE_PWD_PASSWORD': 'Change expire password',
            'CHANGE_PWD_TEXT': 'Enter a new password to login.',
            'EXPIRE_CHANGE_PWD_TEXT': 'Your password has expired. Enter a new password to login.',
            'ENTRY_CHANGE_PASSWORD': 'Change',
            'ENTRY_EXPIRE_CHANGE_PASSWORD': 'Change',
            'OLD_PASSWORD': 'Current password',
            'NEW_PASSWORD_SET': 'New password',
            'NEW_PASSWORD_CONFIRM': 'Repeat password',
            'CHANGE_PWD_SUCCESS_TEXT': 'Password changed successfuly',
            'EXPIRE_CHANGE_PWD_SUCCESS_TEXT': 'Password changed successfuly',
            'ERROR_EMAIL_INVALID': 'Enter a valid email',
            'ERROR_LOGIN_INVALID': 'Enter a valid login',
            'ERROR_PASSWORD_INVALID': 'Enter a valid password',
            'MINLENGTH_PASSWORD': 'Minimum password length 6 characters',
            'ERROR_FULLNAME_INVALID': 'Enter full name',
            'ERROR_CODE_INVALID': 'Enter a code from mail',
            'ERROR_CODE_WRONG': 'Wrong recovery code',
            'ERROR_SERVER_INVALID': 'Enter server URL',
            'LANGUAGE_RUSSIAN': 'Russian',
            'LANGUAGE_ENGLISH': 'English',
            'ERROR_ACT_EXECUTE': 'Bad Request. User was not found.',
            'ERROR_WRONG_LOGIN': 'Account was not found',
            'ERROR_LOGIN_NOT_FOUND': 'Account was not found',
            'ERROR_NO_LOGIN': 'Missing account login',
            'ERROR_WRONG_PASSWORD': 'Invalid password',
            'ERROR_WRONG_CODE': 'Invalid password recovery code',
            'ERROR_INVALID_CODE': 'Invalid email verification code',
            'ERROR_NO_EMAIL': 'Missing email',
            'ERROR_NO_NAME': 'Missing account name',
            'ERROR_ALREADY_EXIST': 'User account already exist',
            'ERROR_LOGIN_ALREADY_USED': 'User account already exist',
            'ERROR_ALREADY_EXIST_EMAIL': 'User account already exist',
            'ERROR_WRONG_LOGIN_EMAIL': 'Account was not found',
            'ERROR_NO_LOGIN_EMAIL': 'Missing account login',
            'ERROR_SERVER': 'Server is not responding',
            'ERROR_ACCOUNT_LOCKED': 'Number of attempts exceeded. You account was locked.',
            'ERROR_UNKNOWN': 'Unknown error',
            'PASSWORD_IDENTICAL': 'Old and new passwords are identical'
        });
        pipTranslateProvider.translations('ru', {
            'FULLNAME': 'Имя и фамилия',
            'EMAIL': 'Адрес эл.почты',
            'LOGIN': 'Логин',
            'PASSWORD': 'Пароль',
            'LANGUAGE': 'Язык',
            'GENDER': 'Пол',
            'BIRTHDAY': 'Дата рождения',
            'LOCATION': 'Местонахождение',
            'VERIFY': 'Подтвердить',
            'CONTINUE': 'Продолжить',
            'HINT_FULLNAME': "Пожалуйста, введите свое полное имя - так, как вы хотите чтобы вас видели другие пользователи.",
            'HINT_PASSWORD': 'Минимум 6 символов',
            'SIGNIN_HINT_PASSWORD': 'Введите пароль',
            'HINT_ABOUT': 'Несколько слов о себе',
            'VERIFY_EMAIL': 'Подтвердите адрес своей эл.почты',
            'HINT_EMAIL': 'Введите адрес своей эл.почты',
            'VERIFY_LOGIN': 'Подтвердите свой логин',
            'HINT_LOGIN': 'Введите свой логин',
            'SIGNIN_TITLE': 'Вход в систему',
            'SIGNIN_NOT_MEMBER': 'Еще не зарегистрировались?',
            'SIGNIN_REMEMBER': 'Запомнить',
            'SIGNIN_FORGOT_PASSWORD': 'Забыли пароль?',
            'SIGNIN_SIGNUP_HERE': ' Зарегистрироваться здесь',
            'SIGNUP_TITLE': 'Регистрация',
            'SIGNUP_NOT_MEMBER': 'Новенький? Зарегистрируйтесь сейчас',
            'SIGNUP_TEXT_11': 'Нажимая кнопку регистрация, я соглашаюсь с',
            'SIGNUP_SERVICES': 'договором об услугах',
            'SIGNUP_TEXT_12': 'и',
            'SIGNUP_PRIVACY': 'соглашением о личных данных',
            'SIGNUP_TEXT_2': 'Уже зарегистрировались?',
            'SIGNUP_SIGNIN_HERE': ' Вход здесь',
            'SIGNUP_EMAIL_REGISTERED': 'Введенный адрес эл.почты уже занят',
            'SIGNUP_LOGIN_REGISTERED': 'Введенный логин уже занят',
            'POST_SIGNUP_TITLE': 'Добро пожаловать в Pip.Life',
            'POST_SIGNUP_TEXT_1': 'Ваша учетная запись создана.',
            'POST_SIGNUP_TEXT_2': 'Несклько слов о о себе',
            'RECOVER_PWD_TITLE': 'Забыли пароль?',
            'RECOVER_PWD_TEXT_1_LOGIN': 'Введите логин, который вы использовали при регистрации и мы вышлем вам инструкции как изменить пароль.',
            'RECOVER_PWD_TEXT_1_EMAIL': 'Введите эл. почту, которую вы использовали при регистрации и мы вышлем вам инструкции как изменить пароль.',
            'RECOVER_PWD_TEXT_2': 'По соображениям безопасности мы НЕ храним пароли. Таким образом, мы никогда не пошлем ваш пароль по электронной почте.',
            'RECOVER_PWD_RECOVER': 'Восстановить пароль',
            'RESET_PWD_PASSWORD': 'Изменить пароль',
            'RESET_PWD_TEXT_LOGIN': 'Введите логин вместе с кодом, который вы получили в почтовом сообщении. Помните, что код действителен только 24 часа.',
            'RESET_PWD_TEXT_EMAIL': 'Введите эл. почту вместе с кодом, который вы получили в почтовом сообщении. Помните, что код действителен только 24 часа.',
            'RESET_PWD_SUCCESS_TEXT': 'Ваш пароль успешно изменён',
            'VERIFY_EMAIL_WAIT': 'Верификация эл. почты. Подождите немного.',
            'VERIFY_EMAIL_TITLE': 'Подтверждение адреса эл.почты',
            'VERIFY_EMAIL_TEXT_1': 'Введите код, который вы получили по эл.почте',
            'VERIFY_EMAIL_TEXT_21': "Если вы не получили почтовое сообщение с кодом, нажмите ",
            'VERIFY_EMAIL_RESEND': 'отправить снова',
            'VERIFY_EMAIL_TEXT_22': '.',
            'VERIFY_EMAIL_SUCCESS_TEXT': 'Адрес вашей электронной почты успешно подтвержден. Спасибо!',
            'PASSWORD_MATCH': 'Пароли не совпадают',
            'PASSWORD_CONFIRM': 'Подтвердите пароль',
            'PASSWORD_SET': 'Задайте пароль',
            'ENTRY_CHANGE_SERVER': 'Изменить сервер',
            'ENTRY_SERVER_URL': 'URL сервера',
            'ENTRY_RESET_CODE': 'Код сброса пароля',
            'ENTRY_VERIFICATION_CODE': 'Код проверки электронной почты',
            'ENTRY_NEW_PASSWORD': 'Новый пароль',
            'ENTRY_SET_PASSWORD': 'Изменить пароль',
            'ENTRY_RESET_PASSWORD': 'Изменить',
            'ENTRY_FREE': 'бесплатно',
            'ENTRY_REPEAT': 'Повторить',
            'CHANGE_PWD_PASSWORD': 'Изменение пароля',
            'EXPIRE_CHANGE_PWD_PASSWORD': 'Изменение пароля',
            'CHANGE_PWD_TEXT': 'Для входа введите новый пароль.',
            'EXPIRE_CHANGE_PWD_TEXT': 'Время действия Вашего пароля истекло. Для входа введите новый пароль.',
            'ENTRY_CHANGE_PASSWORD': 'Изменить',
            'ENTRY_EXPIRE_CHANGE_PASSWORD': 'Изменить',
            'OLD_PASSWORD': 'Текущий пароль',
            'NEW_PASSWORD_SET': 'Новый пароль',
            'NEW_PASSWORD_CONFIRM': 'Повторите пароль',
            'CHANGE_PWD_SUCCESS_TEXT': 'Пароль был успешно изменен',
            'EXPIRE_CHANGE_PWD_SUCCESS_TEXT': 'Пароль был успешно изменен',
            'ERROR_EMAIL_INVALID': 'Введите адрес электронной почты',
            'ERROR_LOGIN_INVALID': 'Введите логин',
            'ERROR_PASSWORD_INVALID': 'Введите пароль',
            'MINLENGTH_PASSWORD': 'Минимальная длинна пароля 6 символов',
            'ERROR_FULLNAME_INVALID': 'Введите полное имя',
            'ERROR_CODE_INVALID': 'Введите код',
            'ERROR_CODE_WRONG': 'Неправильный код',
            'ERROR_SERVER_INVALID': 'Введите URL сервера',
            'LANGUAGE_RUSSIAN': 'Русский',
            'LANGUAGE_ENGLISH': 'Английский',
            'ERROR_ACT_EXECUTE': 'Неверный запрос. Пользователь не найден.',
            'ERROR_WRONG_LOGIN': 'Учетная запись пользователя не существует',
            'ERROR_LOGIN_NOT_FOUND': 'Учетная запись пользователя не существует',
            'ERROR_NO_LOGIN': 'Не задан логин',
            'ERROR_WRONG_PASSWORD': 'Не верный пароль',
            'ERROR_WRONG_CODE': 'Не верный код восстановления пароля',
            'ERROR_INVALID_CODE': 'Не верный код верификации электронной почты',
            'ERROR_NO_EMAIL': 'Не задан адресс электронной почты',
            'ERROR_NO_NAME': 'Не задано имя пользователя',
            'ERROR_ALREADY_EXIST': 'Логин уже зарегистрирован',
            'ERROR_LOGIN_ALREADY_USED': 'Логин уже зарегистрирован',
            'ERROR_ALREADY_EXIST_EMAIL': 'Логин уже зарегистрирован',
            'ERROR_WRONG_LOGIN_EMAIL': 'Учетная запись пользователя не существует',
            'ERROR_NO_LOGIN_EMAIL': 'Не задан логин',
            'ERROR_SERVER': 'Сервер не отвечает. Проверьте URL сервера.',
            'ERROR_ACCOUNT_LOCKED': 'Количесво попыток превышено. Ваша учетная запись заблокирована.',
            'ERROR_UNKNOWN': 'Неизвестная ошибка',
            'PASSWORD_IDENTICAL': 'Старый и новый пароль совпадают'
        });
    }]);
})();
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],15:[function(require,module,exports){
compareOldPassword.$inject = ['$parse'];
compareNewPassword.$inject = ['$parse'];
comparePasswordMatch.$inject = ['$parse'];
function compareOldPassword($parse) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl['$validators'].ERROR_compareTo = function (modelValue, viewValue) {
                if (ngModelCtrl['$isEmpty'](modelValue)) {
                    return true;
                }
                var otherModelValue;
                var otherModelValueGetter = $parse(attrs.compareTo);
                if (!modelValue || !!otherModelValue)
                    return true;
                if (otherModelValueGetter) {
                    otherModelValue = otherModelValueGetter(scope);
                    return modelValue != otherModelValue;
                }
                else {
                    return true;
                }
            };
        }
    };
}
function compareNewPassword($parse) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl['$validators'].ERROR_compareTo = function (modelValue, viewValue) {
                if (ngModelCtrl['$isEmpty'](modelValue)) {
                    return true;
                }
                var otherModelValue;
                var otherModelValueGetter = $parse(attrs.compareTo1);
                if (!modelValue || !!otherModelValue)
                    return true;
                if (otherModelValueGetter) {
                    otherModelValue = otherModelValueGetter(scope);
                    return modelValue != otherModelValue;
                }
                else {
                    return true;
                }
            };
        }
    };
}
function comparePasswordMatch($parse) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModelCtrl) {
            ngModelCtrl['$validators'].ERROR_compareTo = function (modelValue, viewValue) {
                if (ngModelCtrl['$isEmpty'](modelValue)) {
                    return true;
                }
                var otherModelValue;
                var otherModelValueGetter = $parse(attrs.compareTo2);
                if (!modelValue || !!otherModelValue)
                    return true;
                if (otherModelValueGetter) {
                    otherModelValue = otherModelValueGetter(scope);
                    return modelValue == otherModelValue;
                }
                else {
                    return true;
                }
            };
        }
    };
}
angular.module('pipPasswordMatch', [])
    .directive('pipCompareOldPassword', compareOldPassword)
    .directive('pipCompareNewPassword', compareNewPassword)
    .directive('pipComparePasswordMatch', comparePasswordMatch);
},{}],16:[function(require,module,exports){
(function () {
    'use strict';
    angular.module('pipEntry.Common', ['pipEntry.CommonService', 'pipEntry.Service']);
})();
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Account = (function () {
    function Account() {
    }
    return Account;
}());
exports.Account = Account;
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmailSettings = (function () {
    function EmailSettings() {
    }
    return EmailSettings;
}());
exports.EmailSettings = EmailSettings;
},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntryData = (function () {
    EntryData.$inject = ['$stateParams', 'pipRest', 'pipEntry', 'pipSession'];
    function EntryData($stateParams, pipRest, pipEntry, pipSession) {
        "ngInject";
        this.$stateParams = $stateParams;
        this.pipRest = pipRest;
        this.pipEntry = pipEntry;
        this.pipSession = pipSession;
    }
    EntryData.prototype.getUserId = function () {
        var userId;
        userId = this.pipSession.session ? this.pipSession.session.userId : null;
        return userId;
    };
    EntryData.prototype.signup = function (params, successCallback, errorCallback) {
        return this.pipRest.getResource('signup').call(params, successCallback, errorCallback);
    };
    EntryData.prototype.recoverPassword = function (params, successCallback, errorCallback) {
        return this.pipRest.getResource('recoverPassword').call({
            login: params.login
        }, successCallback, errorCallback);
    };
    EntryData.prototype.resetPassword = function (params, successCallback, errorCallback) {
        return this.pipRest.getResource('resetPassword').call({
            login: params.login,
            code: params.code,
            password: params.password
        }, successCallback, errorCallback);
    };
    EntryData.prototype.expireChangePassword = function (params, successCallback, errorCallback) {
        var param = params || {};
        param.user_id = this.getUserId();
        return this.pipRest.getResource('changePassword').save(param, successCallback, errorCallback);
    };
    EntryData.prototype.requestEmailVerification = function (params, successCallback, errorCallback) {
        return this.pipRest.getResource('requestEmailVerification').call({
            login: params.login
        }, successCallback, errorCallback);
    };
    EntryData.prototype.verifyEmail = function (params, successCallback, errorCallback) {
        return this.pipRest.getResource('verifyEmail').call(params, successCallback, errorCallback);
    };
    EntryData.prototype.readEmailSettings = function (params, successCallback, errorCallback) {
        var param = params || {};
        param.user_id = param.user_id ? param.user_id : this.getUserId();
        return this.pipRest.getResource('email_settings').get(params, successCallback, errorCallback);
    };
    EntryData.prototype.signupValidate = function (login, successCallback, errorCallback) {
        return this.pipRest.getResource('signupValidate').get({
            login: login
        }, successCallback, errorCallback);
    };
    EntryData.prototype.saveSettingsKey = function (section, key, value, successCallback, errorCallback) {
        return this.pipRest.getResource('settings').save({
            section: section,
            key: key
        }, { value: value }, function (data) {
            if (successCallback) {
                successCallback(data);
            }
        }, function (error) {
            if (errorCallback) {
                errorCallback(error);
            }
        });
    };
    return EntryData;
}());
angular
    .module('pipEntryData', ['pipRest'])
    .service('pipEntryData', EntryData);
},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GENDER = (function () {
    function GENDER() {
    }
    return GENDER;
}());
exports.GENDER = GENDER;
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Role = (function () {
    function Role() {
    }
    return Role;
}());
exports.Role = Role;
},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Session = (function () {
    function Session() {
    }
    return Session;
}());
exports.Session = Session;
},{}],25:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Session_1 = require("./Session");
var SessionData = (function (_super) {
    __extends(SessionData, _super);
    function SessionData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SessionData;
}(Session_1.Session));
exports.SessionData = SessionData;
},{"./Session":24}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionData = (function () {
    SessionData.$inject = ['$stateParams', 'pipRest', 'pipSession'];
    function SessionData($stateParams, pipRest, pipSession) {
        "ngInject";
        this.$stateParams = $stateParams;
        this.pipRest = pipRest;
        this.pipSession = pipSession;
        this.RESOURCE = 'sessions';
        this.RESOURCE_USER = 'userSessions';
        this.RESOURCE_RESTORE = 'restoreSessions';
    }
    SessionData.prototype.getSessionId = function () {
        var sessionId;
        sessionId = this.pipSession.session ? this.pipSession.session.sessionId : null;
        return sessionId;
    };
    SessionData.prototype.getUserId = function () {
        var userId;
        userId = this.pipSession.session ? this.pipSession.session.userId : null;
        return userId;
    };
    SessionData.prototype.getSessions = function (params, successCallback, errorCallback) {
        params = params || {};
        return this.pipRest.getResource(this.RESOURCE).call(params, successCallback, errorCallback);
    };
    SessionData.prototype.restoreSession = function (params, successCallback, errorCallback) {
        params = params || {};
        params.session_id = this.getSessionId();
        return this.pipRest.getResource(this.RESOURCE_RESTORE).call(params, successCallback, errorCallback);
    };
    SessionData.prototype.getUserSessions = function (params, successCallback, errorCallback) {
        params = params || {};
        params.user_id = this.getUserId();
        return this.pipRest.getResource(this.RESOURCE_USER).get(params, successCallback, errorCallback);
    };
    return SessionData;
}());
angular
    .module('pipSessionData', ['pipRest'])
    .service('pipSessionData', SessionData);
},{}],27:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Session");
require("./Account");
require("./Enums");
require("./Role");
require("./SessionData");
require("./SessionDataService");
require("./ISessionDataService");
require("./EntryDataService");
require("./IEntryDataService");
angular.module('pipEntry.Data', ['pipRest', 'pipEntryData', 'pipSessionData']);
__export(require("./Session"));
__export(require("./Account"));
__export(require("./Enums"));
__export(require("./Role"));
__export(require("./SessionData"));
},{"./Account":17,"./EntryDataService":19,"./Enums":20,"./IEntryDataService":21,"./ISessionDataService":22,"./Role":23,"./Session":24,"./SessionData":25,"./SessionDataService":26}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpireChangePasswordController = (function () {
    ExpireChangePasswordController.$inject = ['$state', 'pipExpireChangePasswordViewModel', 'pipEntryCommon', 'pipEntry', 'pipAuthState', 'pipSession', '$window'];
    function ExpireChangePasswordController($state, pipExpireChangePasswordViewModel, pipEntryCommon, pipEntry, pipAuthState, pipSession, $window) {
        "ngInject";
        this.pipExpireChangePasswordViewModel = pipExpireChangePasswordViewModel;
        this.$window = $window;
        pipEntryCommon.configureAppBar();
        if (pipEntry.passwordExpire === false || !pipSession.isOpened()) {
            $state.go(pipAuthState.signinState(), {});
        }
    }
    ExpireChangePasswordController.prototype.goBack = function () {
        this.$window.history.back();
    };
    Object.defineProperty(ExpireChangePasswordController.prototype, "config", {
        get: function () {
            return this.pipExpireChangePasswordViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    ExpireChangePasswordController.prototype.onChange = function () {
        this.pipExpireChangePasswordViewModel.onChange();
    };
    return ExpireChangePasswordController;
}());
exports.ExpireChangePasswordController = ExpireChangePasswordController;
{
    angular.module('pipEntry.ExpireChangePassword', ['pipEntry.Common', 'pipExpireChangePasswordPanel']);
}
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ExpireChangePasswordDialogService = (function () {
        ExpireChangePasswordDialogService.$inject = ['$mdDialog'];
        function ExpireChangePasswordDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        ExpireChangePasswordDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'expire_change_password/ExpireChangePasswordDialog.html',
                controller: ExpireChangePasswordDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: false
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return ExpireChangePasswordDialogService;
    }());
    var ExpireChangePasswordDialogController_1 = (function () {
        ExpireChangePasswordDialogController_1.$inject = ['$mdDialog', 'pipExpireChangePasswordViewModel'];
        function ExpireChangePasswordDialogController_1($mdDialog, pipExpireChangePasswordViewModel) {
            "ngInject";
            this.pipExpireChangePasswordViewModel = pipExpireChangePasswordViewModel;
            this.goBack = $mdDialog.cancel;
        }
        Object.defineProperty(ExpireChangePasswordDialogController_1.prototype, "config", {
            get: function () {
                return this.pipExpireChangePasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        ExpireChangePasswordDialogController_1.prototype.onChange = function () {
            var _this = this;
            this.pipExpireChangePasswordViewModel.onChange(function () {
                _this.goBack();
            });
        };
        return ExpireChangePasswordDialogController_1;
    }());
    angular.module('pipEntry.ExpireChangePasswordDialog', ['pipEntry.Common', "pipExpireChangePasswordPanel"])
        .service('pipExpireChangePasswordDialog', ExpireChangePasswordDialogService);
}
},{}],30:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var ExpireChangePasswordModel = (function (_super) {
    __extends(ExpireChangePasswordModel, _super);
    ExpireChangePasswordModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipEntry', 'pipToasts'];
    function ExpireChangePasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipEntry, pipToasts) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipTranslate = pipTranslate;
        _this.pipEntryData = pipEntryData;
        _this.pipEntry = pipEntry;
        _this.pipToasts = pipToasts;
        _this.transaction = pipTransaction.create('entry.expire_change_password');
        return _this;
    }
    ExpireChangePasswordModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    ExpireChangePasswordModel.prototype.setElementVisability = function () {
        this.hideObject.subTitle = new Boolean(this.hideObject.subTitle) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    ExpireChangePasswordModel.prototype.onShowToast = function (message, type) {
        if (!message)
            return;
        message = this.pipTranslate.translate(message);
        type = type || 'message';
        if (type == 'message') {
            this.pipToasts.showMessage(message, null, null, null);
            return;
        }
        if (type == 'error') {
            this.pipToasts.showError(message, null, null, null, null);
            return;
        }
    };
    ExpireChangePasswordModel.prototype.onChange = function (callback) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipEntryData.expireChangePassword({
            login: this.config.data.login,
            old_password: this.config.data.password,
            new_password: this.config.data.passwordNew,
            user_id: this.pipEntryData.getUserId()
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            var message = String() + 'EXPIRE_CHANGE_PWD_SUCCESS_TEXT';
            _this.onShowToast(message, 'message');
            _this.transaction.end();
            if (callback)
                callback();
            _this.pipEntry.signout(function () {
                _this.$state.go('signin', {
                    server_url: _this.config.data.serverUrl,
                    login: _this.config.data.login
                });
            });
        }, function (error) {
            _this.transaction.end(error);
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'NO_LOGIN': 'login',
                'WRONG_LOGIN': 'login',
                'LOGIN_NOT_FOUND': 'login',
                'WRONG_PASSWORD': 'password',
                'act_execute': 'form',
                '-1': 'form'
            });
        });
    };
    return ExpireChangePasswordModel;
}(EntryModel_1.EntryModel));
exports.ExpireChangePasswordModel = ExpireChangePasswordModel;
},{"../common/EntryModel":10}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ExpireChangePasswordPanelBindings = {};
    var ExpireChangePasswordPanelController = (function () {
        ExpireChangePasswordPanelController.$inject = ['$scope', 'pipFormErrors', 'pipRest', 'pipExpireChangePasswordViewModel'];
        function ExpireChangePasswordPanelController($scope, pipFormErrors, pipRest, pipExpireChangePasswordViewModel) {
            "ngInject";
            this.$scope = $scope;
            this.pipFormErrors = pipFormErrors;
            this.pipRest = pipRest;
            this.pipExpireChangePasswordViewModel = pipExpireChangePasswordViewModel;
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            pipExpireChangePasswordViewModel.initModel($scope);
        }
        ExpireChangePasswordPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
            this.config.data.password = null;
            this.config.data.passwordNew = null;
        };
        Object.defineProperty(ExpireChangePasswordPanelController.prototype, "config", {
            get: function () {
                return this.pipExpireChangePasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpireChangePasswordPanelController.prototype, "transaction", {
            get: function () {
                return this.pipExpireChangePasswordViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpireChangePasswordPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipExpireChangePasswordViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpireChangePasswordPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipExpireChangePasswordViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        ExpireChangePasswordPanelController.prototype.onServerUrlChanged = function () {
            this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
        };
        ExpireChangePasswordPanelController.prototype.onChanged = function () {
            this.pipFormErrors.resetFormErrors(this.config.form, false);
            this.pipFormErrors.resetFieldsErrors(this.config.form, null);
            this.pipRest.serverUrl = this.config.selected.searchURLs;
            this.config.data.serverUrl = this.config.selected.searchURLs;
        };
        ExpireChangePasswordPanelController.prototype.onShowToast = function (message, type) {
            this.pipExpireChangePasswordViewModel.onShowToast(message, type);
        };
        return ExpireChangePasswordPanelController;
    }());
    var ExpireChangePasswordPanel = {
        bindings: ExpireChangePasswordPanelBindings,
        controller: ExpireChangePasswordPanelController,
        templateUrl: 'expire_change_password/ExpireChangePasswordPanel.html'
    };
    angular.module("pipExpireChangePasswordPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipExpireChangePasswordPanel', ExpireChangePasswordPanel);
}
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExpireChangePasswordModel_1 = require("./ExpireChangePasswordModel");
var ExpireChangePasswordViewModel = (function () {
    ExpireChangePasswordViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntry', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function ExpireChangePasswordViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntry, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        this.pipTranslate = pipTranslate;
        this.pipEntryData = pipEntryData;
        this.pipToasts = pipToasts;
        this.model = new ExpireChangePasswordModel_1.ExpireChangePasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipEntry, pipToasts);
    }
    Object.defineProperty(ExpireChangePasswordViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpireChangePasswordViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpireChangePasswordViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExpireChangePasswordViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    ExpireChangePasswordViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    ExpireChangePasswordViewModel.prototype.onShowToast = function (message, type) {
        this.model.onShowToast(message, type);
    };
    ExpireChangePasswordViewModel.prototype.onChange = function (callback) {
        this.model.onChange(callback);
    };
    return ExpireChangePasswordViewModel;
}());
exports.ExpireChangePasswordViewModel = ExpireChangePasswordViewModel;
angular.module('pipEntry.ExpireChangePassword')
    .service('pipExpireChangePasswordViewModel', ExpireChangePasswordViewModel);
},{"./ExpireChangePasswordModel":30}],33:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./data");
require("./rest");
require("./common");
var VerifyEmail_1 = require("./verify_email/VerifyEmail");
var RecoverPassword_1 = require("./recover_password/RecoverPassword");
var ResetPassword_1 = require("./reset_password/ResetPassword");
var PostSignup_1 = require("./post_signup/PostSignup");
var Signout_1 = require("./signout/Signout");
var ChangePassword_1 = require("./change_password/ChangePassword");
var ExpireChangePassword_1 = require("./expire_change_password/ExpireChangePassword");
{
    var configEntryRoutes = function ($stateProvider, $locationProvider, $httpProvider, pipAuthStateProvider) {
        $stateProvider
            .state('recover_password', {
            url: '/recover_password?server_url&email',
            auth: false,
            controllerAs: '$ctrl',
            controller: RecoverPassword_1.RecoverPasswordController,
            templateUrl: 'recover_password/RecoverPassword.html'
        })
            .state('change_password', {
            url: '/change_password?server_url&login',
            auth: true,
            controllerAs: '$ctrl',
            controller: ChangePassword_1.ChangePasswordController,
            templateUrl: 'change_password/ChangePassword.html'
        })
            .state('expire_change_password', {
            url: '/expire_change_password?server_url&login',
            auth: true,
            controllerAs: '$ctrl',
            controller: ExpireChangePassword_1.ExpireChangePasswordController,
            templateUrl: 'expire_change_password/ExpireChangePassword.html'
        })
            .state('reset_password', {
            url: '/reset_password?server_url&email&reset_code',
            auth: false,
            controller: ResetPassword_1.ResetPasswordController,
            controllerAs: '$ctrl',
            templateUrl: 'reset_password/ResetPassword.html'
        })
            .state('signout', {
            url: '/signout',
            controller: Signout_1.SignoutController,
            auth: false
        })
            .state('post_signup', {
            url: '/post_signup?party_id',
            auth: true,
            controller: PostSignup_1.PostSignupController,
            controllerAs: '$ctrl',
            templateUrl: 'post_signup/PostSignup.html'
        })
            .state('verify_email', {
            url: '/verify_email?server_url&email&code&language',
            auth: true,
            controller: VerifyEmail_1.VerifyEmailController,
            controllerAs: '$ctrl',
            templateUrl: 'verify_email/VerifyEmail.html'
        })
            .state('verify_email_success', {
            url: '/verify_email_success',
            auth: true,
            controller: VerifyEmail_1.VerifyEmailSuccessController,
            controllerAs: '$ctrl',
            templateUrl: 'verify_email/VerifyEmailSuccess.html'
        });
        pipAuthStateProvider.signinState = 'signin';
        pipAuthStateProvider.signoutState = 'signout';
    };
    configEntryRoutes.$inject = ['$stateProvider', '$locationProvider', '$httpProvider', 'pipAuthStateProvider'];
    angular.module('pipEntry', [
        'ui.router', 'ngMessages', 'ngCookies', 'LocalStorageModule',
        'pipControls', 'pipLocations', 'pipErrors',
        'pipTranslate', 'pipCommonRest',
        'pipEntry.Strings',
        'pipEntry.Data', 'pipEntry.Rest',
        'pipEntry.Common', 'pipEntry.Signin', 'pipEntry.Signup',
        'pipEntry.PostSignup', 'pipEntry.VerifyEmail',
        'pipEntry.RecoverPassword', 'pipEntry.ResetPassword',
        'pipEntry.ResetPasswordDialog', 'pipEntry.RecoverPasswordDialog',
        'pipEntry.ChangePassword', 'pipEntry.ChangePasswordDialog',
        'pipEntry.ExpireChangePassword', 'pipEntry.ExpireChangePasswordDialog',
        'pipEntry.Templates'
    ])
        .config(configEntryRoutes);
}
__export(require("./data"));
},{"./change_password/ChangePassword":1,"./common":16,"./data":27,"./expire_change_password/ExpireChangePassword":28,"./post_signup/PostSignup":34,"./recover_password/RecoverPassword":39,"./reset_password/ResetPassword":44,"./rest":52,"./signout/Signout":58,"./verify_email/VerifyEmail":64}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PostSignupController = (function () {
    PostSignupController.$inject = ['$window', '$party', 'pipPostSignupViewModel'];
    function PostSignupController($window, $party, pipPostSignupViewModel) {
        "ngInject";
        this.$window = $window;
        this.$party = $party;
        this.pipPostSignupViewModel = pipPostSignupViewModel;
    }
    PostSignupController.prototype.$onInit = function () { };
    PostSignupController.prototype.onPostSignupSubmit = function () {
        this.pipPostSignupViewModel.onPostSignupSubmit();
    };
    Object.defineProperty(PostSignupController.prototype, "transaction", {
        get: function () {
            return this.pipPostSignupViewModel.transaction;
        },
        enumerable: true,
        configurable: true
    });
    return PostSignupController;
}());
exports.PostSignupController = PostSignupController;
{
    angular.module('pipEntry.PostSignup', ['pipEntry.Common', "pipPostSignupPanel"])
        .controller('pipPostSignupController', PostSignupController);
}
},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var PostSignupDialogService = (function () {
        PostSignupDialogService.$inject = ['$mdDialog'];
        function PostSignupDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        PostSignupDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'post_signup/PostSignupDialog.html',
                controller: PostSignupDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: false
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return PostSignupDialogService;
    }());
    var PostSignupDialogController_1 = (function () {
        PostSignupDialogController_1.$inject = ['$mdDialog', 'params', 'pipPostSignupViewModel'];
        function PostSignupDialogController_1($mdDialog, params, pipPostSignupViewModel) {
            "ngInject";
            this.pipPostSignupViewModel = pipPostSignupViewModel;
            this.goBack = $mdDialog.cancel;
            this.$party = params.$party;
        }
        PostSignupDialogController_1.prototype.onPostSignupSubmit = function () {
            var _this = this;
            this.pipPostSignupViewModel.onPostSignupSubmit(function () {
                _this.goBack();
            });
        };
        Object.defineProperty(PostSignupDialogController_1.prototype, "transaction", {
            get: function () {
                return this.pipPostSignupViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        return PostSignupDialogController_1;
    }());
    angular.module('pipEntry.PostSignupDialog', ['pipEntry.Common', "pipPostSignupPanel"])
        .service('pipPostSignupDialog', PostSignupDialogService);
}
},{}],36:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var PostSignupModel = (function (_super) {
    __extends(PostSignupModel, _super);
    PostSignupModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipErrorPageConfigService', 'pipAuthState', 'pipFormErrors', 'pipEntry', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function PostSignupModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipFormErrors, pipEntry, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipErrorPageConfigService = pipErrorPageConfigService;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipEntry = pipEntry;
        _this.pipRest = pipRest;
        _this.pipTranslate = pipTranslate;
        _this.pipEntryData = pipEntryData;
        _this.pipToasts = pipToasts;
        _this.transaction = pipTransaction.create('entry.signin');
        return _this;
    }
    PostSignupModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    PostSignupModel.prototype.setElementVisability = function () {
        this.hideObject.subTitle = new Boolean(this.hideObject.subTitle) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.successTitle = new Boolean(this.hideObject.successTitle) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    PostSignupModel.prototype.checkSupported = function () {
        var pipSystemInfo = this.$injector.has('pipSystemInfo') ? this.$injector.get('pipSystemInfo') : null;
        if (!pipSystemInfo) {
            return true;
        }
        if (!this.pipErrorPageConfigService || !this.pipErrorPageConfigService.configs ||
            !this.pipErrorPageConfigService.configs.Unsupported || !this.pipErrorPageConfigService.configs.Unsupported.Active) {
            return true;
        }
        var browser = pipSystemInfo.browserName;
        var version = pipSystemInfo.browserVersion;
        version = version.split(".")[0];
        var supported = this.pipErrorPageConfigService.configs.Unsupported.Params && this.pipErrorPageConfigService.configs.Unsupported.Params.supported ? this.pipErrorPageConfigService.configs.Unsupported.Params.supported : null;
        if (!supported) {
            return true;
        }
        if (browser && supported[browser] && version >= supported[browser]) {
            return true;
        }
        this.pipEntry.signout();
        this.$state.go(pip.errors.ErrorsUnsupportedState);
        return false;
    };
    PostSignupModel.prototype.onPostSignupSubmit = function (callback) {
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (callback)
            callback();
    };
    return PostSignupModel;
}(EntryModel_1.EntryModel));
exports.PostSignupModel = PostSignupModel;
},{"../common/EntryModel":10}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("../data/Enums");
{
    var PostSignupPanelBindings = {
        $party: '=pipParty',
    };
    var PostSignupPanelController = (function () {
        PostSignupPanelController.$inject = ['$scope', 'pipTranslate', 'pipFormErrors', 'pipPostSignupViewModel'];
        function PostSignupPanelController($scope, pipTranslate, pipFormErrors, pipPostSignupViewModel) {
            "ngInject";
            this.$scope = $scope;
            this.pipPostSignupViewModel = pipPostSignupViewModel;
            pipPostSignupViewModel.initModel($scope);
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            this.config.data = {
                id: this.$party.id,
                name: this.$party.name,
                email: this.$party.email,
                about: this.$party.about,
                language: pipTranslate.language,
                birthday: this.$party.birthday,
                gender: this.$party.gender || Enums_1.GENDER.NOT_SPECIFIED,
                location: this.$party.location
            };
        }
        PostSignupPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
        };
        Object.defineProperty(PostSignupPanelController.prototype, "config", {
            get: function () {
                return this.pipPostSignupViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PostSignupPanelController.prototype, "transaction", {
            get: function () {
                return this.pipPostSignupViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PostSignupPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipPostSignupViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PostSignupPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipPostSignupViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        PostSignupPanelController.prototype.onPictureChanged = function ($control) {
            if (!this.config.enableAvatar) {
                return;
            }
            if (this.picture)
                this.picture.save(function () { }, function (error) {
                });
        };
        PostSignupPanelController.prototype.onPictureCreated = function ($event) {
            this.picture = $event.sender;
        };
        return PostSignupPanelController;
    }());
    var PostSignupPanel = {
        bindings: PostSignupPanelBindings,
        templateUrl: 'post_signup/PostSignupPanel.html',
        controller: PostSignupPanelController
    };
    angular.module("pipPostSignupPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipPostSignupPanel', PostSignupPanel);
}
},{"../data/Enums":20}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PostSignupModel_1 = require("./PostSignupModel");
var PostSignupViewModel = (function () {
    PostSignupViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipErrorPageConfigService', 'pipAuthState', 'pipEntry', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function PostSignupViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipEntry, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        this.pipTranslate = pipTranslate;
        this.pipEntryData = pipEntryData;
        this.pipToasts = pipToasts;
        this.model = new PostSignupModel_1.PostSignupModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipFormErrors, pipEntry, pipRest, pipTranslate, pipEntryData, pipToasts);
    }
    Object.defineProperty(PostSignupViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostSignupViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostSignupViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostSignupViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    PostSignupViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    PostSignupViewModel.prototype.onPostSignupSubmit = function (callback) {
        this.model.onPostSignupSubmit(callback);
    };
    return PostSignupViewModel;
}());
exports.PostSignupViewModel = PostSignupViewModel;
angular.module('pipEntry.PostSignup')
    .service('pipPostSignupViewModel', PostSignupViewModel);
},{"./PostSignupModel":36}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RecoverPasswordController = (function () {
    RecoverPasswordController.$inject = ['$scope', 'pipRecoverPasswordViewModel', 'pipResetPasswordDialog', 'pipEntryCommon', '$state', 'pipAuthState', 'pipFormErrors', '$window'];
    function RecoverPasswordController($scope, pipRecoverPasswordViewModel, pipResetPasswordDialog, pipEntryCommon, $state, pipAuthState, pipFormErrors, $window) {
        "ngInject";
        this.$scope = $scope;
        this.pipRecoverPasswordViewModel = pipRecoverPasswordViewModel;
        this.pipResetPasswordDialog = pipResetPasswordDialog;
        this.$state = $state;
        this.pipAuthState = pipAuthState;
        this.pipFormErrors = pipFormErrors;
        this.$window = $window;
        pipEntryCommon.configureAppBar();
    }
    RecoverPasswordController.prototype.goBack = function () {
        this.$state.go(this.pipAuthState.signinState());
    };
    Object.defineProperty(RecoverPasswordController.prototype, "transaction", {
        get: function () {
            return this.pipRecoverPasswordViewModel.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecoverPasswordController.prototype, "config", {
        get: function () {
            return this.pipRecoverPasswordViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    RecoverPasswordController.prototype.onRecover = function () {
        var _this = this;
        this.pipRecoverPasswordViewModel.onRecover(function () {
            _this.pipResetPasswordDialog.show({}, function () {
                _this.$scope.$broadcast('RecoverPasswordInit');
            }, function () {
                _this.$scope.$broadcast('RecoverPasswordInit');
            });
        });
    };
    return RecoverPasswordController;
}());
exports.RecoverPasswordController = RecoverPasswordController;
{
    angular.module('pipEntry.RecoverPassword', ['pipEntry.Common', 'pipRecoverPasswordPanel', 'pipEntry.ResetPasswordDialog']);
}
},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var RecoverPasswordDialogService = (function () {
        RecoverPasswordDialogService.$inject = ['$mdDialog'];
        function RecoverPasswordDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        RecoverPasswordDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'recover_password/RecoverPasswordDialog.html',
                controller: RecoverPasswordDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: false
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return RecoverPasswordDialogService;
    }());
    var RecoverPasswordDialogController_1 = (function () {
        RecoverPasswordDialogController_1.$inject = ['pipResetPasswordDialog', 'pipRecoverPasswordViewModel', 'pipFormErrors', '$mdDialog'];
        function RecoverPasswordDialogController_1(pipResetPasswordDialog, pipRecoverPasswordViewModel, pipFormErrors, $mdDialog) {
            "ngInject";
            this.pipResetPasswordDialog = pipResetPasswordDialog;
            this.pipRecoverPasswordViewModel = pipRecoverPasswordViewModel;
            this.pipFormErrors = pipFormErrors;
            this.$mdDialog = $mdDialog;
            this.goBack = $mdDialog.cancel;
        }
        Object.defineProperty(RecoverPasswordDialogController_1.prototype, "transaction", {
            get: function () {
                return this.pipRecoverPasswordViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecoverPasswordDialogController_1.prototype, "config", {
            get: function () {
                return this.pipRecoverPasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        RecoverPasswordDialogController_1.prototype.onRecover = function () {
            var _this = this;
            this.$mdDialog.cancel;
            this.pipRecoverPasswordViewModel.onRecover(function () {
                _this.pipResetPasswordDialog.show({});
            });
        };
        return RecoverPasswordDialogController_1;
    }());
    angular.module('pipEntry.RecoverPasswordDialog', ['pipEntry.Common', "pipRecoverPasswordPanel",
        'pipEntry.ResetPasswordDialog'
    ])
        .service('pipRecoverPasswordDialog', RecoverPasswordDialogService);
}
},{}],41:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var RecoverPasswordModel = (function (_super) {
    __extends(RecoverPasswordModel, _super);
    RecoverPasswordModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function RecoverPasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipTranslate = pipTranslate;
        _this.pipEntryData = pipEntryData;
        _this.pipToasts = pipToasts;
        _this.transaction = pipTransaction.create('entry.signin');
        return _this;
    }
    RecoverPasswordModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    RecoverPasswordModel.prototype.setElementVisability = function () {
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.subTitle1 = new Boolean(this.hideObject.subTitle1) == true;
        this.hideObject.subTitle2 = new Boolean(this.hideObject.subTitle2) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    RecoverPasswordModel.prototype.onRecover = function (gotoReset) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipEntryData.recoverPassword({
            login: this.config.data.login
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            if (_this.transaction.aborted(transactionId))
                return;
            _this.transaction.end();
            if (!gotoReset) {
                _this.$state.go('reset_password', {
                    server_url: _this.config.data.serverUrl,
                    login: _this.config.data.login
                });
            }
            else {
                gotoReset();
            }
        }, function (error) {
            _this.transaction.end(error);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'WRONG_LOGIN': 'login',
                'NO_LOGIN': 'login',
                'LOGIN_NOT_FOUND': 'login',
                'act_execute': 'form',
                '-1': 'form'
            });
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
        });
    };
    ;
    return RecoverPasswordModel;
}(EntryModel_1.EntryModel));
exports.RecoverPasswordModel = RecoverPasswordModel;
},{"../common/EntryModel":10}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var RecoverPasswordPanelBindings = {};
    var RecoverPasswordPanelController = (function () {
        RecoverPasswordPanelController.$inject = ['$scope', 'pipFormErrors', 'pipRest', 'pipRecoverPasswordViewModel'];
        function RecoverPasswordPanelController($scope, pipFormErrors, pipRest, pipRecoverPasswordViewModel) {
            "ngInject";
            var _this = this;
            this.$scope = $scope;
            this.pipFormErrors = pipFormErrors;
            this.pipRest = pipRest;
            this.pipRecoverPasswordViewModel = pipRecoverPasswordViewModel;
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            pipRecoverPasswordViewModel.initModel($scope);
            this.$scope.$on('RecoverPasswordInit', function () {
                _this.config.form = _this.$scope.form;
            });
        }
        RecoverPasswordPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
            this.config.data.password = null;
            this.config.data.passwordNew = null;
        };
        Object.defineProperty(RecoverPasswordPanelController.prototype, "config", {
            get: function () {
                return this.pipRecoverPasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecoverPasswordPanelController.prototype, "transaction", {
            get: function () {
                return this.pipRecoverPasswordViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RecoverPasswordPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipRecoverPasswordViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        RecoverPasswordPanelController.prototype.onServerUrlChanged = function () {
            this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
        };
        RecoverPasswordPanelController.prototype.onChanged = function () {
            this.pipFormErrors.resetFormErrors(this.config.form, false);
            this.pipFormErrors.resetFieldsErrors(this.config.form, null);
            this.pipRest.serverUrl = this.config.selected.searchURLs;
            this.config.data.serverUrl = this.config.selected.searchURLs;
        };
        Object.defineProperty(RecoverPasswordPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipRecoverPasswordViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        return RecoverPasswordPanelController;
    }());
    var RecoverPasswordPanel = {
        bindings: RecoverPasswordPanelBindings,
        controller: RecoverPasswordPanelController,
        templateUrl: 'recover_password/RecoverPasswordPanel.html'
    };
    angular.module("pipRecoverPasswordPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipRecoverPasswordPanel', RecoverPasswordPanel);
}
},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RecoverPasswordModel_1 = require("./RecoverPasswordModel");
var RecoverPasswordViewModel = (function () {
    RecoverPasswordViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function RecoverPasswordViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        this.pipTranslate = pipTranslate;
        this.pipEntryData = pipEntryData;
        this.pipToasts = pipToasts;
        this.model = new RecoverPasswordModel_1.RecoverPasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts);
    }
    Object.defineProperty(RecoverPasswordViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecoverPasswordViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecoverPasswordViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecoverPasswordViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    RecoverPasswordViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    RecoverPasswordViewModel.prototype.onRecover = function (gotoReset) {
        this.model.onRecover(gotoReset);
    };
    return RecoverPasswordViewModel;
}());
exports.RecoverPasswordViewModel = RecoverPasswordViewModel;
angular.module('pipEntry.RecoverPassword')
    .service('pipRecoverPasswordViewModel', RecoverPasswordViewModel);
},{"./RecoverPasswordModel":41}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResetPasswordController = (function () {
    ResetPasswordController.$inject = ['pipResetPasswordViewModel', 'pipEntryCommon', '$window'];
    function ResetPasswordController(pipResetPasswordViewModel, pipEntryCommon, $window) {
        "ngInject";
        this.pipResetPasswordViewModel = pipResetPasswordViewModel;
        this.$window = $window;
        pipEntryCommon.configureAppBar();
    }
    ResetPasswordController.prototype.goBack = function () {
        this.$window.history.back();
    };
    Object.defineProperty(ResetPasswordController.prototype, "config", {
        get: function () {
            return this.pipResetPasswordViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    ResetPasswordController.prototype.onReset = function () {
        this.pipResetPasswordViewModel.onReset();
    };
    return ResetPasswordController;
}());
exports.ResetPasswordController = ResetPasswordController;
{
    angular.module('pipEntry.ResetPassword', ['pipEntry.Common', 'pipResetPasswordPanel',
        'pipEmailUnique'
    ]);
}
},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ResetPasswordDialogService = (function () {
        ResetPasswordDialogService.$inject = ['$mdDialog'];
        function ResetPasswordDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        ResetPasswordDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'reset_password/ResetPasswordDialog.html',
                controller: ResetPasswordDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: false
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return ResetPasswordDialogService;
    }());
    var ResetPasswordDialogController_1 = (function () {
        ResetPasswordDialogController_1.$inject = ['$mdDialog', 'pipResetPasswordViewModel'];
        function ResetPasswordDialogController_1($mdDialog, pipResetPasswordViewModel) {
            "ngInject";
            this.pipResetPasswordViewModel = pipResetPasswordViewModel;
            this.goBack = $mdDialog.cancel;
        }
        Object.defineProperty(ResetPasswordDialogController_1.prototype, "config", {
            get: function () {
                return this.pipResetPasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        ResetPasswordDialogController_1.prototype.onReset = function () {
            var _this = this;
            this.pipResetPasswordViewModel.onReset(function () {
                _this.goBack();
            });
        };
        ResetPasswordDialogController_1.prototype.onCancel = function () {
            this.goBack();
        };
        return ResetPasswordDialogController_1;
    }());
    angular.module('pipEntry.ResetPasswordDialog', ['pipEntry.Common', "pipResetPasswordPanel"])
        .service('pipResetPasswordDialog', ResetPasswordDialogService);
}
},{}],46:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var ResetPasswordModel = (function (_super) {
    __extends(ResetPasswordModel, _super);
    ResetPasswordModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function ResetPasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipTranslate = pipTranslate;
        _this.pipEntryData = pipEntryData;
        _this.pipToasts = pipToasts;
        _this.transaction = pipTransaction.create('entry.signin');
        return _this;
    }
    ResetPasswordModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    ResetPasswordModel.prototype.setElementVisability = function () {
        this.hideObject.subTitle = new Boolean(this.hideObject.subTitle) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    ResetPasswordModel.prototype.onShowToast = function (message, type) {
        if (!message)
            return;
        message = this.pipTranslate.translate(message);
        type = type || 'message';
        if (type == 'message') {
            this.pipToasts.showMessage(message, null, null, null);
            return;
        }
        if (type == 'error') {
            this.pipToasts.showError(message, null, null, null, null);
            return;
        }
    };
    ResetPasswordModel.prototype.onReset = function (callback) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipEntryData.resetPassword({
            login: this.config.data.login,
            code: this.config.data.resetCode,
            password: this.config.data.password
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            var message = String() + 'RESET_PWD_SUCCESS_TEXT';
            _this.onShowToast(message, 'message');
            _this.transaction.end();
            if (callback)
                callback();
            _this.$state.go('signin', {
                server_url: _this.config.data.serverUrl,
                login: _this.config.data.login
            });
        }, function (error) {
            _this.transaction.end(error);
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'NO_LOGIN': 'login',
                'WRONG_LOGIN': 'login',
                'LOGIN_NOT_FOUND': 'login',
                'WRONG_PASSWORD': 'password',
                'WRONG_CODE': 'resetCode',
                'act_execute': 'form',
                '-1': 'form'
            });
        });
    };
    return ResetPasswordModel;
}(EntryModel_1.EntryModel));
exports.ResetPasswordModel = ResetPasswordModel;
},{"../common/EntryModel":10}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ResetPasswordPanelBindings = {};
    var ResetPasswordPanelController = (function () {
        ResetPasswordPanelController.$inject = ['$scope', 'pipFormErrors', 'pipRest', 'pipResetPasswordViewModel'];
        function ResetPasswordPanelController($scope, pipFormErrors, pipRest, pipResetPasswordViewModel) {
            "ngInject";
            this.$scope = $scope;
            this.pipFormErrors = pipFormErrors;
            this.pipRest = pipRest;
            this.pipResetPasswordViewModel = pipResetPasswordViewModel;
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            pipResetPasswordViewModel.initModel($scope);
        }
        ResetPasswordPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
            this.config.data.password = null;
            this.config.data.passwordNew = null;
        };
        Object.defineProperty(ResetPasswordPanelController.prototype, "config", {
            get: function () {
                return this.pipResetPasswordViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResetPasswordPanelController.prototype, "transaction", {
            get: function () {
                return this.pipResetPasswordViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResetPasswordPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipResetPasswordViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ResetPasswordPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipResetPasswordViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        ResetPasswordPanelController.prototype.onServerUrlChanged = function () {
            this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
        };
        ResetPasswordPanelController.prototype.onChanged = function () {
            this.pipFormErrors.resetFormErrors(this.config.form, false);
            this.pipFormErrors.resetFieldsErrors(this.config.form, null);
            this.pipRest.serverUrl = this.config.selected.searchURLs;
            this.config.data.serverUrl = this.config.selected.searchURLs;
        };
        ResetPasswordPanelController.prototype.onShowToast = function (message, type) {
            this.pipResetPasswordViewModel.onShowToast(message, type);
        };
        return ResetPasswordPanelController;
    }());
    var ResetPasswordPanel = {
        bindings: ResetPasswordPanelBindings,
        controller: ResetPasswordPanelController,
        templateUrl: 'reset_password/ResetPasswordPanel.html'
    };
    angular.module("pipResetPasswordPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipResetPasswordPanel', ResetPasswordPanel);
}
},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResetPasswordModel_1 = require("./ResetPasswordModel");
var ResetPasswordViewModel = (function () {
    ResetPasswordViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipTranslate', 'pipEntryData', 'pipToasts'];
    function ResetPasswordViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts) {
        "ngInject";
        this.pipTranslate = pipTranslate;
        this.pipEntryData = pipEntryData;
        this.pipToasts = pipToasts;
        this.model = new ResetPasswordModel_1.ResetPasswordModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipTranslate, pipEntryData, pipToasts);
    }
    Object.defineProperty(ResetPasswordViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResetPasswordViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResetPasswordViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ResetPasswordViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    ResetPasswordViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    ResetPasswordViewModel.prototype.onShowToast = function (message, type) {
        this.model.onShowToast(message, type);
    };
    ResetPasswordViewModel.prototype.onReset = function (callback) {
        this.model.onReset(callback);
    };
    return ResetPasswordViewModel;
}());
exports.ResetPasswordViewModel = ResetPasswordViewModel;
angular.module('pipEntry.ResetPassword')
    .service('pipResetPasswordViewModel', ResetPasswordViewModel);
},{"./ResetPasswordModel":46}],49:[function(require,module,exports){
configEntryResources.$inject = ['pipRestProvider'];
function configEntryResources(pipRestProvider) {
    pipRestProvider.registerOperation('signin', '/api/v1/signin');
    pipRestProvider.registerOperation('signout', '/api/v1/signout');
    pipRestProvider.registerOperation('signup', '/api/v1/signup');
    pipRestProvider.registerOperation('recoverPassword', '/api/v1/passwords/recover');
    pipRestProvider.registerOperation('resetPassword', '/api/v1/passwords/reset');
    pipRestProvider.registerCollection('changePassword', '/api/v1/passwords/:user_id/change', { user_id: '@user_id' });
    pipRestProvider.registerOperation('requestEmailVerification', '/api/v1/email_settings/resend');
    pipRestProvider.registerOperation('verifyEmail', '/api/v1/email_settings/verify');
    pipRestProvider.registerOperation('email_settings', '/api/v1/email_settings/:user_id', { user_id: '@user_id' }, {
        get: { method: 'GET', isArray: false }
    });
    pipRestProvider.registerOperation('signupValidate', '/api/v1/signup/validate', {}, {
        get: { method: 'GET', isArray: false }
    });
}
angular
    .module('pipEntry.Rest')
    .config(configEntryResources);
},{}],50:[function(require,module,exports){
configSessionResources.$inject = ['pipRestProvider'];
function configSessionResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('sessions', '/api/v1/sessions');
    pipRestProvider.registerOperation('restoreSessions', '/api/v1/sessions/restore');
    pipRestProvider.registerPagedCollection('userSessions', '/api/v1//sessions/:user_id');
}
angular
    .module('pipEntry.Rest')
    .config(configSessionResources);
},{}],51:[function(require,module,exports){
configSettingsResources.$inject = ['pipRestProvider'];
function configSettingsResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('settings', '/api/v1/settings/:section/:key', { section: '@section' }, {
        update: { method: 'PUT' }
    });
}
angular
    .module('pipEntry.Rest')
    .config(configSettingsResources);
},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipEntry.Rest', []);
require("./EntryResources");
require("./SettingsResources");
require("./SessionResources");
},{"./EntryResources":49,"./SessionResources":50,"./SettingsResources":51}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSignin = 'isSignin';
{
    var SigninController_1 = (function () {
        SigninController_1.$inject = ['$scope', '$rootScope', 'pipEntry', 'pipEntryCommon', 'pipSession'];
        function SigninController_1($scope, $rootScope, pipEntry, pipEntryCommon, pipSession) {
            "ngIngect";
            this.fixedServerUrl = false;
            pipEntryCommon.configureAppBar();
            $rootScope[exports.isSignin] = false;
            this.fixedServerUrl = $scope['fixedServerUrl'];
        }
        return SigninController_1;
    }());
    var SigninConfig = function ($stateProvider, pipAuthStateProvider) {
        $stateProvider
            .state('signin', {
            url: '/signin?login&server_url&redirect_to&language&email',
            auth: false,
            controller: SigninController_1,
            controllerAs: '$ctrl',
            templateUrl: 'signin/Signin.html'
        });
        pipAuthStateProvider.signinState = 'signin';
    };
    SigninConfig.$inject = ['$stateProvider', 'pipAuthStateProvider'];
    angular.module('pipEntry.Signin', ['pipEntry.Common', "pipSigninPanel"])
        .config(SigninConfig);
}
},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SigninDialogService = (function () {
    SigninDialogService.$inject = ['$mdDialog'];
    function SigninDialogService($mdDialog) {
        this.$mdDialog = $mdDialog;
    }
    SigninDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this.$mdDialog.show({
            targetEvent: params.event,
            templateUrl: 'signin/SigninDialog.html',
            controller: SigninDialogController,
            locals: {
                params: params
            },
            clickOutsideToClose: false
        })
            .then(function () {
            if (successCallback) {
                successCallback();
            }
        }, function () {
            if (cancelCallback) {
                cancelCallback();
            }
        });
    };
    return SigninDialogService;
}());
var SigninDialogController = (function () {
    SigninDialogController.$inject = ['pipSignupDialog', 'pipRecoverPasswordDialog', 'pipEntry'];
    function SigninDialogController(pipSignupDialog, pipRecoverPasswordDialog, pipEntry) {
        "ngInject";
        var _this = this;
        this.pipSignupDialog = pipSignupDialog;
        this.pipRecoverPasswordDialog = pipRecoverPasswordDialog;
        this.pipEntry = pipEntry;
        this.pipGotoSignupDialog = function () {
            _this.gotoSignupDialog();
        };
        this.pipGotoRecoverPasswordDialog = function () {
            _this.gotoRecoverPasswordDialog();
        };
    }
    SigninDialogController.prototype.gotoSignupDialog = function () {
        this.pipSignupDialog.show({});
    };
    SigninDialogController.prototype.gotoRecoverPasswordDialog = function () {
        this.pipRecoverPasswordDialog.show({});
    };
    return SigninDialogController;
}());
{
    angular.module('pipEntry.SigninDialog', [
        'pipEntry.Common',
        'pipSigninPanel',
        'pipEntry.SignupDialog',
        'pipEntry.RecoverPasswordDialog'
    ])
        .service('pipSigninDialog', SigninDialogService);
}
},{}],55:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var EntryPageConfig_1 = require("../common/EntryPageConfig");
var SinginModel = (function (_super) {
    __extends(SinginModel, _super);
    SinginModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipErrorPageConfigService', 'pipAuthState', 'pipEntry', 'pipFormErrors', 'pipNavService', 'pipRest'];
    function SinginModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipEntry, pipFormErrors, pipNavService, pipRest) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipErrorPageConfigService = pipErrorPageConfigService;
        _this.pipAuthState = pipAuthState;
        _this.pipEntry = pipEntry;
        _this.pipFormErrors = pipFormErrors;
        _this.pipNavService = pipNavService;
        _this.pipRest = pipRest;
        _this.transaction = pipTransaction.create('entry.signin');
        return _this;
    }
    SinginModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    SinginModel.prototype.setElementVisability = function () {
        this.hideObject.remember = new Boolean(this.hideObject.remember) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.forgotPassword = new Boolean(this.hideObject.forgotPassword) == true;
        this.hideObject.signup = new Boolean(this.hideObject.signup) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    SinginModel.prototype.checkSupported = function () {
        var pipSystemInfo = this.$injector.has('pipSystemInfo') ? this.$injector.get('pipSystemInfo') : null;
        if (!pipSystemInfo) {
            return true;
        }
        if (!this.pipErrorPageConfigService || !this.pipErrorPageConfigService.configs ||
            !this.pipErrorPageConfigService.configs.Unsupported || !this.pipErrorPageConfigService.configs.Unsupported.Active) {
            return true;
        }
        var browser = pipSystemInfo.browserName;
        var version = pipSystemInfo.browserVersion;
        version = version.split(".")[0];
        var supported = this.pipErrorPageConfigService.configs.Unsupported.Params && this.pipErrorPageConfigService.configs.Unsupported.Params.supported ? this.pipErrorPageConfigService.configs.Unsupported.Params.supported : null;
        if (!supported) {
            return true;
        }
        if (browser && supported[browser] && version >= supported[browser]) {
            return true;
        }
        this.pipEntry.signout();
        this.$state.go(pip.errors.ErrorsUnsupportedState);
        return false;
    };
    SinginModel.prototype.gotoSignup = function (gotoSignupPage, gotoSignupDialog) {
        if (!gotoSignupPage && !gotoSignupDialog) {
            this.$state.go('signup', {
                server_url: this.config.data.serverUrl,
                login: this.config.data.login
            });
            return;
        }
        if (gotoSignupPage) {
            this.$state.go(gotoSignupPage);
            return;
        }
        if (gotoSignupDialog) {
            gotoSignupDialog();
            return;
        }
    };
    SinginModel.prototype.gotoRecoverPassword = function (gotoRecoverPasswordDialog) {
        if (!gotoRecoverPasswordDialog) {
            this.$state.go('recover_password', {
                server_url: this.config.data.serverUrl,
                login: this.config.data.login
            });
            return;
        }
        if (gotoRecoverPasswordDialog) {
            gotoRecoverPasswordDialog();
            return;
        }
    };
    SinginModel.prototype.inSigninComplete = function (data) {
        if (this.checkSupported()) {
            var passwordExpire = false;
            if (this.pipEntry.passwordExpire && data.user && data.user.change_pwd_time) {
                var expireDate = new Date(data.user.change_pwd_time);
                var nowDate = new Date();
                passwordExpire = expireDate.getTime() < nowDate.getTime();
            }
            if (passwordExpire) {
                this.pipAuthState.go('change_password', {
                    login: this.config.data.login,
                    server_url: this.pipRest.serverUrl
                });
            }
            else if (this.pipAuthState.params.redirect_to) {
                if (this.pipAuthState.params.toState) {
                    if (this.pipAuthState.params.toState != this.pipAuthState.signinState) {
                        this.pipAuthState.go(this.pipAuthState.params.toState, this.pipAuthState.params.toParams);
                    }
                    else {
                        this.pipAuthState.goToAuthorized({});
                    }
                }
                else {
                    if (decodeURIComponent(this.pipAuthState.params.redirect_to) != '/signin') {
                        this.$location.url(decodeURIComponent(this.pipAuthState.params.redirect_to));
                    }
                    else {
                        this.pipAuthState.goToAuthorized({});
                    }
                }
            }
            else {
                this.pipAuthState.goToAuthorized({});
            }
            this.pipNavService.sidenav.show();
        }
    };
    SinginModel.prototype.checkEmailVerification = function (data) {
        return data.user && data.user.settings &&
            data.user.settings['verified_email'] && data.user.settings['verified_email'] == "true";
    };
    SinginModel.prototype.onSignin = function (rememberDefault) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('ENTERING');
        if (!transactionId)
            return;
        this.$rootScope['isSignin'] = true;
        if (this.hideObject.remember && !!rememberDefault) {
            this.config.data.remember = true;
        }
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        var session = new EntryPageConfig_1.AuthSessionData();
        this.pipRest.setHeaders({
            'session-id': undefined,
            'user-id': undefined,
            'account-id': undefined
        });
        this.pipRest.getResource('signin').call({
            login: this.config.data.login,
            password: this.config.data.password
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            _this.pipEntry.openSession(data, _this.config.data.remember);
            if (_this.checkEmailVerification(data)) {
                _this.inSigninComplete(data);
                _this.transaction.end();
            }
            else {
                _this.pipRest.getResource('email_settings').get({
                    user_id: data.user.id
                }, function (setting) {
                    if (setting && setting.verified && setting.email == data.user.login) {
                        _this.inSigninComplete(data);
                    }
                    else {
                        _this.pipAuthState.go('verify_email', { email: data.user.login || data.user['email'], serverUrl: _this.pipRest.serverUrl });
                    }
                    _this.transaction.end();
                }, function (error) {
                    _this.$rootScope['isSignin'] = false;
                    _this.pipFormErrors.resetFormErrors(_this.config.form, true);
                    _this.pipFormErrors.setFormError(_this.config.form, error, {
                        'WRONG_LOGIN': 'login',
                        'NO_LOGIN': 'login',
                        'LOGIN_NOT_FOUND': 'login',
                        'WRONG_PASSWORD': 'password',
                        'ACCOUNT_LOCKED': 'form',
                        'act_execute': 'form',
                        '-1': 'form'
                    });
                    _this.transaction.end({
                        message: error
                    });
                });
            }
        }, function (error) {
            _this.$rootScope['isSignin'] = false;
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'WRONG_LOGIN': 'login',
                'NO_LOGIN': 'login',
                'LOGIN_NOT_FOUND': 'login',
                'WRONG_PASSWORD': 'password',
                'act_execute': 'form',
                '-1': 'form'
            });
            _this.transaction.end({
                message: error
            });
        });
    };
    return SinginModel;
}(EntryModel_1.EntryModel));
exports.SinginModel = SinginModel;
},{"../common/EntryModel":10,"../common/EntryPageConfig":11}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SigninPanelController = (function () {
    SigninPanelController.$inject = ['$scope', '$document', '$timeout', 'pipMedia', 'pipSigninViewModel', 'pipRest', 'pipFormErrors'];
    function SigninPanelController($scope, $document, $timeout, pipMedia, pipSigninViewModel, pipRest, pipFormErrors) {
        "ngInject";
        this.$scope = $scope;
        this.$document = $document;
        this.$timeout = $timeout;
        this.pipMedia = pipMedia;
        this.pipSigninViewModel = pipSigninViewModel;
        this.pipRest = pipRest;
        this.pipFormErrors = pipFormErrors;
        pipSigninViewModel.initModel($scope);
        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
    }
    SigninPanelController.prototype.$postLink = function () {
        var _this = this;
        this.config.form = this.$scope.form;
        this.$timeout(function () {
            if (_this.$document && _this.$document[0]) {
                var elem = angular.element(_this.$document[0].querySelector('input[type=password]:-webkit-autofill'));
                if (elem.length) {
                    elem.parent().addClass('md-input-has-value');
                }
            }
        }, 150);
    };
    Object.defineProperty(SigninPanelController.prototype, "config", {
        get: function () {
            return this.pipSigninViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninPanelController.prototype, "transaction", {
        get: function () {
            return this.pipSigninViewModel.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninPanelController.prototype, "showServerError", {
        get: function () {
            return this.pipSigninViewModel.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninPanelController.prototype, "hideObject", {
        get: function () {
            return this.pipSigninViewModel.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    SigninPanelController.prototype.gotoSignup = function () {
        this.pipSigninViewModel.gotoSignup(this.gotoSignupPage, this.gotoSignupDialog);
    };
    SigninPanelController.prototype.onSignin = function () {
        this.pipSigninViewModel.onSignin(this.rememberDefault);
    };
    SigninPanelController.prototype.gotoRecoverPassword = function () {
        this.pipSigninViewModel.gotoRecoverPassword(this.gotoRecoverPasswordDialog);
    };
    SigninPanelController.prototype.onServerUrlChanged = function () {
        this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
    };
    SigninPanelController.prototype.onChanged = function () {
        this.pipFormErrors.resetFormErrors(this.config.form, false);
        this.pipFormErrors.resetFieldsErrors(this.config.form, null);
        this.pipRest.serverUrl = this.config.selected.searchURLs;
        this.config.data.serverUrl = this.config.selected.searchURLs;
    };
    SigninPanelController.prototype.onEnter = function (event) {
        if (event.keyCode === 13) {
            this.onSignin();
        }
    };
    return SigninPanelController;
}());
var SigninBindings = {
    gotoSignupPage: '=pipGotoSignupPage',
    gotoSignupDialog: '=pipGotoSignupDialog',
    gotoRecoverPasswordDialog: '=pipGotoRecoverPasswordDialog',
    rememberDefault: '=pipRemember',
};
var SigninChanges = (function () {
    function SigninChanges() {
    }
    return SigninChanges;
}());
{
    var SigninPanel = {
        bindings: SigninBindings,
        templateUrl: 'signin/SigninPanel.html',
        controller: SigninPanelController
    };
    angular.module("pipSigninPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipSigninPanel', SigninPanel);
}
},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SigninModel_1 = require("./SigninModel");
var SigninViewModel = (function () {
    SigninViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipErrorPageConfigService', 'pipAuthState', 'pipEntry', 'pipFormErrors', 'pipNavService', 'pipRest'];
    function SigninViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipEntry, pipFormErrors, pipNavService, pipRest) {
        this.model = new SigninModel_1.SinginModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipErrorPageConfigService, pipAuthState, pipEntry, pipFormErrors, pipNavService, pipRest);
    }
    Object.defineProperty(SigninViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SigninViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    SigninViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    SigninViewModel.prototype.gotoSignup = function (gotoSignupPage, gotoSignupDialog) {
        this.model.gotoSignup(gotoSignupPage, gotoSignupDialog);
    };
    SigninViewModel.prototype.gotoRecoverPassword = function (gotoRecoverPasswordDialog) {
        this.model.gotoRecoverPassword(gotoRecoverPasswordDialog);
    };
    SigninViewModel.prototype.onSignin = function (rememberDefault) {
        this.model.onSignin(rememberDefault);
    };
    return SigninViewModel;
}());
exports.SigninViewModel = SigninViewModel;
angular.module('pipEntry.Signin')
    .service('pipSigninViewModel', SigninViewModel);
},{"./SigninModel":55}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignoutController = (function () {
    function SignoutController(pipAuthState, pipEntry) {
        "ngIngect";
        pipEntry.signout();
        pipAuthState.goToUnauthorized({});
    }
    return SignoutController;
}());
exports.SignoutController = SignoutController;
angular.module('pipEntry.Signout', []);
},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var SignupController_1 = (function () {
        SignupController_1.$inject = ['pipEntryCommon', 'pipEntry', '$state', 'pipAuthState'];
        function SignupController_1(pipEntryCommon, pipEntry, $state, pipAuthState) {
            "ngInject";
            pipEntryCommon.configureAppBar();
            if (pipEntry.entryHideObject && pipEntry.entryHideObject.signup === true) {
                $state.go(pipAuthState.signinState(), {});
            }
        }
        return SignupController_1;
    }());
    var SignupConfig = function ($stateProvider, pipAuthStateProvider) {
        $stateProvider
            .state('signup', {
            url: '/signup?name&login&server_url&redirect_to&language',
            auth: false,
            controller: SignupController_1,
            controllerAs: '$ctrl',
            templateUrl: 'signup/Signup.html'
        });
    };
    SignupConfig.$inject = ['$stateProvider', 'pipAuthStateProvider'];
    angular
        .module('pipEntry.Signup', [
        'pipEntry.Common',
        'pipSignupPanel',
        'pipPasswordMatch'
    ])
        .config(SignupConfig);
}
},{}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignupDialogService = (function () {
    SignupDialogService.$inject = ['$mdDialog'];
    function SignupDialogService($mdDialog) {
        this.$mdDialog = $mdDialog;
    }
    SignupDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this.$mdDialog.show({
            targetEvent: params.event,
            templateUrl: 'signup/SignupDialog.html',
            controller: SignupDialogController,
            controllerAs: '$ctrl',
            locals: {
                params: params
            },
            clickOutsideToClose: false
        })
            .then(function () {
            if (successCallback) {
                successCallback();
            }
        }, function () {
            if (cancelCallback) {
                cancelCallback();
            }
        });
    };
    return SignupDialogService;
}());
var SignupDialogController = (function () {
    SignupDialogController.$inject = ['pipSigninDialog', 'pipPostSignupDialog', 'pipEntry'];
    function SignupDialogController(pipSigninDialog, pipPostSignupDialog, pipEntry) {
        "ngInject";
        var _this = this;
        this.pipSigninDialog = pipSigninDialog;
        this.pipPostSignupDialog = pipPostSignupDialog;
        this.pipEntry = pipEntry;
        pipEntry.signout();
        this.pipGotoSigninDialog = function () {
            _this.gotoSigninDialog();
        };
        this.pipGotoPostSignupDialog = function (user) {
            _this.gotoPostSignupDialog(user);
        };
    }
    SignupDialogController.prototype.gotoSigninDialog = function () {
        this.pipSigninDialog.show({});
    };
    SignupDialogController.prototype.gotoPostSignupDialog = function (user) {
        this.pipPostSignupDialog.show({
            $party: user
        });
    };
    return SignupDialogController;
}());
{
    angular.module('pipEntry.SignupDialog', [
        'pipEntry.Common',
        "pipSignupPanel",
        'pipEntry.SigninDialog',
        'pipEntry.PostSignupDialog'
    ])
        .service('pipSignupDialog', SignupDialogService);
}
},{}],61:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var SingupModel = (function (_super) {
    __extends(SingupModel, _super);
    SingupModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntry', 'pipEntryData', 'pipTranslate'];
    function SingupModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntry, pipEntryData, pipTranslate) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipEntry = pipEntry;
        _this.pipEntryData = pipEntryData;
        _this.pipTranslate = pipTranslate;
        _this.regestryVerifyEmailKey = 'verified_email';
        _this.transaction = pipTransaction.create('entry.signup');
        return _this;
    }
    SingupModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
    };
    SingupModel.prototype.setElementVisability = function () {
        this.hideObject.agreement = new Boolean(this.hideObject.agreement) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.passwordConfirm = new Boolean(this.hideObject.passwordConfirm) == true;
        this.hideObject.signin = new Boolean(this.hideObject.signin) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    SingupModel.prototype.gotoSignin = function (gotoSigninPage, gotoSigninDialog) {
        if (!gotoSigninPage && !gotoSigninDialog) {
            this.$state.go(this.pipAuthState.signinState(), {});
            return;
        }
        if (gotoSigninPage) {
            this.$state.go(gotoSigninPage);
            return;
        }
        if (gotoSigninDialog) {
            gotoSigninDialog();
            return;
        }
    };
    SingupModel.prototype.onSignup = function (gotoPostSignup) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipRest.getResource('signup').call({
            serverUrl: this.config.data.serverUrl,
            name: this.config.data.name,
            login: this.config.useEmailAsLogin ? this.config.data.email : this.config.data.login,
            email: this.config.data.email,
            password: this.config.data.password,
            language: this.pipTranslate.language || 'en',
            theme: 'default',
            time_zone: null
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            _this.pipEntry.openSession(data);
            _this.transaction.end();
            _this.pipEntryData.saveSettingsKey(_this.pipEntry.getUserId(data), _this.regestryVerifyEmailKey, false);
            if (_this.config.isPostSignup) {
                if (!gotoPostSignup) {
                    _this.pipAuthState.go('post_signup', {
                        party_id: _this.pipEntry.getUserId(data)
                    });
                }
                else {
                    gotoPostSignup(data);
                }
            }
            else {
                _this.pipRest.getResource('email_settings').get({
                    user_id: data.user.id
                }, function (setting) {
                    if (setting && setting.verified && setting.email == data.user.login) {
                        _this.pipAuthState.goToAuthorized({});
                    }
                    else {
                        _this.pipAuthState.go('verify_email', {
                            email: data.user.login || data.user['email'], serverUrl: _this.pipRest.serverUrl
                        });
                    }
                    _this.transaction.end();
                }, function (error) {
                    _this.pipFormErrors.resetFormErrors(_this.config.form, true);
                    _this.pipFormErrors.setFormError(_this.config.form, error, {
                        'WRONG_LOGIN': 'signupLogin',
                        'NO_LOGIN': 'signupLogin',
                        'ALREADY_EXIST': 'signupLogin',
                        'WRONG_PASSWORD': 'password',
                        'NO_EMAIL': 'userEmail',
                        'NO_NAME': 'signupFullName',
                        'act_execute': 'form',
                        '-1': 'form'
                    });
                    _this.transaction.end(error);
                });
            }
        }, function (error) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'WRONG_LOGIN': 'signupLogin',
                'NO_LOGIN': 'signupLogin',
                'ALREADY_EXIST': 'signupLogin',
                'WRONG_PASSWORD': 'password',
                'NO_EMAIL': 'userEmail',
                'NO_NAME': 'signupFullName',
                'act_execute': 'form',
                '-1': 'form'
            });
            _this.transaction.end(error);
        });
    };
    ;
    return SingupModel;
}(EntryModel_1.EntryModel));
exports.SingupModel = SingupModel;
},{"../common/EntryModel":10}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var SignupPanelController = (function () {
        SignupPanelController.$inject = ['$scope', 'pipMedia', 'pipFormErrors', 'pipEntryData', 'pipRest', 'pipSignupViewModel'];
        function SignupPanelController($scope, pipMedia, pipFormErrors, pipEntryData, pipRest, pipSignupViewModel) {
            "ngInject";
            this.$scope = $scope;
            this.pipMedia = pipMedia;
            this.pipFormErrors = pipFormErrors;
            this.pipEntryData = pipEntryData;
            this.pipRest = pipRest;
            this.pipSignupViewModel = pipSignupViewModel;
            this.isQuery = false;
            this.pipSignupViewModel.initModel(this.$scope);
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        }
        SignupPanelController.prototype.$postLink = function () {
            this.config.form = this.$scope.form;
        };
        Object.defineProperty(SignupPanelController.prototype, "config", {
            get: function () {
                return this.pipSignupViewModel.config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SignupPanelController.prototype, "transaction", {
            get: function () {
                return this.pipSignupViewModel.transaction;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SignupPanelController.prototype, "showServerError", {
            get: function () {
                return this.pipSignupViewModel.showServerError;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SignupPanelController.prototype, "hideObject", {
            get: function () {
                return this.pipSignupViewModel.hideObject;
            },
            enumerable: true,
            configurable: true
        });
        SignupPanelController.prototype.gotoSignin = function () {
            this.pipSignupViewModel.gotoSignin(this.gotoSigninPage, this.gotoSigninDialog);
        };
        SignupPanelController.prototype.onSignup = function () {
            this.pipSignupViewModel.onSignup(this.gotoPostSignup);
        };
        SignupPanelController.prototype.onEnter = function (event) {
            if (event.keyCode === 13) {
                this.onSignup();
            }
        };
        SignupPanelController.prototype.onChangeEmail = function (field) {
            var _this = this;
            if (!this.config.data.email) {
                return;
            }
            if (this.isQuery)
                return;
            this.error = null;
            this.isQuery = true;
            this.pipEntryData.signupValidate(this.config.data.email, function (data) {
                if (_this.config.form && _this.config.form[field]) {
                    _this.config.form[field].$setValidity('emailUnique', true);
                }
                _this.isQuery = false;
            }, function (err) {
                if (err && err.status == 400 && err.data && err.data.code == 'LOGIN_ALREADY_USED') {
                    if (_this.config.form && _this.config.form[field]) {
                        _this.config.form[field].$setValidity('emailUnique', false);
                    }
                }
                else {
                    var code = err.code || (err.data || {}).code || null;
                    if (!code && err.status)
                        code = err.status;
                    if (code == '-1') {
                        _this.error = 'ERROR_' + code;
                    }
                    else {
                        if (err.data && err.data.message) {
                            _this.error = err.data.message;
                        }
                        else if (err.message) {
                            _this.error = err.message;
                        }
                        else if (err.name) {
                            _this.error = err.name;
                        }
                        else
                            _this.error = err;
                    }
                }
                _this.isQuery = false;
            });
        };
        SignupPanelController.prototype.onServerUrlChanged = function () {
            this.error = null;
            this.config.onServerUrlChanged(this.config.form, this.config.selected.searchURLs);
        };
        SignupPanelController.prototype.onChanged = function () {
            this.pipFormErrors.resetFormErrors(this.config.form, false);
            this.pipFormErrors.resetFieldsErrors(this.config.form, null);
            this.pipRest.serverUrl = this.config.selected.searchURLs;
            this.config.data.serverUrl = this.config.selected.searchURLs;
        };
        SignupPanelController.prototype.isError = function (error) {
            return error.required || error.email || error.emailUnique || error.ERROR_WRONG_LOGIN || error.ERROR_NO_LOGIN;
        };
        return SignupPanelController;
    }());
    var SignupPanelBindings = {
        gotoPostSignup: '=pipPostSignup',
        gotoSigninPage: '=pipGotoSigninPage',
        gotoSigninDialog: '=pipGotoSigninDialog',
    };
    var SignupPanelBindingsChanges = (function () {
        function SignupPanelBindingsChanges() {
        }
        return SignupPanelBindingsChanges;
    }());
    var SignupPanel = {
        bindings: SignupPanelBindings,
        controller: SignupPanelController,
        templateUrl: 'signup/SignupPanel.html'
    };
    angular.module("pipSignupPanel", ['pipFocused', 'pipEntry.Strings'])
        .component('pipSignupPanel', SignupPanel);
}
},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignupModel_1 = require("./SignupModel");
var SignupViewModel = (function () {
    SignupViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntry', 'pipEntryData', 'pipTranslate'];
    function SignupViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntry, pipEntryData, pipTranslate) {
        "ngInject";
        this.model = new SignupModel_1.SingupModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntry, pipEntryData, pipTranslate);
    }
    Object.defineProperty(SignupViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignupViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignupViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignupViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    SignupViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    SignupViewModel.prototype.gotoSignin = function (gotoSigninPage, gotoSigninDialog) {
        this.model.gotoSignin(gotoSigninPage, gotoSigninDialog);
    };
    SignupViewModel.prototype.onSignup = function (gotoPostSignup) {
        this.model.onSignup(gotoPostSignup);
    };
    return SignupViewModel;
}());
exports.SignupViewModel = SignupViewModel;
angular.module('pipEntry.Signup')
    .service('pipSignupViewModel', SignupViewModel);
},{"./SignupModel":61}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VerifyEmailController = (function () {
    VerifyEmailController.$inject = ['$scope', '$window', 'pipFormErrors', 'pipVerifyEmailViewModel', 'pipIdentity', '$timeout'];
    function VerifyEmailController($scope, $window, pipFormErrors, pipVerifyEmailViewModel, pipIdentity, $timeout) {
        "ngInject";
        var _this = this;
        this.$scope = $scope;
        this.$window = $window;
        this.pipFormErrors = pipFormErrors;
        this.pipVerifyEmailViewModel = pipVerifyEmailViewModel;
        this.pipIdentity = pipIdentity;
        this.$timeout = $timeout;
        pipVerifyEmailViewModel.initModel(this.$scope);
        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        $timeout(function () {
            _this.config.form = _this.$scope.form;
            if (_this.config.data.code && _this.config.data.email) {
                _this.showValidateProgress = true;
                _this.pipVerifyEmailViewModel.onVerify(function (data) {
                    _this.pipVerifyEmailViewModel.onContinue();
                }, function (error) {
                    _this.showValidateProgress = false;
                });
            }
            else {
                _this.showValidateProgress = false;
            }
        }, 0);
    }
    VerifyEmailController.prototype.goBack = function () {
        this.pipVerifyEmailViewModel.onCancel();
    };
    Object.defineProperty(VerifyEmailController.prototype, "config", {
        get: function () {
            return this.pipVerifyEmailViewModel.config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VerifyEmailController.prototype, "transaction", {
        get: function () {
            return this.pipVerifyEmailViewModel.transaction;
        },
        enumerable: true,
        configurable: true
    });
    VerifyEmailController.prototype.onVerify = function () {
        this.pipVerifyEmailViewModel.onVerify();
    };
    VerifyEmailController.prototype.onRecover = function () {
        this.pipVerifyEmailViewModel.onRecover();
    };
    return VerifyEmailController;
}());
exports.VerifyEmailController = VerifyEmailController;
var VerifyEmailSuccessController = (function () {
    function VerifyEmailSuccessController($scope, pipVerifyEmailViewModel) {
        this.pipVerifyEmailViewModel = pipVerifyEmailViewModel;
        pipVerifyEmailViewModel.initModel($scope);
    }
    VerifyEmailSuccessController.prototype.onContinue = function () {
        this.pipVerifyEmailViewModel.onContinue();
    };
    return VerifyEmailSuccessController;
}());
exports.VerifyEmailSuccessController = VerifyEmailSuccessController;
angular.module('pipEntry.VerifyEmail', []);
},{}],65:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EntryModel_1 = require("../common/EntryModel");
var VerifyEmailModel = (function (_super) {
    __extends(VerifyEmailModel, _super);
    VerifyEmailModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntryData', 'pipIdentity', 'pipEntry'];
    function VerifyEmailModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntryData, pipIdentity, pipEntry) {
        "ngInject";
        var _this = _super.call(this, pipEntryCommon) || this;
        _this.$rootScope = $rootScope;
        _this.$location = $location;
        _this.$state = $state;
        _this.$injector = $injector;
        _this.pipAuthState = pipAuthState;
        _this.pipFormErrors = pipFormErrors;
        _this.pipRest = pipRest;
        _this.pipEntryData = pipEntryData;
        _this.pipIdentity = pipIdentity;
        _this.pipEntry = pipEntry;
        _this.regestryVerifyEmailKey = 'verified_email';
        _this.transaction = pipTransaction.create('entry.verify_email');
        return _this;
    }
    VerifyEmailModel.prototype.init = function ($scope) {
        this.initModel($scope);
        this.setElementVisability();
        this.pipEntryCommon.configureAppBar();
    };
    VerifyEmailModel.prototype.setElementVisability = function () {
        this.hideObject.remember = new Boolean(this.hideObject.remember) == true;
        this.hideObject.title = new Boolean(this.hideObject.title) == true;
        this.hideObject.server = new Boolean(this.hideObject.server) == true;
        this.hideObject.forgotPassword = new Boolean(this.hideObject.forgotPassword) == true;
        this.hideObject.signup = new Boolean(this.hideObject.signup) == true;
        this.hideObject.hint = new Boolean(this.hideObject.hint) == true;
        this.hideObject.progress = new Boolean(this.hideObject.progress) == true;
    };
    VerifyEmailModel.prototype.onVerify = function (successCallback, errorCallback) {
        var _this = this;
        if (this.config.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.config.form, true);
            return;
        }
        var transactionId = this.transaction.begin('PROCESSING');
        if (!transactionId)
            return;
        if (!this.pipRest.lockServerUrl) {
            this.pipRest.serverUrl = this.config.data.serverUrl;
        }
        this.pipEntryData.verifyEmail({
            login: this.config.data.login,
            email: this.config.data.email || this.config.data.login,
            code: this.config.data.code
        }, function (data) {
            _this.pipFormErrors.resetFormErrors(_this.config.form, false);
            if (_this.transaction.aborted(transactionId))
                return;
            var userId = _this.pipEntryData.getUserId();
            if (successCallback)
                successCallback(data);
            _this.transaction.end();
            _this.pipEntryData.saveSettingsKey(userId, _this.regestryVerifyEmailKey, true, function (data) {
                var identity = _this.pipIdentity.identity;
                if (identity && identity.user) {
                    if (!identity.user.settings)
                        identity.user.settings = {};
                    identity.user.settings[_this.regestryVerifyEmailKey] = "true";
                    _this.pipIdentity.identity = identity;
                }
                _this.onContinue();
            }, function (error) {
                _this.transaction.end(error);
            });
        }, function (error) {
            _this.transaction.end(error);
            _this.pipFormErrors.resetFormErrors(_this.config.form, true);
            _this.pipFormErrors.setFormError(_this.config.form, error, {
                'WRONG_LOGIN_EMAIL': 'login',
                'NO_LOGIN_EMAIL': 'login',
                'NO_EMAIL': 'login',
                'INVALID_CODE': 'code',
                'act_execute': 'form',
                '-1': 'form'
            });
            if (errorCallback)
                errorCallback(error);
        });
    };
    VerifyEmailModel.prototype.onRecover = function () {
        var _this = this;
        if (!this.config.data.login) {
            return;
        }
        var tid = this.transaction.begin('PROCESSING');
        if (!tid)
            return;
        this.pipEntryData.requestEmailVerification({
            login: this.config.data.login
        }, function (data) {
            if (_this.transaction.aborted(tid))
                return;
            _this.config.data.code = null;
            _this.transaction.end();
        }, function (error) {
            _this.transaction.end(error);
        });
    };
    VerifyEmailModel.prototype.onContinue = function () {
        if (this.pipAuthState.params.redirect_to) {
            this.$location.url(this.pipAuthState.params.redirect_to);
        }
        else {
            this.pipAuthState.goToAuthorized(this.config && this.config.data ? this.config.data : {});
        }
    };
    VerifyEmailModel.prototype.onCancel = function () {
        this.pipEntry.signout();
        this.pipAuthState.goToUnauthorized({});
    };
    return VerifyEmailModel;
}(EntryModel_1.EntryModel));
exports.VerifyEmailModel = VerifyEmailModel;
},{"../common/EntryModel":10}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VerifyEmailModel_1 = require("./VerifyEmailModel");
var VerifyEmailViewModel = (function () {
    VerifyEmailViewModel.$inject = ['pipEntryCommon', 'pipTransaction', '$rootScope', '$location', '$state', '$injector', 'pipAuthState', 'pipFormErrors', 'pipRest', 'pipEntryData', 'pipIdentity', 'pipEntry'];
    function VerifyEmailViewModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntryData, pipIdentity, pipEntry) {
        "ngInject";
        this.model = new VerifyEmailModel_1.VerifyEmailModel(pipEntryCommon, pipTransaction, $rootScope, $location, $state, $injector, pipAuthState, pipFormErrors, pipRest, pipEntryData, pipIdentity, pipEntry);
    }
    Object.defineProperty(VerifyEmailViewModel.prototype, "transaction", {
        get: function () {
            return this.model.transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VerifyEmailViewModel.prototype, "hideObject", {
        get: function () {
            return this.model.hideObject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VerifyEmailViewModel.prototype, "showServerError", {
        get: function () {
            return this.model.showServerError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VerifyEmailViewModel.prototype, "config", {
        get: function () {
            return this.model.config;
        },
        enumerable: true,
        configurable: true
    });
    VerifyEmailViewModel.prototype.initModel = function ($scope) {
        this.model.init($scope);
    };
    VerifyEmailViewModel.prototype.onVerify = function (successCallback, errorCallback) {
        this.model.onVerify(successCallback, errorCallback);
    };
    VerifyEmailViewModel.prototype.onRecover = function () {
        this.model.onRecover();
    };
    VerifyEmailViewModel.prototype.onContinue = function () {
        this.model.onContinue();
    };
    VerifyEmailViewModel.prototype.onCancel = function () {
        this.model.onCancel();
    };
    return VerifyEmailViewModel;
}());
exports.VerifyEmailViewModel = VerifyEmailViewModel;
angular.module('pipEntry.VerifyEmail')
    .service('pipVerifyEmailViewModel', VerifyEmailViewModel);
},{"./VerifyEmailModel":65}],67:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('change_password/ChangePassword.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-change-password-panel class="scroll-y"></pip-change-password-panel><div class="pip-footer"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onChange()" aria-label="ENTRY_CHANGE_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.code.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_CHANGE_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('change_password/ChangePasswordDialog.html',
    '<md-dialog class="pip-entry lp0 rp0"><md-dialog-content><pip-change-password-panel></pip-change-password-panel></md-dialog-content><md-dialog-actions class="layout-row layout-align-end-center"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onChange()" aria-label="ENTRY_CHANGE_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.code.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_CHANGE_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('change_password/ChangePasswordPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && $ctrl.showServerError && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 ng-if="!$ctrl.hideObject.changePwdTitle">{{::\'CHANGE_PWD_PASSWORD\' | translate}}</h2><p class="title-padding bm16" ng-if="!$ctrl.hideObject.changePwdSubTitle">{{::\'CHANGE_PWD_TEXT\' | translate}}</p><form name="form" novalidate="" autocomplete="off"><input name="password" style="display:none"> <input name="passwordNew" style="display:none"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{ ::\'ERROR_ACT_EXECUTE\' | translate }}</div><div ng-message="ERROR_-1">{{ ::\'ERROR_SERVER\' | translate }}</div><div ng-message="ERROR_UNKNOWN">{{ \'ERROR_UNKNOWN\' | translate }}</div></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" ng-enabled="!$ctrl.transaction.busy()" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" pip-clear-errors=""><span md-highlight-text="$ctrl.config.selected.searchURLs">{{ item }}</span></md-autocomplete></div><md-input-container class="pip-no-hint" style="padding-bottom: 4px!important;"><label>{{::\'OLD_PASSWORD\' | translate}}</label> <input name="password" ng-disabled="$ctrl.transaction.busy()" xxxpip-clear-errors="" type="password" tabindex="4" ng-model="$ctrl.config.data.password" required="" minlength="6" ng-change="$ctrl.onChangePassword()" pip-compare-old-password="" compare-to="$ctrl.config.data.passwordNew"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password, true)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div><div ng-message="ERROR_compareTo">{{::\'PASSWORD_IDENTICAL\' | translate}}</div></div></md-input-container><md-input-container class="display bp4"><label>{{::\'NEW_PASSWORD_SET\' | translate}}</label> <input name="passwordNew" ng-disabled="$ctrl.transaction.busy()" xxxpip-clear-errors="" type="password" tabindex="4" ng-model="$ctrl.config.data.passwordNew" ng-change="$ctrl.onChangePasswordNew()" required="" minlength="6" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password" autocomplete="off" pip-compare-new-password="" compare-to1="$ctrl.config.data.password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew, true)" md-auto-hide="false"><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="ERROR_compareTo">{{::\'PASSWORD_IDENTICAL\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD" xxxng-if="!$ctrl.config.form.passwordNew.$pristine">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div></div></md-input-container><md-input-container class="display bp4" ng-if="!$ctrl.hideObject.passwordConfirm"><label>{{::\'NEW_PASSWORD_CONFIRM\' | translate}}</label> <input name="passwordConfirm" type="password" tabindex="4" required="" minlength="6" ng-model="$ctrl.confirmPassword" ng-disabled="$ctrl.transaction.busy()" xxpip-clear-errors="" ng-change="$ctrl.onChangePasswordConfirm()" pip-compare-password-match="" compare-to2="$ctrl.config.data.passwordNew" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true)" md-auto-hide="false"><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="ERROR_compareTo">{{::\'PASSWORD_MATCH\' | translate}}</div></div></md-input-container></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('expire_change_password/ExpireChangePassword.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-expire-change-password-panel class="scroll-y"></pip-expire-change-password-panel><div class="pip-footer"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onChange()" aria-label="ENTRY_EXPIRE_CHANGE_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.code.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_EXPIRE_CHANGE_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('expire_change_password/ExpireChangePasswordDialog.html',
    '<md-dialog class="pip-entry lp0 rp0"><md-dialog-content><pip-expire-change-password-panel></pip-expire-change-password-panel></md-dialog-content><md-dialog-actions class="layout-row layout-align-end-center"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onChange()" aria-label="ENTRY_EXPIRE_CHANGE_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.code.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_EXPIRE_CHANGE_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('expire_change_password/ExpireChangePasswordPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && $ctrl.showServerError && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 ng-if="!$ctrl.hideObject.changePwdTitle">{{::\'EXPIRE_CHANGE_PWD_PASSWORD\' | translate}}</h2><p class="title-padding bm16" ng-if="!$ctrl.hideObject.changePwdSubTitle">{{::\'EXPIRE_CHANGE_PWD_TEXT\' | translate}}</p><form name="form" novalidate="" autocomplete="off"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div class="bp16"><a ng-hide="$ctrl.config.showServerUrl || $ctrl.config.fixedServerUrl || $ctrl.hideObject.server" ng-click="$ctrl.config.showServerUrl = true" href="">{{::\'ENTRY_CHANGE_SERVER\' | translate}}</a></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" ng-enabled="!$ctrl.transaction.busy()" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" pip-clear-errors=""><span md-highlight-text="$ctrl.config.selected.searchURLs">{{ item }}</span></md-autocomplete></div><md-input-container class="pip-no-hint" style="padding-bottom: 4px!important;"><label>{{::\'OLD_PASSWORD\' | translate}}</label> <input name="password" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" type="password" tabindex="4" ng-model="$ctrl.config.data.password" required="" minlength="6"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div></div></md-input-container><md-input-container class="display bp4"><label>{{::\'NEW_PASSWORD_SET\' | translate}}</label> <input name="passwordNew" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" type="password" tabindex="4" ng-model="$ctrl.config.data.passwordNew" required="" minlength="6" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew)" md-auto-hide="false"><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD" xxxng-if="!$ctrl.config.form.passwordNew.$pristine">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div></div></md-input-container><md-input-container class="display bp4" ng-if="!$ctrl.hideObject.passwordConfirm"><label>{{::\'NEW_PASSWORD_CONFIRM\' | translate}}</label> <input name="passwordConfirm" type="password" tabindex="4" required="" minlength="6" ng-model="$ctrl.confirmPassword" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" pip-compare-password-match="" compare-to2="$ctrl.config.data.passwordNew" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true)" md-auto-hide="false"><div ng-message="ERROR_compareTo">{{::\'PASSWORD_MATCH\' | translate}}</div><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div></div></md-input-container></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('post_signup/PostSignup.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-post-signup-panel pip-party="$ctrl.$party"></pip-post-signup-panel><div class="pip-footer"><md-button ng-hide="$ctrl.transaction.busy()" class="md-accent" type="submit" ng-click="$ctrl.onPostSignupSubmit()" aria-label="CONTINUE">{{ ::\'CONTINUE\' | translate }}</md-button><md-button ng-show="$ctrl.transaction.busy()" class="md-warn" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('post_signup/PostSignupDialog.html',
    '<md-dialog class="pip-entry lp0 rp0"><md-dialog-content><pip-post-signup-panel pip-party="$ctrl.$party"></pip-post-signup-panel></md-dialog-content><md-dialog-actions class="layout-row layout-align-end-center"><md-button ng-hide="$ctrl.transaction.busy()" class="md-accent" ng-click="$ctrl.onPostSignupSubmit()" aria-label="CONTINUE">{{ ::\'CONTINUE\' | translate }}</md-button><md-button ng-show="$ctrl.transaction.busy()" class="md-warn" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('post_signup/PostSignupPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 class="text-overflow" ng-if="!$ctrl.hideObject.title">{{ \'POST_SIGNUP_TITLE\' | translate }}</h2><p class="bm0 line-height-string" ng-if="!$ctrl.hideObject.successTitle">{{ \'POST_SIGNUP_TEXT_1\' | translate }}</p><p class="line-height-string m0" ng-if="!$ctrl.hideObject.subTitle">{{ \'POST_SIGNUP_TEXT_2\' | translate }}</p><form name="form" novalidate=""><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8" md-auto-hide="false"><div ng-message="ERROR_1000">{{::\'ERROR_1000\' | translate}}</div><div ng-message="ERROR_1110">{{::\'ERROR_1110\' | translate}}</div><div ng-message="ERROR_1111">{{::\'ERROR_1111\' | translate}}</div><div ng-message="ERROR_1112">{{::\'ERROR_1112\' | translate}}</div><div ng-message="ERROR_1002">{{::\'ERROR_1002\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div class="pip-ref-item"><pip-avatar-edit ng-disabled="$ctrl.transaction.busy()" ng-if="$ctrl.config.enableAvatar" pip-reset="false" pip-party-id="$ctrl.config.data.id" pip-created="$ctrl.onPictureCreated($event)" pip-changed="$ctrl.onPictureChanged($control, $event)" class="rm16 flex-fixed"></pip-avatar-edit><div class="pip-content"><p class="pip-title">{{ $ctrl.config.data.name }}</p><p class="pip-subtitle">{{ $ctrl.config.data.email }}</p></div></div><md-input-container class="pip-no-hint bp4"><label>{{ \'HINT_ABOUT\' | translate }}</label> <textarea ng-model="$ctrl.config.data.about" ng-initial="" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="">\n' +
    '                        </textarea></md-input-container><div class="tm2"><p class="text-caption bm0">{{ \'GENDER\' | translate }}</p><md-select class="w-stretch tm0 tp0 bp8" ng-disabled="$ctrl.transaction.busy()" ng-model="$ctrl.config.data.gender" label="{{\'GENDER\' | translate}}" ng-change="$ctrl.onStatusChange($ctrl.config.data)" pip-clear-errors=""><md-option ng-value="opt.id" ng-repeat="opt in $ctrl.genders track by opt.id">{{ opt.name }}</md-option></md-select></div><div class="tm2"><p class="text-caption bm0">{{ ::\'BIRTHDAY\' | translate }}</p><pip-date ng-disabled="$ctrl.transaction.busy()" ng-model="$ctrl.config.data.birthday" pip-time-mode="past" pip-clear-errors="" time-mode="past"></pip-date></div><md-input-container><label>{{ ::\'LANGUAGE\' | translate }}</label><md-select class="w-stretch tm0 tp0 bp16" ng-disabled="$ctrl.transaction.busy()" ng-model="$ctrl.config.data.language" ng-change="$ctrl.onStatusChange($ctrl.config.data)" pip-clear-errors=""><md-option ng-value="opt.id" ng-repeat="opt in $ctrl.languages track by opt.id">{{ opt.name }}</md-option></md-select></md-input-container></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('reset_password/ResetPassword.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-reset-password-panel class="scroll-y"></pip-reset-password-panel><div class="pip-footer"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onReset()" aria-label="ENTRY_RESET_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.resetCode.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_RESET_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('reset_password/ResetPasswordDialog.html',
    '<md-dialog class="pip-entry lp0 rp0"><md-dialog-content><pip-reset-password-panel></pip-reset-password-panel></md-dialog-content><md-dialog-actions class="layout-row layout-align-end-center"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onCancel()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onReset()" aria-label="ENTRY_RESET_PASSWORD" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0 || $ctrl.config.data.resetCode.length == 0 || $ctrl.config.data.password.length < 6" class="md-accent" type="submit">{{ ::\'ENTRY_RESET_PASSWORD\' | translate }}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('reset_password/ResetPasswordPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && $ctrl.showServerError && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 ng-if="!$ctrl.hideObject.title">{{::\'RESET_PWD_PASSWORD\' | translate}}</h2><p class="title-padding bm16" ng-if="!$ctrl.hideObject.resetSubTitle && !$ctrl.config.useEmailAsLogin">{{::\'RESET_PWD_TEXT_LOGIN\' | translate}}</p><p class="title-padding bm16" ng-if="!$ctrl.hideObject.resetSubTitle && $ctrl.config.useEmailAsLogin">{{::\'RESET_PWD_TEXT_EMAIL\' | translate}}</p><form name="form" novalidate="" autocomplete="off"><input name="code" style="display:none"> <input name="resetCode" style="display:none"> <input name="password" style="display:none"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div class="bp16"><a ng-hide="$ctrl.config.showServerUrl || $ctrl.config.fixedServerUrl || $ctrl.hideObject.server" ng-click="$ctrl.config.showServerUrl = true" href="">{{::\'ENTRY_CHANGE_SERVER\' | translate}}</a></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" aria-label="URL" ng-enabled="!$ctrl.transaction.busy()" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" pip-clear-errors=""><span md-highlight-text="$ctrl.config.selected.searchURLs">{{ item }}</span></md-autocomplete></div><md-input-container class="pip-no-hint" style="padding-bottom: 4px!important;"><label ng-if="!$ctrl.config.useEmailAsLogin">{{::\'LOGIN\' | translate}}</label> <label ng-if="$ctrl.config.useEmailAsLogin">{{::\'EMAIL\' | translate}}</label> <input name="login" type="login" ng-model="$ctrl.config.data.login" required="" step="any" aria-label="LOGIN" pip-clear-errors="" ng-disabled="$ctrl.transaction.busy()" tabindex="2"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && !$ctrl.config.useEmailAsLogin">{{::\'HINT_LOGIN\' | translate}}</div><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && $ctrl.config.useEmailAsLogin">{{::\'HINT_EMAIL\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'ERROR_LOGIN_INVALID\' | translate }}</div><div ng-message="ERROR_NO_LOGIN">{{::\'ERROR_NO_LOGIN\' | translate}}</div><div ng-message="ERROR_WRONG_LOGIN">{{::\'ERROR_WRONG_LOGIN\' | translate}}</div><div ng-message="ERROR_LOGIN_NOT_FOUND">{{::\'ERROR_LOGIN_NOT_FOUND\' | translate}}</div></div></md-input-container><md-input-container class="pip-no-hint"><label>{{::\'ENTRY_RESET_CODE\' | translate}}</label> <input name="resetCode" ng-disabled="$ctrl.transaction.busy()" autocomplete="off" aria-label="CODE" ng-model="$ctrl.config.data.resetCode" required="" tabindex="3" pip-clear-errors=""><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.resetCode).hint && !$ctrl.hideObject.hint">{{::\'ENTRY_RESET_CODE\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.resetCode)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'ERROR_CODE_WRONG\' | translate }}</div><div ng-message="ERROR_WRONG_CODE">{{::\'ERROR_WRONG_CODE\' | translate}}</div></div></md-input-container><md-input-container class="pip-no-hint" style="padding-bottom: 4px!important;"><label>{{::\'NEW_PASSWORD_SET\' | translate}}</label> <input name="passwordNew" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" autocomplete="off" type="password" tabindex="4" ng-model="$ctrl.config.data.password" required="" minlength="6" aria-label="password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordNew)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'MINLENGTH_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div></div></md-input-container></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('recover_password/RecoverPassword.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-recover-password-panel class="scroll-y"></pip-recover-password-panel><div class="pip-footer"><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()" class="rm8" aria-label="CANCEL">{{ ::\'CANCEL\' | translate }}</md-button><md-button ng-hide="$ctrl.transaction.busy()" class="md-accent" ng-click="$ctrl.onRecover()" aria-label="RECOVER_PWD_RECOVER" type="submit" ng-disabled="($ctrl.config.form.$pristine && !$ctrl.config.data.login) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.login.length == 0">{{ ::\'RECOVER_PWD_RECOVER\' | translate }}</md-button><md-button ng-show="$ctrl.transaction.busy()" class="md-warn" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{ ::\'CANCEL\' | translate }}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('recover_password/RecoverPasswordDialog.html',
    '<md-dialog class="pip-entry lp0 rp0"><md-dialog-content><pip-recover-password-panel></pip-recover-password-panel></md-dialog-content><md-dialog-actions class="layout-row layout-align-end-center"><md-button ng-hide="$ctlr.transaction.busy()" ng-click="$ctlr.goBack()" class="rm8" aria-label="CANCEL">{{::\'CANCEL\' | translate}}</md-button><md-button ng-hide="$ctlr.transaction.busy()" class="md-accent" ng-click="$ctlr.onRecover()" aria-label="RECOVER_PWD_RECOVER" ng-disabled="($$ctlr.config.form.$pristine && !$ctlr.config.data.login) || $ctlr.config.data.login== undefined || || $ctlr.config.data.serverUrl.length == 0 || $ctlr.config.data.login.length == 0">{{::\'RECOVER_PWD_RECOVER\' | translate}}</md-button><md-button ng-show="$ctlr.transaction.busy()" class="md-warn" ng-click="$ctlr.transaction.abort()" aria-label="ABORT">{{::\'CANCEL\' | translate}}</md-button></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('recover_password/RecoverPasswordPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 ng-if="!$ctrl.hideObject.title">{{ \'RECOVER_PWD_TITLE\' | translate }}</h2><p class="text-primary tm0 bm16" ng-if="!$ctrl.hideObject.subTitle1 && !$ctrl.config.useEmailAsLogin">{{ \'RECOVER_PWD_TEXT_1_LOGIN\' | translate }}</p><p class="text-primary tm0 bm16" ng-if="!$ctrl.hideObject.subTitle1 && $ctrl.config.useEmailAsLogin">{{ \'RECOVER_PWD_TEXT_1_EMAIL\' | translate }}</p><p class="text-primary tm0 bm16" ng-if="!$ctrl.hideObject.subTitle2">{{ \'RECOVER_PWD_TEXT_2\' | translate }}</p><form name="form" novalidate="" autocomplete="off"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div class="bp16"><a ng-hide="$ctrl.config.showServerUrl || $ctrl.config.fixedServerUrl || $ctrl.hideObject.server" ng-click="$ctrl.config.showServerUrl = true" href="">{{ ::\'ENTRY_CHANGE_SERVER\' | translate }}</a></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" aria-label="URL" ng-enabled="!$ctrl.transaction.busy()" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" pip-clear-errors=""><span md-highlight-text="$ctrl.config.selected.searchURLs">{{ item }}</span></md-autocomplete></div><md-input-container class="pip-no-hint" style="padding-bottom: 4px!important;"><label ng-if="!$ctrl.config.useEmailAsLogin">{{::\'LOGIN\' | translate}}</label> <label ng-if="$ctrl.config.useEmailAsLogin">{{::\'EMAIL\' | translate}}</label> <input name="login" type="text" aria-label="LOGIN" ng-model="$ctrl.config.data.login" required="" step="any" pip-clear-errors="" ng-disabled="$ctrl.transaction.busy()" tabindex="2"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && !$ctrl.config.useEmailAsLogin">{{::\'HINT_LOGIN\' | translate}}</div><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && $ctrl.config.useEmailAsLogin">{{::\'HINT_EMAIL\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login)" class="md-input-error" md-auto-hide="false"><div ng-message="required">{{::\'ERROR_LOGIN_INVALID\' | translate }}</div><div ng-message="ERROR_WRONG_LOGIN">{{::\'ERROR_WRONG_LOGIN\' | translate}}</div><div ng-message="ERROR_NO_LOGIN">{{::\'ERROR_NO_LOGIN\' | translate}}</div><div ng-message="ERROR_LOGIN_NOT_FOUND">{{::\'ERROR_LOGIN_NOT_FOUND\' | translate}}</div></div></md-input-container></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signin/Signin.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-signin-panel pipfixedserverurl="$ctrl.fixedServerUrl" class="scroll-y"></pip-signin-panel></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signin/SigninDialog.html',
    '<md-dialog class="pip-entry"><md-dialog-content><pip-signin-panel pip-goto-signup-dialog="$ctrl.pipGotoSignupDialog" pip-goto-recover-password-dialog="$ctrl.pipGotoRecoverPasswordDialog"></pip-signin-panel></md-dialog-content></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signin/SigninPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 pip-translate="SIGNIN_TITLE" ng-if="!$ctrl.hideObject.title"></h2><form name="form" novalidate=""><input type="password" style="display:none"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_ACCOUNT_LOCKED">{{::\'ERROR_ACCOUNT_LOCKED\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div class="bp16"><a ng-hide="$ctrl.config.showServerUrl || $ctrl.config.fixedServerUrl || $ctrl.hideObject.server" ng-click="$ctrl.config.showServerUrl = true" href="" id="link-server-url" pip-test="link-server-url">{{::\'ENTRY_CHANGE_SERVER\' | translate}}</a></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" pip-test="autocomplete-server"><span md-highlight-text="$ctrl.config.selected.searchURLs">{{item}}</span></md-autocomplete></div><md-input-container class="display bp4"><label ng-if="!$ctrl.config.useEmailAsLogin">{{::\'LOGIN\' | translate}}</label> <label ng-if="$ctrl.config.useEmailAsLogin">{{::\'EMAIL\' | translate}}</label> <input name="login" ng-model="$ctrl.config.data.login" required="" step="any" ng-keypress="$ctrl.onEnter($event)" aria-label="LOGIN" pip-clear-errors="" ng-disabled="$ctrl.transaction.busy()" tabindex="2" pip-test="input-login"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && !$ctrl.config.useEmailAsLogin">{{::\'HINT_LOGIN\' | translate}}</div><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login).hint && !$ctrl.hideObject.hint && $ctrl.config.useEmailAsLogin">{{::\'HINT_EMAIL\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.login)" md-auto-hide="false"><div ng-message="required">{{::\'ERROR_LOGIN_INVALID\' | translate }}</div><div ng-message="ERROR_WRONG_LOGIN">{{::\'ERROR_WRONG_LOGIN\' | translate}}</div><div ng-message="ERROR_NO_LOGIN">{{::\'ERROR_NO_LOGIN\' | translate}}</div><div ng-message="ERROR_LOGIN_NOT_FOUND">{{::\'ERROR_LOGIN_NOT_FOUND\' | translate}}</div></div></md-input-container><md-input-container class="display bp4"><label>{{::\'PASSWORD\' | translate}}</label> <input name="password" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" type="password" tabindex="3" ng-model="$ctrl.config.data.password" ng-keypress="$ctrl.onEnter($event)" required="" minlength="6" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password).hint && !$ctrl.hideObject.hint">{{::\'SIGNIN_HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password)" md-auto-hide="false"><div ng-message="required">{{::\'SIGNIN_HINT_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div></div></md-input-container><a href="" class="display bm16" ng-if="!$ctrl.hideObject.forgotPassword" ng-click="$ctrl.gotoRecoverPassword()" tabindex="4">{{::\'SIGNIN_FORGOT_PASSWORD\' | translate}}</a><md-checkbox ng-disabled="$ctrl.transaction.busy()" ng-if="!$ctrl.hideObject.forgotPassword" md-no-ink="" class="lm0" aria-label="{{\'SIGNIN_REMEMBER\' | translate}}" tabindex="5" ng-model="$ctrl.config.data.remember" pip-test-checkbox="remember"><label class="label-check">{{::\'SIGNIN_REMEMBER\' | translate}}</label></md-checkbox><div style="height: 36px; overflow: hidden;"><md-button ng-if="!$ctrl.transaction.busy()" ng-click="$ctrl.onSignin()" aria-label="SIGNIN" class="md-raised md-accent w-stretch m0" tabindex="6" type="submit" xxng-disabled="($ctrl.config.data.login == undefined) || $ctrl.config.data.login.length == 0 || $ctrl.config.data.serverUrl == \'\' || $ctrl.config.data.serverUrl == undefined || $ctrl.config.data.serverUrl.length == 0 || ($ctrl.config.data.password == undefined)" pip-test="button-signin">{{::\'SIGNIN_TITLE\' | translate}}</md-button><md-button ng-if="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" class="md-raised md-warn m0 w-stretch" tabindex="5" aria-label="ABORT" pip-test="button-cancel">{{::\'CANCEL\' | translate}}</md-button></div><div class="tm24 layout-row" ng-if="!$ctrl.config.adminOnly && $ctrl.pipMedia(\'gt-xs\') && !$ctrl.hideObject.signup"><p class="m0 text-small">{{::\'SIGNIN_NOT_MEMBER\' | translate}} <a href="" ng-click="$ctrl.gotoSignup()" tabindex="6">{{::\'SIGNIN_SIGNUP_HERE\' | translate}}</a></p></div><div class="tm24 divider-top text-signup" ng-if="!$ctrl.config.adminOnly && $ctrl.pipMedia(\'xs\') && !$ctrl.hideObject.signup"><div class="h48 layout-row layout-align-center-end"><p class="m0 text-small">{{::\'SIGNIN_NOT_MEMBER\' | translate}}</p></div><div class="h48 layout-row layout-align-center-start"><a class="text-small" ng-click="$ctrl.gotoSignup()" href="" tabindex="6">{{::\'SIGNIN_SIGNUP_HERE\' | translate}}</a></div></div></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signup/Signup.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><pip-signup-panel class="scroll-y"></pip-signup-panel></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signup/SignupDialog.html',
    '<md-dialog class="pip-entry"><md-dialog-content><pip-signup-panel pip-goto-signin-dialog="$ctrl.pipGotoSigninDialog" pip-post-signup="$ctrl.pipPostSignup"></pip-signup-panel></md-dialog-content></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('signup/SignupPanel.html',
    '<div class="pip-body"><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy() && !$ctrl.hideObject.progress" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2 pip-translate="SIGNUP_TITLE" ng-if="!$ctrl.hideObject.title"></h2><form name="form" novalidate="" autocomplete="off"><input type="email" style="display:none"> <input type="login" style="display:none"> <input type="password" style="display:none"><div ng-messages="$ctrl.config.form.$serverError" class="text-error bm8 color-error" md-auto-hide="false"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div ng-if="$ctrl.error" class="text-error bm8 color-error" md-auto-hide="false">{{::\'ERROR_SERVER\' | translate}}</div><div class="bp16"><a ng-hide="$ctrl.config.showServerUrl || $ctrl.config.fixedServerUrl || $ctrl.hideObject.server" ng-click="$ctrl.config.showServerUrl = true" href="">{{::\'ENTRY_CHANGE_SERVER\' | translate}}</a></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="bp8"><md-autocomplete ng-initial="" autofocus="" tabindex="1" class="pip-combobox w-stretch bm8" name="server" ng-enabled="!$ctrl.transaction.busy()" placeholder="{{::\'ENTRY_SERVER_URL\' | translate}}" md-no-cache="true" md-selected-item="$ctrl.config.data.serverUrl" md-search-text="$ctrl.config.selected.searchURLs" md-items="item in $ctrl.config.getMatches($ctrl.config.selected.searchURLs)" md-item-text="item" md-selected-item-change="$ctrl.onServerUrlChanged()" md-search-text-change="$ctrl.onChanged()" md-delay="200" ng-model="$ctrl.config.data.serverUrl" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors=""><span md-highlight-text="$ctrl.config.selected.searchURLs">{{item}}</span></md-autocomplete></div><md-input-container class="display bp4"><label>{{::\'FULLNAME\' | translate}}</label> <input name="signupFullName" ng-disabled="$ctrl.transaction.busy()" autocomplete="off" ng-model="$ctrl.config.data.name" ng-init="$ctrl.config.data.name = \'\'" required="" tabindex="2" pip-clear-errors="" ng-keypress="$ctrl.onEnter($event)"><div class="hint text-overflow w-stretch" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.signupFullName).hint && !$ctrl.hideObject.hint">{{ ::\'HINT_FULLNAME\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.signupFullName)" md-auto-hide="false"><div ng-message="required">{{ ::\'HINT_FULLNAME\' | translate}} {{::\'ERROR_FULLNAME_INVALID\' | translate }}</div><div ng-message="ERROR_NO_NAME">{{ ::\'ERROR_NO_NAME\' | translate }}</div></div></md-input-container><div ng-if="!$ctrl.config.useEmailAsLogin"><md-input-container class="display bp4"><label>{{ ::\'LOGIN\' | translate}}</label> <input name="signupLogin" ng-disabled="$ctrl.transaction.busy()" autocomplete="off" ng-model="$ctrl.config.data.login" ng-init="$ctrl.config.data.login = \'\'" required="" tabindex="2" pip-clear-errors="" ng-keypress="$ctrl.onEnter($event)"><div class="hint text-overflow w-stretch" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.signupLogin).hint && !$ctrl.hideObject.hint">{{::\'HINT_LOGIN\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.signupLogin)" md-auto-hide="false"><div ng-message="required">{{::\'HINT_LOGIN\' | translate}} {{::\'ERROR_LOGIN_INVALID\' | translate }}</div><div ng-message="ERROR_WRONG_LOGIN">{{::\'ERROR_WRONG_LOGIN\' | translate}}</div><div ng-message="ERROR_NO_LOGIN">{{::\'ERROR_NO_LOGIN\' | translate}}</div></div></md-input-container><md-input-container class="display bp4"><label>{{::\'EMAIL\' | translate}}</label> <input name="userEmail" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" type="email" tabindex="3" ng-model="$ctrl.config.data.email" xxxxpip-email-unique="$ctrl.config.data.email" ng-change="$ctrl.onChangeEmail(\'userEmail\')" ng-model-options="{ delay: 500 }" required="" ng-keypress="$ctrl.onEnter($event)" xxxpip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.userEmail, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_EMAIL\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.userEmail, true)" md-auto-hide="false"><div ng-message="emailUnique">{{::\'ERROR_ALREADY_EXIST\' | translate}}</div><div ng-message="required">{{::\'ERROR_EMAIL_INVALID\' | translate }}</div><div ng-message="email">{{::\'ERROR_EMAIL_INVALID\' | translate }}</div><div ng-message="ERROR_NO_EMAIL">{{::\'ERROR_NO_EMAIL\' | translate}}</div></div></md-input-container></div><div ng-if="$ctrl.config.useEmailAsLogin"><md-input-container class="display bp4" xxxmd-is-error="$ctrl.isError($ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.userEmail1))"><label>{{::\'EMAIL\' | translate}}</label> <input name="userEmail1" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" type="email" tabindex="3" ng-model="$ctrl.config.data.email" ng-change="$ctrl.onChangeEmail(\'userEmail1\')" ng-model-options="{ delay: 500 }" required="" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.userEmail1, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_EMAIL\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.userEmail1, true)" md-auto-hide="false"><div ng-message="required">{{::\'ERROR_EMAIL_INVALID\' | translate }}</div><div ng-message="email">{{::\'ERROR_EMAIL_INVALID\' | translate }}</div><div ng-message="emailUnique">{{::\'ERROR_ALREADY_EXIST_EMAIL\' | translate}}</div><div ng-message="ERROR_WRONG_LOGIN">{{::\'ERROR_WRONG_LOGIN_EMAIL\' | translate}}</div><div ng-message="ERROR_NO_LOGIN">{{::\'ERROR_NO_LOGIN_EMAIL\' | translate}}</div></div></md-input-container></div><md-input-container class="display bp4"><label>{{::\'PASSWORD_SET\' | translate}}</label> <input name="password" ng-disabled="$ctrl.transaction.busy()" autocomplete="off" pip-clear-errors="" type="password" tabindex="4" ng-model="$ctrl.config.data.password" required="" minlength="6" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.password)" md-auto-hide="false"><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="ERROR_WRONG_PASSWORD" xxxng-if="!$ctrl.config.form.password.$pristine">{{::\'ERROR_WRONG_PASSWORD\' | translate}}</div></div></md-input-container><md-input-container class="display bp4" ng-if="!$ctrl.hideObject.passwordConfirm"><label>{{::\'PASSWORD_CONFIRM\' | translate}}</label> <input name="passwordConfirm" type="password" tabindex="4" required="" minlength="6" ng-model="$ctrl.confirmPassword" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" pip-compare-password-match="" compare-to2="$ctrl.config.data.password" ng-keypress="$ctrl.onEnter($event)" pip-test="input-password"><div class="hint" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true).hint && !$ctrl.hideObject.hint">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.passwordConfirm, true)" md-auto-hide="false"><div ng-message="ERROR_compareTo">{{::\'PASSWORD_MATCH\' | translate}}</div><div ng-message="required">{{::\'HINT_PASSWORD\' | translate}}</div><div ng-message="minlength">{{::\'HINT_PASSWORD\' | translate}}</div></div></md-input-container><p class="text-small-secondary" ng-if="!$ctrl.hideObject.agreement">{{::\'SIGNUP_TEXT_11\' | translate}} <a href="#/legal/privacy" target="_blank">{{::\'SIGNUP_PRIVACY\' | translate}}</a> {{::\'SIGNUP_TEXT_12\' | translate}} <a href="#/legal/services" target="_blank">{{::\'SIGNUP_SERVICES\' | translate}}</a></p><md-button ng-hide="$ctrl.transaction.busy()" class="md-raised m0 md-accent w-stretch" ng-click="$ctrl.onSignup()" aria-label="SIGNUP" type="submit" xxng-disabled="$ctrl.config.form.$invalid || ($ctrl.config.form.$pristine && !$ctrl.config.data.email) || $ctrl.config.data.serverUrl.length == 0 || $ctrl.config.data.email.length == 0 || ($ctrl.config.data.login.length == 0 && !$ctrl.config.useEmailAsLogin) || (!$ctrl.config.data.password) || (!$ctrl.config.data.name) || $ctrl.config.data.name.length == 0 || $ctrl.config.data.password.length == 0">{{::\'SIGNUP_TITLE\' | translate}}</md-button><md-button ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" class="md-raised md-warn m0 w-stretch" aria-label="ABORT">{{::\'CANCEL\' | translate}}</md-button><div class="tm24 layout-row" ng-if="$ctrl.pipMedia(\'gt-xs\') && !$ctrl.hideObject.signin"><p class="text-small m0">{{::\'SIGNUP_TEXT_2\' | translate}} <a href="" ng-click="$ctrl.gotoSignin()">{{::\'SIGNUP_SIGNIN_HERE\' | translate}}</a></p></div><div class="tm24 divider-top" ng-if="$ctrl.pipMedia(\'xs\') && !$ctrl.hideObject.signin" style="margin-right: -16px; margin-left: -16px; background-color: rgb(238, 238, 238);"><div class="h48 layout-row layout-align-center-end"><p class="bm0 text-small">{{::\'SIGNUP_TEXT_2\' | translate}}</p></div><div class="h48 layout-row layout-align-center-start"><p class="bm0 text-small"><a href="" ng-click="$ctrl.gotoSignin()">{{::\'SIGNUP_SIGNIN_HERE\' | translate}}</a></p></div></div></form></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('verify_email/VerifyEmail.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><div class="pip-body"><div class="pip-content layout-column flex" style="position: absolute; top: 0px; right: 0px; left: 0px; bottom: 0px; background-color: #fafafa; z-index: 100;" ng-if="$ctrl.showValidateProgress"><h2 class="p24-flex m0">{{\'VERIFY_EMAIL_WAIT\' | translate}}</h2><div class="layout-column flex layout-align-center-center"><md-progress-circular md-diameter="96"></md-progress-circular></div></div><div class="pip-content"><md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate" class="pip-progress-top"></md-progress-linear><h2>{{\'VERIFY_EMAIL_TITLE\' | translate}}</h2><p class="title-padding">{{\'VERIFY_EMAIL_TEXT_1\' | translate}}</p><form name="form" novalidate="" ng-init="$ctrl.formCreated(form)" autocomplete="off"><div ng-messages="$ctrl.config.form.$serverError" class="text-error color-error bm8"><div ng-message="ERROR_act_execute">{{::\'ERROR_ACT_EXECUTE\' | translate}}</div><div ng-message="ERROR_-1">{{::\'ERROR_SERVER\' | translate}}</div><div ng-message="ERROR_UNKNOWN">{{ $ctrl.config.form.$serverError.ERROR_UNKNOWN | translate }}</div></div><div ng-show="$ctrl.config.showServerUrl && !$ctrl.hideObject.server" class="tp8 bp8">{{::\'ENTRY_SERVER_URL\' | translate}}: {{ $ctrl.config.data.serverUrl }}</div><div class="tp8 bp8"><span ng-if="!$ctrl.config.useEmailAsLogin">{{::\'LOGIN\' | translate}}</span> <span ng-if="$ctrl.config.useEmailAsLogin">{{::\'EMAIL\' | translate}}</span> : {{ $ctrl.config.data.login }}</div><md-input-container class="pip-no-hint"><label>{{::\'ENTRY_VERIFICATION_CODE\' | translate}}</label> <input name="code" ng-disabled="$ctrl.transaction.busy()" pip-clear-errors="" ng-model="$ctrl.config.data.code" required="" tabindex="3"><div class="hint text-overflow w-stretch" ng-if="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.code).hint && !$ctrl.hideObject.hint">{{::\'ENTRY_VERIFICATION_CODE\' | translate}}</div><div ng-messages="$ctrl.touchedErrorsWithHint($ctrl.config.form, $ctrl.config.form.code)" ng-if="!$ctrl.config.form.$pristine" class="md-input-error"><div ng-message="required">{{::\'ERROR_CODE_INVALID\' | translate }}</div><div ng-message="ERROR_INVALID_CODE">{{::\'ERROR_INVALID_CODE\' | translate }}</div></div></md-input-container><p>{{\'VERIFY_EMAIL_TEXT_21\' | translate}} <a ng-click="$ctrl.onRecover()" class="pointer" href="">{{\'VERIFY_EMAIL_RESEND\' | translate}}</a> {{\'VERIFY_EMAIL_TEXT_22\' | translate}}</p></form></div></div><div class="pip-footer"><md-button ng-click="$ctrl.goBack()" ng-hide="$ctrl.transaction.busy()" class="rm8" aria-label="CANCEL">{{::\'CANCEL\' | translate}}</md-button><md-button class="md-accent" ng-click="$ctrl.onVerify()" ng-hide="$ctrl.transaction.busy()" aria-label="VERIFY" ng-if="!$ctrl.showValidateProgress" type="submit" ng-disabled="$ctrl.config.data.code.length == 0 || $ctrl.config.data.login.length == 0 || (!$ctrl.config.data.login && $ctrl.config.form.$pristine) || (!$ctrl.config.data.code)">{{::\'VERIFY\' | translate}}</md-button><md-button class="md-warn" ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" aria-label="ABORT">{{::\'CANCEL\' | translate}}</md-button></div></pip-card></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipEntry.Templates');
} catch (e) {
  module = angular.module('pipEntry.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('verify_email/VerifyEmailSuccess.html',
    '<div class="pip-card-container pip-outer-scroll pip-entry"><pip-card width="400"><div class="pip-footer"><md-button ng-click="$ctrl.onContinue()" class="md-accent">{{\'CONTINUE\' | translate}}</md-button></div><div class="pip-body"><div class="pip-content"><h2>{{\'VERIFY_EMAIL_TITLE\' | translate}}</h2><p class="title-padding">{{\'VERIFY_EMAIL_SUCCESS_TEXT\' | translate}}</p></div></div></pip-card></div>');
}]);
})();



},{}]},{},[67,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,15,17,18,19,20,21,27,22,23,24,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,52,50,51,53,54,55,56,57,58,59,60,61,62,63,64,65,66])(67)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).split = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MobileState = (function () {
    function MobileState() {
    }
    return MobileState;
}());
exports.MobileState = MobileState;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var run = function ($rootScope, pipSplit, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var splitElements = $('.pip-split');
            if (splitElements.length > 0) {
                splitElements.removeClass('pip-transition-forward');
                splitElements.removeClass('pip-transition-back');
                if (toState.name != fromState.name) {
                    if (pipSplit.forwardTransition(toState, fromState)) {
                        splitElements.addClass('pip-transition-forward');
                    }
                    else {
                        splitElements.addClass('pip-transition-back');
                    }
                }
            }
        });
        var debounceResize = _.debounce(function () {
            var toState = pipSplit.goToDesktopState($state.current.name);
            if (toState)
                $state.go(toState, $state.current.params);
        }, 100);
        $rootScope.$on(pip.layouts.MainResizedEvent, function (event, breakpoints) {
            if (!breakpoints.xs) {
                debounceResize();
            }
        });
    };
    run.$inject = ['$rootScope', 'pipSplit', '$state'];
    var SplitService_1 = (function () {
        function SplitService_1(transitionSequences, mobileStates) {
            this.transitionSequences = transitionSequences;
            this.mobileStates = mobileStates;
        }
        SplitService_1.prototype.forwardTransition = function (toState, fromState) {
            for (var i = 0; i < this.transitionSequences.length; i++) {
                var toIndex = this.transitionSequences[i].indexOf(toState.name);
                var fromIndex = this.transitionSequences[i].indexOf(fromState.name);
                if (toIndex > -1) {
                    return toIndex > fromIndex;
                }
            }
            return false;
        };
        SplitService_1.prototype.goToDesktopState = function (fromState) {
            for (var i = 0; i < this.mobileStates.length; i++) {
                var fromIndex = _.findIndex(this.mobileStates[i], function (state) {
                    return state.name === fromState;
                });
                if (fromIndex > -1) {
                    return this.mobileStates[i][fromIndex].toState;
                }
            }
            return '';
        };
        return SplitService_1;
    }());
    var SplitProvider = (function () {
        function SplitProvider() {
            this.transitionSequences = [];
            this.mobileStates = [];
        }
        SplitProvider.prototype.addTransitionSequence = function (sequence, mobileStates) {
            if (!_.isArray(sequence) || sequence.length == 0) {
                throw new Error('Transition sequence must be an array of state names');
            }
            this.transitionSequences.push(sequence);
            this.mobileStates.push(mobileStates);
        };
        SplitProvider.prototype.$get = function () {
            "ngInject";
            if (this._service == null)
                this._service = new SplitService_1(this.transitionSequences, this.mobileStates);
            return this._service;
        };
        return SplitProvider;
    }());
    angular.module('pipSplit', [])
        .run(run)
        .provider('pipSplit', SplitProvider);
}
},{}],3:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipSplit', []);
require("./SplitService");
__export(require("./ISplitService"));
},{"./ISplitService":1,"./SplitService":2}]},{},[3])(3)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).pictures = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageOption_1 = require("./AddImageOption");
var ConfigTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'FILE': 'Upload pictures',
        'WEB_LINK': 'Use web link',
        'CAMERA': 'Take photo',
        'IMAGE_GALLERY': 'Use image library',
    });
    pipTranslateProvider.translations('ru', {
        'FILE': 'Загрузить картинку',
        'WEB_LINK': 'Вставить веб ссылка',
        'CAMERA': 'Использовать камеру',
        'IMAGE_GALLERY': 'Открыть галерею изображений'
    });
};
ConfigTranslations.$inject = ['pipTranslateProvider'];
{
    var AddImageController_1 = (function () {
        AddImageController_1.$inject = ['$scope', '$element', '$mdMenu', '$timeout', 'pipCameraDialog', 'pipPictureUrlDialog', 'pipGallerySearchDialog'];
        function AddImageController_1($scope, $element, $mdMenu, $timeout, pipCameraDialog, pipPictureUrlDialog, pipGallerySearchDialog) {
            "ngInject";
            this.$scope = $scope;
            this.$element = $element;
            this.$mdMenu = $mdMenu;
            this.$timeout = $timeout;
            this.pipCameraDialog = pipCameraDialog;
            this.pipPictureUrlDialog = pipPictureUrlDialog;
            this.pipGallerySearchDialog = pipGallerySearchDialog;
            var defaultOption = new AddImageOption_1.AddImageOption();
            this.option = _.assign(defaultOption, this.$scope.option);
        }
        AddImageController_1.prototype.openMenu = function ($mdOpenMenu) {
            if (this.$scope.ngDisabled()) {
                return;
            }
            $mdOpenMenu();
        };
        AddImageController_1.prototype.toBoolean = function (value) {
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        AddImageController_1.prototype.isMulti = function () {
            if (this.$scope.multi !== undefined && this.$scope.multi !== null) {
                if (angular.isFunction(this.$scope.multi)) {
                    return this.toBoolean(this.$scope.multi());
                }
                else {
                    return this.toBoolean(this.$scope.multi);
                }
            }
            else {
                return true;
            }
        };
        AddImageController_1.prototype.hideMenu = function () {
            this.$mdMenu.hide();
        };
        AddImageController_1.prototype.dataURItoBlob = function (dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            }
            else {
                byteString = unescape(dataURI.split(',')[1]);
            }
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ia = new Uint8Array(byteString.length);
            var i;
            for (i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], { type: mimeString });
        };
        AddImageController_1.prototype.addImages = function (images) {
            var _this = this;
            if (images === undefined) {
                return;
            }
            if (angular.isArray(images)) {
                images.forEach(function (img) {
                    if (_this.$scope.onChange) {
                        _this.$scope.onChange(img);
                    }
                });
            }
            else {
                if (this.$scope.onChange) {
                    this.$scope.onChange(images);
                }
            }
            if (this.$scope.$images === undefined || !Array.isArray(this.$scope.$images)) {
                return;
            }
            if (Array.isArray(images)) {
                images.forEach(function (img) {
                    _this.$scope.$images.push(img);
                });
            }
            else {
                this.$scope.$images.push(images);
            }
        };
        AddImageController_1.prototype.onFileChange = function ($files) {
            var _this = this;
            if ($files == null || $files.length == 0) {
                return;
            }
            $files.forEach(function (file) {
                if (file.type.indexOf('image') > -1) {
                    _this.$timeout(function () {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function (e) {
                            _this.$timeout(function () {
                                _this.addImages({ url: null, uriData: e.target.result, file: file, picture: null });
                            });
                        };
                    });
                }
            });
        };
        AddImageController_1.prototype.onWebLinkClick = function () {
            var _this = this;
            this.pipPictureUrlDialog.show(function (result) {
                var blob = null;
                if (result.substring(0, 10) == 'data:image') {
                    blob = _this.dataURItoBlob(result);
                    blob.name = result.slice(result.lastIndexOf('/') + 1, result.length).split('?')[0];
                }
                _this.addImages({ url: result, uriData: null, file: blob, picture: null });
            });
        };
        AddImageController_1.prototype.onCameraClick = function () {
            var _this = this;
            this.pipCameraDialog.show(function (result) {
                var blob = _this.dataURItoBlob(result);
                blob.name = 'camera';
                _this.addImages({ url: null, uriData: result, file: blob, picture: null });
            });
        };
        AddImageController_1.prototype.onGalleryClick = function () {
            var _this = this;
            this.pipGallerySearchDialog.show({
                multiple: this.isMulti()
            }, function (result) {
                if (_this.isMulti()) {
                    var imgs_1 = [];
                    result.forEach(function (item) {
                        imgs_1.push({ url: null, uriData: null, file: null, picture: item });
                    });
                    _this.addImages(imgs_1);
                }
                else {
                    _this.addImages({ url: null, uriData: null, file: null, picture: result[0] });
                }
            });
        };
        return AddImageController_1;
    }());
    var AddImage = function () {
        return {
            restrict: 'AC',
            scope: {
                $images: '=pipImages',
                onChange: '&pipChanged',
                multi: '&pipMulti',
                option: '=pipOption',
                ngDisabled: '&'
            },
            transclude: true,
            templateUrl: 'add_image/AddImage.html',
            controller: AddImageController_1,
            controllerAs: 'vm'
        };
    };
    angular
        .module('pipAddImage', ['pipCameraDialog', 'pipPictureUrlDialog', 'pipGallerySearchDialog', 'angularFileUpload'])
        .config(ConfigTranslations)
        .directive('pipAddImage', AddImage);
}
},{"./AddImageOption":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageOption = (function () {
    function AddImageOption() {
        this.Upload = true;
        this.WebLink = true;
        this.Camera = true;
        this.Galery = true;
    }
    return AddImageOption;
}());
exports.AddImageOption = AddImageOption;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AddImageResult = (function () {
    function AddImageResult() {
    }
    return AddImageResult;
}());
exports.AddImageResult = AddImageResult;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAvatarDataService_1 = require("../data/IAvatarDataService");
var AvatarEdit_1 = require("../avatar_edit/AvatarEdit");
{
    var AvatarBindings = {
        pipId: '<?',
        pipUrl: '<?',
        pipName: '<?',
        ngClass: '<?',
        pipRebindAvatar: '<?',
        pipRebind: '<?'
    };
    var AvatarBindingsChanges = (function () {
        function AvatarBindingsChanges() {
        }
        return AvatarBindingsChanges;
    }());
    var AvatarController = (function () {
        AvatarController.$inject = ['$log', '$http', '$rootScope', '$element', 'pipAvatarData', 'pipPictureUtils', 'pipCodes', '$timeout'];
        function AvatarController($log, $http, $rootScope, $element, pipAvatarData, pipPictureUtils, pipCodes, $timeout) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipAvatarData = pipAvatarData;
            this.pipPictureUtils = pipPictureUtils;
            this.pipCodes = pipCodes;
            this.$timeout = $timeout;
            this.postLink = false;
            this.image = null;
            this.initial = this.pipAvatarData.DefaultInitial;
            $element.addClass('pip-avatar flex-fixed');
            this.$rootScope.$on(AvatarEdit_1.ReloadAvatar, function ($event, id) {
                if (_this.pipId == id && _this.pipRebind) {
                    _this.refreshAvatar();
                }
            });
        }
        AvatarController.prototype.$postLink = function () {
            var _this = this;
            this.imageElement = this.$element.children('img');
            this.defaultAvatarElement = this.$element.find('#default-avatar');
            this.imageElement
                .load(function ($event) {
                _this.image = $($event.target);
                _this.pipPictureUtils.setImageMarginCSS(_this.$element, _this.image);
            })
                .error(function ($event) {
                _this.showAvatarByName();
            });
            this.bindControl();
            this.postLink = true;
        };
        AvatarController.prototype.$onChanges = function (changes) {
            var _this = this;
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipRebindAvatar && changes.pipRebindAvatar.currentValue !== changes.pipRebindAvatar.previousValue) {
                this.pipRebindAvatar = changes.pipRebindAvatar.currentValue;
            }
            if (changes.ngClass && changes.ngClass.currentValue !== changes.ngClass.previousValue) {
                this.ngClass = changes.ngClass.currentValue;
                setTimeout(function () {
                    _this.pipPictureUtils.setImageMarginCSS(_this.$element, _this.image);
                }, 50);
            }
            var isDataChange = false;
            if (this.pipRebind) {
                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    isDataChange = true;
                }
                if (changes.pipUrl && changes.pipUrl.currentValue !== changes.pipUrl.previousValue) {
                    this.pipUrl = changes.pipUrl.currentValue;
                    isDataChange = true;
                }
                if (changes.pipName && changes.pipName.currentValue !== changes.pipName.previousValue) {
                    this.pipName = changes.pipName.currentValue;
                    isDataChange = true;
                }
            }
            if (isDataChange && this.postLink) {
                this.refreshAvatar();
            }
        };
        AvatarController.prototype.showAvatarByName = function () {
            var _this = this;
            this.$timeout(function () {
                var colorClassIndex = _this.pipCodes.hash(_this.pipId) % IAvatarDataService_1.colors.length;
                _this.defaultAvatarElement.removeAttr('class');
                _this.defaultAvatarElement.addClass(IAvatarDataService_1.colorClasses[colorClassIndex]);
                _this.imageElement.css('display', 'none');
                _this.defaultAvatarElement.css('display', 'inline-block');
            });
        };
        AvatarController.prototype.toBoolean = function (value) {
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        AvatarController.prototype.refreshAvatar = function () {
            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                this.imageElement.attr('src', '');
                this.imageElement.css('display', 'inline-block');
                this.defaultAvatarElement.css('display', 'none');
            }
            this.bindControl();
        };
        ;
        AvatarController.prototype.bindControl = function () {
            var _this = this;
            if (this.pipRebindAvatar) {
                this.cleanupAvatarUpdated = this.$rootScope.$on('pipPartyAvatarUpdated', function () { _this.refreshAvatar(); });
            }
            else {
                if (this.cleanupAvatarUpdated) {
                    this.cleanupAvatarUpdated();
                }
            }
            if (this.pipName) {
                this.initial = this.pipName.charAt(0);
            }
            else {
                this.initial = this.pipAvatarData.DefaultInitial;
            }
            if (!this.pipAvatarData.ShowOnlyNameIcon) {
                var url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : this.pipUrl;
                this.imageElement.attr('src', url);
            }
            else {
                this.showAvatarByName();
            }
        };
        return AvatarController;
    }());
    var AvatarComponent = {
        bindings: AvatarBindings,
        template: '<img/><div id="default-avatar">{{ $ctrl.initial }}</div>',
        controller: AvatarController
    };
    angular
        .module('pipAvatar', ['pipPictureUtils'])
        .component('pipAvatar', AvatarComponent);
}
},{"../avatar_edit/AvatarEdit":8,"../data/IAvatarDataService":18}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var AddImageOption_1 = require("../add_image/AddImageOption");
exports.ReloadAvatar = 'pipReloadAvatar';
var AvatarEditControl = (function () {
    function AvatarEditControl() {
        this.disabled = false;
        this.url = '';
        this.progress = 0;
        this.uploaded = false;
        this.uploading = false;
        this.upload = false;
        this.loaded = false;
        this.file = null;
        this.state = AvatarStates.Original;
    }
    return AvatarEditControl;
}());
exports.AvatarEditControl = AvatarEditControl;
var AvatarStates = (function () {
    function AvatarStates() {
    }
    return AvatarStates;
}());
AvatarStates.Original = 'original';
AvatarStates.Changed = 'changed';
AvatarStates.Deleted = 'deleted';
AvatarStates.Error = 'error';
exports.AvatarStates = AvatarStates;
{
    var ConfigAvatarEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'PICTURE_EDIT_TEXT': 'Click here to upload a picture',
            'PICTURE_ERROR_LOAD': 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_EDIT_TEXT': 'Нажмите сюда для загрузки картинки',
            'PICTURE_ERROR_LOAD': 'Ошибка загрузки картинки'
        });
    };
    ConfigAvatarEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var AvatarEvent = (function () {
        function AvatarEvent() {
        }
        return AvatarEvent;
    }());
    var AvatarEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipReset: '<?',
        pipId: '<?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var AvatarEditBindingsChanges = (function () {
        function AvatarEditBindingsChanges() {
        }
        return AvatarEditBindingsChanges;
    }());
    var AvatarEditController = (function () {
        AvatarEditController.$inject = ['$log', '$scope', '$http', '$rootScope', '$element', '$timeout', 'pipAvatarData', 'pipCodes', 'pipPictureUtils', 'pipFileUpload', 'pipRest'];
        function AvatarEditController($log, $scope, $http, $rootScope, $element, $timeout, pipAvatarData, pipCodes, pipPictureUtils, pipFileUpload, pipRest) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$http = $http;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.$timeout = $timeout;
            this.pipAvatarData = pipAvatarData;
            this.pipCodes = pipCodes;
            this.pipPictureUtils = pipPictureUtils;
            this.pipFileUpload = pipFileUpload;
            this.pipRest = pipRest;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.option = new AddImageOption_1.AddImageOption();
            this.option.WebLink = false;
            this.option.Galery = false;
            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.control = new AvatarEditControl();
            this.multiUpload = false;
            this.control.reset = function (afterDeleting) {
                _this.reset(afterDeleting);
            };
            this.control.save = function (id, successCallback, errorCallback) {
                _this.save(id, successCallback, errorCallback);
            };
            $element.addClass('pip-picture-edit');
        }
        AvatarEditController.prototype.$postLink = function () {
            var _this = this;
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');
            this.$element.children('.pip-picture-upload').focus(function () {
                _this.pipPicturePaste.addPasteListener(function (item) {
                    _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
                });
            });
            this.$element.children('.pip-picture-upload').blur(function () {
                _this.pipPicturePaste.removePasteListener();
            });
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }
            this.control.reset();
        };
        AvatarEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.pipReset && changes.pipReset.currentValue !== changes.pipReset.previousValue) {
                this.pipReset = changes.pipReset.currentValue;
            }
            var isReset = false;
            if (this.pipRebind) {
                if (changes.pipId && changes.pipId.currentValue !== changes.pipId.previousValue) {
                    this.pipId = changes.pipId.currentValue;
                    if (this.pipReset !== false) {
                        isReset = true;
                    }
                }
                if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                    this.ngDisabled = changes.ngDisabled.currentValue;
                }
            }
            if (changes.pipId && changes.pipId.currentValue && this.control && this.control.state != AvatarStates.Deleted && this.control.state != AvatarStates.Changed) {
                isReset = true;
            }
            if (isReset) {
                this.control.reset();
            }
        };
        AvatarEditController.prototype.reset = function (afterDeleting) {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;
            this.control.file = null;
            this.control.state = AvatarStates.Original;
            this.control.url = '';
            this.control.uriData = null;
            if (!afterDeleting) {
                var url = this.pipId ? this.pipAvatarData.getAvatarUrl(this.pipId) : '';
                if (!url)
                    return;
                this.control.progress = 0;
                this.control.url = url;
                this.control.uploaded = this.control.url != '';
                this.onChange();
            }
            else
                this.onChange();
        };
        AvatarEditController.prototype.saveAvatar = function (id, successCallback, errorCallback) {
            var _this = this;
            if (!id) {
                id = this.pipId;
            }
            if (this.control.file !== null) {
                var fd = new FormData();
                fd.append('file', this.control.file);
                this.control.uploading = true;
                this.$http.put(this.pipAvatarData.getAvatarUrl(id), fd, {
                    uploadEventHandlers: {
                        progress: function (e) {
                            if (e.lengthComputable) {
                                _this.control.progress = (e.loaded / e.total) * 100;
                            }
                        }
                    },
                    headers: { 'Content-Type': undefined }
                })
                    .success(function (response) {
                    _this.control.progress = 100;
                    _this.pipId = response.id;
                    _this.$rootScope.$broadcast(exports.ReloadAvatar, _this.pipId);
                    _this.control.reset();
                    if (successCallback) {
                        successCallback(response);
                    }
                })
                    .error(function (error) {
                    _this.control.progress = 0;
                    _this.control.uploading = false;
                    _this.control.upload = false;
                    _this.control.progress = 0;
                    _this.control.state = AvatarStates.Original;
                    if (errorCallback) {
                        errorCallback(error);
                    }
                    else {
                        _this.$log.error(error);
                    }
                });
            }
        };
        AvatarEditController.prototype.deletePicture = function (successCallback, errorCallback) {
            var _this = this;
            this.pipAvatarData.deleteAvatar(this.pipId, function () {
                _this.$rootScope.$broadcast(exports.ReloadAvatar, _this.pipId);
                _this.control.reset(true);
                if (successCallback) {
                    successCallback();
                }
            }, function (error) {
                _this.control.uploading = false;
                _this.control.upload = false;
                _this.control.progress = 0;
                _this.control.state = AvatarStates.Original;
                if (errorCallback) {
                    errorCallback(error);
                }
                else {
                    _this.$log.error(error);
                }
            });
        };
        AvatarEditController.prototype.save = function (id, successCallback, errorCallback) {
            if (this.control.state == AvatarStates.Changed) {
                this.saveAvatar(id, successCallback, errorCallback);
            }
            else if (this.control.state == AvatarStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            else {
                if (successCallback)
                    successCallback();
            }
        };
        AvatarEditController.prototype.empty = function () {
            return this.control.url == '' && !this.control.uploading;
        };
        ;
        AvatarEditController.prototype.isUpdated = function () {
            return this.control.state != AvatarStates.Original;
        };
        ;
        AvatarEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            if (picture) {
                this.control.url = this.pipAvatarData.getAvatarUrl(this.pipId);
            }
            else {
                this.control.file = file;
                this.control.url = file ? uriData : url ? url : '';
            }
            this.control.state = AvatarStates.Changed;
            this.onChange();
        };
        ;
        AvatarEditController.prototype.onDeleteClick = function ($event) {
            if ($event) {
                $event.stopPropagation();
            }
            this.controlElement.focus();
            this.control.file = null;
            this.control.url = '';
            this.control.state = AvatarStates.Deleted;
            this.onChange();
        };
        ;
        AvatarEditController.prototype.onKeyDown = function ($event) {
            var _this = this;
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                setTimeout(function () {
                    _this.controlElement.trigger('click');
                }, 0);
            }
            else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = AvatarStates.Deleted;
                this.onChange();
            }
            else if ($event.keyCode == 27) {
                this.control.reset();
            }
        };
        ;
        AvatarEditController.prototype.onImageError = function ($event) {
            var _this = this;
            this.$scope.$apply(function () {
                _this.control.url = '';
                var image = $($event.target);
                _this.control.state = AvatarStates.Original;
                _this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        };
        ;
        AvatarEditController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = {};
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        };
        ;
        AvatarEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { $control: this.control },
                    $control: this.control
                });
            }
        };
        ;
        return AvatarEditController;
    }());
    var AvatarEditComponent = {
        bindings: AvatarEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: AvatarEditController
    };
    angular
        .module('pipAvatarEdit', ['ui.event', 'pipPictureUtils', 'pipPictures.Templates', 'pipFiles'])
        .config(ConfigAvatarEditTranslations)
        .component('pipAvatarEdit', AvatarEditComponent);
}
},{"../add_image/AddImageOption":5,"../utilities/PicturePaste":43}],9:[function(require,module,exports){
var ConfigCameraDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'TAKE_PICTURE': 'Take a picture',
        'WEB_CAM_ERROR': 'Webcam is missing or was not found'
    });
    pipTranslateProvider.translations('ru', {
        'TAKE_PICTURE': 'Сделать фото',
        'WEB_CAM_ERROR': 'Web-камера отсутствует или не найдена'
    });
};
ConfigCameraDialogTranslations.$inject = ['pipTranslateProvider'];
{
    var CameraDialogController = (function () {
        CameraDialogController.$inject = ['$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'pipSystemInfo'];
        function CameraDialogController($mdDialog, $rootScope, $timeout, $mdMenu, pipSystemInfo) {
            "ngInject";
            this.$mdDialog = $mdDialog;
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.$mdMenu = $mdMenu;
            this.pipSystemInfo = pipSystemInfo;
            this.theme = this.$rootScope[pip.themes.ThemeRootVar];
            this.browser = this.pipSystemInfo.os;
            this.freeze = false;
            this.onInit();
        }
        CameraDialogController.prototype.onInit = function () {
            var _this = this;
            if (this.browser !== 'android') {
                Webcam.init();
                setTimeout(function () {
                    Webcam.attach('.camera-stream');
                }, 0);
                Webcam.on('error', function (err) {
                    _this.webCamError = true;
                    console.error(err);
                });
                Webcam.set({
                    width: 400,
                    height: 300,
                    dest_width: 400,
                    dest_height: 300,
                    crop_width: 400,
                    crop_height: 300,
                    image_format: 'jpeg',
                    jpeg_quality: 90
                });
                Webcam.setSWFLocation('webcam.swf');
            }
            else {
                document.addEventListener("deviceready", this.onDeviceReady, false);
            }
        };
        CameraDialogController.prototype.onDeviceReady = function () {
            var _this = this;
            navigator.camera.getPicture(function (data) { _this.onSuccess(data); }, function (message) { _this.onFail(message); }, {
                sourceType: Camera.PictureSourceType.CAMERA,
                correctOrientation: true,
                quality: 75,
                targetWidth: 200,
                destinationType: Camera.DestinationType.DATA_URL
            });
        };
        CameraDialogController.prototype.onSuccess = function (imageData) {
            var picture = 'data:image/jpeg;base64,' + imageData;
            this.$mdDialog.hide(picture);
        };
        CameraDialogController.prototype.onFail = function (message) {
            alert('Failed because: ' + message);
            this.$mdDialog.hide();
        };
        CameraDialogController.prototype.onTakePictureClick = function () {
            var _this = this;
            if (Webcam) {
                if (this.freeze) {
                    Webcam.snap(function (dataUri) {
                        _this.freeze = false;
                        _this.$mdDialog.hide(dataUri);
                    });
                }
                else {
                    this.freeze = true;
                    Webcam.freeze();
                }
            }
        };
        CameraDialogController.prototype.onResetPicture = function () {
            this.freeze = false;
            Webcam.unfreeze();
        };
        CameraDialogController.prototype.onCancelClick = function () {
            this.$mdDialog.cancel();
        };
        return CameraDialogController;
    }());
    angular
        .module('pipCameraDialog')
        .config(ConfigCameraDialogTranslations)
        .controller('pipCameraDialogController', CameraDialogController);
}
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CameraDialogService = (function () {
    CameraDialogService.$inject = ['$mdDialog'];
    function CameraDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    CameraDialogService.prototype.show = function (successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'camera_dialog/CameraDialog.html',
            clickOutsideToClose: true,
            controller: 'pipCameraDialogController',
            controllerAs: '$ctrl'
        })
            .then(function (result) {
            Webcam.reset();
            if (successCallback) {
                successCallback(result);
            }
        }, function () {
            Webcam.reset();
        });
    };
    return CameraDialogService;
}());
angular
    .module('pipCameraDialog')
    .service('pipCameraDialog', CameraDialogService);
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipCameraDialog', ['ngMaterial', 'pipServices', 'pipPictures.Templates']);
require("./ICameraDialogService");
require("./CameraDialogService");
require("./CameraDialogController");
},{"./CameraDialogController":9,"./CameraDialogService":10,"./ICameraDialogService":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ContainerSize = (function () {
        function ContainerSize() {
        }
        return ContainerSize;
    }());
    var CollageBindings = {
        pipPictureIds: '<?',
        pipSrcs: '<?',
        pipPictures: '<?',
        uniqueCode: '<?pipUniqueCode',
        multiple: '<?pipMultiple',
        allowOpen: '<?pipOpen',
        pipRebind: '<?',
    };
    var CollageBindingsChanges = (function () {
        function CollageBindingsChanges() {
        }
        return CollageBindingsChanges;
    }());
    var CollageController = (function () {
        CollageController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureData', 'pipPictureUtils', 'pipCodes'];
        function CollageController($log, $scope, $rootScope, $element, pipPictureData, pipPictureUtils, pipCodes) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureData = pipPictureData;
            this.pipPictureUtils = pipPictureUtils;
            this.pipCodes = pipCodes;
            $element.addClass('pip-collage');
            this.collageSchemes = pipPictureUtils.getCollageSchemes(),
                this.resized = 0;
            this.svgData = '<?xml version="1.0" encoding="utf-8"?>' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                '<svg version="1.1"' +
                'xmlns="http://www.w3.org/2000/svg"' +
                'xmlns:xlink="http://www.w3.org/1999/xlink"' +
                'x="0px" y="0px"' +
                'viewBox="0 0 510 510"' +
                'style="enable-background:new 0 0 515 515;"' +
                'xml:space="preserve">' +
                '<defs>' +
                '<style type="text/css"><![CDATA[' +
                '#symbol-picture-no-border {' +
                '        transform-origin: 50% 50%;' +
                '        transform: scale(0.6, -0.6);' +
                '    }' +
                '        ]]></style>' +
                '        </defs>' +
                '<rect x="0" width="515" height="515"/>' +
                '<path id="symbol-picture-no-border" d="M120 325l136-102 69 33 136-82 0-54-410 0 0 136z m341 15c0-28-23-51-51-51-29 0-52 23-52 51 0 29 23 52 52 52 28 0 51-23 51-52z" />' +
                '</svg>';
            this.debounceCalculateResize = _.debounce(function () { _this.calculateResize(); }, 50);
        }
        CollageController.prototype.$postLink = function () {
            var _this = this;
            this.$scope.getElementDimensions = function () {
                var dimension = {
                    'h': _this.$element.height(),
                    'w': _this.$element.width()
                };
                return dimension;
            };
            this.$scope.$watch(this.$scope.getElementDimensions, function (newValue, oldValue) {
                if (newValue && oldValue && oldValue.h == newValue.h && oldValue.w == newValue.w)
                    return;
                _this.debounceCalculateResize();
            }, true);
            this.generateContent();
        };
        CollageController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.allowOpen && changes.allowOpen.currentValue !== changes.allowOpen.previousValue) {
                this.allowOpen = changes.allowOpen.currentValue;
            }
            var isChanged = false;
            if (this.pipRebind) {
                if (changes.pipSrcs && !_.isEqual(changes.pipSrcs.currentValue, changes.pipSrcs.previousValue)) {
                    this.pipSrcs = changes.pipSrcs.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictureIds && !_.isEqual(changes.pipPictureIds.currentValue, changes.pipPictureIds.previousValue)) {
                    this.pipPictureIds = changes.pipPictureIds.currentValue;
                    isChanged = true;
                }
                if (changes.pipPictures && !_.isEqual(changes.pipPictures.currentValue, changes.pipPictures.previousValue)) {
                    this.pipPictures = changes.pipPictures.currentValue;
                    isChanged = true;
                }
            }
            if (isChanged) {
                this.generateContent();
            }
        };
        CollageController.prototype.calculateResize = function () {
            var ims = this.$element.find('img');
            var i = 0;
            for (i; i < ims.length; i++) {
                var container = angular.element(ims[i].parentElement);
                var image = angular.element(ims[i]);
                if (image.css('display') != 'none') {
                    this.pipPictureUtils.setImageMarginCSS(container, image);
                }
            }
            var icns = this.$element.find('md-icon');
            for (i; i < icns.length; i++) {
                var container = angular.element(icns[i].parentElement);
                var icn = angular.element(icns[i]);
                if (container.css('display') != 'none') {
                    this.pipPictureUtils.setIconMarginCSS(container[0], icn);
                }
            }
        };
        CollageController.prototype.onImageError = function ($event) {
            var image = $($event.target);
            var container = image.parent();
            var defaultBlock = container.children('div');
            var defaultIcon = image.parent().find('md-icon');
            defaultBlock.css('display', 'block');
            image.css('display', 'none');
            this.pipPictureUtils.setIconMarginCSS(container[0], defaultIcon);
            defaultIcon.empty().append(this.svgData);
        };
        CollageController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = image.parent();
            var defaultBlock = container.children('div');
            this.pipPictureUtils.setImageMarginCSS(container, image);
            defaultBlock.css('display', 'none');
        };
        CollageController.prototype.getScheme = function (count) {
            var schemes = this.collageSchemes[count - 1];
            if (schemes.length == 1)
                return schemes[0];
            var uniqueCode = this.uniqueCode ? this.uniqueCode : '';
            var hash = this.pipCodes.hash(uniqueCode);
            return schemes[hash % schemes.length];
        };
        CollageController.prototype.getImageUrls = function () {
            if (this.pipSrcs) {
                return _.clone(this.pipSrcs);
            }
            var i;
            var result = [];
            if (this.pipPictureIds) {
                for (i = 0; i < this.pipPictureIds.length; i++) {
                    result.push(this.pipPictureData.getPictureUrl(this.pipPictureIds[i]));
                }
            }
            else if (this.pipPictures) {
                for (i = 0; i < this.pipPictures.length; i++) {
                    var url = this.pipPictures[i].uri ? this.pipPictures[i].uri : this.pipPictureData.getPictureUrl(this.pipPictures[i].id);
                    result.push(url);
                }
            }
            return result;
        };
        CollageController.prototype.generatePicture = function (urls, scheme) {
            var url = urls[0];
            var containerClasses = '';
            var pictureClasses = '';
            urls.splice(0, 1);
            containerClasses += scheme.fullWidth ? ' pip-full-width' : '';
            containerClasses += scheme.fullHeight ? ' pip-full-height' : '';
            containerClasses += ' flex-' + scheme.flex;
            pictureClasses += scheme.leftPadding ? ' pip-left' : '';
            pictureClasses += scheme.rightPadding ? ' pip-right' : '';
            pictureClasses += scheme.topPadding ? ' pip-top' : '';
            pictureClasses += scheme.bottomPadding ? ' pip-bottom' : '';
            if (this.allowOpen) {
                return '<a class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '" '
                    + 'href="' + url + '"  target="_blank">'
                    + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                    + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></a>';
            }
            return '<div class="pip-picture-container' + containerClasses + '" flex="' + scheme.flex + '">'
                + '<div class="pip-picture' + pictureClasses + '"><img src="' + url + '"/>'
                + '<div><md-icon class="collage-error-icon" md-svg-icon="icons:picture-no-border"></md-icon></div></div></div>';
        };
        CollageController.prototype.generatePictureGroup = function (urls, scheme) {
            var classes = '';
            var result;
            var i;
            classes += scheme.fullWidth ? ' pip-full-width' : '';
            classes += scheme.fullHeight ? ' pip-full-height' : '';
            classes += ' flex-' + scheme.flex;
            classes += ' layout-' + scheme.layout;
            result = '<div class="pip-picture-group layout' + classes + '" flex="'
                + scheme.flex + '" layout="' + scheme.layout + '">';
            for (i = 0; i < scheme.children.length; i++) {
                result += this.generate(urls, scheme.children[i]);
            }
            result += '</div>';
            return result;
        };
        CollageController.prototype.generate = function (urls, scheme) {
            if (scheme.group) {
                return this.generatePictureGroup(urls, scheme);
            }
            return this.generatePicture(urls, scheme);
        };
        CollageController.prototype.generateContent = function () {
            var _this = this;
            this.$element.find('img')
                .unbind('error')
                .unbind('load');
            this.$element.empty();
            var urls = this.getImageUrls();
            var scheme;
            var html;
            if (urls.length == 0) {
                this.$element.hide();
                return;
            }
            if (urls.length > 8) {
                if (!this.multiple) {
                    urls.length = 8;
                }
            }
            if (urls.length <= 8) {
                scheme = this.getScheme(urls.length);
                html = '<div class="pip-collage-section">' + this.generate(urls, scheme) + '</div>';
                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            }
            else {
                html = '';
                while (urls.length > 0) {
                    var partialUrls = urls.splice(0, 8);
                    scheme = this.getScheme(partialUrls.length);
                    html += '<div class="pip-collage-section">' + this.generate(partialUrls, scheme) + '</div>';
                }
                html += '<div class="clearfix"></div>';
                this.$element.html(html);
            }
            this.$element.find('img')
                .bind('error', function (event) { _this.onImageError(event); })
                .bind('load', function (event) { _this.onImageLoad(event); });
            this.$element.show();
        };
        return CollageController;
    }());
    var CollageComponent = {
        bindings: CollageBindings,
        controller: CollageController
    };
    angular
        .module('pipCollage', [])
        .component('pipCollage', CollageComponent);
}
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attachment = (function () {
    function Attachment(id, uri, name) {
        this.id = id;
        this.uri = uri;
        this.name = name;
    }
    return Attachment;
}());
exports.Attachment = Attachment;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAvatarDataService_1 = require("./IAvatarDataService");
var AvatarData = (function () {
    AvatarData.$inject = ['_config', 'pipRest'];
    function AvatarData(_config, pipRest) {
        "ngInject";
        this._config = _config;
        this.pipRest = pipRest;
    }
    Object.defineProperty(AvatarData.prototype, "AvatarRoute", {
        get: function () {
            return this._config.AvatarRoute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarData.prototype, "ShowOnlyNameIcon", {
        get: function () {
            return this._config.ShowOnlyNameIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarData.prototype, "DefaultInitial", {
        get: function () {
            return this._config.DefaultInitial;
        },
        enumerable: true,
        configurable: true
    });
    AvatarData.prototype.getAvatarUrl = function (id) {
        return this.pipRest.serverUrl + this._config.AvatarRoute + '/' + id;
    };
    AvatarData.prototype.postAvatarUrl = function () {
        return this.pipRest.serverUrl + this._config.AvatarRoute;
    };
    AvatarData.prototype.deleteAvatar = function (id, successCallback, errorCallback) {
        var params = {};
        params[this._config.AvatarFieldId] = id;
        this.pipRest.getResource(this._config.AvatarResource).remove(params, null, successCallback, errorCallback);
    };
    AvatarData.prototype.createAvatar = function (data, successCallback, errorCallback, progressCallback) {
    };
    return AvatarData;
}());
var AvatarDataProvider = (function () {
    AvatarDataProvider.$inject = ['pipRestProvider'];
    function AvatarDataProvider(pipRestProvider) {
        this.pipRestProvider = pipRestProvider;
        this._config = new IAvatarDataService_1.AvatarConfig();
        this._config.AvatarRoute = '/api/1.0/avatars';
        this._config.AvatarResource = 'avatars';
        this._config.AvatarFieldId = 'avatar_id';
        this._config.ShowOnlyNameIcon = false;
        this._config.DefaultInitial = '&';
    }
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarRoute", {
        get: function () {
            return this._config.AvatarRoute;
        },
        set: function (value) {
            this._config.AvatarRoute = value;
            this.pipRestProvider.registerOperation('avatars', this._config.AvatarRoute + '/:avatar_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarResource", {
        get: function () {
            return this._config.AvatarResource;
        },
        set: function (value) {
            this._config.AvatarResource = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "AvatarFieldId", {
        get: function () {
            return this._config.AvatarFieldId;
        },
        set: function (value) {
            this._config.AvatarFieldId = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "ShowOnlyNameIcon", {
        get: function () {
            return this._config.ShowOnlyNameIcon;
        },
        set: function (value) {
            this._config.ShowOnlyNameIcon = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AvatarDataProvider.prototype, "DefaultInitial", {
        get: function () {
            return this._config.DefaultInitial;
        },
        set: function (value) {
            this._config.DefaultInitial = value;
        },
        enumerable: true,
        configurable: true
    });
    AvatarDataProvider.prototype.$get = ['pipRest', function (pipRest) {
        "ngInject";
        if (this._service == null) {
            this._service = new AvatarData(this._config, pipRest);
        }
        return this._service;
    }];
    return AvatarDataProvider;
}());
angular
    .module('pipAvatarData', ['pipRest'])
    .provider('pipAvatarData', AvatarDataProvider);
},{"./IAvatarDataService":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlobInfo = (function () {
    function BlobInfo(id, group, name, size, content_type, create_time, expire_time, completed) {
        this.id = id;
        this.group = group;
        this.name = name;
        this.size = size;
        this.content_type = content_type;
        this.create_time = create_time;
        this.expire_time = expire_time;
        this.completed = completed;
    }
    return BlobInfo;
}());
exports.BlobInfo = BlobInfo;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataPage = (function () {
    function DataPage(data, total) {
        if (data === void 0) { data = null; }
        if (total === void 0) { total = null; }
        this.total = total;
        this.data = data;
    }
    return DataPage;
}());
exports.DataPage = DataPage;
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AvatarConfig = (function () {
    function AvatarConfig() {
    }
    return AvatarConfig;
}());
exports.AvatarConfig = AvatarConfig;
exports.colorClasses = [
    'pip-avatar-color-0', 'pip-avatar-color-1', 'pip-avatar-color-2', 'pip-avatar-color-3',
    'pip-avatar-color-4', 'pip-avatar-color-5', 'pip-avatar-color-6', 'pip-avatar-color-7',
    'pip-avatar-color-8', 'pip-avatar-color-9', 'pip-avatar-color-10', 'pip-avatar-color-11',
    'pip-avatar-color-12', 'pip-avatar-color-13', 'pip-avatar-color-14', 'pip-avatar-color-15'
];
exports.colors = [
    'rgba(239,83,80,1)', 'rgba(236,64,122,1)', 'rgba(171,71,188,1)',
    'rgba(126,87,194,1)', 'rgba(92,107,192,1)', 'rgba(3,169,244,1)',
    'rgba(0,188,212,1)', 'rgba(0,150,136,1)', 'rgba(76,175,80,1)',
    'rgba(139,195,74,1)', 'rgba(205,220,57,1)', 'rgba(255,193,7,1)',
    'rgba(255,152,0,1)', 'rgba(255,87,34,1)', 'rgba(121,85,72,1)',
    'rgba(96,125,139,1)'
];
},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PictureConfig = (function () {
    function PictureConfig() {
    }
    return PictureConfig;
}());
exports.PictureConfig = PictureConfig;
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Image = (function () {
    function Image() {
    }
    return Image;
}());
exports.Image = Image;
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSet = (function () {
    function ImageSet(id, title, picIds, create_time) {
        this.id = id;
        this.title = title;
        this.pics = [];
        this.create_time = create_time;
    }
    return ImageSet;
}());
exports.ImageSet = ImageSet;
},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageSetData = (function () {
    ImageSetData.$inject = ['pipRest', 'pipFormat'];
    function ImageSetData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'imagesets';
    }
    ImageSetData.prototype.readImageSets = function (params, successCallback, errorCallback) {
        params = params || {};
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    ImageSetData.prototype.readImageSet = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ imagesets_id: id }, successCallback, errorCallback);
    };
    ImageSetData.prototype.updateImageSet = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ imagesets_id: id }, data, successCallback, errorCallback);
    };
    ImageSetData.prototype.createImageSet = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(null, data, successCallback, errorCallback);
    };
    ImageSetData.prototype.deleteImageSet = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ imagesets_id: id }, null, successCallback, errorCallback);
    };
    return ImageSetData;
}());
angular
    .module('pipImageSetData', ['pipRest'])
    .service('pipImageSetData', ImageSetData);
},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IPictureDataService_1 = require("./IPictureDataService");
var PictureData = (function () {
    PictureData.$inject = ['_config', 'pipFormat', 'pipRest'];
    function PictureData(_config, pipFormat, pipRest) {
        "ngInject";
        this._config = _config;
        this.pipFormat = pipFormat;
        this.pipRest = pipRest;
        this.RESOURCE = 'picture';
        this.RESOURCE_INFO = 'pictureInfo';
    }
    Object.defineProperty(PictureData.prototype, "PictureRoute", {
        get: function () {
            return this._config.PictureRoute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureData.prototype, "ShowErrorIcon", {
        get: function () {
            return this._config.ShowErrorIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureData.prototype, "DefaultErrorIcon", {
        get: function () {
            return this._config.DefaultErrorIcon;
        },
        enumerable: true,
        configurable: true
    });
    PictureData.prototype.getPictureUrl = function (id) {
        return this.pipRest.serverUrl + this._config.PictureRoute + '/' + id;
    };
    PictureData.prototype.postPictureUrl = function () {
        return this.pipRest.serverUrl + this._config.PictureRoute;
    };
    PictureData.prototype.readPictures = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    PictureData.prototype.readPictureInfo = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_INFO).get(params, successCallback, errorCallback);
    };
    PictureData.prototype.readPicture = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({
            picture_id: id
        }, successCallback, errorCallback);
    };
    PictureData.prototype.deletePicture = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ picture_id: id }, null, successCallback, errorCallback);
    };
    return PictureData;
}());
var PictureDataProvider = (function () {
    PictureDataProvider.$inject = ['pipRestProvider'];
    function PictureDataProvider(pipRestProvider) {
        this.pipRestProvider = pipRestProvider;
        this._config = new IPictureDataService_1.PictureConfig();
        this._config.PictureRoute = '/api/1.0/blobs';
        this._config.ShowErrorIcon = true;
        this._config.DefaultErrorIcon = 'picture-no-border';
    }
    Object.defineProperty(PictureDataProvider.prototype, "PictureRoute", {
        get: function () {
            return this._config.PictureRoute;
        },
        set: function (value) {
            this._config.PictureRoute = value;
            this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
        },
        enumerable: true,
        configurable: true
    });
    PictureDataProvider.prototype.getPictureUrl = function (id) {
        return this.pipRestProvider.serverUrl + this._config.PictureRoute + '/' + id;
    };
    Object.defineProperty(PictureDataProvider.prototype, "DefaultErrorIcon", {
        get: function () {
            return this._config.DefaultErrorIcon;
        },
        set: function (value) {
            this._config.DefaultErrorIcon = value;
            this.pipRestProvider.registerOperation('pictures', this._config.PictureRoute + '/:picture_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PictureDataProvider.prototype, "ShowErrorIcon", {
        get: function () {
            return this._config.ShowErrorIcon;
        },
        set: function (value) {
            this._config.ShowErrorIcon = value;
        },
        enumerable: true,
        configurable: true
    });
    PictureDataProvider.prototype.$get = ['pipRest', 'pipFormat', function (pipRest, pipFormat) {
        "ngInject";
        if (this._service == null) {
            this._service = new PictureData(this._config, pipFormat, pipRest);
        }
        return this._service;
    }];
    return PictureDataProvider;
}());
angular
    .module('pipPictureData', ['pipRest'])
    .provider('pipPictureData', PictureDataProvider);
},{"./IPictureDataService":20}],25:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Attachment");
require("./BlobInfo");
require("./DataPage");
require("./ImageSet");
require("./Image");
require("./AvatarDataService");
require("./IAvatarDataService");
require("./ImageSetDataService");
require("./IImageSetDataService");
require("./PictureDataService");
require("./IPictureDataService");
angular
    .module('pipPictures.Data', [
    'pipAvatarData',
    'pipPictureData',
    'pipImageSetData'
]);
__export(require("./Attachment"));
__export(require("./BlobInfo"));
__export(require("./DataPage"));
__export(require("./ImageSet"));
__export(require("./Image"));
__export(require("./IAvatarDataService"));
__export(require("./IPictureDataService"));
},{"./Attachment":14,"./AvatarDataService":15,"./BlobInfo":16,"./DataPage":17,"./IAvatarDataService":18,"./IImageSetDataService":19,"./IPictureDataService":20,"./Image":21,"./ImageSet":22,"./ImageSetDataService":23,"./PictureDataService":24}],26:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var IGallerySearchDialogService_1 = require("./IGallerySearchDialogService");
var ConfigGallerySearchDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'IMAGE_GALLERY': 'Add from image gallery',
        'SEARCH_PICTURES': 'Search for pictures...',
        'IMAGE_START_SEARCH': 'Images will appear here once you start searching'
    });
    pipTranslateProvider.translations('ru', {
        'IMAGE_GALLERY': 'Добавить из галереи изображений',
        'SEARCH_PICTURES': 'Поиск изображений...',
        'IMAGE_START_SEARCH': 'Картинки появятся после начала поиска'
    });
};
ConfigGallerySearchDialogTranslations.$inject = ['pipTranslateProvider'];
var GallerySearchDialogImage = (function () {
    function GallerySearchDialogImage() {
    }
    return GallerySearchDialogImage;
}());
var GallerySearchDialogController = (function (_super) {
    __extends(GallerySearchDialogController, _super);
    GallerySearchDialogController.$inject = ['$log', '$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'multiple', '$http', 'pipRest', 'pipTransaction', 'pipImageSetData', 'pipPictureData'];
    function GallerySearchDialogController($log, $mdDialog, $rootScope, $timeout, $mdMenu, multiple, $http, pipRest, pipTransaction, pipImageSetData, pipPictureData) {
        "ngInject";
        var _this = _super.call(this) || this;
        _this.$log = $log;
        _this.$mdDialog = $mdDialog;
        _this.$rootScope = $rootScope;
        _this.$timeout = $timeout;
        _this.$mdMenu = $mdMenu;
        _this.multiple = multiple;
        _this.$http = $http;
        _this.pipRest = pipRest;
        _this.pipTransaction = pipTransaction;
        _this.pipImageSetData = pipImageSetData;
        _this.pipPictureData = pipPictureData;
        _this.prevSearch = '';
        _this.images = [];
        _this.theme = _this.$rootScope[pip.themes.ThemeRootVar];
        _this.search = '';
        _this.imagesSearchResult = [];
        _this.transaction = _this.pipTransaction.create('search');
        _this.focusSearchText();
        return _this;
    }
    GallerySearchDialogController.prototype.onSearchClick = function () {
        var _this = this;
        if (this.transaction.busy())
            return;
        if (this.search == '' || this.search == this.prevSearch)
            return;
        this.prevSearch = this.search;
        this.imagesSearchResult = [];
        var transactionId = this.transaction.begin('ENTERING');
        if (!transactionId)
            return;
        this.pipImageSetData.readImageSets({
            Search: this.search
        }, function (result) {
            if (_this.transaction.aborted(transactionId))
                return;
            _.each(result.data, function (item) {
                _.each(item.pics, function (img) {
                    var newImage = {
                        checked: false,
                        url: img.uri ? img.uri : _this.pipPictureData.getPictureUrl(img.id),
                        item: img,
                        thumbnail: img.uri ? img.uri : _this.pipPictureData.getPictureUrl(img.id)
                    };
                    _this.imagesSearchResult.push(newImage);
                });
            });
            _this.transaction.end();
        }, function (error) {
            _this.transaction.end(error);
            _this.$log.error(error);
        });
    };
    GallerySearchDialogController.prototype.onStopSearchClick = function () {
        this.transaction.abort();
        this.prevSearch = '';
    };
    GallerySearchDialogController.prototype.onKeyPress = function ($event) {
        if ($event.keyCode === 13) {
            this.onSearchClick();
        }
    };
    GallerySearchDialogController.prototype.onImageClick = function (image) {
        if (this.transaction.busy()) {
            return;
        }
        image.checked = !image.checked;
        if (this.multiple) {
            if (image.checked) {
                this.images.push(image);
            }
            else {
                _.remove(this.images, { url: image.url });
            }
        }
        else {
            if (image.checked) {
                if (this.images.length > 0) {
                    this.images[0].checked = false;
                    this.images[0] = image;
                }
                else {
                    this.images.push(image);
                }
            }
            else {
                this.images = [];
            }
        }
    };
    GallerySearchDialogController.prototype.onAddClick = function () {
        if (this.transaction.busy()) {
            return;
        }
        var result = [];
        this.images.forEach(function (image) {
            if (image.checked) {
                result.push(image.item);
            }
        });
        this.$mdDialog.hide(result);
    };
    GallerySearchDialogController.prototype.onCancelClick = function () {
        this.$mdDialog.cancel();
    };
    GallerySearchDialogController.prototype.addButtonDisabled = function () {
        return this.images.length == 0 || this.transaction.busy();
    };
    GallerySearchDialogController.prototype.focusSearchText = function () {
        setTimeout(function () {
            var element = $('.pip-gallery-search-dialog .search-images');
            if (element.length > 0) {
                element.focus();
            }
        }, 0);
    };
    return GallerySearchDialogController;
}(IGallerySearchDialogService_1.GallerySearchDialogParams));
angular
    .module('pipGallerySearchDialog')
    .config(ConfigGallerySearchDialogTranslations)
    .controller('pipGallerySearchController', GallerySearchDialogController);
},{"./IGallerySearchDialogService":28}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GallerySearchDialogService = (function () {
    GallerySearchDialogService.$inject = ['$mdDialog'];
    function GallerySearchDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    GallerySearchDialogService.prototype.show = function (params, successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'gallery_search_dialog/GallerySearchDialog.html',
            clickOutsideToClose: true,
            controller: 'pipGallerySearchController',
            controllerAs: '$ctrl',
            locals: params
        })
            .then(function (result) {
            if (successCallback) {
                successCallback(result);
            }
        });
    };
    return GallerySearchDialogService;
}());
angular
    .module('pipGallerySearchDialog')
    .service('pipGallerySearchDialog', GallerySearchDialogService);
},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GallerySearchDialogParams = (function () {
    function GallerySearchDialogParams() {
    }
    return GallerySearchDialogParams;
}());
exports.GallerySearchDialogParams = GallerySearchDialogParams;
},{}],29:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipGallerySearchDialog', ['ngMaterial', 'pipPictures.Templates', 'pipCommonRest']);
require("./IGallerySearchDialogService");
require("./GallerySearchDialogService");
require("./GallerySearchDialogController");
__export(require("./IGallerySearchDialogService"));
},{"./GallerySearchDialogController":26,"./GallerySearchDialogService":27,"./IGallerySearchDialogService":28}],30:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./data");
require("./rest");
require("./camera_dialog");
require("./add_image/AddImage");
require("./add_image/AddImageOption");
require("./add_image/AddImageResult");
require("./avatar/Avatar");
require("./avatar_edit/AvatarEdit");
require("./collage/Collage");
require("./gallery_search_dialog");
require("./picture/Picture");
require("./picture_edit/PictureEdit");
require("./picture_list_edit/PictureListEdit");
require("./picture_url_dialog");
require("./utilities");
angular
    .module('pipPictures', [
    'pipControls',
    'pipPictures.Data',
    'pipPictures.Rest',
    'pipCameraDialog',
    'pipGallerySearchDialog',
    'pipPictureUrlDialog',
    'pipAddImage',
    'pipAvatar',
    'pipPictureUtils',
    'pipPicturePaste',
    'pipAvatarEdit',
    'pipPicture',
    'pipPictureEdit',
    'pipCollage',
    'pipPictureListEdit',
]);
__export(require("./data"));
__export(require("./avatar_edit/AvatarEdit"));
__export(require("./add_image/AddImageOption"));
__export(require("./add_image/AddImageResult"));
__export(require("./gallery_search_dialog"));
__export(require("./picture_edit/PictureEdit"));
__export(require("./picture_list_edit/PictureListEdit"));
__export(require("./utilities"));
},{"./add_image/AddImage":4,"./add_image/AddImageOption":5,"./add_image/AddImageResult":6,"./avatar/Avatar":7,"./avatar_edit/AvatarEdit":8,"./camera_dialog":12,"./collage/Collage":13,"./data":25,"./gallery_search_dialog":29,"./picture/Picture":31,"./picture_edit/PictureEdit":32,"./picture_list_edit/PictureListEdit":33,"./picture_url_dialog":37,"./rest":41,"./utilities":45}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var PictureBindings = {
        src: '<?pipSrc',
        pictureId: '<?pipPictureId',
        pipPicture: '<?',
        defaultIcon: '<?pipDefaultIcon',
        pipRebind: '<?'
    };
    var PictureBindingsChanges = (function () {
        function PictureBindingsChanges() {
        }
        return PictureBindingsChanges;
    }());
    var PictureController = (function () {
        PictureController.$inject = ['$scope', '$rootScope', '$element', 'pipPictureUtils', 'pipPictureData'];
        function PictureController($scope, $rootScope, $element, pipPictureUtils, pipPictureData) {
            "ngInject";
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureUtils = pipPictureUtils;
            this.pipPictureData = pipPictureData;
            this.postLink = false;
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.$element.addClass('pip-picture');
        }
        PictureController.prototype.$postLink = function () {
            this.imageElement = this.$element.children('img');
            this.defaultBlock = this.$element.children('div');
            this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
            this.postLink = true;
            this.bindControl();
        };
        PictureController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            var isDataChange = false;
            if (this.pipRebind) {
                if (changes.src && changes.src.currentValue !== changes.src.previousValue) {
                    this.src = changes.src.currentValue;
                    isDataChange = true;
                }
                if (changes.pictureId && changes.pictureId.currentValue !== changes.pictureId.previousValue) {
                    this.pictureId = changes.pictureId.currentValue;
                    isDataChange = true;
                }
                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, changes.pipPicture.previousValue)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    isDataChange = true;
                }
                if (changes.defaultIcon && changes.defaultIcon.currentValue !== changes.defaultIcon.previousValue) {
                    this.defaultIcon = changes.defaultIcon.currentValue;
                    this.defaultIcon = this.defaultIcon ? this.defaultIcon : this.pipPictureData.DefaultErrorIcon;
                }
            }
            if (isDataChange && this.postLink) {
                this.bindControl();
            }
        };
        PictureController.prototype.onImageError = function ($event) {
            var _this = this;
            if (this.pipPictureData.ShowErrorIcon) {
                this.$scope.$apply(function () {
                    _this.imageElement.css('display', 'none');
                    _this.defaultBlock.css('display', 'block');
                });
            }
            else {
                this.$scope.$apply(function () {
                    _this.defaultBlock.css('display', 'none');
                });
            }
        };
        PictureController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            this.pipPictureUtils.setImageMarginCSS(this.$element, image);
            this.$element.children('div').css('display', 'none');
        };
        PictureController.prototype.bindControl = function () {
            var url;
            if (this.pictureId) {
                url = this.pipPictureData.getPictureUrl(this.pictureId);
                this.imageElement.attr('src', url);
            }
            else if (this.src) {
                this.imageElement.attr('src', this.src);
            }
            else if (this.pipPicture) {
                url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPictureData.getPictureUrl(this.pipPicture.id);
                this.imageElement.attr('src', url);
            }
        };
        return PictureController;
    }());
    var PictureComponent = {
        bindings: PictureBindings,
        template: '<img ui-event="{ error: \'$ctrl.onImageError($event)\', load: \'$ctrl.onImageLoad($event)\' }"/>'
            + '<div class="pip-picture-error"><md-icon md-svg-icon="icons:{{$ctrl.defaultIcon}}"></md-icon><div class="pip-default-text"><span>{{ $ctrl.errorText | translate }}</span></div></div>',
        controller: PictureController
    };
    angular
        .module('pipPicture', [])
        .component('pipPicture', PictureComponent);
}
},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var PictureEditControl = (function () {
    function PictureEditControl() {
        this.disabled = false;
        this.url = '';
        this.progress = 0;
        this.uploaded = false;
        this.uploading = false;
        this.upload = false;
        this.loaded = false;
        this.file = null;
        this.state = PictureStates.Original;
    }
    return PictureEditControl;
}());
exports.PictureEditControl = PictureEditControl;
var PictureStates = (function () {
    function PictureStates() {
    }
    return PictureStates;
}());
PictureStates.Original = 'original';
PictureStates.Copied = 'copied';
PictureStates.Changed = 'changed';
PictureStates.Deleted = 'deleted';
PictureStates.Error = 'error';
exports.PictureStates = PictureStates;
{
    var ConfigPictureEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            ERROR_WRONG_IMAGE_FILE: 'Incorrect image file. Please, choose another one',
            PICTURE_EDIT_TEXT: 'Click here to upload a picture',
            PICTURE_ERROR_LOAD: 'Error image loading'
        });
        pipTranslateProvider.translations('ru', {
            ERROR_WRONG_IMAGE_FILE: 'Неправильный файл с изображением. Выберете другой файл',
            PICTURE_EDIT_TEXT: 'Нажмите сюда для загрузки картинки',
            PICTURE_ERROR_LOAD: 'Ошибка загрузки картинки'
        });
    };
    ConfigPictureEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var PictureEvent = (function () {
        function PictureEvent() {
        }
        return PictureEvent;
    }());
    var PictureEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pipPictureId: '=?',
        pipPicture: '=?',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var PictureEditBindingsChanges = (function () {
        function PictureEditBindingsChanges() {
        }
        return PictureEditBindingsChanges;
    }());
    var PictureEditController = (function () {
        PictureEditController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureData', 'pipPictureUtils', '$timeout', 'pipFileUpload'];
        function PictureEditController($log, $scope, $rootScope, $element, pipPictureData, pipPictureUtils, $timeout, pipFileUpload) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureData = pipPictureData;
            this.pipPictureUtils = pipPictureUtils;
            this.$timeout = $timeout;
            this.pipFileUpload = pipFileUpload;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.pictureStartState = this.pipAddedPicture ? PictureStates.Copied : PictureStates.Original;
            this.text = this.text || 'PICTURE_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.multiUpload = false;
            this.control = new PictureEditControl();
            this.control.state = this.pictureStartState;
            this.control.reset = function (afterDeleting) {
                _this.resetImage(afterDeleting);
            };
            this.control.save = function (successCallback, errorCallback) {
                _this.saveImage(successCallback, errorCallback);
            };
            this.control.abort = function () {
                _this.abort();
            };
            $element.addClass('pip-picture-edit');
        }
        PictureEditController.prototype.$postLink = function () {
            this.controlElement = this.$element.children('.pip-picture-upload');
            this.inputElement = this.controlElement.children('input[type=file]');
            this.control.reset();
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        PictureEditController.prototype.abort = function () {
            if (this.control.uploading) {
                this.control.uploaded = false;
                this.control.uploading = false;
                this.control.progress = 0;
                this.control.upload = null;
            }
        };
        PictureEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            var change = false;
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
                this.control.disabled = this.ngDisabled;
                if (this.inputElement) {
                    this.inputElement.attr('disabled', this.control.disabled);
                }
            }
            if (this.pipRebind) {
                if (changes.pipPictureId && changes.pipPictureId.currentValue !== this.pipPictureId) {
                    this.pipPictureId = changes.pipPictureId.currentValue;
                    change = true;
                }
            }
            if (this.pipRebind) {
                if (changes.pipPicture && !_.isEqual(changes.pipPicture.currentValue, this.pipPicture)) {
                    this.pipPicture = changes.pipPicture.currentValue;
                    change = true;
                }
            }
            if (change) {
                this.control.reset();
            }
        };
        PictureEditController.prototype.resetImage = function (afterDeleting) {
            this.control.progress = 0;
            this.control.uploading = false;
            this.control.uploaded = false;
            this.control.file = null;
            this.control.state = this.pictureStartState;
            this.control.url = '';
            this.control.uri = null;
            this.control.name = null;
            this.control.uriData = null;
            this.control.id = null;
            var url = '';
            if (!afterDeleting) {
                if (this.pipPictureId) {
                    url = this.pipPictureData.getPictureUrl(this.pipPictureId);
                }
                else if (this.pipPicture) {
                    url = this.pipPicture.uri ? this.pipPicture.uri : this.pipPicture.id ? this.pipPictureData.getPictureUrl(this.pipPicture.id) : null;
                    this.control.uri = this.pipPicture.uri;
                    this.control.name = this.pipPicture.name;
                    this.control.id = this.pipPicture.id;
                }
                if (!url)
                    return;
                this.control.url = url;
                this.control.uploaded = true;
                this.onChange();
            }
            else {
                this.onChange();
            }
        };
        PictureEditController.prototype.onFocus = function () {
            var _this = this;
            this.pipPicturePaste.addPasteListener(function (item) {
                _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        };
        PictureEditController.prototype.onBlur = function () {
            this.pipPicturePaste.removePasteListener();
        };
        ;
        PictureEditController.prototype.savePicture = function (successCallback, errorCallback) {
            var _this = this;
            if (this.control.id) {
                this.control.uploading = false;
                this.pipPicture = {
                    id: this.control.id,
                    uri: this.control.uri,
                    name: this.control.name
                };
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                if (successCallback) {
                    successCallback(this.pipPicture);
                }
            }
            else if (this.control.file !== null) {
                this.control.uploading = true;
                this.pipFileUpload.upload(this.control.file, this.pipPictureData.postPictureUrl(), function (data, error) {
                    if (!error) {
                        _this.pipPictureId = data.id;
                        _this.pipPicture = {
                            id: data.id,
                            uri: null,
                            name: data.name
                        };
                        _this.pictureStartState = PictureStates.Original;
                        _this.control.reset();
                        if (successCallback) {
                            successCallback(_this.pipPicture);
                        }
                    }
                    else {
                        _this.control.uploading = false;
                        _this.control.upload = false;
                        _this.control.progress = 0;
                        _this.pictureStartState = PictureStates.Error;
                        if (errorCallback) {
                            errorCallback(error);
                        }
                        else {
                            _this.$log.error(error);
                        }
                    }
                }, function (state, progress) {
                    _this.control.progress = progress;
                });
            }
            else if (this.control.uri && this.pipPicture) {
                this.control.uploading = false;
                if (this.control.uri) {
                    this.pipPicture = {
                        id: this.control.id,
                        uri: this.control.uri,
                        name: this.control.name
                    };
                    this.pictureStartState = PictureStates.Original;
                    this.control.reset();
                    if (successCallback) {
                        successCallback(this.pipPicture);
                    }
                }
            }
        };
        PictureEditController.prototype.deletePicture = function (successCallback, errorCallback) {
            var _this = this;
            if (this.pipPictureId) {
                this.pipPictureData.deletePicture(this.pipPictureId, function () {
                    _this.pipPictureId = null;
                    _this.control.reset(true);
                    if (successCallback)
                        successCallback();
                }, function (error) {
                    _this.control.uploading = false;
                    _this.control.upload = false;
                    _this.control.progress = 0;
                    _this.control.state = PictureStates.Error;
                    if (errorCallback) {
                        errorCallback(error);
                    }
                    else {
                        _this.$log.error(error);
                    }
                });
            }
            else {
                this.control.uploading = false;
                this.pipPicture = {
                    id: null,
                    uri: null,
                    name: null
                };
                this.control.reset(true);
                if (successCallback)
                    successCallback(this.pipPicture);
            }
        };
        PictureEditController.prototype.saveImage = function (successCallback, errorCallback) {
            if (this.control.state == PictureStates.Changed) {
                this.savePicture(successCallback, errorCallback);
            }
            else if (this.control.state == PictureStates.Deleted) {
                this.deletePicture(successCallback, errorCallback);
            }
            else if (this.control.state == PictureStates.Copied) {
                this.pipPicture = {
                    id: this.control.id,
                    name: this.control.name,
                    uri: this.control.uri
                };
                this.pictureStartState = PictureStates.Original;
                this.control.reset();
                successCallback(this.pipPicture);
            }
            else {
                if (successCallback) {
                    if (this.pipPicture) {
                        successCallback(this.pipPicture);
                    }
                    else {
                        successCallback(this.pipPictureId);
                    }
                }
            }
        };
        PictureEditController.prototype.empty = function () {
            return (this.control.url == '' && !this.control.uploading);
        };
        PictureEditController.prototype.isUpdated = function () {
            return this.control.state != PictureStates.Original;
        };
        PictureEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            if (picture) {
                this.control.file = null;
                this.control.name = picture.name;
                this.control.uri = picture.uri;
                this.control.id = picture.id;
                this.control.uriData = null;
                this.control.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                this.control.state == PictureStates.Copied;
            }
            else {
                this.control.file = file;
                this.control.name = file ? file.name : url ? url.split('/').pop() : null;
                this.control.url = !file && url ? url : uriData ? uriData : '';
                this.control.uri = !file && url ? url : null;
                this.control.uriData = uriData;
                this.control.id = null;
                this.control.state = PictureStates.Changed;
            }
            this.onChange();
        };
        PictureEditController.prototype.onDeleteClick = function ($event) {
            $event.stopPropagation();
            this.controlElement.focus();
            this.control.file = null;
            this.control.url = '';
            this.control.uri = null;
            this.control.uriData = null;
            this.control.name = null;
            this.control.id = null;
            if (this.control.state != PictureStates.Copied)
                this.control.state = PictureStates.Deleted;
            this.onChange();
        };
        PictureEditController.prototype.onKeyDown = function ($event) {
            var _this = this;
            if ($event.keyCode == 13 || $event.keyCode == 32) {
                setTimeout(function () {
                    _this.controlElement.trigger('click');
                }, 0);
            }
            else if ($event.keyCode == 46 || $event.keyCode == 8) {
                this.control.file = null;
                this.control.url = '';
                this.control.state = PictureStates.Deleted;
                this.onChange();
            }
            else if ($event.keyCode == 27) {
                this.control.reset();
            }
        };
        PictureEditController.prototype.onImageError = function ($event) {
            var _this = this;
            this.$scope.$apply(function () {
                _this.control.url = '';
                var image = $($event.target);
                _this.control.state = PictureStates.Error;
                _this.pipPictureUtils.setErrorImageCSS(image, { width: 'auto', height: '100%' });
            });
        };
        PictureEditController.prototype.onImageLoad = function ($event) {
            var image = $($event.target);
            var container = {};
            container.clientWidth = 80;
            container.clientHeight = 80;
            this.pipPictureUtils.setImageMarginCSS(container, image);
            this.control.uploading = false;
        };
        PictureEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        return PictureEditController;
    }());
    var PictureEditComponent = {
        bindings: PictureEditBindings,
        templateUrl: 'picture_edit/PictureEdit.html',
        controller: PictureEditController
    };
    angular
        .module('pipPictureEdit', ['ui.event', 'pipPicturePaste',
        'pipTranslate', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureEditTranslations)
        .component('pipPictureEdit', PictureEditComponent);
}
},{"../utilities/PicturePaste":43}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste_1 = require("../utilities/PicturePaste");
var async = require('async');
var PictureListEditItem = (function () {
    function PictureListEditItem() {
    }
    return PictureListEditItem;
}());
exports.PictureListEditItem = PictureListEditItem;
var PictureListEditControl = (function () {
    function PictureListEditControl() {
        this.uploading = 0;
    }
    return PictureListEditControl;
}());
exports.PictureListEditControl = PictureListEditControl;
var PictureListEditStates = (function () {
    function PictureListEditStates() {
    }
    return PictureListEditStates;
}());
PictureListEditStates.Added = 'added';
PictureListEditStates.Original = 'original';
PictureListEditStates.Copied = 'copied';
PictureListEditStates.Changed = 'changed';
PictureListEditStates.Deleted = 'deleted';
PictureListEditStates.Error = 'error';
exports.PictureListEditStates = PictureListEditStates;
var PictureUploadErrors = (function () {
    function PictureUploadErrors() {
    }
    return PictureUploadErrors;
}());
exports.PictureUploadErrors = PictureUploadErrors;
{
    var ConfigPictureListEditTranslations = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'PICTURE_LIST_EDIT_TEXT': 'Click here to add a picture',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Transaction is in progress. Please, wait until it is finished or abort',
            'ERROR_IMAGE_PRELOADING': 'Image loading error. The picture can not be saved'
        });
        pipTranslateProvider.translations('ru', {
            'PICTURE_LIST_EDIT_TEXT': 'Нажмите сюда чтобы добавить картинку',
            'ERROR_TRANSACTION_IN_PROGRESS': 'Транзакция еще не завершена. Подождите окончания или прервите её',
            'ERROR_IMAGE_PRELOADING': 'Ошибка при загрузки картинки. Картинка не сохранена.'
        });
    };
    ConfigPictureListEditTranslations.$inject = ['pipTranslateProvider'];
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var PictureEvent = (function () {
        function PictureEvent() {
        }
        return PictureEvent;
    }());
    var PictureListEditBindings = {
        ngDisabled: '<?',
        pipCreated: '&?',
        pipChanged: '&?',
        pictures: '=?pipPictures',
        pipAddedPicture: '&?',
        text: '<?pipDefaultText',
        icon: '<?pipDefaultIcon',
        pipRebind: '<?',
    };
    var PictureListEditBindingsChanges = (function () {
        function PictureListEditBindingsChanges() {
        }
        return PictureListEditBindingsChanges;
    }());
    var PictureListEditController = (function () {
        PictureListEditController.$inject = ['$log', '$scope', '$rootScope', '$element', 'pipPictureUtils', '$timeout', 'pipFileUpload', 'pipRest', 'pipPictureData'];
        function PictureListEditController($log, $scope, $rootScope, $element, pipPictureUtils, $timeout, pipFileUpload, pipRest, pipPictureData) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.pipPictureUtils = pipPictureUtils;
            this.$timeout = $timeout;
            this.pipFileUpload = pipFileUpload;
            this.pipRest = pipRest;
            this.pipPictureData = pipPictureData;
            this.itemPin = 0;
            this.pipPicturePaste = new PicturePaste_1.PicturePaste($timeout);
            this.pictureStartState = this.toBoolean(this.pipAddedPicture) ? PictureListEditStates.Copied : PictureListEditStates.Original;
            this.text = this.text || 'PICTURE_LIST_EDIT_TEXT';
            this.icon = this.icon || 'picture-no-border';
            this.errorText = 'PICTURE_ERROR_LOAD';
            this.control = new PictureListEditControl();
            this.control.uploading = 0;
            this.control.items = [];
            this.control.reset = function () {
                _this.reset();
            };
            this.control.save = function (successCallback, errorCallback) {
                _this.save(successCallback, errorCallback);
            };
            this.control.abort = function () {
                _this.abort();
            };
            $element.addClass('pip-picture-list-edit');
        }
        PictureListEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        PictureListEditController.prototype.filterItem = function (item) {
            return item.state != PictureListEditStates.Deleted;
        };
        PictureListEditController.prototype.$postLink = function () {
            this.controlElement = this.$element.find('.pip-picture-drop');
            this.control.reset();
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        PictureListEditController.prototype.removeItem = function (item) {
            if (item.state === PictureListEditStates.Added || item.state === PictureListEditStates.Copied) {
                var index = _.findIndex(this.control.items, { pin: item.pin });
                if (index > -1) {
                    this.control.items.splice(index, 1);
                }
            }
            else {
                item.state = PictureListEditStates.Deleted;
            }
        };
        PictureListEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (this.pipRebind) {
                if (changes.pictures && !_.isEqual(changes.pictures.currentValue, this.pictures)) {
                    this.pictures = changes.pictures.currentValue;
                    this.control.reset();
                }
            }
            this.pictures = this.pictures ? this.pictures : [];
        };
        PictureListEditController.prototype.onImageError = function ($event, item) {
            item.state = PictureListEditStates.Error;
            item.url = '';
        };
        PictureListEditController.prototype.onFocus = function () {
            var _this = this;
            this.pipPicturePaste.addPasteListener(function (item) {
                _this.readItemLocally(item.url, item.uriData, item.file, item.picture);
            });
        };
        PictureListEditController.prototype.onBlur = function () {
            this.pipPicturePaste.removePasteListener();
        };
        PictureListEditController.prototype.getItems = function () {
            var items = [];
            var i;
            if (this.pictures == null || this.pictures.length == 0) {
                return items;
            }
            for (i = 0; i < this.pictures.length; i++) {
                var newItem = {
                    pin: this.itemPin++,
                    id: this.pictures[i].id,
                    name: this.pictures[i].name,
                    uri: this.pictures[i].uri,
                    uriData: null,
                    uploading: false,
                    uploaded: false,
                    progress: 0,
                    file: null,
                    url: this.pictures[i].id ? this.pipPictureData.getPictureUrl(this.pictures[i].id) : this.pictures[i].uri,
                    state: this.pictureStartState
                };
                items.push(newItem);
            }
            return items;
        };
        PictureListEditController.prototype.setItems = function () {
            var i;
            if (this.pictures && this.pictures.length > 0) {
                this.pictures.splice(0, this.pictures.length);
            }
            for (i = 0; i < this.control.items.length; i++) {
                var item = this.control.items[i];
                if ((item.id || item.uri) && item.state != PictureListEditStates.Deleted) {
                    var newPic = {
                        id: item.id,
                        name: item.name,
                        uri: item.uri
                    };
                    this.pictures.push(newPic);
                }
            }
        };
        PictureListEditController.prototype.reset = function () {
            if (!this.controlElement) {
                return;
            }
            this.control.uploading = 0;
            this.control.items = this.getItems();
        };
        PictureListEditController.prototype.addItem = function (oldItem, fileInfo, error) {
            var itemIndex = _.findIndex(this.control.items, { pin: oldItem.pin });
            if (itemIndex < 0)
                return;
            if (error) {
                this.control.items[itemIndex].uploaded = false;
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].state = PictureListEditStates.Error;
            }
            else {
                if (fileInfo) {
                    this.control.items[itemIndex].id = fileInfo.id;
                    this.control.items[itemIndex].name = fileInfo.name;
                    this.control.items[itemIndex].uploaded = true;
                    this.control.items[itemIndex].state = PictureListEditStates.Original;
                }
                else {
                    this.control.items[itemIndex].uploaded = false;
                }
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].uriData = null;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].file = null;
            }
        };
        PictureListEditController.prototype.deleteItem = function (item, callback) {
            if (item.upload) {
                item.upload.abort();
                item.upload = null;
            }
            if (item.state != PictureListEditStates.Deleted) {
                return;
            }
            this.removeItem(item);
            callback();
        };
        PictureListEditController.prototype.save = function (successCallback, errorCallback) {
            var _this = this;
            var item;
            var onItemCallback;
            var i;
            if (this.control.uploading) {
                if (errorCallback) {
                    errorCallback('ERROR_TRANSACTION_IN_PROGRESS');
                }
                return;
            }
            this.cancelQuery = null;
            this.control.error = null;
            this.control.uploading = 0;
            var addedBlobCollection = [];
            var addedUrlCollection = [];
            _.each(this.control.items, function (item) {
                if (item.state == 'added') {
                    if (item.file) {
                        addedBlobCollection.push(item);
                    }
                    else {
                        addedUrlCollection.push(item);
                    }
                }
            });
            var deletedCollection = _.filter(this.control.items, { state: 'deleted' });
            _.each(addedUrlCollection, function (item) {
                item.uploaded = true;
                item.uploading = false;
                item.progress = 0;
                item.upload = null;
                item.uriData = null;
                item.file = null;
                item.state = PictureListEditStates.Original;
            });
            if (!addedBlobCollection.length && !deletedCollection.length) {
                if (addedUrlCollection.length > 0) {
                    this.setItems();
                }
                this.control.uploading = 0;
                if (successCallback) {
                    successCallback(this.pictures);
                }
                return;
            }
            this.control.uploading = addedBlobCollection.length + deletedCollection.length;
            async.parallel([
                function (callbackAll) {
                    _.each(addedBlobCollection, function (item) {
                        item.uploading = true;
                        item.progress = 0;
                    });
                    _this.pipFileUpload.multiUpload(_this.pipPictureData.postPictureUrl(), addedBlobCollection, function (index, data, err) {
                        var item = addedBlobCollection[index];
                        _this.addItem(item, data, err);
                        if (err) {
                            _this.control.error = true;
                        }
                    }, function (index, state, progress) {
                        var item = addedBlobCollection[index];
                        item.progress = progress;
                    }, function (error, result, res) {
                        _this.cancelQuery = null;
                        callbackAll();
                    }, function (cancelQuery) {
                        _this.cancelQuery = cancelQuery;
                    }, false, 'pin');
                },
                function (callbackAll) {
                    if (deletedCollection.length) {
                        async.each(deletedCollection, function (item, callback) {
                            _this.deleteItem(item, function (error) { callback(); });
                        }, function (error, result) {
                            callbackAll();
                        });
                    }
                    else {
                        callbackAll();
                    }
                }
            ], function (error, results) {
                if (error && !_this.control.error) {
                    _this.control.error = error;
                }
                if (_this.control.error) {
                    _this.control.uploading = 0;
                    var errors = _this.getUploadErors();
                    if (errorCallback) {
                        errorCallback(errors);
                    }
                    else {
                        _this.$log.error(errors);
                    }
                }
                else {
                    _this.setItems();
                    _this.control.uploading = 0;
                    if (successCallback) {
                        successCallback(_this.pictures);
                    }
                }
            });
        };
        PictureListEditController.prototype.getUploadErors = function () {
            var errors = [];
            _.each(this.control.items, function (item) {
                if (item.state == PictureListEditStates.Error || item.state == PictureListEditStates.Error) {
                    errors.push({
                        id: item.id,
                        uri: item.uri,
                        name: item.name
                    });
                }
            });
            return errors;
        };
        PictureListEditController.prototype.abort = function () {
            var i;
            for (i = 0; i < this.control.items.length; i++) {
                var item = this.control.items[i];
                if (item.uploading) {
                    if (item.upload) {
                        item.upload.abort();
                    }
                    item.uploaded = false;
                    item.uploading = false;
                    item.progress = 0;
                    item.upload = null;
                }
            }
            if (this.cancelQuery) {
                this.cancelQuery.resolve();
            }
            this.control.uploading = 0;
            this.control.error = true;
        };
        PictureListEditController.prototype.readItemLocally = function (url, uriData, file, picture) {
            var item = new PictureListEditItem();
            item.pin = this.itemPin++;
            item.uploading = false;
            item.uploaded = false;
            item.progress = 0;
            if (picture) {
                item.file = null;
                item.name = picture.name;
                item.uri = picture.uri;
                item.id = picture.id;
                item.uriData = null;
                item.url = picture.uri ? picture.uri : picture.id ? this.pipPictureData.getPictureUrl(picture.id) : '';
                item.state == PictureListEditStates.Copied;
            }
            else {
                item.file = file;
                item.name = file ? file.name : url ? url.split('/').pop() : null;
                item.url = !file && url ? url : uriData ? uriData : '';
                item.uri = !file && url ? url : null;
                item.uriData = uriData;
                item.id = null;
                item.state = PictureListEditStates.Added;
            }
            this.control.items.push(item);
            this.onChange();
        };
        PictureListEditController.prototype.onSelectClick = function ($files) {
            var i;
            this.controlElement.focus();
            if ($files == null || $files.length == 0) {
                return;
            }
            for (i = 0; i < $files.length; i++) {
                var file = $files[i];
                if (file.type.indexOf('image') > -1) {
                    this.readItemLocally('', null, file, null);
                }
            }
        };
        PictureListEditController.prototype.onDeleteClick = function (item) {
            this.removeItem(item);
            this.onChange();
        };
        PictureListEditController.prototype.onKeyDown = function ($event, item) {
            var _this = this;
            if (item) {
                if ($event.keyCode == 46 || $event.keyCode == 8) {
                    if (item.state == PictureListEditStates.Added) {
                        this.removeItem(item);
                    }
                    else {
                        item.state = PictureListEditStates.Deleted;
                    }
                    this.onChange();
                }
            }
            else {
                if ($event.keyCode == 13 || $event.keyCode == 32) {
                    setTimeout(function () {
                        _this.controlElement.trigger('click');
                    }, 0);
                }
            }
        };
        PictureListEditController.prototype.onImageLoad = function ($event, item) {
            var _this = this;
            setTimeout(function () {
                var image = $($event.target);
                var container = {};
                container.clientWidth = 80;
                container.clientHeight = 80;
                _this.pipPictureUtils.setImageMarginCSS(container, image);
            }, 250);
            item.loaded = true;
        };
        PictureListEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        return PictureListEditController;
    }());
    var PictureListEditComponent = {
        bindings: PictureListEditBindings,
        templateUrl: 'picture_list_edit/PictureListEdit.html',
        controller: PictureListEditController
    };
    angular
        .module('pipPictureListEdit', ['ui.event', 'pipPicturePaste',
        'pipFocused', 'angularFileUpload', 'pipPictures.Templates'])
        .config(ConfigPictureListEditTranslations)
        .component('pipPictureListEdit', PictureListEditComponent);
}
},{"../utilities/PicturePaste":43,"async":1}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],35:[function(require,module,exports){
var ConfigPictureUrlDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'PICTURE_FROM_WEBLINK': 'Add from web link',
        'LINK_PICTURE': 'Link to the picture...'
    });
    pipTranslateProvider.translations('ru', {
        'PICTURE_FROM_WEBLINK': 'Добавить из веб ссылки',
        'LINK_PICTURE': 'Ссылка на изображение...'
    });
};
ConfigPictureUrlDialogTranslations.$inject = ['pipTranslateProvider'];
var PictureUrlDialogController = (function () {
    PictureUrlDialogController.$inject = ['$log', '$scope', '$mdDialog', '$rootScope', '$timeout', '$mdMenu', 'pipPictureUtils'];
    function PictureUrlDialogController($log, $scope, $mdDialog, $rootScope, $timeout, $mdMenu, pipPictureUtils) {
        "ngInject";
        this.$log = $log;
        this.$scope = $scope;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$mdMenu = $mdMenu;
        this.pipPictureUtils = pipPictureUtils;
        this.url = '';
        this.invalid = true;
        this.theme = this.$rootScope[pip.themes.ThemeRootVar];
    }
    PictureUrlDialogController.prototype.setImageSize = function (img) {
        var imageWidth = img.width();
        var imageHeight = img.height();
        var cssParams = {};
        if ((imageWidth) > (imageHeight)) {
            cssParams['width'] = '250px';
            cssParams['height'] = 'auto';
        }
        else {
            cssParams['width'] = 'auto';
            cssParams['height'] = '250px';
        }
        img.css(cssParams);
    };
    PictureUrlDialogController.prototype.checkUrl = function () {
        var _this = this;
        var img = $("img#url_image")
            .on('error', function () {
            _this.invalid = true;
            _this.$scope.$apply();
        })
            .on('load', function (e) {
            _this.invalid = false;
            _this.setImageSize(img);
            _this.$scope.$apply();
        })
            .attr("src", this.url);
    };
    ;
    PictureUrlDialogController.prototype.onCancelClick = function () {
        this.$mdDialog.cancel();
    };
    ;
    PictureUrlDialogController.prototype.onAddClick = function () {
        this.$mdDialog.hide(this.url);
    };
    ;
    return PictureUrlDialogController;
}());
angular
    .module('pipPictureUrlDialog')
    .config(ConfigPictureUrlDialogTranslations)
    .controller('pipPictureUrlDialogController', PictureUrlDialogController);
},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PictureUrlDialogService = (function () {
    PictureUrlDialogService.$inject = ['$mdDialog'];
    function PictureUrlDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    PictureUrlDialogService.prototype.show = function (successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'picture_url_dialog/PictureUrlDialog.html',
            clickOutsideToClose: true,
            controller: 'pipPictureUrlDialogController',
            controllerAs: '$ctrl'
        })
            .then(function (result) {
            if (successCallback) {
                successCallback(result);
            }
        });
    };
    return PictureUrlDialogService;
}());
angular
    .module('pipPictureUrlDialog')
    .service('pipPictureUrlDialog', PictureUrlDialogService);
},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipPictureUrlDialog', ['ngMaterial', 'pipPictures.Templates']);
require("./IPictureUrlDialogService");
require("./PictureUrlDialogService");
require("./PictureUrlDialogController");
},{"./IPictureUrlDialogService":34,"./PictureUrlDialogController":35,"./PictureUrlDialogService":36}],38:[function(require,module,exports){
configAvatarResources.$inject = ['pipRestProvider'];
function configAvatarResources(pipRestProvider) {
    pipRestProvider.registerOperation('avatars', '/api/1.0/avatars/:avatar_id');
}
angular
    .module('pipPictures.Rest')
    .config(configAvatarResources);
},{}],39:[function(require,module,exports){
configImageSetResources.$inject = ['pipRestProvider'];
function configImageSetResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('imagesets', '/api/1.0/imagesets/:imageset_id', { imageset_id: '@imageset_id' }, {
        page: { method: 'GET', isArray: false },
        update: { method: 'PUT' }
    });
}
angular
    .module('pipPictures.Rest')
    .config(configImageSetResources);
},{}],40:[function(require,module,exports){
configPictureResources.$inject = ['pipRestProvider'];
function configPictureResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('picture', '/api/1.0/blobs/:picture_id', { blob_id: '@picture_id' }, {
        page: { method: 'GET', isArray: false },
        update: { method: 'PUT' }
    });
    pipRestProvider.registerResource('picturesInfo', '/api/1.0/blobs/:picture_id/info');
}
angular
    .module('pipPictures.Rest')
    .config(configPictureResources);
},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipPictures.Rest', []);
require("./PictureResources");
require("./ImageSetResources");
require("./AvatarResources");
},{"./AvatarResources":38,"./ImageSetResources":39,"./PictureResources":40}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var imageCssParams = (function () {
    function imageCssParams() {
    }
    return imageCssParams;
}());
exports.imageCssParams = imageCssParams;
},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PicturePaste = (function () {
    PicturePaste.$inject = ['$timeout'];
    function PicturePaste($timeout) {
        "ngInject";
        this.$timeout = $timeout;
    }
    PicturePaste.prototype.addPasteListener = function (onPaste) {
        var _this = this;
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                this.removePasteListener();
            }
            this.pasteCatcher = document.createElement("div");
            this.pasteCatcher.setAttribute("contenteditable", "true");
            $(this.pasteCatcher).css({
                "position": "absolute",
                "left": "-999",
                width: "0",
                height: "0",
                "overflow": "hidden",
                outline: 0
            });
            document.body.appendChild(this.pasteCatcher);
        }
        $(document).on('paste', function (event) {
            var localEvent;
            if (event['clipboardData'] == null && event.originalEvent) {
                localEvent = event.originalEvent;
            }
            else {
                localEvent = event;
            }
            if (localEvent.clipboardData) {
                var items = localEvent.clipboardData.items;
                _.each(items, function (item) {
                    if (item.type.indexOf("image") != -1) {
                        var file = item.getAsFile();
                        var fileReader = new FileReader();
                        fileReader.onload = function (e) {
                            _this.$timeout(function () {
                                onPaste({ url: e.target['result'], file: file });
                            });
                        };
                        fileReader.readAsDataURL(file);
                    }
                });
            }
            else if (window['clipboardData'] && window['clipboardData'].files) {
                _.each(window['clipboardData'].files, function (file) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        _this.$timeout(function () {
                            onPaste({ url: e.target['result'], file: file });
                        });
                    };
                    fileReader.readAsDataURL(file);
                });
            }
        });
    };
    PicturePaste.prototype.removePasteListener = function () {
        if (!window['Clipboard']) {
            if (this.pasteCatcher !== null && this.pasteCatcher !== undefined) {
                document.body.removeChild(this.pasteCatcher);
                this.pasteCatcher = null;
            }
        }
        $(document).off('paste');
    };
    return PicturePaste;
}());
exports.PicturePaste = PicturePaste;
angular
    .module('pipPicturePaste', []);
},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var collageSchemes = [
    [
        { flex: 100, fullWidth: true, fullHeight: true }
    ],
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                { flex: 50, fullHeight: true, leftPadding: true }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullHeight: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true, rightPadding: true },
                { flex: 33, fullHeight: true, leftPadding: true }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 70, fullHeight: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 30,
                    fullHeight: true,
                    children: [
                        { flex: 50, leftPadding: true, bottomPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, bottomPadding: true },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, rightPadding: true, topPadding: true },
                        { flex: 50, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 30, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 70,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 50, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 100, fullWidth: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 33, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 67,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 50, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 50, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 33, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 50, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullHeight: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        },
        {
            group: true,
            layout: 'row',
            flex: 100,
            fullHeight: true,
            children: [
                { flex: 25, fullWidth: true, rightPadding: true },
                {
                    group: true,
                    layout: 'column',
                    flex: 75,
                    fullHeight: true,
                    children: [
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, bottomPadding: true }
                            ]
                        },
                        {
                            group: true,
                            layout: 'row',
                            flex: 50,
                            fullHeight: true,
                            children: [
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                                { flex: 33, fullWidth: true, leftPadding: true, topPadding: true }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    [
        {
            group: true,
            layout: 'column',
            flex: 100,
            fullHeight: true,
            fullWidth: true,
            children: [
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, bottomPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, bottomPadding: true }
                    ]
                },
                {
                    group: true,
                    layout: 'row',
                    flex: 50,
                    fullWidth: true,
                    children: [
                        { flex: 25, fullWidth: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, rightPadding: true, topPadding: true },
                        { flex: 25, fullWidth: true, leftPadding: true, topPadding: true }
                    ]
                }
            ]
        }
    ]
];
var PictureUtils = (function () {
    function PictureUtils() {
        "ngInject";
    }
    PictureUtils.prototype.getCollageSchemes = function () {
        return collageSchemes;
    };
    PictureUtils.prototype.setErrorImageCSS = function (image, params) {
        var cssParams = {
            'width': '',
            'margin-left': '',
            'height': '',
            'margin-top': ''
        };
        if (params) {
            cssParams = _.assign(cssParams, params);
        }
        if (image) {
            image.css(cssParams);
        }
    };
    PictureUtils.prototype.setImageMarginCSS = function ($element, image, params) {
        var containerWidth = $element.width ? $element.width() : $element.clientWidth;
        var containerHeight = $element.height ? $element.height() : $element.clientHeight;
        var imageWidth = image[0].naturalWidth || image.width;
        var imageHeight = image[0].naturalHeight || image.height;
        var margin = 0;
        var cssParams = {};
        if ((imageWidth / containerWidth) > (imageHeight / containerHeight)) {
            margin = -((imageWidth / imageHeight * containerHeight - containerWidth) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
            cssParams['height'] = '' + containerHeight + 'px';
            cssParams['width'] = '' + imageWidth * containerHeight / imageHeight + 'px';
            cssParams['margin-top'] = '';
        }
        else {
            margin = -((imageHeight / imageWidth * containerWidth - containerHeight) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
            cssParams['height'] = '' + imageHeight * containerWidth / imageWidth + 'px';
            cssParams['width'] = '' + containerWidth + 'px';
            cssParams['margin-left'] = '';
        }
        if (params) {
            cssParams = _.assign(cssParams, params);
        }
        image.css(cssParams);
    };
    PictureUtils.prototype.setIconMarginCSS = function (container, icon) {
        var containerWidth = container.clientWidth ? container.clientWidth : container.width;
        var containerHeight = container.clientHeight ? container.clientHeight : container.height;
        var margin = 0;
        var iconSize = containerWidth > containerHeight ? containerHeight : containerWidth;
        var cssParams = {
            'width': '' + iconSize + 'px',
            'margin-left': '',
            'height': '' + iconSize + 'px',
            'margin-top': ''
        };
        if ((containerWidth) > (containerHeight)) {
            margin = ((containerWidth - containerHeight) / 2);
            cssParams['margin-left'] = '' + margin + 'px';
        }
        else {
            margin = ((containerHeight - containerWidth) / 2);
            cssParams['margin-top'] = '' + margin + 'px';
        }
        icon.css(cssParams);
    };
    return PictureUtils;
}());
var PictureUtilsProvider = (function () {
    function PictureUtilsProvider() {
    }
    PictureUtilsProvider.prototype.$get = function () {
        "ngInject";
        if (this._service == null) {
            this._service = new PictureUtils();
        }
        return this._service;
    };
    return PictureUtilsProvider;
}());
angular
    .module('pipPictureUtils', [])
    .provider('pipPictureUtils', PictureUtilsProvider);
},{}],45:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./IPictureUtils");
require("./PictureUtils");
require("./PicturePaste");
__export(require("./IPictureUtils"));
__export(require("./PicturePaste"));
},{"./IPictureUtils":42,"./PicturePaste":43,"./PictureUtils":44}],46:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('add_image/AddImage.html',
    '<md-menu><ng-transclude class="pip-add-image-open-button" ng-click="vm.openMenu($mdOpenMenu)" xxxng-click="vm.ngDisabled() ? \'\' : $mdOpenMenu()"></ng-transclude><md-menu-content width="4"><md-menu-item ng-if="vm.option.Upload"><md-button class="layout-row layout-align-start-center" accept="image/*" ng-keydown="vm.onKeyDown($event)" ng-multiple="vm.isMulti()" ng-file-select="" ng-file-change="vm.onFileChange($files)" ng-click="vm.hideMenu()" ng-file-drop=""><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:folder"></md-icon><span class="text-grey">{{ ::\'FILE\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.WebLink"><md-button class="layout-row layout-align-start-center" ng-click="vm.onWebLinkClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:weblink"></md-icon><span class="text-grey">{{ ::\'WEB_LINK\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.Camera"><md-button class="layout-row layout-align-start-center" ng-click="vm.onCameraClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:camera"></md-icon><span class="text-grey">{{ ::\'CAMERA\' | translate }}</span></md-button></md-menu-item><md-menu-item ng-if="vm.option.Galery"><md-button class="layout-row layout-align-start-center" ng-click="vm.onGalleryClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:images"></md-icon><span class="text-grey">{{ ::\'IMAGE_GALLERY\' | translate }}</span></md-button></md-menu-item></md-menu-content></md-menu>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('camera_dialog/CameraDialog.html',
    '<md-dialog class="pip-dialog pip-picture-dialog pip-camera-dialog layout-column" md-theme="{{$ctrl.theme}}" ng-show="$ctrl.browser != \'android\'" ng-class="{\'pip-android-dialog\': $ctrl.browser == \'android\' || !$ctrl.browser}"><div class="pip-header"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button><h3 class="m0 text-title">{{ ::\'TAKE_PICTURE\' | translate }}</h3></div><div class="pip-body"><div class="camera-stream" ng-hide="$ctrl.webCamError || $ctrl.browser == \'android\'"></div><div class="camera-error" ng-show="$ctrl.webCamError || $ctrl.browser == \'android\'"><span>{{ ::\'WEB_CAM_ERROR\' | translate }}</span></div></div><div class="pip-footer"><div class="w48"><md-button ng-click="$ctrl.onResetPicture()" ng-hide="!$ctrl.freeze || $ctrl.webCamError" class="md-icon-button" ng-disabled="transaction.busy()" aria-label="{{ ::\'REMOVE_PICTURE\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:refresh"></md-icon></md-button></div><div class="flex"></div><div class="w48"><md-button ng-click="$ctrl.onTakePictureClick()" ng-hide="$ctrl.webCamError" class="md-icon-button" aria-label="{{ ::\'TAKE_PICTURE\' | translate }}"><md-icon class="text-grey icon-button" md-svg-icon="icons:{{$ctrl.freeze ? \'check\' : \'camera\'}}"></md-icon></md-button></div><div class="flex"></div><div class="w48"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:cross"></md-icon></md-button></div></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('gallery_search_dialog/GallerySearchDialog.html',
    '<md-dialog class="pip-dialog pip-gallery-search-dialog pip-picture-dialog layout-column" md-theme="{{ $ctrl.theme }}"><md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate"></md-progress-linear><md-dialog-content class="pip-body lp0 rp0 tp0 pip-scroll flex layout-row"><div class="layout-column layout-align-start-start flex"><div class="pip-header w-stretch layout-column layout-align-start-start"><h3 class="w-stretch text-title m0 bp8"><md-button class="md-icon-button m0" ng-click="$ctrl.onCancelClick()" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button>{{ ::\'IMAGE_GALLERY\' | translate }}</h3><div class="w-stretch divider-bottom layout-row layout-start-center"><input class="no-divider rm8 text-subhead1 flex" ng-disabled="$ctrl.transaction.busy()" ng-model="$ctrl.search" ng-keypress="$ctrl.onKeyPress($event)" placeholder="{{ ::\'SEARCH_PICTURES\' | translate }}" type="text" tabindex="1"><md-button class="md-icon-button md-icon-button-square p0 pip-search-button md-primary" ng-click="$ctrl.onSearchClick()" ng-hide="$ctrl.optionDefault" tabindex="-1" aria-label="SEARCH"><md-icon class="text-opacity md-primary" md-svg-icon="icons:search-square"></md-icon></md-button></div></div><div class="pip-content flex" ng-show="$ctrl.imagesSearchResult.length > 0"><div class="pip-image-container" ng-click="$ctrl.onImageClick(image)" ng-repeat="image in $ctrl.imagesSearchResult track by $index" ng-class="{\'checked\': image.checked}" tabindex="{{ $index + 2 }}"><pip-picture pip-src="image.thumbnail" pip-default-icon="icon-images" pip-rebind="true"></pip-picture><div class="pip-checked-cover"></div><div class="pip-checkbox-backdrop"><md-checkbox md-no-ink="" ng-model="image.checked" ng-click="image.checked = !image.checked" aria-label="CHECKED"></md-checkbox></div></div></div><div class="pip-no-images w-stretch layout-column layout-align-center-center flex" ng-show="$ctrl.imagesSearchResult.length == 0"><img src="images/add_from_image_library.svg" width="200" height="200"><p class="text-secondary opacity-secondary text-center">{{ ::\'IMAGE_START_SEARCH\' | translate }}</p></div></div></md-dialog-content><div class="pip-footer"><md-button ng-click="$ctrl.onCancelClick()" ng-hide="$ctrl.transaction.busy()" aria-label="{{ ::\'CANCEL\' | translate }}" tabindex="{{ $ctrl.imagesSearchResult.length + 3 }}"><span class="text-grey">{{ ::\'CANCEL\' | translate }}</span></md-button><md-button ng-if="transaction.busy()" ng-click="$ctrl.onStopSearchClick()" class="md-raised md-warn m0" tabindex="5" aria-label="ABORT" pip-test="button-cancel">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-hide="$ctrl.transaction.busy()" ng-disabled="$ctrl.addButtonDisabled()" ng-click="$ctrl.onAddClick()" aria-label="{{ ::\'ADD\' | translate }}" tabindex="{{ $ctrl.imagesSearchResult.length + 4 }}">{{ ::\'ADD\' | translate }}</md-button></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_edit/PictureEdit.html',
    '<div class="pip-picture-upload pip-picture-drop md-focused" ng-keydown="$ctrl.onKeyDown($event)" ng-class="{\'pip-picture-error\': $ctrl.control.state == \'error\'}" tabindex="{{ $ctrl.ngDisabled || $ctrl.control.uploading ? -1 : 0 }}" pip-changed="$ctrl.readItemLocally(url, uriData, file, picture)" ng-disabled="$ctrl.ngDisabled" pip-multi="$ctrl.multiUpload" ng-focus="$ctrl.onFocus()" ng-blur="$ctrl.onBlur()" pip-option="$ctrl.option" pip-add-image=""><div class="pip-default-icon" ng-show="$ctrl.empty() || $ctrl.control.state == \'error\'"><md-icon class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text" ng-show="$ctrl.control.state == \'error\'"><span>{{ $ctrl.errorText | translate }}</span></div><div class="pip-default-text" ng-show="$ctrl.empty() && $ctrl.control.state != \'error\'"><span>{{ $ctrl.text | translate }}</span></div><img class="pip-picture-image" ng-src="{{ $ctrl.control.url }}" ng-show="!$ctrl.empty() && $ctrl.control.state != \'error\'" ng-class="{ \'pip-image-new\': $ctrl.isUpdated(), \'cursor-default\' : $ctrl.ngDisabled || $ctrl.control.uploading }" ui-event="{ error: \'$ctrl.onImageError($event)\', load: \'$ctrl.onImageLoad($event)\' }"><md-button class="md-icon-button" ng-click="$ctrl.onDeleteClick($event)" tabindex="-1" aria-label="delete" ng-hide="$ctrl.empty() || $ctrl.ngDisabled" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading"><md-icon md-svg-icon="icons:cross"></md-icon></md-button><md-progress-linear ng-show="$ctrl.control.uploading" ng-value="$ctrl.control.progress"></md-progress-linear></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_list_edit/PictureListEdit.html',
    '<div pip-focused=""><div class="pip-picture-upload pointer pip-focusable" ng-class="{\'pip-picture-error\': item.state == \'error\'}" ng-keydown="$ctrl.onKeyDown($event, item)" tabindex="{{ $ctrl.ngDisabled ? -1 : 0 }}" ng-repeat="item in $ctrl.control.items | filter: $ctrl.filterItem"><div class="pip-default-icon" ng-hide="item.loaded || item.state == \'error\'"><md-icon pip-cancel-drag="true" class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text" ng-show="$ctrl.control.state == \'error\'"><span>{{ $ctrl.errorText | translate }}</span></div><img ng-src="{{ ::item.url }}" pip-cancel-drag="true" ng-hide="item.state == \'error\'" ng-class="{ \'pip-image-new\': item.state == \'added\' }" ui-event="{ error: \'$ctrl.onImageError($event, item)\', load: \'$ctrl.onImageLoad($event, item)\' }"><md-button ng-click="$ctrl.onDeleteClick(item)" ng-hide="$ctrl.ngDisabled || $ctrl.control.uploading" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading" tabindex="-1" aria-label="delete" class="md-icon-button"><md-icon pip-cancel-drag="true" md-svg-icon="icons:cross"></md-icon></md-button><md-progress-linear md-mode="indeterminate" ng-show="item.uploading" value="{{ item.progress }}"></md-progress-linear></div><button class="pip-picture-upload pip-picture-drop pip-focusable" pip-add-image="" pip-multi="true" ng-focus="$ctrl.onFocus()" ng-blur="$ctrl.onBlur()" pip-changed="$ctrl.readItemLocally(url, uriData, file, picture)" ng-disabled="$ctrl.ngDisabled || $ctrl.control.uploading"><div class="pip-default-icon"><md-icon pip-cancel-drag="true" class="pip-picture-icon" md-svg-icon="icons:{{ $ctrl.icon }}"></md-icon></div><div class="pip-default-text"><span>{{ $ctrl.text | translate }}</span></div></button><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipPictures.Templates');
} catch (e) {
  module = angular.module('pipPictures.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('picture_url_dialog/PictureUrlDialog.html',
    '<md-dialog class="pip-dialog pip-picture-url-dialog pip-picture-dialog layout-column" md-theme="{{ $ctrl.theme }}"><md-dialog-content class="pip-body lp0 rp0 tp0 pip-scroll"><div class="pip-header bm16 layout-row layout-align-start-center"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button lm0" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button><h3 class="text-title m0">{{ ::\'PICTURE_FROM_WEBLINK\' | translate}}</h3></div><div class="pip-content lm6 rm16"><md-input-container md-no-float="" class="w-stretch text-subhead1"><input type="text" ng-model="$ctrl.url" ng-change="$ctrl.checkUrl()" placeholder="{{ ::\'LINK_PICTURE\' | translate }}"></md-input-container><div class="w-stretch layout-row layout-align-center-center" ng-hide="$ctrl.invalid"><img id="url_image"></div><div class="pip-no-images layout-row layout-align-center-center" ng-show="$ctrl.invalid"><md-icon class="text-grey" md-svg-icon="icons:images"></md-icon></div></div></md-dialog-content><div class="pip-footer"><md-button ng-click="$ctrl.onCancelClick()" aria-label="{{ ::\'CANCEL\' | translate }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onAddClick()" ng-disabled="$ctrl.invalid" aria-label="{{ ::\'ADD\' | translate }}">{{ ::\'ADD\' | translate }}</md-button></div></md-dialog>');
}]);
})();



},{}]},{},[46,30])(46)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).documents = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'FILE_DOCUMENTS': 'Upload document',
        'WEB_LINK': 'Use web link'
    });
    pipTranslateProvider.translations('ru', {
        'FILE_DOCUMENTS': 'Загрузить документ',
        'WEB_LINK': 'Вставить веб ссылка'
    });
};
ConfigTranslations.$inject = ['pipTranslateProvider'];
{
    var AddDocumentsOnChangeParams = (function () {
        function AddDocumentsOnChangeParams() {
        }
        return AddDocumentsOnChangeParams;
    }());
    var AddDocumentController_1 = (function () {
        AddDocumentController_1.$inject = ['$scope', '$element', '$mdMenu', '$timeout', 'pipDocumentUrlDialog'];
        function AddDocumentController_1($scope, $element, $mdMenu, $timeout, pipDocumentUrlDialog) {
            "ngInject";
            this.$scope = $scope;
            this.$element = $element;
            this.$mdMenu = $mdMenu;
            this.$timeout = $timeout;
            this.pipDocumentUrlDialog = pipDocumentUrlDialog;
        }
        AddDocumentController_1.prototype.openMenu = function ($mdOpenMenu) {
            if (this.$scope.ngDisabled()) {
                return;
            }
            $mdOpenMenu();
        };
        AddDocumentController_1.prototype.toBoolean = function (value) {
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        AddDocumentController_1.prototype.isMulti = function () {
            if (this.$scope.multi !== undefined && this.$scope.multi !== null) {
                if (angular.isFunction(this.$scope.multi)) {
                    return this.toBoolean(this.$scope.multi());
                }
                else {
                    return this.toBoolean(this.$scope.multi);
                }
            }
            else {
                return true;
            }
        };
        AddDocumentController_1.prototype.hideMenu = function () {
            this.$mdMenu.hide();
        };
        AddDocumentController_1.prototype.addDocuments = function (documents) {
            var _this = this;
            if (documents === undefined) {
                return;
            }
            if (Array.isArray(documents)) {
                documents.forEach(function (img) {
                    if (_this.$scope.onChange) {
                        var params = { url: img.url, file: img.file };
                        _this.$scope.onChange(params);
                    }
                });
            }
            else {
                if (this.$scope.onChange) {
                    var params = { url: documents.url, file: documents.file };
                    this.$scope.onChange(params);
                }
            }
            if (this.$scope.$document === undefined || !Array.isArray(this.$scope.$document)) {
                return;
            }
            if (Array.isArray(documents)) {
                documents.forEach(function (img) {
                    _this.$scope.$document.push(img.url);
                });
            }
            else {
                this.$scope.$document.push(documents.url);
            }
        };
        AddDocumentController_1.prototype.onFileChange = function ($files) {
            var _this = this;
            if ($files == null || $files.length == 0) {
                return;
            }
            $files.forEach(function (file) {
                if (file.type.indexOf('image') > -1) {
                    _this.$timeout(function () {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function (e) {
                            _this.$timeout(function () {
                                _this.addDocuments({ url: null, file: file });
                            });
                        };
                    });
                }
            });
        };
        AddDocumentController_1.prototype.onWebLinkClick = function () {
            var _this = this;
            this.pipDocumentUrlDialog.show(function (result) {
                _this.addDocuments({ url: result, file: null });
            });
        };
        return AddDocumentController_1;
    }());
    var AddDocument = function () {
        return {
            restrict: 'AC',
            scope: {
                $document: '=pipDocuments',
                onChange: '&pipChanged',
                multi: '&pipMulti',
                ngDisabled: '&'
            },
            transclude: true,
            templateUrl: 'add_documents/AddDocument.html',
            controller: AddDocumentController_1,
            controllerAs: 'vm'
        };
    };
    angular
        .module('pipAddDocument', ['DocumentUrlDialog'])
        .config(ConfigTranslations)
        .directive('pipAddDocument', AddDocument);
}
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attachment = (function () {
    function Attachment(id, uri, name) {
        this.id = id;
        this.uri = uri;
        this.name = name;
    }
    return Attachment;
}());
exports.Attachment = Attachment;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlobInfo = (function () {
    function BlobInfo(id, group, name, size, content_type, create_time, expire_time, completed) {
        this.id = id;
        this.group = group;
        this.name = name;
        this.size = size;
        this.content_type = content_type;
        this.create_time = create_time;
        this.expire_time = expire_time;
        this.completed = completed;
    }
    return BlobInfo;
}());
exports.BlobInfo = BlobInfo;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataPage = (function () {
    function DataPage(data, total) {
        if (data === void 0) { data = null; }
        if (total === void 0) { total = null; }
        this.total = total;
        this.data = data;
    }
    return DataPage;
}());
exports.DataPage = DataPage;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IDocumentDataService_1 = require("./IDocumentDataService");
var DocumentData = (function () {
    DocumentData.$inject = ['_config', 'pipRest', 'pipFormat'];
    function DocumentData(_config, pipRest, pipFormat) {
        "ngInject";
        this._config = _config;
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'documents';
        this.RESOURCE_INFO = 'documentsInfo';
        this.PAGE_SIZE = 100;
        this.PAGE_START = 0;
        this.PAGE_TOTAL = true;
    }
    Object.defineProperty(DocumentData.prototype, "DocumentRoute", {
        get: function () {
            return this._config.DocumentRoute;
        },
        enumerable: true,
        configurable: true
    });
    DocumentData.prototype.getDocumentUrl = function (id) {
        return this.pipRest.serverUrl + this._config.DocumentRoute + '/' + id;
    };
    DocumentData.prototype.postDocumentUrl = function () {
        return this.pipRest.serverUrl + this._config.DocumentRoute;
    };
    DocumentData.prototype.readDocuments = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    DocumentData.prototype.readDocumentInfo = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_INFO).get(params, successCallback, errorCallback);
    };
    DocumentData.prototype.readDocument = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({
            blob_id: id
        }, successCallback, errorCallback);
    };
    DocumentData.prototype.deleteDocument = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ blob_id: id }, null, successCallback, errorCallback);
    };
    return DocumentData;
}());
var DocumentDataProvider = (function () {
    DocumentDataProvider.$inject = ['pipRestProvider'];
    function DocumentDataProvider(pipRestProvider) {
        this.pipRestProvider = pipRestProvider;
        this._config = new IDocumentDataService_1.DocumentConfig();
        this._config.DocumentRoute = '/api/1.0/blobs';
    }
    Object.defineProperty(DocumentDataProvider.prototype, "DocumentRoute", {
        get: function () {
            return this._config.DocumentRoute;
        },
        set: function (value) {
            this._config.DocumentRoute = value;
            this.pipRestProvider.registerOperation('documents', this._config.DocumentRoute + '/:document_id');
            this.pipRestProvider.registerResource('documentInfo', this._config.DocumentRoute + '/:document_id/info');
        },
        enumerable: true,
        configurable: true
    });
    DocumentDataProvider.prototype.$get = ['pipRest', 'pipFormat', function (pipRest, pipFormat) {
        "ngInject";
        if (this._service == null) {
            this._service = new DocumentData(this._config, pipRest, pipFormat);
        }
        return this._service;
    }];
    return DocumentDataProvider;
}());
angular
    .module('pipDocumentData', ['pipRest', 'pipServices'])
    .provider('pipDocumentData', DocumentDataProvider);
},{"./IDocumentDataService":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentConfig = (function () {
    function DocumentConfig() {
    }
    return DocumentConfig;
}());
exports.DocumentConfig = DocumentConfig;
},{}],10:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Attachment");
require("./BlobInfo");
require("./DataPage");
require("./DocumentDataService");
require("./IDocumentDataService");
angular
    .module('pipDocuments.Data', [
    'pipDocumentData'
]);
__export(require("./Attachment"));
__export(require("./BlobInfo"));
__export(require("./DataPage"));
__export(require("./IDocumentDataService"));
},{"./Attachment":5,"./BlobInfo":6,"./DataPage":7,"./DocumentDataService":8,"./IDocumentDataService":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentListEdit_1 = require("../document_list_edit/DocumentListEdit");
var ConfigTranslations = function (pipTranslate) {
    if (pipTranslate) {
        (pipTranslate).setTranslations('en', {
            DOCUMENTS_ATTACHED: 'document(s) attached',
            ERROR_DOCUMENTS_LOADED: 'Error: <%= error_number %> document(s) are not loaded'
        });
        (pipTranslate).setTranslations('ru', {
            DOCUMENTS_ATTACHED: 'документов добавлено',
            ERROR_DOCUMENTS_LOADED: 'Ошибка: <%= error_number %> документ(ов) не загружено'
        });
    }
};
ConfigTranslations.$inject = ['pipTranslate'];
{
    var DocumentListBindings = {
        ngDisabled: '&?',
        documents: '<pipDocuments',
        collapsable: '<?pipCollapse',
        pipDocumentIcon: '<?pipDocumentIcon',
        rebind: '<?pipRebind'
    };
    var DocumentListChanges = (function () {
        function DocumentListChanges() {
        }
        return DocumentListChanges;
    }());
    var DocumentListController = (function () {
        DocumentListController.$inject = ['$element', '$attrs', 'pipTranslate', '$parse', '$scope', '$timeout', 'pipDocumentData', 'pipRest'];
        function DocumentListController($element, $attrs, pipTranslate, $parse, $scope, $timeout, pipDocumentData, pipRest) {
            "ngInject";
            this.$element = $element;
            this.$attrs = $attrs;
            this.pipTranslate = pipTranslate;
            this.$parse = $parse;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.pipDocumentData = pipDocumentData;
            this.pipRest = pipRest;
            this.documentListIcon = DocumentListEdit_1.DefaultDocumentIcon;
            this.$element.addClass('pip-document-list');
        }
        DocumentListController.prototype.$postLink = function () {
            this.documentsContainer = this.$element.children('.pip-documents-container');
            this.up = this.$element.find('.icon-up');
            this.down = this.$element.find('.icon-down');
            this.documents = this.documents || [];
            this.showDocuments = this.collapsable;
            if (!this.collapsable) {
                this.up.hide();
                this.documentsContainer.hide();
            }
            else {
                this.down.hide();
            }
            if (this.ngDisabled()) {
                this.up.hide();
                this.down.hide();
            }
        };
        DocumentListController.prototype.onDownload = function (item) {
            var e = document.createEvent('MouseEvents');
            var a = document.createElement('a');
            a.href = this.pipDocumentData.getDocumentUrl(item.id);
            ;
            a.dataset['downloadurl'] = ['undefined', a.download, a.href].join(':');
            e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
            a.dispatchEvent(e);
        };
        DocumentListController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.rebind)) {
                if (changes.documents && changes.documents.currentValue) {
                    if (this.differentDocumentList(changes.documents.currentValue)) {
                        this.documents = changes.documents.currentValue;
                    }
                }
            }
        };
        DocumentListController.prototype.differentDocumentList = function (newList) {
            var i, obj;
            if (!this.documents || newList) {
                return true;
            }
            if (this.documents.length !== newList.length) {
                return true;
            }
            for (i = 0; i < newList.length; i++) {
                obj = _.find(this.documents, { id: newList[i].id });
                if (obj === undefined) {
                    return true;
                }
            }
            return false;
        };
        DocumentListController.prototype.onTitleClick = function (event) {
            if (event) {
                event.stopPropagation();
            }
            if (this.$attrs.disabled) {
                return;
            }
            this.showDocuments = !this.showDocuments;
            this.up[this.showDocuments ? 'show' : 'hide']();
            this.down[!this.showDocuments ? 'show' : 'hide']();
            this.documentsContainer[this.showDocuments ? 'show' : 'hide']();
        };
        DocumentListController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        return DocumentListController;
    }());
    var documentList = {
        bindings: DocumentListBindings,
        templateUrl: 'document_list/DocumentList.html',
        controller: DocumentListController,
    };
    angular
        .module("pipDocumentList", ['pipFocused', 'pipDocuments.Templates'])
        .run(ConfigTranslations)
        .component('pipDocumentList', documentList);
}
},{"../document_list_edit/DocumentListEdit":12}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDocumentIcon = 'document';
var async = require('async');
var ConfigTranslations = function (pipTranslate) {
    if (pipTranslate) {
        (pipTranslate).setTranslations('en', {
            DOCUMENT_LIST_EDIT_TEXT: 'Click here to add a document',
            ERROR_TRANSACTION_IN_PROGRESS: 'Transaction is in progress. Please, wait until it\'s finished or abort'
        });
        (pipTranslate).setTranslations('ru', {
            DOCUMENT_LIST_EDIT_TEXT: 'Нажмите сюда, чтобы добавить документ',
            ERROR_TRANSACTION_IN_PROGRESS: 'Транзакция еще не завершена. Подождите окончания или прервите её'
        });
    }
};
ConfigTranslations.$inject = ['pipTranslate'];
var DocumentListEditControl = (function () {
    function DocumentListEditControl() {
        this.uploading = 0;
    }
    return DocumentListEditControl;
}());
exports.DocumentListEditControl = DocumentListEditControl;
var DocumentUploadErrors = (function () {
    function DocumentUploadErrors() {
    }
    return DocumentUploadErrors;
}());
exports.DocumentUploadErrors = DocumentUploadErrors;
var DocumentListEditItem = (function () {
    function DocumentListEditItem() {
    }
    return DocumentListEditItem;
}());
exports.DocumentListEditItem = DocumentListEditItem;
{
    var DocumentListEditBindings = {
        ngDisabled: '&?',
        pipCreated: '&?',
        pipChanged: '&?',
        documents: '=?pipDocuments',
        addedDocument: '&?pipAddedDocument',
        documentListText: '<?pipDefaultText',
        documentListIcon: '<?pipDefaultIcon',
        cancelDrag: '<?pipCanselDrag'
    };
    var DocumentListEditChanges = (function () {
        function DocumentListEditChanges() {
        }
        return DocumentListEditChanges;
    }());
    var SenderEvent = (function () {
        function SenderEvent() {
        }
        return SenderEvent;
    }());
    var DocEvent = (function () {
        function DocEvent() {
        }
        return DocEvent;
    }());
    var DocumentStates_1 = (function () {
        function DocumentStates_1() {
        }
        return DocumentStates_1;
    }());
    DocumentStates_1.Original = 'original';
    DocumentStates_1.Copied = 'copied';
    DocumentStates_1.Added = 'added';
    DocumentStates_1.Error = 'error';
    DocumentStates_1.Deleted = 'deleted';
    var DocumentListEditController = (function () {
        DocumentListEditController.$inject = ['$log', '$element', '$injector', 'pipRest', '$timeout', 'pipDocumentData', 'pipFileUpload'];
        function DocumentListEditController($log, $element, $injector, pipRest, $timeout, pipDocumentData, pipFileUpload) {
            "ngInject";
            var _this = this;
            this.$log = $log;
            this.$element = $element;
            this.$injector = $injector;
            this.pipRest = pipRest;
            this.$timeout = $timeout;
            this.pipDocumentData = pipDocumentData;
            this.pipFileUpload = pipFileUpload;
            this._itemPin = 0;
            this._pipTranslate = this.$injector.has('pipTranslate') ? this.$injector.get('pipTranslate') : null;
            this._elementDocumentDrop = $element.children('.pip-document-drop');
            if (!this.documentListText) {
                this.documentListText = 'DOCUMENT_LIST_EDIT_TEXT';
            }
            if (!this.documentListIcon) {
                this.documentListIcon = 'document';
            }
            this.iconError = 'warn-circle';
            this.documentStartState = this.toBoolean(this.addedDocument) ? DocumentStates_1.Copied : DocumentStates_1.Original;
            this.control = {
                uploading: 0,
                items: this.getItems(),
                reset: function () {
                    _this.resetDocument();
                },
                save: function (successCallback, errorCallback) {
                    _this.saveDocument(successCallback, errorCallback);
                },
                abort: function () {
                    _this.onAbort();
                },
                error: null
            };
            this.control.reset();
            this.executeCallback();
            this.$element.addClass('pip-document-list-edit');
        }
        DocumentListEditController.prototype.$onChanges = function (changes) {
            if (changes.documents && changes.documents.currentValue) {
                if (!_.isEqual(this.documents, changes.documents.currentValue)) {
                    this.control.reset();
                }
            }
        };
        DocumentListEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        DocumentListEditController.prototype.getItems = function () {
            var items = [];
            var i;
            if (this.documents === null || this.documents.length === 0) {
                return items;
            }
            for (i = 0; i < this.documents.length; i++) {
                var item = {
                    pin: this._itemPin++,
                    id: this.documents[i].id,
                    name: this.documents[i].name,
                    uri: this.documents[i].uri,
                    uploading: false,
                    uploaded: false,
                    progress: 50,
                    file: null,
                    state: this.documentStartState,
                    error: null
                };
                items.push(item);
            }
            return items;
        };
        DocumentListEditController.prototype.setItems = function () {
            var item;
            var i;
            if (this.documents && this.documents.length > 0) {
                this.documents.splice(0, this.documents.length);
            }
            for (i = 0; i < this.control.items.length; i++) {
                item = this.control.items[i];
                if ((item.id || item.uri) && item.state != DocumentStates_1.Deleted) {
                    var newDoc = {
                        id: item.id,
                        name: item.name,
                        uri: item.uri
                    };
                    this.documents.push(newDoc);
                }
            }
        };
        DocumentListEditController.prototype.getUploadErors = function () {
            var errors = [];
            _.each(this.control.items, function (item) {
                if (item.state == DocumentStates_1.Error || item.error) {
                    errors.push({
                        id: item.id,
                        uri: item.uri,
                        name: item.name,
                        error: item.error
                    });
                }
            });
            return errors;
        };
        DocumentListEditController.prototype.isDisabled = function () {
            if (this.control.uploading) {
                return true;
            }
            if (this.ngDisabled) {
                return this.ngDisabled();
            }
            return false;
            ;
        };
        DocumentListEditController.prototype.resetDocument = function () {
            this.control.uploading = 0;
            this.control.items = this.getItems();
        };
        DocumentListEditController.prototype.deleteItem = function (item, callback) {
            if (item.upload) {
                item.upload.abort();
                item.upload = null;
            }
            if (item.state !== DocumentStates_1.Deleted) {
                return;
            }
            this.removeItem(item);
            callback();
        };
        DocumentListEditController.prototype.saveDocument = function (successCallback, errorCallback) {
            var _this = this;
            var item;
            var onItemCallback;
            var i;
            if (this.control.uploading) {
                if (errorCallback) {
                    errorCallback('ERROR_TRANSACTION_IN_PROGRESS');
                }
                return;
            }
            this.cancelQuery = null;
            this.control.error = null;
            this.control.uploading = 0;
            var addedBlobCollection = [];
            var addedUrlCollection = [];
            _.each(this.control.items, function (item) {
                if (item.state == 'added') {
                    if (!item.uri) {
                        addedBlobCollection.push(item);
                    }
                    else {
                        addedUrlCollection.push(item);
                    }
                }
            });
            var deletedCollection = _.filter(this.control.items, { state: 'deleted' });
            _.each(addedUrlCollection, function (item) {
                item.uploaded = true;
                item.uploading = false;
                item.progress = 0;
                item.upload = null;
                item.file = null;
                item.state = DocumentStates_1.Original;
            });
            if (!addedBlobCollection.length && !deletedCollection.length) {
                if (addedUrlCollection.length > 0) {
                    this.setItems();
                }
                this.control.uploading = 0;
                if (successCallback) {
                    successCallback(this.documents);
                }
                return;
            }
            this.control.uploading = addedBlobCollection.length + deletedCollection.length;
            async.parallel([
                function (callbackAll) {
                    _.each(addedBlobCollection, function (item) {
                        item.uploading = true;
                        item.progress = 0;
                    });
                    _this.pipFileUpload.multiUpload(_this.pipDocumentData.postDocumentUrl(), addedBlobCollection, function (index, data, err) {
                        var item = addedBlobCollection[index];
                        _this.addItem(item, data, err);
                        if (err) {
                            _this.control.error = true;
                        }
                    }, function (index, state, progress) {
                        var item = addedBlobCollection[index];
                        item.progress = progress;
                    }, function (error, result, res) {
                        _this.cancelQuery = null;
                        callbackAll();
                    }, function (cancelQuery) {
                        _this.cancelQuery = cancelQuery;
                    }, false, 'pin');
                },
                function (callbackAll) {
                    if (deletedCollection.length) {
                        async.each(deletedCollection, function (item, callback) {
                            _this.deleteItem(item, function (error) { callback(); });
                        }, function (error, result) {
                            callbackAll();
                        });
                    }
                    else {
                        callbackAll();
                    }
                }
            ], function (error, results) {
                if (error && !_this.control.error) {
                    _this.control.error = error;
                }
                if (_this.control.error) {
                    _this.control.uploading = 0;
                    var errors = _this.getUploadErors();
                    if (errorCallback) {
                        errorCallback(errors);
                    }
                    else {
                        _this.$log.error(_this.control.error);
                    }
                }
                else {
                    _this.setItems();
                    _this.control.uploading = 0;
                    if (successCallback) {
                        successCallback(_this.documents);
                    }
                }
            });
        };
        DocumentListEditController.prototype.addItem = function (oldItem, fileInfo, error) {
            var itemIndex = _.findIndex(this.control.items, { pin: oldItem.pin });
            if (itemIndex < 0)
                return;
            if (error) {
                this.control.items[itemIndex].uploaded = false;
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].state = DocumentStates_1.Error;
                this.control.items[itemIndex].error = error;
            }
            else {
                if (fileInfo) {
                    this.control.items[itemIndex].id = fileInfo.id;
                    this.control.items[itemIndex].name = fileInfo.name;
                    this.control.items[itemIndex].uploaded = true;
                    this.control.items[itemIndex].state = DocumentStates_1.Original;
                }
                else {
                    this.control.items[itemIndex].uploaded = false;
                }
                this.control.items[itemIndex].uploading = false;
                this.control.items[itemIndex].progress = 0;
                this.control.items[itemIndex].upload = null;
                this.control.items[itemIndex].file = null;
                this.control.items[itemIndex].error = null;
            }
        };
        DocumentListEditController.prototype.onAbort = function () {
            var item;
            var i;
            for (i = 0; i < this.control.items.length; i++) {
                item = this.control.items[i];
                if (item.uploading) {
                    if (item.upload) {
                        item.upload.abort();
                    }
                    item.uploaded = false;
                    item.uploading = false;
                    item.progress = 0;
                    item.upload = null;
                }
            }
            if (this.cancelQuery) {
                this.cancelQuery.resolve();
            }
            this.control.uploading = 0;
            this.control.error = true;
        };
        DocumentListEditController.prototype.filterItem = function (item) {
            return item.state !== DocumentStates_1.Deleted;
        };
        DocumentListEditController.prototype.readItemLocally = function (url, file) {
            var item = {
                pin: this._itemPin++,
                id: null,
                name: file ? file.name : url ? url.split('/').pop() : null,
                uri: !file && url ? url : null,
                uploading: false,
                uploaded: false,
                progress: 0,
                file: file ? file : null,
                state: DocumentStates_1.Added,
                error: null
            };
            this.control.items.push(item);
            this.onChange();
        };
        DocumentListEditController.prototype.removeItem = function (item) {
            if (item.state === DocumentStates_1.Added || item.state === DocumentStates_1.Copied) {
                var index = _.findIndex(this.control.items, { pin: item.pin });
                if (index > -1) {
                    this.control.items.splice(index, 1);
                }
            }
            else {
                item.state = DocumentStates_1.Deleted;
            }
        };
        DocumentListEditController.prototype.onDelete = function (item) {
            this.removeItem(item);
            this.onChange();
        };
        DocumentListEditController.prototype.onKeyDown = function ($event, item) {
            var _this = this;
            if (item) {
                if ($event.keyCode === 46 || $event.keyCode === 8) {
                    this.removeItem(item);
                    this.onChange();
                }
            }
            else if ($event.keyCode === 13 || $event.keyCode === 32) {
                setTimeout(function () {
                    _this._elementDocumentDrop.trigger('click');
                }, 0);
            }
        };
        DocumentListEditController.prototype.onChange = function () {
            if (this.pipChanged) {
                this.pipChanged({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        DocumentListEditController.prototype.executeCallback = function () {
            if (this.pipCreated) {
                this.pipCreated({
                    $event: { sender: this.control },
                    $control: this.control
                });
            }
        };
        return DocumentListEditController;
    }());
    var documentListEdit = {
        bindings: DocumentListEditBindings,
        templateUrl: 'document_list_edit/DocumentListEdit.html',
        controller: DocumentListEditController
    };
    angular
        .module("pipDocumentListEdit", ['ui.event', 'pipFocused', 'pipDocuments.Templates', 'pipFiles', 'DocumentUrlDialog'])
        .run(ConfigTranslations)
        .component('pipDocumentListEdit', documentListEdit);
}
},{"async":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentUrlDialogService = (function () {
    DocumentUrlDialogService.$inject = ['$mdDialog'];
    function DocumentUrlDialogService($mdDialog) {
        this._mdDialog = $mdDialog;
    }
    DocumentUrlDialogService.prototype.show = function (successCallback, cancelCallback) {
        this._mdDialog.show({
            templateUrl: 'document_url_dialog/DocumentUrlDialog.html',
            clickOutsideToClose: true,
            controller: DocumentUrlDialogController,
            controllerAs: '$ctrl'
        })
            .then(function (result) {
            if (successCallback) {
                successCallback(result);
            }
        });
    };
    return DocumentUrlDialogService;
}());
var ConfigDocumentUrlDialogTranslations = function (pipTranslateProvider) {
    pipTranslateProvider.translations('en', {
        'DOCUMENT_FROM_WEBLINK': 'Add web link',
        'LINK_DOCUMENT': 'Link to the document...'
    });
    pipTranslateProvider.translations('ru', {
        'DOCUMENT_FROM_WEBLINK': 'Добавить веб ссылку',
        'LINK_DOCUMENT': 'Ссылка на документ...'
    });
};
ConfigDocumentUrlDialogTranslations.$inject = ['pipTranslateProvider'];
var DocumentUrlDialogController = (function () {
    DocumentUrlDialogController.$inject = ['$log', '$scope', '$mdDialog', '$rootScope', '$timeout', '$mdMenu'];
    function DocumentUrlDialogController($log, $scope, $mdDialog, $rootScope, $timeout, $mdMenu) {
        "ngInject";
        this.$log = $log;
        this.$scope = $scope;
        this.$mdDialog = $mdDialog;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$mdMenu = $mdMenu;
        this.url = '';
        this.invalid = true;
        this.theme = this.$rootScope[pip.themes.ThemeRootVar];
        this.ExpressionURI = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}\]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
        this.regexURI = new RegExp(this.ExpressionURI);
        this.matchURI = false;
    }
    DocumentUrlDialogController.prototype.checkUrl = function () {
        if (this.url.match(this.regexURI)) {
            this.matchURI = true;
        }
        else {
            this.matchURI = false;
        }
    };
    ;
    DocumentUrlDialogController.prototype.onCancelClick = function () {
        this.$mdDialog.cancel();
    };
    ;
    DocumentUrlDialogController.prototype.onAddClick = function () {
        this.$mdDialog.hide(this.url);
    };
    ;
    return DocumentUrlDialogController;
}());
angular
    .module('DocumentUrlDialog', ['ngMaterial', 'pipDocuments.Templates'])
    .service('pipDocumentUrlDialog', DocumentUrlDialogService)
    .config(ConfigDocumentUrlDialogTranslations);
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],15:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./document_url_dialog/DocumentUrlDialogService");
require("./document_url_dialog/IDocumentUrlDialogService");
require("./document_list/DocumentList");
require("./document_list_edit/DocumentListEdit");
require("./rest");
require("./data");
require("./add_documents/AddDocument");
angular
    .module('pipDocuments', [
    'DocumentUrlDialog',
    'pipAddDocument',
    'pipDocuments.Rest',
    'pipDocuments.Data',
    'pipDocumentList',
    'pipDocumentListEdit'
]);
__export(require("./document_list_edit/DocumentListEdit"));
__export(require("./data"));
},{"./add_documents/AddDocument":4,"./data":10,"./document_list/DocumentList":11,"./document_list_edit/DocumentListEdit":12,"./document_url_dialog/DocumentUrlDialogService":13,"./document_url_dialog/IDocumentUrlDialogService":14,"./rest":18}],16:[function(require,module,exports){
configDocumentResources.$inject = ['pipRestProvider'];
function configDocumentResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('documents', '/api/1.0/blobs/:document_id', { blob_id: '@document_id' }, {
        page: { method: 'GET', isArray: false },
        update: { method: 'PUT' }
    });
    pipRestProvider.registerResource('documentInfo', '/api/1.0/blobs/:document_id/info');
}
angular
    .module('pipDocuments.Rest')
    .config(configDocumentResources);
},{}],17:[function(require,module,exports){
configFileResources.$inject = ['pipRestProvider'];
function configFileResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('files', '/api/1.0/files/:file_id');
}
angular
    .module('pipDocuments.Rest')
    .config(configFileResources);
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipDocuments.Rest', []);
require("./DocumentResources");
require("./FileResources");
},{"./DocumentResources":16,"./FileResources":17}],19:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipDocuments.Templates');
} catch (e) {
  module = angular.module('pipDocuments.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('add_documents/AddDocument.html',
    '<md-menu><ng-transclude class="pip-add-image-open-button" ng-click="vm.openMenu($mdOpenMenu)" xxxng-click="vm.ngDisabled() ? \'\' : $mdOpenMenu()"></ng-transclude><md-menu-content width="4"><md-menu-item><md-button class="layout-row layout-align-start-center" accept="image/*" ng-keydown="vm.onKeyDown($event)" ng-multiple="vm.isMulti()" ng-file-select="" ng-file-change="vm.onFileChange($files)" ng-click="vm.hideMenu()" ng-file-drop=""><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:folder"></md-icon><span class="text-grey">{{ ::\'FILE_DOCUMENTS\' | translate }}</span></md-button></md-menu-item><md-menu-item><md-button class="layout-row layout-align-start-center" ng-click="vm.onWebLinkClick()"><md-icon class="text-headline text-grey rm24-flex" md-svg-icon="icons:weblink"></md-icon><span class="text-grey">{{ ::\'WEB_LINK\' | translate }}</span></md-button></md-menu-item></md-menu-content></md-menu>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDocuments.Templates');
} catch (e) {
  module = angular.module('pipDocuments.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('document_list/DocumentList.html',
    '<md-button class="pip-documents-name" ng-class="{\'lp24-flex rp16\': $ctrl.pipDocumentIcon }" ng-click="$ctrl.onTitleClick($event); $ctrl.onResize()" aria-label="RESIZE"><div class="layout-align-start-center layout-row w-stretch"><md-icon md-svg-icon="icons:document" ng-class="{\'pip-icon\': $ctrl.pipDocumentIcon}" ng-if="$ctrl.pipDocumentIcon"></md-icon><span class="pip-documents-text">{{ $ctrl.documents.length }} {{ ::\'DOCUMENTS_ATTACHED\' | translate }}</span><md-icon class="icon-up" md-svg-icon="icons:triangle-up"></md-icon><md-icon class="icon-down" md-svg-icon="icons:triangle-down"></md-icon></div></md-button><div pip-focused="" class="pip-documents-container bm8" ng-class="{ \'lp24-flex rp24-flex\': $ctrl.pipDocumentIcon }"><md-button class="pip-document-download md-primary" ng-if="document.uri" ng-class="{\'pip-focusable\' : !$ctrl.ngDisabled()}" href="{{ document.uri }}" target="_blank" ng-disabled="$ctrl.ngDisabled() || $ctrl.document.error" ng-repeat="document in $ctrl.documents track by $index" aria-label="DOCUMENT"><div class="pip-default-icon"><md-icon md-svg-icon="icons:{{::$ctrl.documentListIcon}}"></md-icon></div><div class="pip-document-title">{{ ::document.name }}</div></md-button><md-button class="pip-document-download md-primary" ng-if="!document.uri" ng-class="{\'pip-focusable\' : !$ctrl.ngDisabled()}" ng-click="$ctrl.onDownload(document)" target="_blank" ng-disabled="$ctrl.ngDisabled() || $ctrl.document.error" ng-repeat="document in $ctrl.documents track by $index" aria-label="DOCUMENT"><div class="pip-default-icon"><md-icon md-svg-icon="icons:{{::$ctrl.documentListIcon}}"></md-icon></div><div class="pip-document-title">{{ ::document.name }}</div></md-button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDocuments.Templates');
} catch (e) {
  module = angular.module('pipDocuments.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('document_list/DocumentListCollapse.html',
    '<div class="pip-documents-name" ng-click="$ctrl.onTitleClick($event); $ctrl.onResize()"><span class="pip-documents-text">{{ documents.length }} {{ ::\'DOCUMENTS_ATTACHED\' | translate }}</span><md-icon class="icon-up" md-svg-icon="icons:triangle-up"></md-icon><md-icon class="icon-down" md-svg-icon="icons:triangle-down"></md-icon></div><div pip-focused="" class="pip-documents-container bm8"><md-button class="pip-document-download pip-focusable md-primary" href="{{::$ctrl.document.url}}" target="_blank" ng-repeat="document in $ctrl.documents track by document.id" aria-label="DOCUMENT"><div class="pip-default-icon"><md-icon md-svg-icon="icons:{{::$ctrl.icon}}"></md-icon></div><div class="pip-document-title">{{ ::$ctrl.document.name }}</div></md-button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDocuments.Templates');
} catch (e) {
  module = angular.module('pipDocuments.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('document_list_edit/DocumentListEdit.html',
    '<div pip-focusable=""><div class="pip-document-upload pointer md-primary" ng-class="{\'pip-focusable\' : !$ctrl.ngDisabled(), \'pip-item-error\' : item.state == \'error\'}" ng-keydown="$ctrl.onKeyDown($event, item)" tabindex="{{ $ctrl.ngDisabled() ? -1 : 0 }}" ng-repeat="item in $ctrl.control.items | filter: $ctrl.filterItem track by $index"><div class="pip-default-icon" ng-class="{ \'pip-document-new\': item.state == \'added\' || item.state == \'copied\' }"><md-icon pip-cancel-drag="true" class="md-primary" ng-if="item.state == \'original\' || item.state == \'added\'" md-svg-icon="icons:{{::$ctrl.documentListIcon}}"></md-icon><md-icon pip-cancel-drag="true" class="md-warn" ng-if="item.state == \'error\'" md-svg-icon="icons:{{::$ctrl.iconError}}"></md-icon></div><div class="pip-document-title" pip-cancel-drag="true">{{ item.name }}</div><md-button ng-click="$ctrl.onDelete(item)" ng-disabled="$ctrl.isDisabled()" tabindex="-1" ng-hide="$ctrl.ngDisabled()" class="md-icon-button" aria-label="DELETE"><md-icon md-svg-icon="icons:cross" pip-cancel-drag="true"></md-icon></md-button><md-progress-linear md-mode="determinate" ng-show="item.uploading" ng-value="item.progress"></md-progress-linear></div><button class="pip-document-upload pip-document-drop" ng-class="{\'pip-focusable\' : !$ctrl.ngDisabled()}" ng-keydown="$ctrl.onKeyDown($event)" tabindex="0" xxxng-file-drop="" xxxng-file-select="" xxxng-file-change="$ctrl.onSelect($files)" pip-changed="$ctrl.readItemLocally(url, file)" xxng-multiple="true" pip-multi="true" ng-disabled="$ctrl.ngDisabled()" aria-label="UPLOAD" pip-add-document=""><div class="pip-default-icon"><md-icon pip-cancel-drag="true" md-svg-icon="icons:{{ ::$ctrl.documentListIcon }}"></md-icon></div><div class="pip-default-text"><span>{{ $ctrl.documentListText | translate }}</span></div></button><div class="clearfix"></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipDocuments.Templates');
} catch (e) {
  module = angular.module('pipDocuments.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('document_url_dialog/DocumentUrlDialog.html',
    '<md-dialog class="pip-dialog pip-document-url-dialog pip-document-dialog layout-column" md-theme="{{ $ctrl.theme }}"><md-dialog-content class="pip-body lp0 rp0 tp0 pip-scroll"><div class="pip-header bm16 layout-row layout-align-start-center"><md-button ng-click="$ctrl.onCancelClick()" class="md-icon-button lm0" aria-label="{{ ::\'CANCEL\' | translate }}"><md-icon class="text-grey" md-svg-icon="icons:arrow-left"></md-icon></md-button><h3 class="text-title m0">{{ ::\'DOCUMENT_FROM_WEBLINK\' | translate}}</h3></div><div class="pip-content lp16 rp16"><md-input-container md-no-float="" class="w-stretch text-subhead1"><input type="text" ng-model="$ctrl.url" ng-change="$ctrl.checkUrl()" placeholder="{{ ::\'LINK_DOCUMENT\' | translate }}"></md-input-container></div></md-dialog-content><div class="pip-footer"><md-button ng-click="$ctrl.onCancelClick()" aria-label="{{ ::\'CANCEL\' | translate }}">{{ ::\'CANCEL\' | translate }}</md-button><md-button class="md-accent" ng-click="$ctrl.onAddClick()" aria-label="{{ ::\'ADD\' | translate }}" ng-disabled="!$ctrl.matchURI">{{ ::\'ADD\' | translate }}</md-button></div></md-dialog>');
}]);
})();



},{}]},{},[19,4,5,6,7,8,9,10,12,11,13,14,15,16,17,18])(19)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).standalone = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process,global,setImmediate){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (typeof arguments[1] === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var hasError = false;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            if (hasError) return;
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    hasError = true;

                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has nonexistent dependency in ' + requires.join(', '));
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback.apply(null, [null].concat(args));
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while(!q.paused && workers < q.concurrency && q.tasks.length){

                    var tasks = q.payload ?
                        q.tasks.splice(0, q.payload) :
                        q.tasks.splice(0, q.tasks.length);

                    var data = _map(tasks, function (task) {
                        return task.data;
                    });

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);
                    var cb = only_once(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        var has = Object.prototype.hasOwnProperty;
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (has.call(memo, key)) {   
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (has.call(queues, key)) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)

},{"_process":2,"timers":3}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistDraggEvent = 'onChecklistDrag';
{
    var ChecklistSelected_1 = (function () {
        function ChecklistSelected_1() {
            this.index = 0;
            this.dragId = 0;
            this.isChanged = false;
        }
        return ChecklistSelected_1;
    }());
    var ChecklistEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipDraggable: '<?',
        pipOptions: '=',
        pipScrollContainer: '<?',
        pipRebind: '<?'
    };
    var ChecklistEditBindingsChanges = (function () {
        function ChecklistEditBindingsChanges() {
        }
        return ChecklistEditBindingsChanges;
    }());
    var ChecklistEditController = (function () {
        ChecklistEditController.$inject = ['$element', '$timeout', '$document', '$rootScope'];
        function ChecklistEditController($element, $timeout, $document, $rootScope) {
            "ngInject";
            var _this = this;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$document = $document;
            this.$rootScope = $rootScope;
            $element.addClass('pip-checklist-edit');
            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }
            this.selected = new ChecklistSelected_1();
            this.selected.drag = this.pipDraggable;
            this.selected.dragInit = this.pipDraggable;
            this.selected.id = this.now();
            this.generateList(this.pipOptions);
            this._debounceChange = _.debounce(function () {
                _this.onChecklistChange();
            }, 200);
        }
        ChecklistEditController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.selected.isChanged) {
                            this.generateList(changes.pipOptions.currentValue);
                        }
                        else {
                            this.selected.isChanged = false;
                        }
                    }
                }
                if (changes.pipDraggable && changes.pipDraggable.currentValue) {
                    this.pipDraggable = changes.pipDraggable.currentValue;
                }
            }
        };
        ChecklistEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        ChecklistEditController.prototype.getCaret = function (el) {
            if (el.selectionStart) {
                return el.selectionStart;
            }
            else if (this.$document.selection) {
                el.focus();
                var r = this.$document.selection.createRange();
                if (r == null) {
                    return 0;
                }
                var re = el.createTextRange(), rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                return rc.text.length;
            }
            return 0;
        };
        ChecklistEditController.prototype.setSelectionRange = function (input, selectionStart, selectionEnd) {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            }
            else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        };
        ChecklistEditController.prototype.setCaretToPos = function (input, pos) {
            this.setSelectionRange(input, pos, pos);
        };
        ChecklistEditController.prototype.addItem = function (text, index) {
            var newItem = this.getNewItem(text, false);
            if (index > -1) {
                this.selected.index = index;
            }
            if (this.checklistContent.length < 2) {
                this.checklistContent.unshift(newItem);
            }
            else {
                this.checklistContent.splice(this.selected.index + 1, 0, newItem);
            }
            this.selected.index += 1;
            this.setFocus(this.selected.index);
            this._debounceChange();
        };
        ChecklistEditController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            var content = [];
            _.each(this.checklistContent, function (item) {
                if (!item.empty) {
                    content.push({
                        checked: item.checked,
                        text: item.text
                    });
                }
            });
            this.pipOptions = content;
        };
        ChecklistEditController.prototype.setFocus = function (index, toPos) {
            var _this = this;
            if (index > -1) {
                setTimeout(function () {
                    var nextElement = angular.element('#check-item-text-' + _this.selected.id + '-' + index);
                    if (nextElement) {
                        nextElement.focus();
                        if (toPos !== undefined && nextElement[0]) {
                            _this.setCaretToPos(nextElement[0], toPos);
                        }
                    }
                }, 50);
            }
        };
        ChecklistEditController.prototype.getNewItem = function (text, isEmpty) {
            var newItem = {
                checked: false,
                text: text || '',
                empty: isEmpty
            };
            return newItem;
        };
        ChecklistEditController.prototype.now = function () {
            return +new Date;
        };
        ChecklistEditController.prototype.clearList = function () {
            this.selected.index = 0;
            this.checklistContent = [];
            this.checklistContent.push(this.getNewItem('', true));
        };
        ChecklistEditController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
            }
            else {
                this.checklistContent = [];
                _.each(content, function (item) {
                    _this.checklistContent.push(item);
                });
                this.checklistContent.push(this.getNewItem('', true));
            }
        };
        ChecklistEditController.prototype.setWidth100 = function () {
            var element = angular.element('#check-item-' + +this.selected.id + '-' + this.selected.index);
            element.css("width", 'none');
            element.css("max-width", 'none');
        };
        ChecklistEditController.prototype.setWidth = function () {
            if (this.isWidth)
                return;
            var elementEtalon = angular.element('#check-item-empty-' + this.selected.id);
            var value = elementEtalon.width();
            var element = angular.element('#check-item-' + this.selected.id + '-' + this.selected.index);
            if (element) {
                element.css("width", value + 'px');
                element.css("max-width", value + 'px');
            }
        };
        ChecklistEditController.prototype.onItemFocus = function (index) {
            if (this.ngDisabled)
                return;
            this.selected.index = index;
        };
        ChecklistEditController.prototype.isSelectedItem = function (index) {
            var empty;
            try {
                empty = this.checklistContent[index].empty;
            }
            catch (err) {
                empty = true;
            }
            return this.selected.index == index && this.pipDraggable && !empty;
        };
        ChecklistEditController.prototype.onAddItem = function () {
            this.addItem('', this.selected.index - 1);
        };
        ChecklistEditController.prototype.onChangeItem = function (index) {
            if (index > -1 && this.checklistContent[index] && this.checklistContent[index].empty) {
                if (this.checklistContent[index].empty) {
                    this.checklistContent[index].empty = false;
                    this.checklistContent.push(this.getNewItem('', true));
                }
            }
            this._debounceChange();
        };
        ChecklistEditController.prototype.onClick = function ($event, index) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.index = index;
        };
        ChecklistEditController.prototype.onTextAreaClick = function ($event, index) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.index = index;
        };
        ChecklistEditController.prototype.onDropComplete = function (placeIndex, obj, $event, componentId) {
            if (this.selected.id != componentId) {
                return;
            }
            if (!this.selected.drag) {
                return;
            }
            var index = placeIndex;
            var tmpIndex = this.selected.index;
            var checklist = _.cloneDeep(this.checklistContent);
            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > checklist.length - 1) {
                        index = checklist.length - 1;
                    }
                    for (var i_1 = 0; i_1 < tmpIndex - index; i_1++) {
                        checklist[tmpIndex - i_1] = checklist[tmpIndex - i_1 - 1];
                    }
                    checklist[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    for (var i = 0; i < index - tmpIndex; i++) {
                        checklist[tmpIndex + i] = checklist[tmpIndex + i + 1];
                    }
                    checklist[index] = obj;
                }
                this.selected.index = index;
            }
            this.checklistContent = checklist;
            this._debounceChange();
        };
        ChecklistEditController.prototype.onMove = function () {
            this.setWidth();
            this.isWidth = true;
        };
        ChecklistEditController.prototype.onStop = function (id) {
            var _this = this;
            this.$timeout(function () {
                _this.selected.drag = _this.selected.dragInit;
                _this.selected.dragId = 0;
            }, 50);
            if (this.isWidth) {
                this.setWidth100();
                this.isWidth = false;
            }
        };
        ChecklistEditController.prototype.onStart = function (id) {
            this.selected.isChanged = true;
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        };
        ChecklistEditController.prototype.onDownDragg = function (item) {
            if (this.pipDraggable && this.checklistContent.length > 2 && !item.empty) {
                this.$rootScope.$broadcast(exports.ChecklistDraggEvent);
                this.selected.dragId = this.selected.id;
            }
        };
        ChecklistEditController.prototype.onDeleteItem = function (index, item) {
            if (this.checklistContent.length == 1) {
                this.checklistContent[0].text = '';
                this.checklistContent[0].checked = false;
                this.checklistContent[0].empty = true;
                this.selected.index = 0;
            }
            else {
                if (index >= 0 && index <= this.checklistContent.length) {
                    this.checklistContent.splice(index, 1);
                }
                else {
                    return;
                }
            }
            if (this.selected.index >= this.checklistContent.length) {
                this.selected.index = this.checklistContent.length - 1;
            }
            this.setFocus(this.selected.index, 0);
            this._debounceChange();
        };
        ChecklistEditController.prototype.onChecked = function (item) {
            this._debounceChange();
        };
        ChecklistEditController.prototype.onChecklistChange = function () {
            var _this = this;
            this.updateContents();
            if (this.pipChanged) {
                this.$timeout(function () {
                    _this.pipChanged(_this.pipOptions);
                }, 0);
            }
        };
        ChecklistEditController.prototype.onTextareaKeyDown = function ($event, index, item) {
            if (this.ngDisabled)
                return;
            if (this.selected.index == -1)
                return;
            var textareaLength;
            var posCaret;
            if ($event && $event.target) {
                posCaret = this.getCaret($event.target);
                if ($event.target['value'] !== undefined) {
                    textareaLength = $event.target['value'].length;
                }
            }
            if (this.selected.index > 0 && item.text != '' && posCaret == 0 && $event.keyCode == 8 && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    var position = this.checklistContent[this.selected.index - 1].text.length;
                    this.checklistContent[this.selected.index - 1].text = this.checklistContent[this.selected.index - 1].text + item.text;
                    this.selected.index -= 1;
                    this.checklistContent.splice(this.selected.index + 1, 1);
                    this._debounceChange();
                    this.setFocus(this.selected.index, position);
                }
                if ($event) {
                    $event.stopPropagation();
                }
                return false;
            }
            if (item.text == '' && ($event.keyCode == 8 || $event.keyCode == 46) && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    this.onDeleteItem(index, item);
                }
                if ($event) {
                    $event.stopPropagation();
                }
                return false;
            }
            if (($event.keyCode == 13 || $event.keyCode == 45) && !$event.ctrlKey && !$event.shiftKey) {
                if (posCaret !== undefined && posCaret == 0) {
                    if (this.selected.index > 0) {
                        this.addItem('', this.selected.index - 1);
                    }
                    else {
                        this.selected.index = -1;
                        this.addItem('', -1);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if (textareaLength && posCaret && textareaLength == posCaret) {
                    if (!item.empty) {
                        this.addItem('', this.selected.index);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if (textareaLength && posCaret && textareaLength > posCaret) {
                    if (!item.empty) {
                        var valueCurrent = void 0;
                        var newItem = void 0;
                        valueCurrent = item.text.substring(0, posCaret);
                        newItem = item.text.substring(posCaret);
                        item.text = valueCurrent;
                        this.addItem(newItem, this.selected.index);
                        this.setFocus(this.selected.index, 0);
                    }
                    if ($event) {
                        $event.stopPropagation();
                    }
                    if ($event) {
                        $event.preventDefault();
                    }
                    return false;
                }
                if ($event) {
                    $event.preventDefault();
                }
                return false;
            }
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 38 && !$event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (posCaret !== undefined && textareaLength !== undefined && posCaret == 0) {
                    if (this.selected.index == 0) {
                        this.selected.index = this.checklistContent.length - 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    }
                    else {
                        this.selected.index -= 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    }
                }
                else {
                    this.setFocus(this.selected.index, 0);
                }
                return false;
            }
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 40 && !$event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (posCaret !== undefined && textareaLength !== undefined && posCaret == textareaLength) {
                    if (this.selected.index >= this.checklistContent.length - 1) {
                        this.selected.index = 0;
                        this.setFocus(this.selected.index, 0);
                    }
                    else {
                        this.selected.index += 1;
                        this.setFocus(this.selected.index, 0);
                    }
                }
                else {
                    this.setFocus(this.selected.index, textareaLength);
                }
                return false;
            }
            if (!item.empty && $event.keyCode == 46 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                this.onDeleteItem(index, item);
                return false;
            }
            if ($event.keyCode == 32 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                }
                if ($event) {
                    $event.preventDefault();
                }
                if (item) {
                    item.checked = !item.checked;
                    this._debounceChange();
                }
                return false;
            }
        };
        return ChecklistEditController;
    }());
    var ChecklistEdit = {
        bindings: ChecklistEditBindings,
        templateUrl: 'checklist_edit/ChecklistEdit.html',
        controller: ChecklistEditController
    };
    angular.module("pipChecklistEdit", ['pipComposite.Templates', 'pipBehaviors'])
        .component('pipChecklistEdit', ChecklistEdit);
}
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var ChecklistViewBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipOptions: '=',
        pipRebind: '<?'
    };
    var ChecklistViewBindingsChanges = (function () {
        function ChecklistViewBindingsChanges() {
        }
        return ChecklistViewBindingsChanges;
    }());
    var ChecklistViewController = (function () {
        ChecklistViewController.$inject = ['$element'];
        function ChecklistViewController($element) {
            "ngInject";
            this.$element = $element;
            this.isChanged = false;
            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }
            $element.addClass('pip-checklist-view');
        }
        ChecklistViewController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.isChanged) {
                            this.pipOptions = changes.pipOptions.currentValue;
                        }
                        else {
                            this.isChanged = false;
                        }
                    }
                }
            }
        };
        ChecklistViewController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        ChecklistViewController.prototype.onChecklistChange = function () {
            this.isChanged = true;
            if (this.pipChanged) {
                this.pipChanged(this.pipOptions);
            }
        };
        ChecklistViewController.prototype.onClick = function ($event, item) {
            if ($event) {
                $event.stopPropagation();
            }
            if (this.ngDisabled) {
                return;
            }
            this.onChecklistChange();
        };
        return ChecklistViewController;
    }());
    var ChecklistView = {
        bindings: ChecklistViewBindings,
        templateUrl: 'checklist_view/ChecklistView.html',
        controller: ChecklistViewController
    };
    angular.module("pipChecklistView", ['pipComposite.Templates'])
        .component('pipChecklistView', ChecklistView);
}
},{}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ChecklistEdit_1 = require("../checklist_edit/ChecklistEdit");
var CompositeFocused_1 = require("../utilities/CompositeFocused");
var data_1 = require("../data");
var async = require('async');
exports.CompositeEmptyEvent = 'pipCompositeNotEmpty';
exports.CompositeAddItemEvent = 'pipAddContent';
exports.CompositeNotEmptyEvent = 'pipCompositeNotEmpty';
var CompositeAddItem = (function () {
    function CompositeAddItem() {
    }
    return CompositeAddItem;
}());
exports.CompositeAddItem = CompositeAddItem;
var ConfigTranslations = function (pipTranslate) {
    if (pipTranslate) {
        (pipTranslate).setTranslations('en', {
            'COMPOSITE_TITLE': 'What\'s on your mind?',
            'COMPOSITE_PLACEHOLDER': 'Type text ...',
            'COMPOSITE_START_TIME': 'Start time',
            'COMPOSITE_END_TIME': 'End time'
        });
        (pipTranslate).setTranslations('ru', {
            'COMPOSITE_TITLE': 'Что у вас на уме?',
            'COMPOSITE_PLACEHOLDER': 'Введите текст ...',
            'COMPOSITE_START_TIME': 'Время начала',
            'COMPOSITE_END_TIME': 'Время окончания'
        });
    }
};
ConfigTranslations.$inject = ['pipTranslate'];
var CompositeControl = (function () {
    function CompositeControl() {
    }
    return CompositeControl;
}());
exports.CompositeControl = CompositeControl;
var SenderEvent = (function () {
    function SenderEvent() {
    }
    return SenderEvent;
}());
var CompositeContent = (function (_super) {
    __extends(CompositeContent, _super);
    function CompositeContent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CompositeContent;
}(data_1.ContentBlock));
exports.CompositeContent = CompositeContent;
var CompositeBlockTypes = (function () {
    function CompositeBlockTypes() {
    }
    return CompositeBlockTypes;
}());
CompositeBlockTypes.Text = 'text';
CompositeBlockTypes.Pictures = 'pictures';
CompositeBlockTypes.Checklist = 'checklist';
CompositeBlockTypes.Documents = 'documents';
CompositeBlockTypes.Location = 'location';
CompositeBlockTypes.Time = 'time';
CompositeBlockTypes.SecondaryBlock = ['checklist', 'documents', 'location', 'time'];
CompositeBlockTypes.PrimaryBlock = ['text', 'pictures'];
CompositeBlockTypes.All = ['text', 'pictures', 'checklist', 'documents', 'location', 'time'];
exports.CompositeBlockTypes = CompositeBlockTypes;
{
    var CompositeSelected_1 = (function () {
        function CompositeSelected_1() {
            this.index = 0;
            this.drag = true;
            this.dragId = 0;
            this.isChanged = false;
        }
        return CompositeSelected_1;
    }());
    var CompositeEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipCreated: '&?',
        pipContents: '=?',
        compositeId: '<?pipCompositeId',
        pipCompositePlaceholder: '<?',
        pipScrollContainer: '<?',
        addedContent: '<?pipAddedContent',
        pipRebind: '<?'
    };
    var CompositeEditBindingsChanges = (function () {
        function CompositeEditBindingsChanges() {
        }
        return CompositeEditBindingsChanges;
    }());
    var CompositeEditController = (function () {
        CompositeEditController.$inject = ['$q', '$element', '$timeout', '$document', '$rootScope', 'pipTranslate'];
        function CompositeEditController($q, $element, $timeout, $document, $rootScope, pipTranslate) {
            "ngInject";
            var _this = this;
            this.$q = $q;
            this.$element = $element;
            this.$timeout = $timeout;
            this.$document = $document;
            this.$rootScope = $rootScope;
            this.pipTranslate = pipTranslate;
            this.defaultPlaceholder = 'COMPOSITE_PLACEHOLDER';
            this.CONTENT_TYPES = CompositeBlockTypes.All;
            this.selected = new CompositeSelected_1();
            this.selected.id = this.now();
            $element.addClass('pip-composite-edit');
            this.generateList(this.pipContents);
            this.setPlaceholder();
            this.control = {
                save: function (successCallback, errorCallback) {
                    _this.saveContent(successCallback, errorCallback);
                },
                abort: function () {
                    _this.abortContent();
                },
                error: null
            };
            this.executeCallback();
            this.cleanupCompositeEvent = this.$rootScope.$on(exports.CompositeAddItemEvent, function (event, args) {
                if (_this.compositeId) {
                    if (args.id && args.id == _this.compositeId) {
                        _this.addItem(args.type);
                    }
                }
                else {
                    _this.addItem(args.type);
                }
            });
            this.cleanupChecklistDraggEvent = this.$rootScope.$on(ChecklistEdit_1.ChecklistDraggEvent, function () {
                _this.selected.drag = false;
                _this.$timeout(function () {
                    _this.selected.drag = false;
                }, 0);
            });
            this.cleanupCompositeFocusedEvent = this.$rootScope.$on(CompositeFocused_1.CompositeFocusedEvent, function () {
                if (_this.isFirst) {
                    _this.$timeout(function () {
                        var nextElement = angular.element('#composite-item-text-' + _this.selected.id + '-0');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                }
            });
            this._debounceChange = _.debounce(function () {
                _this.onCompositeChange();
            }, 200);
        }
        CompositeEditController.prototype.abortContent = function () {
            _.each(this.compositeContent, function (item) {
                if (item.pictures && item.pictures.abort) {
                    item.pictures.abort();
                }
                else if (item.documents && item.documents.abort) {
                    item.documents.abort();
                }
            });
        };
        CompositeEditController.prototype.getPicIdsArray = function (data) {
            var result = [];
            _.each(data, function (item) {
                if (item.id) {
                    result.push(item.id);
                }
            });
            return result;
        };
        CompositeEditController.prototype.saveContent = function (successCallback, errorCallback, abortFirstError) {
            var _this = this;
            var content;
            content = _.cloneDeep(this.compositeContent);
            var saveFirstError = null;
            async.eachOf(this.compositeContent, function (item, index, callback) {
                if (item.pictures && item.pictures.save) {
                    item.pictures.save(function (data) {
                        delete item.picIds;
                        item.pic_ids = _this.getPicIdsArray(data);
                        callback();
                    }, function (error) {
                        saveFirstError = saveFirstError ? saveFirstError : error;
                        if (abortFirstError) {
                            callback(error);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else if (item.documents && item.documents.save) {
                    item.documents.save(function (data) {
                        item.docs = data;
                        callback();
                    }, function (error) {
                        saveFirstError = saveFirstError ? saveFirstError : error;
                        if (abortFirstError) {
                            callback(error);
                        }
                        else {
                            callback();
                        }
                    });
                }
                else {
                    callback();
                }
            }, function (error, result) {
                if (error || saveFirstError) {
                    if (abortFirstError) {
                        _this.abortContent();
                    }
                    _this.compositeContent = content;
                    if (errorCallback)
                        errorCallback(error);
                }
                else {
                    _this.onCompositeChange();
                    if (successCallback)
                        successCallback(_this.pipContents);
                }
            });
        };
        CompositeEditController.prototype.$onDestroy = function () {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
            if (angular.isFunction(this.cleanupChecklistDraggEvent)) {
                this.cleanupChecklistDraggEvent();
            }
            if (angular.isFunction(this.cleanupCompositeFocusedEvent)) {
                this.cleanupCompositeFocusedEvent();
            }
        };
        CompositeEditController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    if (!this.selected.isChanged || (this.pipContents
                        && this.pipContents.length != this.compositeContent.length)) {
                        this.generateList(this.pipContents);
                        this.selected.isChanged = false;
                    }
                }
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (changes.pipCompositePlaceholder && changes.pipCompositePlaceholder.currentValue !== changes.pipCompositePlaceholder.previousValue) {
                this.pipCompositePlaceholder = changes.pipCompositePlaceholder.currentValue;
                this.setPlaceholder();
            }
        };
        CompositeEditController.prototype.executeCallback = function () {
            if (this.pipCreated) {
                this.pipCreated({
                    event: this.control
                });
            }
        };
        CompositeEditController.prototype.toBoolean = function (value) {
            if (value == null) {
                return false;
            }
            if (!value) {
                return false;
            }
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeEditController.prototype.getEmptyItem = function () {
            var emptyItem = {
                empty: true,
                id: this.getId(),
                type: 'text',
                text: '', docs: [], pic_ids: [], loc_pos: null, loc_name: '',
                start: null, end: null, checklist: []
            };
            return emptyItem;
        };
        CompositeEditController.prototype.setPlaceholder = function () {
            this.compositePlaceholder =
                (this.pipCompositePlaceholder === undefined || this.pipCompositePlaceholder === null) ?
                    this.pipTranslate.translate(this.defaultPlaceholder) :
                    this.pipTranslate.translate(this.pipCompositePlaceholder);
        };
        CompositeEditController.prototype.addItem = function (contentType, value) {
            if (_.indexOf(this.CONTENT_TYPES, contentType) < 0)
                return;
            var newItem = {
                id: this.getId(),
                type: contentType,
                text: contentType == 'text' ? value : '',
                docs: contentType == 'documents' && value ? value : [],
                pic_ids: contentType == 'pictures' && value ? value : [],
                loc_pos: contentType == 'location' && value ? value.loc_pos : null,
                loc_name: contentType == 'location' && value ? value.loc_name : '',
                start: contentType == 'time' && value ? value.start : null,
                end: contentType == 'time' && value ? value.end : null,
                checklist: contentType == 'checklist' && value ? value : []
            };
            var index = _.findIndex(this.compositeContent, { id: this.selected.index });
            index = index < 0 ? 0 : index;
            if (this.compositeContent.length == 1 && this.compositeContent[0].empty) {
                this.compositeContent[0] = newItem;
            }
            else {
                this.compositeContent.splice(index + 1, 0, newItem);
                index += 1;
            }
            this.selected.index = newItem.id;
            this.onSelect();
            setTimeout(this.scrollTo(this.pipScrollContainer, '#composite-item-' + this.selected.id + '-' + index), 1000);
            this.isFirst = false;
            this.setToolbar();
            this._debounceChange();
        };
        CompositeEditController.prototype.getId = function () {
            var id = -1;
            _.each(this.compositeContent, function (item) {
                if (id < item.id)
                    id = item.id;
            });
            return id + 1;
        };
        CompositeEditController.prototype.scrollTo = function (parentElement, childElement) {
            if (!parentElement || !childElement) {
                return;
            }
            setTimeout(function () {
                if (!$(childElement).position()) {
                    return;
                }
                var modDiff = Math.abs($(parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) {
                    return;
                }
                var scrollTo = $(parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
        };
        CompositeEditController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeEditController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                this.compositeContent = [];
                _.each(content, function (item) {
                    item.id = _this.getId();
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    _this.compositeContent.push(item);
                });
                this.isFirst = false;
            }
            this.setToolbar();
        };
        CompositeEditController.prototype.setToolbar = function () {
            if (this.compositeContent.length > 2) {
                return;
            }
            this.$rootScope.$emit(exports.CompositeNotEmptyEvent, !this.isFirst);
        };
        CompositeEditController.prototype.clearList = function () {
            this.compositeContent = [];
            this.compositeContent.push(this.getEmptyItem());
            this.isFirst = true;
        };
        CompositeEditController.prototype.now = function () {
            return +new Date;
        };
        CompositeEditController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        };
        CompositeEditController.prototype.getParentIndex = function (el) {
            if (el.length < 1)
                return null;
            var elParent = el.parent();
            if (elParent[0] && elParent[0].id && elParent[0].id.indexOf('composite-item-' + this.selected.id) > -1) {
                var strs = elParent[0].id.split('-');
                var parentIndex = parseInt(strs[strs.length - 1], 10);
                return parentIndex;
            }
            else {
                return this.getParentIndex(elParent);
            }
        };
        CompositeEditController.prototype.isActiveChecklist = function (obj) {
            return obj.id == this.selected.id;
        };
        CompositeEditController.prototype.onKeyUp = function ($event) {
            var _this = this;
            if ($event.keyCode == 9) {
                this.$timeout(function () {
                    var focusedElement = angular.element(_this.$document[0].activeElement);
                    var parentIndex = _this.getParentIndex(focusedElement);
                    if (parentIndex != null) {
                        _this.selected.index = parentIndex;
                    }
                    _this.selected.index = _this.compositeContent[parentIndex].id;
                }, 50);
            }
        };
        CompositeEditController.prototype.onKeyDown = function ($event, index, item) {
            if (this.ngDisabled) {
                return;
            }
            if (item && !item.empty && $event.keyCode == 46 && !$event.ctrlKey && $event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                    $event.preventDefault();
                }
                if (index > -1) {
                    this.onDeleteItem(index);
                }
            }
        };
        CompositeEditController.prototype.onCompositeChange = function () {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        };
        CompositeEditController.prototype.onDeleteItem = function (index) {
            if (index < 0 || this.compositeContent.length == 0)
                return;
            if (this.compositeContent.length == 1) {
                this.compositeContent[0] = this.getEmptyItem();
                this.selected.index = this.compositeContent[0].id;
                this.onSelect(0);
                this.isFirst = true;
                this.setToolbar();
            }
            else {
                if (index >= 0 && index < this.compositeContent.length) {
                    this.compositeContent.splice(index, 1);
                }
                if (index == this.compositeContent.length) {
                    this.selected.index = this.compositeContent[this.compositeContent.length - 1].id;
                }
                else {
                    this.selected.index = this.compositeContent[index].id;
                }
                this.onSelect();
            }
            this.setToolbar();
            this._debounceChange();
        };
        CompositeEditController.prototype.onContentChange = function (obj) {
            if (obj && obj.empty && obj.text) {
                obj.empty = false;
                this.isFirst = false;
                this.setToolbar();
            }
            if (!this.ngDisabled) {
                this._debounceChange();
            }
        };
        CompositeEditController.prototype.isSelectedSection = function (index, obj) {
            return this.selected.index == obj.id && !obj.empty;
        };
        CompositeEditController.prototype.onDraggEnd = function () {
            this.selected.drag = true;
        };
        CompositeEditController.prototype.onStart = function (id) {
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        };
        CompositeEditController.prototype.onStop = function (id) {
            var _this = this;
            this.$timeout(function () {
                _this.selected.drag = true;
                _this.selected.dragId = 0;
            }, 500);
        };
        CompositeEditController.prototype.onDownDragg = function ($event, obj) {
            if (this.ngDisabled)
                return;
            this.selected.dragId = this.selected.id;
            this.selected.drag = true;
            this.selected.index = obj.id;
        };
        CompositeEditController.prototype.onClick = function ($event, index, obj) {
            if (this.ngDisabled) {
                return;
            }
            this.selected.event = 'onClick';
            if ($event && $event.target && $event.target.tagName &&
                ($event.target.tagName == 'INPUT' || $event.target.tagName == 'TEXTAREA')) {
                this.selected.index = obj.id;
                return;
            }
            if ((this.selected.index == obj.id && obj.type == 'checklist' && obj.checklist.length > 0) ||
                (this.selected.index == obj.id && obj.type == 'location')) {
                return;
            }
            this.selected.index = obj.id;
            this.onSelect();
        };
        CompositeEditController.prototype.onDropComplete = function (placeIndex, obj, event, componentId) {
            if (componentId != this.selected.id || !obj || !obj.type) {
                this.compositeContent = _.cloneDeep(this.pipContents);
                return;
            }
            var index = placeIndex;
            var tmpIndex = _.findIndex(this.compositeContent, { id: obj.id });
            var i;
            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > this.compositeContent.length - 1)
                        index = this.compositeContent.length - 1;
                    for (i = 0; i < tmpIndex - index; i++) {
                        this.compositeContent[tmpIndex - i] = this.compositeContent[tmpIndex - i - 1];
                    }
                    this.compositeContent[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    for (i = 0; i < index - tmpIndex; i++) {
                        this.compositeContent[tmpIndex + i] = this.compositeContent[tmpIndex + i + 1];
                    }
                    this.compositeContent[index] = obj;
                }
                this.selected.index = this.compositeContent[index].id;
            }
            this.onSelect();
            this._debounceChange();
        };
        CompositeEditController.prototype.onSelect = function (index) {
            var _this = this;
            if (!index) {
                index = _.findIndex(this.compositeContent, { id: this.selected.index });
            }
            if (index < 0) {
                return;
            }
            var item = this.compositeContent[index];
            if (_.isEmpty(item)) {
                return;
            }
            var nextElement;
            switch (item.type) {
                case 'pictures':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' button.pip-picture-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'documents':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' button.pip-document-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'location':
                    setTimeout(function () {
                        nextElement = angular.element('#composite-item-' + _this.selected.id + '-' + index + ' .pip-location-empty  button');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'time':
                    break;
            }
        };
        return CompositeEditController;
    }());
    var CompositeEdit = {
        bindings: CompositeEditBindings,
        templateUrl: 'composite_edit/CompositeEdit.html',
        controller: CompositeEditController
    };
    angular.module("pipCompositeEdit", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .run(ConfigTranslations)
        .component('pipCompositeEdit', CompositeEdit);
}
},{"../checklist_edit/ChecklistEdit":4,"../data":15,"../utilities/CompositeFocused":22,"async":1}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompositeEdit_1 = require("../composite_edit/CompositeEdit");
{
    var CompositeSummaryBindings = {
        pipContents: '<?',
        pipChecklistSize: '<?',
        pipTextSize: '<?',
        pipPrimaryBlockLimit: '<?',
        pipSecondaryBlockLimit: '<?',
        pipSecondaryBlockTypes: '<?',
        pipRebind: '<?'
    };
    var CompositeSummaryBindingsChanges = (function () {
        function CompositeSummaryBindingsChanges() {
        }
        return CompositeSummaryBindingsChanges;
    }());
    var CompositeSummaryController = (function () {
        CompositeSummaryController.$inject = ['$element'];
        function CompositeSummaryController($element) {
            "ngInject";
            this.$element = $element;
            this.disableControl = true;
            this.disabledChecklist = true;
            $element.addClass('pip-composite-summary');
            this.pipChecklistSize = this.pipChecklistSize ? this.pipChecklistSize : 0;
            this.pipTextSize = this.pipTextSize ? this.pipTextSize : 0;
            this.pipPrimaryBlockLimit = this.pipPrimaryBlockLimit === undefined || this.pipPrimaryBlockLimit === null ? -1 : this.pipPrimaryBlockLimit;
            this.pipSecondaryBlockLimit = this.pipSecondaryBlockLimit === undefined || this.pipSecondaryBlockLimit === null ? -1 : this.pipSecondaryBlockLimit;
            this.pipSecondaryBlockTypes = this.pipSecondaryBlockTypes && _.isArray(this.pipSecondaryBlockTypes) ? this.pipSecondaryBlockTypes : CompositeEdit_1.CompositeBlockTypes.SecondaryBlock;
            this.generateList(this.pipContents);
        }
        CompositeSummaryController.prototype.$onChanges = function (changes) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipContents && changes.pipContents.currentValue) {
                    if (!angular.equals(this.pipContents, changes.pipContents.currentValue)) {
                        this.generateList(this.pipContents);
                    }
                }
            }
        };
        CompositeSummaryController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeSummaryController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeSummaryController.prototype.limitChecklist = function (content, val) {
            if (!val)
                return;
            var ellapsed = {
                text: '...',
                checked: false
            };
            _.each(content, function (item) {
                if (item && item.type == CompositeEdit_1.CompositeBlockTypes.Checklist) {
                    var checklistLength = item.checklist.length;
                    item.checklist = _.take(item.checklist, val);
                    if (checklistLength > val) {
                        item.checklist.push(ellapsed);
                    }
                }
            });
        };
        ;
        CompositeSummaryController.prototype.selectSummary = function (content) {
            var _this = this;
            var result = [];
            var i;
            _.each(content, function (item) {
                if (_this.pipPrimaryBlockLimit >= 0 && i >= _this.pipPrimaryBlockLimit) {
                    return result;
                }
                if (_this.pipSecondaryBlockTypes.indexOf(item.type) < 0) {
                    result.push(item);
                    i += 1;
                }
            });
            return result;
        };
        CompositeSummaryController.prototype.selectSummarySecondary = function (content, types) {
            var i;
            var limit = this.pipSecondaryBlockLimit < 0 ? content.length : this.pipSecondaryBlockLimit;
            var result = [];
            for (i; i < content.length; i++) {
                if (types.indexOf(content[i].type) > -1) {
                    result.push(content[i]);
                    if (result.length >= limit) {
                        break;
                    }
                }
            }
            return result;
        };
        CompositeSummaryController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                var summaryContent = _.cloneDeep(content);
                var result = this.selectSummary(summaryContent);
                if (result.length == 0) {
                    result = this.selectSummarySecondary(summaryContent, this.pipSecondaryBlockTypes);
                }
                this.limitChecklist(result, this.pipChecklistSize);
                var id_1;
                _.each(result, function (item) {
                    item.id = id_1;
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    id_1++;
                });
                this.compositeContent = result;
            }
        };
        CompositeSummaryController.prototype.clearList = function () {
            this.compositeContent = [];
        };
        return CompositeSummaryController;
    }());
    var CompositeSummary = {
        bindings: CompositeSummaryBindings,
        templateUrl: 'composite_summary/CompositeSummary.html',
        controller: CompositeSummaryController
    };
    angular.module("pipCompositeSummary", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .component('pipCompositeSummary', CompositeSummary);
}
},{"../composite_edit/CompositeEdit":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompositeEdit_1 = require("../composite_edit/CompositeEdit");
var CompositeAddItemEventParams = (function () {
    function CompositeAddItemEventParams() {
    }
    return CompositeAddItemEventParams;
}());
exports.CompositeAddItemEventParams = CompositeAddItemEventParams;
var CompositeToolbarButton = (function () {
    function CompositeToolbarButton() {
        this.picture = true;
        this.document = true;
        this.location = true;
        this.event = true;
        this.checklist = true;
        this.text = true;
    }
    return CompositeToolbarButton;
}());
exports.CompositeToolbarButton = CompositeToolbarButton;
{
    var translateConfig = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'TEXT': 'Text',
            'CHECKLIST': 'Checklist',
            'LOCATION': 'Location',
            'PICTURE': 'Picture',
            'TIME': 'Time',
            'DOCUMENT': 'Document'
        });
        pipTranslateProvider.translations('ru', {
            'TEXT': 'Текст',
            'CHECKLIST': 'Список',
            'LOCATION': 'Локация',
            'PICTURE': 'Изображение',
            'TIME': 'Время',
            'DOCUMENT': 'Document'
        });
    };
    translateConfig.$inject = ['pipTranslateProvider'];
    var CompositeToolbarBindings = {
        ngDisabled: '<?',
        emptyState: '<?pipCompositeEmpty',
        pipToolbarButton: '=?',
        compositeId: '=?pipCompositeId',
    };
    var CompositeToolbarBindingsChanges = (function () {
        function CompositeToolbarBindingsChanges() {
        }
        ;
        return CompositeToolbarBindingsChanges;
    }());
    var CompositeToolbarController = (function () {
        CompositeToolbarController.$inject = ['$rootScope', '$element'];
        function CompositeToolbarController($rootScope, $element) {
            "ngInject";
            var _this = this;
            this.$rootScope = $rootScope;
            this.$element = $element;
            this.toolbarButton = new CompositeToolbarButton();
            this.setOption();
            $element.addClass('pip-composite-toolbar');
            this.cleanupCompositeEvent = this.$rootScope.$on(CompositeEdit_1.CompositeEmptyEvent, function (event, value) {
                _this.emptyState = !value;
            });
        }
        CompositeToolbarController.prototype.$onDestroy = function () {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
        };
        CompositeToolbarController.prototype.$onChanges = function (changes) {
            if (changes.pipToolbarButton && changes.pipToolbarButton.currentValue) {
                this.setOption();
            }
        };
        CompositeToolbarController.prototype.toBoolean = function (value) {
            if (value == null)
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        CompositeToolbarController.prototype.onAddItem = function (contentType) {
            var params = {
                type: contentType,
                id: this.compositeId
            };
            this.$rootScope.$emit(CompositeEdit_1.CompositeAddItemEvent, params);
        };
        ;
        CompositeToolbarController.prototype.setOption = function () {
            _.assign(this.pipToolbarButton, this.pipToolbarButton);
            this.toolbarButton.text = true;
        };
        ;
        return CompositeToolbarController;
    }());
    var CompositeToolbar = {
        bindings: CompositeToolbarBindings,
        templateUrl: 'composite_toolbar/CompositeToolbar.html',
        controller: CompositeToolbarController
    };
    angular.module("pipCompositeToolbar", ['pipComposite.Templates'])
        .config(translateConfig)
        .component('pipCompositeToolbar', CompositeToolbar);
}
},{"../composite_edit/CompositeEdit":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var CompositeViewBindings = {
        ngDisabled: '<?',
        pipDisabledChecklist: '<?',
        pipChanged: '=?',
        pipContents: '=?',
        pipRebind: '<?'
    };
    var CompositeViewBindingsChanges = (function () {
        function CompositeViewBindingsChanges() {
        }
        return CompositeViewBindingsChanges;
    }());
    var CompositeViewController = (function () {
        CompositeViewController.$inject = ['$element', '$attrs'];
        function CompositeViewController($element, $attrs) {
            "ngInject";
            this.$element = $element;
            this.$attrs = $attrs;
            this.selected = {};
            $element.addClass('pip-composite-view');
            this.selected.isChanged = false;
            this.pipContents = _.isArray(this.pipContents) ? this.pipContents : [];
            this.generateList(this.pipContents);
        }
        CompositeViewController.prototype.$onChanges = function (changes) {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    this.selected.isChanged === true ? this.selected.isChanged = false : this.generateList(changes.pipContents.currentValue);
                }
            }
            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }
            if (changes.pipDisabledChecklist && changes.pipDisabledChecklist.currentValue !== changes.pipDisabledChecklist.previousValue) {
                this.pipDisabledChecklist = changes.pipDisabledChecklist.currentValue;
            }
        };
        CompositeViewController.prototype.getPicIds = function (ids) {
            var result = [];
            _.each(ids, function (id) {
                var item = {
                    id: id
                };
                result.push(item);
            });
            return result;
        };
        CompositeViewController.prototype.updateContents = function () {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        };
        CompositeViewController.prototype.isDisabled = function () {
            return this.pipDisabledChecklist === true || this.ngDisabled === true;
        };
        CompositeViewController.prototype.onContentChange = function () {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        };
        CompositeViewController.prototype.onCompositeChange = function () {
            this.updateContents();
            if (this.pipChanged)
                this.pipChanged(this.pipContents);
        };
        CompositeViewController.prototype.generateList = function (content) {
            var _this = this;
            if (!content || content.length < 1) {
                this.clearList();
                return;
            }
            else {
                this.compositeContent = [];
                var id_1 = 0;
                _.each(content, function (item) {
                    if (typeof (item) != 'object' || item == null) {
                        throw new Error('Error: content error!');
                    }
                    item.id = id_1;
                    item.picIds = item.pic_ids ? _this.getPicIds(item.pic_ids) : null;
                    id_1++;
                    _this.compositeContent.push(item);
                });
            }
        };
        CompositeViewController.prototype.clearList = function () {
            this.compositeContent = [];
        };
        return CompositeViewController;
    }());
    var CompositeView = {
        bindings: CompositeViewBindings,
        templateUrl: 'composite_view/CompositeView.html',
        controller: CompositeViewController
    };
    angular.module("pipCompositeView", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates', 'pipEmbeddedView'])
        .component('pipCompositeView', CompositeView);
}
},{}],10:[function(require,module,exports){
{
    var ContentSwitchLink_1 = (function () {
        ContentSwitchLink_1.$inject = ['$parse', '$scope', '$element', '$attrs'];
        function ContentSwitchLink_1($parse, $scope, $element, $attrs) {
            "ngInject";
            this.$parse = $parse;
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
            this.parentElementNameGetter = $parse($attrs.pipParentElementName);
            this.parentElement = this.parentElementNameGetter($scope);
            this.setOption();
        }
        ContentSwitchLink_1.prototype.scrollTo = function (childElement) {
            var _this = this;
            setTimeout(function () {
                var modDiff = Math.abs($(_this.parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) {
                    return;
                }
                var scrollTo = $(_this.parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(_this.parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
        };
        ;
        ContentSwitchLink_1.prototype.setOption = function () {
            if (this.$scope.contentSwitchOption !== null && this.$scope.contentSwitchOption !== undefined) {
                this.$scope.showIconPicture = this.$scope.contentSwitchOption.picture ? this.$scope.contentSwitchOption.picture : this.$scope.showIconPicture;
                this.$scope.showIconDocument = this.$scope.contentSwitchOption.document ? this.$scope.contentSwitchOption.document : this.$scope.showIconDocument;
                this.$scope.showIconLocation = this.$scope.contentSwitchOption.location ? this.$scope.contentSwitchOption.location : this.$scope.showIconLocation;
                this.$scope.showIconEvent = this.$scope.contentSwitchOption.event ? this.$scope.contentSwitchOption.event : this.$scope.showIconEvent;
            }
            else {
                this.$scope.showIconPicture = true;
                this.$scope.showIconDocument = true;
                this.$scope.showIconLocation = true;
                this.$scope.showIconEvent = true;
            }
        };
        ;
        ContentSwitchLink_1.prototype.onButtonClick = function (type) {
            if (!this.parentElement)
                return;
            switch (type) {
                case 'event':
                    if (this.$scope.showEvent)
                        scrollTo('.event-edit');
                    break;
                case 'documents':
                    if (this.$scope.showDocuments)
                        scrollTo('.pip-document-list-edit');
                    break;
                case 'pictures':
                    if (this.$scope.showPictures)
                        scrollTo('.pip-picture-list-edit');
                    break;
                case 'location':
                    if (this.$scope.showLocation)
                        scrollTo('.pip-location-edit');
                    break;
            }
            ;
        };
        ;
        return ContentSwitchLink_1;
    }());
    var ContentSwitch = function ($parse) {
        return {
            restrict: 'EA',
            scope: false,
            templateUrl: 'content_switch/ContentSwitch.html',
            link: function ($scope, $element, $attrs) {
                new ContentSwitchLink_1($parse, $scope, $element, $attrs);
            }
        };
    };
    ContentSwitch.$inject = ['$parse'];
    angular.module("pipContentSwitch", ['pipComposite.Templates'])
        .directive('pipContentSwitch', ContentSwitch);
}
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChecklistItem = (function () {
    function ChecklistItem() {
    }
    return ChecklistItem;
}());
exports.ChecklistItem = ChecklistItem;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContentBlock = (function () {
    function ContentBlock() {
    }
    return ContentBlock;
}());
exports.ContentBlock = ContentBlock;
},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContentBlockType = (function () {
    function ContentBlockType() {
    }
    return ContentBlockType;
}());
ContentBlockType.Text = "text";
ContentBlockType.Checklist = "checklist";
ContentBlockType.Location = "location";
ContentBlockType.Time = "time";
ContentBlockType.Pictures = "pictures";
ContentBlockType.Documents = "documents";
ContentBlockType.Embedded = "embedded";
ContentBlockType.Custom = "custom";
exports.ContentBlockType = ContentBlockType;
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedType = (function () {
    function EmbeddedType() {
    }
    return EmbeddedType;
}());
EmbeddedType.Youtube = "youtube";
EmbeddedType.Custom = "custom";
exports.EmbeddedType = EmbeddedType;
},{}],15:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Content");
require("./ChecklistItem");
require("./ContentBlockType");
__export(require("./Content"));
__export(require("./ChecklistItem"));
__export(require("./ContentBlockType"));
},{"./ChecklistItem":11,"./Content":12,"./ContentBlockType":13}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedType_1 = require("../data/EmbeddedType");
var EmbeddedEditBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
    onChange: '=pipChanged',
    ngDisabled: '&?ngDisabled'
};
var EmbeddedEditChanges = (function () {
    function EmbeddedEditChanges() {
    }
    return EmbeddedEditChanges;
}());
var EmbeddedEditController = (function () {
    EmbeddedEditController.$inject = ['$element', '$scope', '$state', 'pipMedia'];
    function EmbeddedEditController($element, $scope, $state, pipMedia) {
        this.$element = $element;
        this.$scope = $scope;
        this.$state = $state;
        this.pipMedia = pipMedia;
        this.embeddedTypeCollection = [
            { title: 'EMBEDDED_TYPE_CUSTOM', shortTitle: 'EMBEDDED_TYPE_CUSTOM_SHORT', id: EmbeddedType_1.EmbeddedType.Custom },
            { title: 'EMBEDDED_TYPE_YOUTUBE', shortTitle: 'EMBEDDED_TYPE_YOUTUBE_SHORT', id: EmbeddedType_1.EmbeddedType.Youtube }
        ];
        $element.addClass('pip-embedded-edit');
        this.init();
    }
    EmbeddedEditController.prototype.$onInit = function () { };
    EmbeddedEditController.prototype.$onChanges = function (changes) {
        console.log('$onChanges');
        this.init();
    };
    EmbeddedEditController.prototype.$postLink = function () {
        console.log('postlink', this.$scope);
        this.form = this.$scope.embedded;
    };
    EmbeddedEditController.prototype.init = function () {
        if (!this.embed_type) {
            this.embed_type = EmbeddedType_1.EmbeddedType.Custom;
        }
    };
    EmbeddedEditController.prototype.onChangeType = function () {
        console.log('onChangeType');
        if (!this.form.url.$error)
            this.onChange(this.embed_type, this.embed_uri);
    };
    EmbeddedEditController.prototype.onChangeUrl = function () {
        console.log('onChangeUrl');
        this.onChange(this.embed_type, this.embed_uri);
    };
    EmbeddedEditController.prototype.isDisabled = function () {
        if (this.ngDisabled) {
            return this.ngDisabled();
        }
        return false;
    };
    ;
    return EmbeddedEditController;
}());
(function () {
    declaredEmbeddedEditResources.$inject = ['pipTranslateProvider'];
    function declaredEmbeddedEditResources(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            EMBEDDED_TYPE_LABEL: 'Embedded type',
            EMBEDDED_URL_LABEL: 'Embedded uri',
            EMBEDDED_TYPE_HINT: 'Enter uri of embedded resource',
            EMBEDDED_URL_ERROR: 'Uri error',
            EMBEDDED_TYPE_CUSTOM: 'Custom',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Custom',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
        pipTranslateProvider.translations('ru', {
            EMBEDDED_TYPE_LABEL: 'Тип встроенного ресурса',
            EMBEDDED_URL_LABEL: 'Uri встроенного ресурса',
            EMBEDDED_TYPE_HINT: 'Введите uri встроенного ресурса',
            EMBEDDED_URL_ERROR: 'Неверный uri',
            EMBEDDED_TYPE_CUSTOM: 'Другой',
            EMBEDDED_TYPE_YOUTUBE: 'Youtube',
            EMBEDDED_TYPE_CUSTOM_SHORT: 'Другой',
            EMBEDDED_TYPE_YOUTUBE_SHORT: 'Youtube'
        });
    }
    angular
        .module('pipEmbeddedEdit', [])
        .component('pipEmbeddedEdit', {
        bindings: EmbeddedEditBindings,
        templateUrl: 'embedded_edit/EmbeddedEdit.html',
        controller: EmbeddedEditController,
        controllerAs: '$ctrl'
    })
        .config(declaredEmbeddedEditResources);
})();
},{"../data/EmbeddedType":14}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmbeddedViewBindings = {
    embed_type: '=?pipEmbeddedType',
    embed_uri: '=?pipEmbeddedUri',
};
var EmbeddedViewChanges = (function () {
    function EmbeddedViewChanges() {
    }
    return EmbeddedViewChanges;
}());
var EmbeddedViewController = (function () {
    EmbeddedViewController.$inject = ['$element', 'pipMedia'];
    function EmbeddedViewController($element, pipMedia) {
        this.$element = $element;
        this.pipMedia = pipMedia;
        $element.addClass('pip-embedded-view');
        this.init();
    }
    EmbeddedViewController.prototype.$onInit = function () { };
    EmbeddedViewController.prototype.$onChanges = function (changes) {
        console.log('$onChanges');
        this.init();
    };
    EmbeddedViewController.prototype.init = function () {
    };
    return EmbeddedViewController;
}());
(function () {
    resourceYoutubeConfig.$inject = ['$sceDelegateProvider'];
    declaredEmbeddedViewResources.$inject = ['pipTranslateProvider'];
    function declaredEmbeddedViewResources(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {});
        pipTranslateProvider.translations('ru', {});
    }
    function resourceYoutubeConfig($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'https://www.youtube.com/**'
        ]);
    }
    angular
        .module('pipEmbeddedView', [])
        .component('pipEmbeddedView', {
        bindings: EmbeddedViewBindings,
        templateUrl: 'embedded_view/EmbeddedView.html',
        controller: EmbeddedViewController,
        controllerAs: '$ctrl'
    })
        .config(resourceYoutubeConfig)
        .config(declaredEmbeddedViewResources);
})();
},{}],18:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./checklist_edit/ChecklistEdit");
require("./checklist_view/ChecklistView");
require("./composite_edit/CompositeEdit");
require("./composite_summary/CompositeSummary");
require("./composite_toolbar/CompositeToolbar");
require("./composite_view/CompositeView");
require("./utilities/CompositeFocused");
require("./mobile_mouse");
require("./content_switch/ContentSwitch");
require("./embedded_edit/EmbeddedEdit");
require("./embedded_view/EmbeddedView");
require("./data");
angular.module('pipComposite', [
    'pipContentSwitch',
    'pipChecklistEdit',
    'pipChecklistView',
    'pipCompositeEdit',
    'pipCompositeView',
    'pipCompositeSummary',
    'pipCompositeToolbar',
    'pipCompositeFocused',
    'pipMobileMouse',
    'pipEmbeddedEdit',
    'pipEmbeddedView'
]);
__export(require("./data"));
},{"./checklist_edit/ChecklistEdit":4,"./checklist_view/ChecklistView":5,"./composite_edit/CompositeEdit":6,"./composite_summary/CompositeSummary":7,"./composite_toolbar/CompositeToolbar":8,"./composite_view/CompositeView":9,"./content_switch/ContentSwitch":10,"./data":15,"./embedded_edit/EmbeddedEdit":16,"./embedded_view/EmbeddedView":17,"./mobile_mouse":21,"./utilities/CompositeFocused":22}],19:[function(require,module,exports){
{
    var MobileMousedown_1 = function (scope, elem, attrs) {
        elem.bind("touchstart mousedown", function (e) {
            scope.$apply(attrs.pipMobileMousedown);
        });
    };
    angular.module("pipMobileMouse")
        .directive('pipMobileMousedown', function () {
        return MobileMousedown_1;
    });
}
},{}],20:[function(require,module,exports){
{
    var MobileMouseup_1 = function (scope, elem, attrs) {
        elem.bind("touchend mouseup", function (e) {
            scope.$apply(attrs.pipMobileMouseup);
        });
    };
    angular.module("pipMobileMouse")
        .directive('pipMobileMouseup', function () {
        return MobileMouseup_1;
    });
}
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMobileMouse', []);
require("./MobileMousedown");
require("./MobileMouseup");
},{"./MobileMousedown":19,"./MobileMouseup":20}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeFocusedEvent = 'focusedComposite';
{
    var CompositeFocusedController_1 = (function () {
        CompositeFocusedController_1.$inject = ['$element', '$rootScope'];
        function CompositeFocusedController_1($element, $rootScope) {
            $element.bind("touchstart mousedown", function (e) {
                $rootScope.$broadcast(exports.CompositeFocusedEvent);
            });
        }
        return CompositeFocusedController_1;
    }());
    var CompositeFocused = function () {
        return {
            restrict: 'A',
            scope: false,
            controller: CompositeFocusedController_1
        };
    };
    angular.module("pipCompositeFocused", [])
        .directive('pipCompositeFocused', CompositeFocused);
}
},{}],23:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('checklist_edit/ChecklistEdit.html',
    '<div ng-class="{\'pip-checklist-draggable\': $ctrl.selected.drag}" id="{{\'checklist-\' + $ctrl.selected.id}}"><div ng-repeat="item in $ctrl.checklistContent" ng-mousedown="$ctrl.onClick($event, $index)" class="pip-checklist-item" id="{{\'check-item-\' + $ctrl.selected.id + \'-\' + $index}}" pip-drag="$ctrl.checklistContent.length > 1 && $ctrl.selected.drag && !item.empty" pip-drag-data="item" pip-force-touch="true" pip-touch-delay="30" pip-drop="true" pip-drag-stop="$ctrl.onStop(selected.id)" pip-drag-start="$ctrl.onStart(selected.id)" pip-scroll-container="$ctrl.pipScrollContainer" pip-drop-success="$ctrl.onDropComplete($index, $data, $event, $ctrl.selected.id)"><div ng-class="{\'put_place\': $ctrl.selected.drag}"></div><div class="pip-checklist-item-body layout-row layout-align-start-start" pip-cancel-drag="true" ng-class="{ \'select-active-item\': $ctrl.isSelectedItem($index) }"><div class="pip-checklist-button" pip-cancel-drag="true"><md-button pip-drag-handle="" class="pip-icon-checklist-button md-icon-button no-ripple-container" aria-label="REARRANGE" tabindex="-1" pip-mobile-mousedown="$ctrl.onDownDragg(item)" pip-mobile-mouseup="$ctrl.onDraggEnd()" ng-if="$ctrl.pipDraggable && $ctrl.checklistContent.length > 2 && !item.empty" ng-class="$ctrl.checklistContent.length > 1 ? \'cursor-move\' : \'cursor-default\'" ng-disabled="$ctrl.ngDisabled"><md-icon class="text-grey" md-svg-icon="icons:vhandle"></md-icon></md-button></div><div class="pip-checklist-button" style="overflow: hidden" pip-cancel-drag="true"><div class="pip-checklist-button-container"><md-button class="pip-icon-checklist-button md-icon-button" ng-show="item.empty" ng-disabled="$ctrl.ngDisabled" md-ink-ripple="" ng-click="$ctrl.onAddItem()" tabindex="-1" aria-label="PLUS"><md-icon class="text-grey" md-svg-icon="icons:plus"></md-icon></md-button><md-checkbox ng-model="item.checked" ng-show="!item.empty" aria-label="COMPLETE" pip-cancel-drag="true" ng-focus="$ctrl.onItemFocus($index)" ng-change="$ctrl.onChecked(item)" ng-disabled="$ctrl.ngDisabled"></md-checkbox></div></div><div class="pip-checklist-text flex" pip-cancel-drag="true"><md-input-container md-no-float="" class="flex"><textarea ng-model="item.text" name="{{\'text\' + $index}}" aria-label="TEXT" class="pip-text-checkbox" ng-focus="$ctrl.onItemFocus($index)" ng-change="$ctrl.onChangeItem($index)" ng-keydown="$ctrl.onTextareaKeyDown($event, $index, item)" placeholder="{{::\'TEXT\' | translate}}" id="{{\'check-item-text-\' + selected.id + \'-\' + $index}}" ng-disabled="$ctrl.ngDisabled">\n' +
    '                    </textarea></md-input-container></div><div class="pip-checklist-button" pip-cancel-drag="true"><md-button class="pip-icon-checklist-button md-icon-button" md-ink-ripple="" ng-click="$ctrl.onDeleteItem($index, item)" ng-disabled="$ctrl.ngDisabled" tabindex="-1" ng-focus="$ctrl.onItemFocus($index)" ng-show="$ctrl.isSelectedItem($index)" aria-label="DELETE-ITEM"><md-icon class="text-grey" md-svg-icon="icons:cross-circle"></md-icon></md-button></div></div></div><div id="{{\'check-item-empty-\' + $ctrl.selected.id}}" class="pip-empty-text" pip-drag="false" pip-drop="true" pip-drop-success="$ctrl.onDropComplete($ctrl.checklistContent.length, $data, $event, $ctrl.selected.id)"><div ng-class="{\'put_place\': $ctrl.selected.drag}"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('checklist_view/ChecklistView.html',
    '<div ng-repeat="item in $ctrl.pipOptions track by $index"><div class="pip-checklist-item layout-row layout-align-start-start"><div class="pip-checklist-icon"><md-checkbox ng-model="item.checked" ng-click="$ctrl.onClick($event, item)" aria-label="COMPLETE" ng-disabled="$ctrl.ngDisabled"></md-checkbox></div><div class="pip-checklist-text flex"><pip-markdown pip-text="item.text" pip-rebind="true" ng-disabled="true"></pip-markdown></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_edit/CompositeEdit.html',
    '<div class="divider-top"><div class="pip-composite-body" ng-show="$ctrl.compositeContent.length != 0" ng-class="{\'drag-active\': $ctrl.selected.drag}"><div class="pip-composite-item" ng-repeat="obj in $ctrl.compositeContent track by obj.id" ng-mousedown="$ctrl.onClick($event, $index, obj)" ng-class="{\'selected-content\': $ctrl.isSelectedSection($index, obj), \'composite-animate\': !obj.empty && $ctrl.compositeContent.length > 1}" ng-keyup="$ctrl.onKeyUp($event)" ng-keydown="$ctrl.onKeyDown($event, $index, obj)" pip-drag="$ctrl.compositeContent.length > 1 && $ctrl.selected.drag" pip-touch-delay="10" pip-drag-data="obj" pip-scroll-container="$ctrl.pipScrollContainer" pip-drop="true" pip-force-touch="true" pip-drag-stop="$ctrl.onStop($ctrl.selected.id)" pip-drag-start="$ctrl.onStart($ctrl.selected.id)" pip-drop-success="$ctrl.onDropComplete($index, $data, $event, $ctrl.selected.id)" id="{{\'composite-item-\' + $ctrl.selected.id + \'-\' + $index}}"><div class="putt_box"></div><div class="pip-section-header layout-row layout-align-start-center" ng-if="!obj.empty"><div class="w38"></div><md-button class="md-icon-button md-icon-button-little icon-rearrange-btn no-ripple-container rm8 cursor-move" ng-if="!$ctrl.ngDisabled && $ctrl.compositeContent.length > 1" pip-drag-handle="" pip-mobile-mousedown="$ctrl.onDownDragg($event, obj)" pip-mobile-mouseup="$ctrl.onDraggEnd()" tabindex="-1" aria-label="COMPOSITE-DRAGG" ng-hide="$ctrl.compositeContent.length == 1"><md-icon class="composite-icon cursor-move" md-svg-icon="icons:handle"></md-icon></md-button><div><md-button class="md-icon-button md-icon-button-little rm8" ng-click="$ctrl.onDeleteItem($index)" ng-disabled="$ctrl.ngDisabled" aria-label="COMPOSITE-DELETE"><md-icon class="composite-icon" md-svg-icon="icons:cross"></md-icon></md-button></div></div><div class="pip-section-content rp24-flex lp24-flex tp16 bp16" ng-if="obj.type == \'text\'" pip-cancel-drag="true"><md-input-container class="p0 m0 w-stretch" md-no-float=""><textarea ng-model="obj.text" aria-label="text" placeholder="{{ $ctrl.isFirst ? $ctrl.compositePlaceholder : \'TEXT\' | translate}}" id="{{\'composite-item-text-\' + $ctrl.selected.id + \'-\' + $index}}" ng-change="$ctrl.onContentChange(obj)" pip-cancel-drag="true" ng-disabled="$ctrl.ngDisabled">\n' +
    '                            </textarea></md-input-container></div><div class="pip-section-content rp24-flex lp24-flex vp20" ng-if="obj.type == \'pictures\'" pip-cancel-drag="true"><pip-picture-list-edit class="w-stretch" pip-cancel-drag="true" pip-pictures="obj.picIds" pip-changed="$ctrl.onContentChange(obj)" pip-created="obj.pictures = $event.sender" pip-added-picture="$ctrl.addedContent" ng-disabled="$ctrl.ngDisabled"></pip-picture-list-edit></div><div class="pip-section-content rp24-flex lp24-flex vp20" ng-if="obj.type == \'documents\'" pip-cancel-drag="true"><pip-document-list-edit class="w-stretch" pip-documents="obj.docs" pip-cancel-drag="true" pip-changed="$ctrl.onContentChange(obj)" pip-created="obj.documents = $event.sender" pip-added-document="$ctrl.addedContent" ng-disabled="$ctrl.ngDisabled"></pip-document-list-edit></div><div class="pip-section-embedded rp24-flex lp24-flex vp20" ng-if="obj.type == \'embedded\'" pip-cancel-drag="true"><pip-embedded-edit pip-embedded-type="obj.embed_type" pip-embedded_uri="obj.embed_uri" pip-cancel-drag="true" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled"></pip-embedded-edit></div><div class="pip-section-content layout-row layout-align-start-center" ng-if="obj.type == \'checklist\'" pip-cancel-drag="true"><pip-checklist-edit pip-options="obj.checklist" pip-draggable="$ctrl.isActiveChecklist(obj)" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled" pip-scroll-container="$ctrl.pipScrollContainer" pip-rebind="true"></pip-checklist-edit></div><div class="pip-section-content vp20 rp24-flex lp24-flex" ng-if="obj.type == \'location\'" pip-cancel-drag="true"><pip-location-edit class="pip-location-attachments w-stretch" pip-location-name="obj.loc_name" pip-location-pos="obj.loc_pos" pip-cancel-drag="true" xxxpip-location-holder="$ctrl.pipLocationHolder" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled"></pip-location-edit></div><div class="pip-section-content bp16-flex rp24-flex lp24-flex tp20" ng-if="obj.type == \'time\'" pip-cancel-drag="true"><pip-time-range-edit class="w-stretch" pip-start-date="obj.start" pip-end-date="obj.end" xxxpip-size="$sizeGtSmall" pip-changed="$ctrl.onContentChange(obj)" ng-disabled="$ctrl.ngDisabled" pip-start-label="{{ \'COMPOSITE_START_TIME\' | translate }}" pip-end-label="{{ \'COMPOSITE_END_TIME\' | translate }}"></pip-time-range-edit></div></div><div class="pip-composite-item w-stretch" pip-drag="false" pip-drop="true" pip-drop-success="$ctrl.onDropComplete($ctrl.compositeContent.length, $data, $event, $ctrl.selected.id)" pip-drag-stop="$ctrl.onStop($ctrl.selected.id)" pip-drag-start="$ctrl.onStart($ctrl.selected.id)" id="{{\'pip-composite-last-\' + $ctrl.selected.id}}"><div class="putt_box"></div><div class="pip-section-content h24" style="border: 0px!important;"></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_summary/CompositeSummary.html',
    '<div ng-repeat="item in $ctrl.compositeContent track by $index"><div class="pip-composite-text" ng-if="item.type == \'text\' && item.text"><pip-markdown pip-text="item.text" pip-line-count="$ctrl.textSize" pip-rebind="true" ng-disabled="true"></pip-markdown></div><div ng-if="item.type == \'pictures\' && item.picIds && item.picIds.length > 0" ng-class="$ctrl.compositeContent[$index - 1].type != \'pictures\' ? $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm16 bm16\' : \'tm16 bm0\' : $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm8 bm16\' : \'tm8 bm0\'" class="pip-composite-pictures"><pip-collage pip-pictures="item.picIds" pip-unique-code="item.id" pip-multiple="true" pip-open="$ctrl.disableControl" pip-rebind="true" ng-disabled="$ctrl.disableControl"></pip-collage></div><div ng-if="item.type == \'documents\' && item.docs && item.docs.length > 0" class="pip-composite-documents layout-row flex"><pip-document-list class="flex" pip-documents="item.docs" pip-rebind="true" pip-document-icon="true" pip-collapse="true" ng-disabled="$ctrl.disableControl"></pip-document-list></div><div ng-if="item.type == \'checklist\' && item.checklist && item.checklist.length > 0" class="pip-composite-checklist"><pip-checklist-view pip-options="item.checklist" pip-changed="$ctrl.onContentChange()" pip-rebind="true" pip-collapse="true" ng-disabled="$ctrl.disabledChecklist"></pip-checklist-view></div><div class="pip-composite-location layout-row layout-align-start-center flex" ng-if="item.type == \'location\' && (item.loc_pos || item.loc_name)"><pip-location class="flex" pip-location-name="item.loc_name" pip-location-pos="item.loc_pos" pip-collapse="true" pip-show-location-icon="true" ng-disabled="$ctrl.disableControl" pip-rebind="true"></pip-location></div><div class="pip-composite-time layout-row layout-align-start-center flex" ng-if="item.type == \'time\' && (item.start || item.end)"><md-icon md-svg-icon="icons:time" class="rm24 lm0"></md-icon><pip-time-range pip-start-date="item.start" pip-end-date="item.end" pip-rebind="true" ng-disabled="$ctrl.disableControl"></pip-time-range></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_toolbar/CompositeToolbar.html',
    '<div class="layout-row layout-align-start-start flex"><md-button class="pip-composite-button" ng-if="!$ctrl.emptyState" ng-class="{ \'remove-item\': !$ctrl.emptyState , \'new-item\': !$ctrl.emptyState }" ng-click="$ctrl.onAddItem(\'text\');" aria-label="COMPOSITE-BUTTON-TEXT" ng-disabled="$ctrl.ngDisabled"><md-icon class="icon-text-block" md-svg-icon="icons:text"></md-icon><md-tooltip>{{::\'TEXT\'| translate}}</md-tooltip></md-button><md-button ng-if="$ctrl.toolbarButton.checklist" ng-click="$ctrl.onAddItem(\'checklist\')" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-CHECKLIST"><md-icon class="icon-checkbox-on" md-svg-icon="icons:checkbox-on"></md-icon><md-tooltip>{{::\'CHECKLIST\'| translate}}</md-tooltip></md-button><md-button ng-if="$ctrl.toolbarButton.picture" ng-click="$ctrl.onAddItem(\'pictures\')" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-PICTURES"><md-icon class="icon-camera" md-svg-icon="icons:camera"></md-icon><md-tooltip>{{::\'PICTURE\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'documents\')" ng-if="$ctrl.toolbarButton.document" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-DOCUMENTS"><md-icon class="icon-document" md-svg-icon="icons:document"></md-icon><md-tooltip>{{::\'DOCUMENT\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'location\')" ng-if="$ctrl.toolbarButton.location" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-LOCATIONS"><md-icon class="icon-location" md-svg-icon="icons:location"></md-icon><md-tooltip>{{::\'LOCATION\'| translate}}</md-tooltip></md-button><md-button ng-click="$ctrl.onAddItem(\'time\')" ng-if="$ctrl.toolbarButton.event" ng-disabled="$ctrl.ngDisabled" class="pip-composite-button" aria-label="COMPOSITE-BUTTON-TIME"><md-icon class="icon-time" md-svg-icon="icons:time"></md-icon><md-tooltip>{{::\'TIME\'| translate}}</md-tooltip></md-button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('composite_view/CompositeView.html',
    '<div ng-repeat="item in $ctrl.compositeContent track by $index"><div class="pip-composite-text lp24-flex rp24-flex" ng-if="item.type == \'text\' && item.text" ng-class="{\'bm16\': $last}"><pip-markdown pip-text="item.text" pip-rebind="true" ng-disabled="true"></pip-markdown></div><div ng-if="item.type == \'pictures\' && item.picIds && item.picIds.length > 0" ng-class="$ctrl.compositeContent[$index - 1].type != \'pictures\' ? $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm16 bm16\' : \'tm16 bm0\' : $ctrl.compositeContent[$index + 1].type != \'pictures\' ? \'tm8 bm16\' : \'tm8 bm0\'" class="pip-composite-pictures lp24-flex rp24-flex"><pip-collage pip-pictures="item.picIds" pip-unique-code="item.id" pip-multiple="true" pip-open="true" pip-rebind="true" ng-disabled="$ctrl.ngDisabled"></pip-collage></div><div ng-if="item.type == \'documents\' && item.docs && item.docs.length > 0" class="pip-composite-documents layout-row layout-align-start-start flex"><pip-document-list pip-documents="item.docs" pip-document-icon="true" pip-rebind="true" ng-disabled="$ctrl.ngDisabled"></pip-document-list></div><div ng-if="item.type == \'checklist\' && item.checklist && item.checklist.length > 0" class="pip-composite-checklist lp24-flex rp24-flex"><pip-checklist-view pip-options="item.checklist" pip-changed="$ctrl.onContentChange()" pip-rebind="true" ng-disabled="$ctrl.isDisabled()"></pip-checklist-view></div><div class="pip-composite-location layout-row layout-align-start-start flex" ng-if="item.type == \'location\' && (item.loc_pos || item.loc_name)"><pip-location class="flex" pip-location-name="item.loc_name" pip-location-pos="item.loc_pos" pip-show-location-icon="true" pip-collapse="false" ng-disabled="$ctrl.ngDisabled" pip-rebind="true"></pip-location></div><div class="pip-composite-time lp24-flex rp24-flex layout-row layout-align-start-center flex" ng-if="item.type == \'time\'"><md-icon md-svg-icon="icons:time" class="lm0"></md-icon><pip-time-range pip-start-date="item.start" pip-end-date="item.end" pip-rebind="true" ng-disabled="ngDisabled()"></pip-time-range></div><div class="pip-composite-embedded lp24-flex rp24-flex layout-row layout-align-start-center flex" ng-if="item.type == \'embedded\' && item.embed_uri"><pip-embedded-view class="bm8" pip-embedded-type="item.embed_type" pip-embedded-uri="item.embed_uri"></pip-embedded-view></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('content_switch/ContentSwitch.html',
    '<md-button ng-click="showPictures = !showPictures; onButtonClick(\'pictures\')" aria-label="showPictures" class="md-icon-button" ng-show="showIconPicture" ng-disabled="transaction.busy()"><md-icon class="active-camera" ng-class="{ \'active-camera\': showPictures }" md-svg-icon="icons:camera"></md-icon></md-button><md-button ng-click="showDocuments = !showDocuments; onButtonClick(\'documents\')" aria-label="showDocuments" class="md-icon-button" ng-show="showIconDocument" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-document\': showDocuments }" md-svg-icon="icons:document"></md-icon></md-button><md-button ng-click="showEvent = !showEvent; onButtonClick(\'event\')" aria-label="showEvent" class="md-icon-button" ng-show="showIconEvent" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-time\': showEvent }" md-svg-icon="icons:time"></md-icon></md-button><md-button ng-click="showLocation = !showLocation; onButtonClick(\'location\')" aria-label="showLocation" class="md-icon-button" ng-show="showIconLocation" ng-disabled="transaction.busy()"><md-icon ng-class="{ \'active-location\': showLocation }" md-svg-icon="icons:location"></md-icon></md-button>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('embedded_edit/EmbeddedEdit.html',
    '<form name="embedded"><md-input-container class="md-block flex bm24"><label>{{ ::\'EMBEDDED_TYPE_LABEL\'| translate }}</label><md-select ng-model="$ctrl.embed_type" ng-change="$ctrl.onChangeType()" ng-disabled="$ctrl.isDisabled()"><md-option ng-repeat="t in $ctrl.embeddedTypeCollection track by $index" ng-value="t.id">{{ ::t.title | translate }}</md-option></md-select></md-input-container><md-input-container class="md-block flex"><label>{{::\'EMBEDDED_URL_LABEL\' | translate}}</label> <input ng-model="$ctrl.embed_uri" ng-required="$ctrl.embed_uri" type="url" name="url" ng-change="$ctrl.onChangeUrl()" ng-disabled="$ctrl.isDisabled()" ng-model-options="{ delay: 500 }"><div class="hint" ng-if="!embedded.url.$error">{{::\'EMBEDDED_TYPE_HINT\' | translate}}</div><div ng-messages="embedded.url.$error" role="alert"><div ng-message="url">{{ \'EMBEDDED_URL_ERROR\' | translate }}</div></div></md-input-container></form>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipComposite.Templates');
} catch (e) {
  module = angular.module('pipComposite.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('embedded_view/EmbeddedView.html',
    '<iframe width="100%" height="170" frameborder="0" allowfullscreen="" ng-if="$ctrl.embed_type == \'youtube\'" ng-src="{{ $ctrl.embed_uri }}" style="margin: 0 auto;"></iframe><iframe width="100%" height="170" frameborder="0" allowfullscreen="" style="margin: 0 auto;" ng-src="{{ $ctrl.embed_uri }}" ng-if="$ctrl.embed_type == \'custom\'"><p><a href="{{ $ctrl.embed_uri }}">{{ $ctrl.embed_uri }}</a></p></iframe>');
}]);
})();



},{}]},{},[18,23])(23)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).guidance = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attachment = (function () {
    function Attachment() {
    }
    return Attachment;
}());
exports.Attachment = Attachment;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Guide = (function () {
    function Guide() {
    }
    return Guide;
}());
exports.Guide = Guide;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GuideType_1 = require("./GuideType");
var GuideStatus_1 = require("./GuideStatus");
var GuideData = (function () {
    GuideData.$inject = ['pipRest', 'pipFormat'];
    function GuideData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'guides';
        this.RESOURCE_RANDOM = 'guidesRandom';
        this.PAGE_SIZE = 100;
        this.PAGE_START = 0;
        this.PAGE_TOTAL = true;
    }
    GuideData.prototype.readGuides = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    GuideData.prototype.readRandomGuide = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_RANDOM).get(params, successCallback, errorCallback);
    };
    GuideData.prototype.readIntroGuides = function (params, successCallback, errorCallback) {
        params = params || {};
        var filter = params.filter || {};
        filter.type = GuideType_1.GuideType.Introduction;
        filter.status = GuideStatus_1.GuideStatus.Completed;
        params.filer = this.pipFormat.filterToString(filter);
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    GuideData.prototype.readGuide = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ guide_id: id }, successCallback, errorCallback);
    };
    GuideData.prototype.createGuide = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(null, data, successCallback, errorCallback);
    };
    GuideData.prototype.updateGuide = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ guide_id: id }, data, successCallback, errorCallback);
    };
    GuideData.prototype.deleteGuide = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ guide_id: id }, null, successCallback, errorCallback);
    };
    return GuideData;
}());
angular
    .module('pipGuideData', ['pipRest', 'pipServices'])
    .service('pipGuideData', GuideData);
},{"./GuideStatus":5,"./GuideType":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GuidePage = (function () {
    function GuidePage() {
    }
    return GuidePage;
}());
exports.GuidePage = GuidePage;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GuideStatus = (function () {
    function GuideStatus() {
    }
    return GuideStatus;
}());
GuideStatus.New = "new";
GuideStatus.Writing = "writing";
GuideStatus.Translating = "translating";
GuideStatus.Verifying = "verifying";
GuideStatus.Completed = "completed";
exports.GuideStatus = GuideStatus;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GuideType = (function () {
    function GuideType() {
    }
    return GuideType;
}());
GuideType.Introduction = "introduction";
GuideType.NewRelease = "new release";
exports.GuideType = GuideType;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MultiString = (function () {
    function MultiString() {
    }
    return MultiString;
}());
exports.MultiString = MultiString;
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PageData = (function () {
    function PageData() {
    }
    return PageData;
}());
exports.PageData = PageData;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PartyReference = (function () {
    function PartyReference() {
    }
    return PartyReference;
}());
exports.PartyReference = PartyReference;
},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Quote = (function () {
    function Quote() {
    }
    return Quote;
}());
exports.Quote = Quote;
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteData = (function () {
    QuoteData.$inject = ['pipRest', 'pipFormat'];
    function QuoteData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'quotes';
        this.RESOURCE_RANDOM = 'quotesRandom';
        this.PAGE_SIZE = 100;
        this.PAGE_START = 0;
        this.PAGE_TOTAL = true;
    }
    QuoteData.prototype.readQuotes = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    QuoteData.prototype.readRandomQuote = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_RANDOM).get(params, successCallback, errorCallback);
    };
    QuoteData.prototype.readQuote = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ quote_id: id }, successCallback, errorCallback);
    };
    QuoteData.prototype.createQuote = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(null, data, successCallback, errorCallback);
    };
    QuoteData.prototype.updateQuote = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ quote_id: id }, data, successCallback, errorCallback);
    };
    QuoteData.prototype.deleteQuote = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ quote_id: id }, null, successCallback, errorCallback);
    };
    return QuoteData;
}());
angular
    .module('pipQuoteData', ['pipRest', 'pipServices'])
    .service('pipQuoteData', QuoteData);
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuoteStatus = (function () {
    function QuoteStatus() {
    }
    return QuoteStatus;
}());
QuoteStatus.New = "new";
QuoteStatus.Writing = "writing";
QuoteStatus.Translating = "translating";
QuoteStatus.Verifying = "verifying";
QuoteStatus.Completed = "completed";
exports.QuoteStatus = QuoteStatus;
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tip = (function () {
    function Tip() {
    }
    return Tip;
}());
exports.Tip = Tip;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TipData = (function () {
    TipData.$inject = ['pipRest', 'pipFormat'];
    function TipData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'tips';
        this.RESOURCE_RANDOM = 'tipsRandom';
        this.PAGE_SIZE = 100;
        this.PAGE_START = 0;
        this.PAGE_TOTAL = true;
    }
    TipData.prototype.readTips = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    TipData.prototype.readRandomTip = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE_RANDOM).get(params, successCallback, errorCallback);
    };
    TipData.prototype.readTip = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ tip_id: id }, successCallback, errorCallback);
    };
    TipData.prototype.createTip = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(null, data, successCallback, errorCallback);
    };
    TipData.prototype.updateTip = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ tip_id: id }, data, successCallback, errorCallback);
    };
    TipData.prototype.deleteTip = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ tip_id: id }, null, successCallback, errorCallback);
    };
    return TipData;
}());
angular
    .module('pipTipData', ['pipRest', 'pipServices'])
    .service('pipTipData', TipData);
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TipStatus = (function () {
    function TipStatus() {
    }
    return TipStatus;
}());
TipStatus.New = "new";
TipStatus.Writing = "writing";
TipStatus.Translating = "translating";
TipStatus.Verifying = "verifying";
TipStatus.Completed = "completed";
exports.TipStatus = TipStatus;
},{}],19:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Attachment");
require("./Guide");
require("./GuidePage");
require("./GuideStatus");
require("./GuideType");
require("./MultiString");
require("./PartyReference");
require("./Quote");
require("./QuoteStatus");
require("./PageData");
require("./Tip");
require("./TipStatus");
require("./TipDataService");
require("./ITipDataService");
require("./QuoteDataService");
require("./IQuoteDataService");
require("./GuideDataService");
require("./IGuideDataService");
angular
    .module('pipGuidance.Data', [
    'pipTipData',
    'pipQuoteData',
    'pipGuideData'
]);
__export(require("./Attachment"));
__export(require("./Guide"));
__export(require("./GuidePage"));
__export(require("./GuideStatus"));
__export(require("./GuideType"));
__export(require("./MultiString"));
__export(require("./PartyReference"));
__export(require("./Quote"));
__export(require("./QuoteStatus"));
__export(require("./PageData"));
__export(require("./Tip"));
__export(require("./TipStatus"));
},{"./Attachment":1,"./Guide":2,"./GuideDataService":3,"./GuidePage":4,"./GuideStatus":5,"./GuideType":6,"./IGuideDataService":7,"./IQuoteDataService":8,"./ITipDataService":9,"./MultiString":10,"./PageData":11,"./PartyReference":12,"./Quote":13,"./QuoteDataService":14,"./QuoteStatus":15,"./Tip":16,"./TipDataService":17,"./TipStatus":18}],20:[function(require,module,exports){
{
    var GuidanceDialog = (function () {
        GuidanceDialog.$inject = ['$mdDialog'];
        function GuidanceDialog($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        GuidanceDialog.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'guidance/GuidanceDialog.html',
                controller: GuidanceDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: true
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return GuidanceDialog;
    }());
    var config = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            GUIDANCE_TITLE: 'What should you do here?',
            GUIDANCE_ACTION: 'Do it now!',
            GUIDANCE_DO_NOT_SHOW: "Don't show it again"
        });
        pipTranslateProvider.translations('ru', {
            GUIDANCE_TITLE: 'Что здесь делать?',
            GUIDANCE_ACTION: 'Сделать это сейчас!',
            GUIDANCE_DO_NOT_SHOW: 'Не показывать это снова'
        });
    };
    config.$inject = ['pipTranslateProvider'];
    var GuidanceDialogController_1 = (function () {
        function GuidanceDialogController_1($scope, $rootScope, $mdDialog, pipTranslate, params) {
            this.$mdDialog = $mdDialog;
            this.pipTranslate = pipTranslate;
            this.params = params;
            this.theme = $rootScope[pip.themes.ThemeRootVar];
            this.title = params.title || 'GUIDANCE_TITLE';
            this.imageUrl = params.imageUrl || '';
            this.imageWidth = params.imageWidth || '100%';
            this.imageHeight = params.imageHeight || '150px';
            this.content = params.content;
            this.action = params.action || 'GUIDANCE_ACTION';
            this.hideToggle = params.hideToggle;
            this.showHideToggle = params.hideToggleCallback != null;
        }
        GuidanceDialogController_1.prototype.onCancel = function () {
            this.$mdDialog.cancel();
        };
        GuidanceDialogController_1.prototype.onAction = function () {
            this.$mdDialog.hide();
        };
        GuidanceDialogController_1.prototype.onHideToggle = function () {
            if (this.params.hideToggleCallback) {
                this.params.hideToggleCallback(this.hideToggle);
            }
        };
        GuidanceDialogController_1.prototype.getContent = function (content) {
            var language = this.pipTranslate.language || 'en';
            return content && content[language] ? content[language] : '';
        };
        return GuidanceDialogController_1;
    }());
    angular.module('pipGuidance.Dialog', ['ngMaterial', 'pipTranslate', 'pipGuidance.Templates'])
        .config(config)
        .service('pipGuidanceDialog', GuidanceDialog);
}
},{}],21:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./rest");
require("./data");
require("./intro_guidance");
require("./guidance/GuidanceDialog");
require("./tips/TipsService");
require("./quotes/QuotesService");
angular.module('pipGuidance', [
    'pipGuidance.Rest',
    'pipTips.Service',
    'pipIntroGuidance.Service',
    'pipGuidance.Dialog',
    'pipQuotes.Service',
    'pipReleaseIntroDialog'
]);
__export(require("./data"));
},{"./data":19,"./guidance/GuidanceDialog":20,"./intro_guidance":24,"./quotes/QuotesService":25,"./rest":29,"./tips/TipsService":30}],22:[function(require,module,exports){
{
    var ReleaseIntroDialog = (function () {
        ReleaseIntroDialog.$inject = ['$mdDialog'];
        function ReleaseIntroDialog($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ReleaseIntroDialog.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                templateUrl: 'intro_guidance/IntroGuidanceDialog.html',
                controller: ReleaseIntroDialogController_1,
                controllerAs: '$ctrl',
                locals: {
                    params: params
                },
                clickOutsideToClose: true
            })
                .then(function () {
                if (successCallback) {
                    successCallback();
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return ReleaseIntroDialog;
    }());
    var config = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            GUIDANCE_TITLE: 'What should you do here?',
            GUIDANCE_ACTION: 'Do it now!',
            GUIDANCE_DO_NOT_SHOW: "Don't show it again",
            GUIDE_COMPLETE_BUTTON: 'GOT IT !'
        });
        pipTranslateProvider.translations('ru', {
            GUIDANCE_TITLE: 'Что здесь делать?',
            GUIDANCE_ACTION: 'Сделать это сейчас!',
            GUIDANCE_DO_NOT_SHOW: 'Не показывать это снова',
            GUIDE_COMPLETE_BUTTON: 'Закончить просмотр'
        });
    };
    config.$inject = ['pipTranslateProvider'];
    var ReleaseIntroDialogController_1 = (function () {
        function ReleaseIntroDialogController_1($scope, $rootScope, pipTranslate, $mdDialog, pipMedia, pipPictureData, params) {
            this.$scope = $scope;
            this.$rootScope = $rootScope;
            this.pipTranslate = pipTranslate;
            this.$mdDialog = $mdDialog;
            this.pipMedia = pipMedia;
            this.pipPictureData = pipPictureData;
            this.params = params;
            this.isOpen = true;
            this.theme = $rootScope[pip.themes.ThemeRootVar];
            var guide = this.params.guide;
            this.number = 0;
            this.ln = this.params.ln || this.pipTranslate.language || 'en';
            this.data = guide;
            _.each(this.data.pages, function (page) {
                if (page.pic_id) {
                    var picId = page.pic_id;
                    page.picIds = [];
                    page.picIds.push(picId);
                    page.pic_id_url = pipPictureData.getPictureUrl(page.pic_id);
                }
                if (page.pic_uri) {
                    var picUri = page.pic_uri;
                    page.picUris = [];
                    page.picUris.push(picUri);
                }
            });
        }
        ReleaseIntroDialogController_1.prototype.onChangePage = function (newNumber) {
            this.number = newNumber;
            this.isOpen = false;
        };
        ;
        ReleaseIntroDialogController_1.prototype.onBackPage = function () {
            if (this.number !== 0) {
                this.number -= 1;
            }
            this.isOpen = false;
        };
        ;
        ReleaseIntroDialogController_1.prototype.onNextPage = function () {
            if (this.number !== this.data.pages.length - 1) {
                this.number += 1;
            }
            this.isOpen = false;
        };
        ;
        ReleaseIntroDialogController_1.prototype.onKeyDown = function ($event) {
            if (!$event)
                return;
            if ($event.key == 'ArrowRight') {
                this.onNextPage();
            }
            if ($event.key == 'ArrowLeft') {
                this.onBackPage();
            }
            if ($event.keyCode == 32) {
                this.onNextPage();
            }
            this.isOpen = false;
        };
        ReleaseIntroDialogController_1.prototype.onClose = function () {
            this.$mdDialog.hide();
        };
        ;
        return ReleaseIntroDialogController_1;
    }());
    angular.module('pipReleaseIntroDialog')
        .config(config)
        .service('pipReleaseIntroDialog', ReleaseIntroDialog);
}
},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("../data");
var data_2 = require("../data");
{
    var IntroGuidanceService = (function () {
        IntroGuidanceService.$inject = ['pipReleaseIntroDialog', 'pipGuideData', 'pipTranslate', '$rootScope'];
        function IntroGuidanceService(pipReleaseIntroDialog, pipGuideData, pipTranslate, $rootScope) {
            this.pipReleaseIntroDialog = pipReleaseIntroDialog;
            this.pipGuideData = pipGuideData;
            this.pipTranslate = pipTranslate;
            this.$rootScope = $rootScope;
        }
        IntroGuidanceService.prototype.showReleaseGuidance = function (filter, successCallback, errorCallback) {
            var _this = this;
            this.pipGuideData.readGuides({
                filter: filter
            }, function (guides) {
                guides = _.filter(guides.data, function (guide) {
                    return guide.type = data_1.GuideType.NewRelease && guide.status === data_2.GuideStatus.Completed;
                });
                if (guides.length > 0) {
                    _this.pipReleaseIntroDialog.show({
                        guide: guides[0],
                        ln: _this.pipTranslate.language
                    }, successCallback, errorCallback);
                }
            }, errorCallback);
        };
        IntroGuidanceService.prototype.showIntroGuidance = function (filter, successCallback, errorCallback) {
            var _this = this;
            this.pipGuideData.readIntroGuides({
                filter: filter
            }, function (guides) {
                guides = _.filter(guides.data, function (guide) {
                    return guide.type = data_1.GuideType.Introduction && guide.status === data_2.GuideStatus.Completed;
                });
                if (guides.length > 0) {
                    _this.pipReleaseIntroDialog.show({
                        guide: guides[0],
                        ln: _this.pipTranslate.language
                    }, successCallback, errorCallback);
                }
            }, errorCallback);
        };
        IntroGuidanceService.prototype.showGuide = function (guide, ln, successCallback, errorCallback) {
            if (guide) {
                this.pipReleaseIntroDialog.show({
                    guide: guide,
                    ln: ln
                }, successCallback, errorCallback);
            }
        };
        IntroGuidanceService.prototype.findIntroReleaseGuide = function (guides, settings, appName) {
            var guidesSort;
            var app = appName;
            if (!settings && !settings[app] || !settings[app].intro || !settings[app].intro.lastId) {
                guidesSort = _.filter(guides, function (guide) {
                    return guide.type === data_1.GuideType.Introduction && guide.status === data_2.GuideStatus.Completed && guide.app === app;
                });
                guidesSort = _.sortBy(guidesSort, function (guide) {
                    return -moment(guide.create_time).valueOf();
                });
                return guidesSort[0];
            }
            guidesSort = _.filter(guides, function (guide) {
                return guide.type === data_1.GuideType.NewRelease && guide.status === data_2.GuideStatus.Completed && guide.app === app;
            });
            guidesSort = _.sortBy(guidesSort, function (guide) {
                return -moment(guide.create_time).valueOf();
            });
            if (!settings[app].intro.create_time || (guidesSort.length > 0 &&
                new Date(settings[app].intro.create_time) < new Date(guidesSort[0].create_time) &&
                guidesSort[0].id != settings.release.lastId)) {
                return guidesSort[0];
            }
            return null;
        };
        return IntroGuidanceService;
    }());
    angular.module('pipIntroGuidance.Service', ['pipReleaseIntroDialog', 'pipGuideData', 'pipPictures.Data'])
        .service('pipGuidance', IntroGuidanceService);
}
},{"../data":19}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipReleaseIntroDialog', ['ngMaterial', 'pipTranslate', 'pipGuidance.Templates']);
require("./IntroGuidanceDialog");
require("./IntroGuidanceService");
},{"./IntroGuidanceDialog":22,"./IntroGuidanceService":23}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var QuotesService = (function () {
        QuotesService.$inject = ['pipPopoverService', '$timeout', '$rootScope', 'pipTips'];
        function QuotesService(pipPopoverService, $timeout, $rootScope, pipTips) {
            this.pipPopoverService = pipPopoverService;
            this.$timeout = $timeout;
            this.$rootScope = $rootScope;
            this.pipTips = pipTips;
        }
        QuotesService.prototype.checkStatus = function (item) {
            return item.status == 'completed' ? true : false;
        };
        QuotesService.prototype.compareRandom = function (a, b) {
            return Math.random() - 0.5;
        };
        QuotesService.prototype.filterQuotes = function (data, topic) {
            var quotes;
            var quotesCollection = _.filter(data, this.checkStatus);
            if (topic) {
                quotes = [];
                var _loop_1 = function (index) {
                    var topic_1 = _.find(quotesCollection[index].tags, function (t) {
                        return t == topic_1;
                    });
                    if (topic_1) {
                        quotes.push(quotesCollection[index]);
                    }
                };
                for (var index = 0; index < quotesCollection.length; index++) {
                    _loop_1(index);
                }
            }
            else {
                quotes = quotesCollection;
            }
            quotes.sort(this.compareRandom);
            return quotes;
        };
        QuotesService.prototype.quoteController = function ($scope, pipMedia) {
            var init = function () {
                if ($scope.locals.quotes[$scope.index].author)
                    $scope.author = $scope.locals.quotes[$scope.index].author[$scope.locals.ln] ?
                        $scope.locals.quotes[$scope.index].author[$scope.locals.ln] : $scope.locals.quotes[$scope.index].author['en'];
                if ($scope.locals.quotes[$scope.index].text)
                    $scope.content = $scope.locals.quotes[$scope.index].text[$scope.locals.ln] ? $scope.locals.quotes[$scope.index].text[$scope.locals.ln] :
                        $scope.locals.quotes[$scope.index].text['en'];
                $scope.link = $scope.locals.quotes[$scope.index].more_url;
            };
            $scope.index = 0;
            $scope.pipMedia = pipMedia;
            init();
            $scope.onNextClick = function () {
                $scope.index++;
                if ($scope.index == $scope.locals.quotes.length)
                    this.pipPopoverService.hide();
                else {
                    init();
                    this.pipPopoverService.resize();
                }
            };
            $scope.$on('pipWindowResized', init);
        };
        QuotesService.prototype.showQuotes = function (quotes, ln, $event) {
            if (quotes && quotes.length > 0) {
                this.pipPopoverService.hide();
                this.pipPopoverService.show({
                    element: $event ? $event.currentTarget : null,
                    class: 'pip-quote',
                    cancelCallback: function () {
                        return false;
                    },
                    locals: {
                        quotes: quotes,
                        ln: ln || 'en'
                    },
                    controller: ['$scope', 'pipMedia', this.quoteController],
                    templateUrl: 'quotes/QuoteTemplate.html'
                });
            }
        };
        QuotesService.prototype.waitUserTipsQuotes = function (tips, quotes, ln) {
            var _this = this;
            var idleTimer = null;
            var idleState = false;
            var idleWait = 180000;
            $(document).ready(function () {
                $(document).bind('click keydown scroll', function () {
                    _this.$timeout.cancel(idleTimer);
                    idleState = false;
                    idleTimer = _this.$timeout(function () {
                        _this.pipPopoverService.hide();
                        if (!quotes) {
                            _this.pipTips.showTips(tips, ln);
                        }
                        else {
                            if (!tips) {
                                _this.showQuotes(quotes, ln, null);
                            }
                            else {
                                Math.random() < 0.5 ? _this.pipTips.showTips(tips, ln) : _this.showQuotes(quotes, ln, null);
                            }
                        }
                        idleState = true;
                    }, idleWait);
                });
                $("body").trigger("click");
            });
        };
        return QuotesService;
    }());
    angular.module('pipQuotes.Service', ['pipGuidance.Templates', 'pipGuidance', 'pipControls', 'pipQuoteData'])
        .service('pipQuotes', QuotesService);
}
},{}],26:[function(require,module,exports){
pipGuideDataConfig.$inject = ['pipRestProvider'];
function pipGuideDataConfig(pipRestProvider) {
    pipRestProvider.registerPagedCollection('guides', '/api/v1/guides/:guide_id');
    pipRestProvider.registerResource('guidesRandom', '/api/v1/guides/random');
}
angular
    .module('pipGuidance.Rest')
    .config(pipGuideDataConfig);
},{}],27:[function(require,module,exports){
configQuoteResources.$inject = ['pipRestProvider'];
function configQuoteResources(pipRestProvider) {
    pipRestProvider.registerPagedCollection('quotes', '/api/v1/quotes/:quote_id');
    pipRestProvider.registerResource('quotesRandom', '/api/v1/quotes/random');
}
angular
    .module('pipGuidance.Rest')
    .config(configQuoteResources);
},{}],28:[function(require,module,exports){
pipTipDataConfig.$inject = ['pipRestProvider'];
function pipTipDataConfig(pipRestProvider) {
    pipRestProvider.registerPagedCollection('tips', '/api/v1/tips/:tip_id');
    pipRestProvider.registerResource('tipsRandom', '/api/v1/tips/random');
}
angular
    .module('pipGuidance.Rest')
    .config(pipTipDataConfig);
},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipGuidance.Rest', []);
require("./TipResources");
require("./QuoteResources");
require("./GuideResources");
},{"./GuideResources":26,"./QuoteResources":27,"./TipResources":28}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var TipsService = (function () {
        TipsService.$inject = ['$rootScope', 'pipPopoverService', 'pipTipData'];
        function TipsService($rootScope, pipPopoverService, pipTipData) {
            this.$rootScope = $rootScope;
            this.pipPopoverService = pipPopoverService;
            this.pipTipData = pipTipData;
            this.checkStatus = function (item) {
                return item.status === 'completed';
            };
            this.compareRandom = function () {
                return Math.random() - 0.5;
            };
        }
        TipsService.prototype.filterTips = function (data, topic) {
            this.tips = [];
            var tipsCollection = _.filter(data, this.checkStatus);
            for (var index = 0; index < tipsCollection.length; index++) {
                var t = _.find(tipsCollection[index].topics, function (t) {
                    return t == topic;
                });
                if (t) {
                    this.tips.push(tipsCollection[index]);
                }
            }
            this.tips.sort(this.compareRandom);
            return this.tips;
        };
        TipsService.prototype.tipController = function ($scope, $timeout, pipMedia) {
            var _this = this;
            var init = function () {
                $scope.title = $scope.locals.tips[$scope.index].title[$scope.locals.ln];
                $scope.content = $scope.locals.tips[$scope.index].content[$scope.locals.ln];
                $scope.link = $scope.locals.tips[$scope.index].more_url;
                if ($scope.image) {
                    $timeout(function () {
                        var backdropElement = $('.pip-popover-backdrop'), popover = backdropElement.find('.pip-popover');
                        popover.find('.pip-pic').css('background-image', 'url(' + $scope.image + ')');
                    }, 100);
                }
            };
            $scope.index = 0;
            $scope.pipMedia = pipMedia;
            init();
            $scope.onNextClick = function () {
                $scope.index++;
                if ($scope.index === $scope.locals.tips.length) {
                    _this.pipPopoverService.hide();
                }
                else {
                    init();
                    _this.pipPopoverService.resize();
                }
            };
            $scope.$on('pipWindowResized', init);
        };
        TipsService.prototype.showTips = function (tips, ln, $event) {
            if (tips && tips.length > 0) {
                this.pipPopoverService.hide();
                this.pipPopoverService.show({
                    element: $event ? $event.currentTarget : null,
                    class: 'pip-tip',
                    cancelCallback: function () {
                        return false;
                    },
                    locals: {
                        tips: tips,
                        ln: ln || 'en'
                    },
                    controller: ['$scope', '$timeout', 'pipMedia', this.tipController],
                    templateUrl: 'tips/TipTemplate.html'
                });
            }
        };
        TipsService.prototype.firstShowTips = function (tips, language, topic, settings, dayC) {
        };
        TipsService.prototype.getTips = function (party, ln, topic, callback) {
            var _this = this;
            this.pipTipData.readTips({}, function (result) {
                _this.filterTips(result.data, topic);
                if (callback) {
                    callback(_this.tips);
                }
                return _this.tips;
            }, function () {
                return null;
            });
        };
        return TipsService;
    }());
    angular.module('pipTips.Service', ['pipGuidance.Templates', 'pipControls', 'pipTipData'])
        .service('pipTips', TipsService);
}
},{}],31:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipGuidance.Templates');
} catch (e) {
  module = angular.module('pipGuidance.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('guidance/GuidanceDialog.html',
    '<md-dialog class="pip-dialog pip-guidance-dialog layout-column" width="768" md-theme="{{$ctrl.theme}}"><div class="pip-header layout-row"><h3 class="rm16 flex">{{$ctrl.title | translate}}</h3><md-button class="pip-dialog-close" ng-click="$ctrl.onCancel()" aria-label="{{::\'CLOSE\' | translate}}"><span class="icon-cross"></span></md-button></div><div class="pip-body"><div class="pip-content"><pip-picture pip-src="$ctrl.imageUrl" ng-hide="!$ctrl.imageUrl || $ctrl.imageUrl == \'\'" class="bm16 center-block" ng-style="{ width: $ctrl.imageWidth, height: $ctrl.imageHeight, display: \'block\' }"></pip-picture><div class="bm16" ng-bind-html="{{$ctrl.getContent($ctrl.content)}}"></div><md-button class="md-raised md-accent w-stretch" ng-click="$ctrl.onAction()" ng-hide="!$ctrl.action || $ctrl.action==\'\'" arial-label="{{$ctrl.action | translate}}">{{::action | translate}}</md-button><md-checkbox aria-label="{{\'DO_NOT_SHOW\' | translate}}" class="w-stretch m0 tm16 regular_14" ng-model="$ctrl.hideToggle" ng-change="$ctrl.onHideToggle()" ng-show="$ctrl.showHideToggle">{{::\'GUIDANCE_DO_NOT_SHOW\' | translate}}</md-checkbox></div></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipGuidance.Templates');
} catch (e) {
  module = angular.module('pipGuidance.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('intro_guidance/IntroGuidanceDialog.html',
    '<md-dialog class="pip-dialog pip-guidance-dialog pip-guide-preview layout-column" md-theme="{{$ctrl.theme}}" ng-keydown="$ctrl.onKeyDown($event)"><div ng-if="!$ctrl.$routing" ng-swipe-left="$ctrl.onNextPage()" ng-swipe-right="$ctrl.onBackPage()" class="h-stretch flex layout layout-column" ng-style="{\'background-color\':$ctrl.data.pages[$ctrl.number].color}"><div class="layout layout-row layout-align-space-between-center layout-align-xs-center-center w-stretch pip-guide-page pip-scroll-y"><md-button ng-click="$ctrl.onBackPage()" class="md-icon-button lm8 flex-fixed hide-xs" aria-label="BACK" ng-disabled="$ctrl.transaction.busy() || $ctrl.number == 0"><md-icon md-svg-icon="icons:arrow-left" class="pip-arrow-button" ng-class="{\'opacity-disabled\' :$ctrl.number == 0}"></md-icon></md-button><div style="visibility: hidden; position: fixed; width:0px; height: 0px;" ng-if="$ctrl.isOpen"><div ng-repeat="page in $ctrl.data.pages"><img style="visibility: hidden; position: absolute" ng-if="page.pic_uri" src="{{page.pic_uri}}" aria-hidden="true" alt=""> <img style="visibility: hidden; position: absolute" ng-if="page.pic_id_url" src="{{page.pic_id_url}}" aria-hidden="true" alt=""></div></div><div class="layout layout-column layout-align-center-center bm16"><div class="pip-pic" ng-if="$ctrl.data.pages[$ctrl.number].pic_uri" ng-style="{\'background-image\':\'url(\' + $ctrl.data.pages[$ctrl.number].pic_uri + \')\'}"></div><div class="pip-pic" ng-if="$ctrl.data.pages[$ctrl.number].pic_id_url" ng-style="{\'background-image\':\'url(\' + $ctrl.data.pages[$ctrl.number].pic_id_url + \')\'}"></div><div class="layout layout-column layout-align-center-center pip-text"><p class="pip-preview-title" ng-if="$ctrl.data.pages[$ctrl.number].title[$ctrl.ln]" ng-bind-html="$ctrl.data.pages[$ctrl.number].title[$ctrl.ln]"></p><p class="pip-preview-content" ng-if="$ctrl.data.pages[$ctrl.number].content[$ctrl.ln]" ng-bind-html="$ctrl.data.pages[$ctrl.number].content[$ctrl.ln]"></p></div></div><md-button ng-click="$ctrl.onNextPage()" class="rm8 flex-fixed hide-xs md-icon-button" aria-label="DOWN" ng-disabled="$ctrl.transaction.busy() || $ctrl.number == $ctrl.data.pages.length - 1"><md-icon md-svg-icon="icons:arrow-right" class="pip-arrow-button" ng-class="{\'opacity-disabled\' : $ctrl.number == $ctrl.data.pages.length - 1}"></md-icon></md-button></div><div class="flex-fixed flex w-stretch pip-guide-page-footer bp16" ng-style="{\'background-color\':$ctrl.data.pages[$ctrl.number].color}"><div class="layout-row layout-align-center-center" ng-if="$ctrl.data.pages.length > 1"><md-icon ng-repeat="radio in $ctrl.data.pages" ng-click="$ctrl.onChangePage($index)" class="pip-radio-button" md-svg-icon="{{radio != $ctrl.data.pages[$ctrl.number] ? \'icons:radio-off\' : \'icons:circle\'}}"></md-icon></div><div class="h64 layout-row layout-align-xs-space-between-center layout-align-center-center"><md-button ng-click="$ctrl.onBackPage()" class="lm8 flex-fixed md-icon-button" ng-if="$ctrl.pipMedia(\'xs\')" aria-label="BACK" ng-disabled="$ctrl.transaction.busy() || $ctrl.number == 0"><md-icon md-svg-icon="icons:arrow-left" class="pip-arrow-button" ng-class="{\'opacity-disabled\' :$ctrl.number == 0}"></md-icon></md-button><md-button ng-click="$ctrl.onClose()" ng-if="$ctrl.number == $ctrl.data.pages.length - 1" class="pip-button-got rm8 lm8 md-raised" ng-style="{ \'color\':$ctrl.data.pages[$ctrl.number].color }" aria-label="NEXT" ng-disabled="$ctrl.transaction.busy()">{{ :: \'GUIDE_COMPLETE_BUTTON\' | translate }}</md-button><md-button ng-click="$ctrl.onClose()" ng-if="$ctrl.number != $ctrl.data.pages.length - 1" class="pip-button-got rm8 lm8 pip-button-got-not-raised" ng-style="{ \'background-color\':$ctrl.data.pages[$ctrl.number].color}" aria-label="NEXT" ng-disabled="$ctrl.transaction.busy()">{{ :: \'GUIDE_COMPLETE_BUTTON\' | translate }}</md-button><md-button ng-click="$ctrl.onNextPage()" class="rm8 flex-fixed md-icon-button" ng-if="$ctrl.pipMedia(\'xs\')" aria-label="DOWN" ng-disabled="$ctrl.transaction.busy() || $ctrl.number == $ctrl.data.pages.length - 1"><md-icon md-svg-icon="icons:arrow-right" class="pip-arrow-button" ng-class="{\'opacity-disabled\' : $ctrl.number == $ctrl.data.pages.length - 1}"></md-icon></md-button></div></div></div></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipGuidance.Templates');
} catch (e) {
  module = angular.module('pipGuidance.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('quotes/QuoteTemplate.html',
    '<img src="images/quotes.svg" class="pip-bg"><div class="pip-content pip-popover-content lp24-flex rp24-flex pip-scroll"><div>{{ ::content | translate }}</div></div><div class="pip-footer lm24-flex rm24-flex position-bottom layout-row layout-align-start-center"><div class="pip-author flex color-secondary-text">{{ ::author | translate }}</div><md-button ng-click="onNextClick()" class="tm0 bm0 rm0">{{ ::\'NEXT\' | translate }}</md-button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipGuidance.Templates');
} catch (e) {
  module = angular.module('pipGuidance.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('tips/TipTemplate.html',
    '<div ng-if="title" class="pip-title p24-flex flex-fixed bp16">{{ title | translate }}</div><div class="pip-content pip-popover-content lp24-flex rp24-flex text-body1 bm64 pip-scroll" ng-class="{\'tm24\' : !title }"><div ng-if="image && pipMedia(\'gt-xs\')" class="pip-pic"></div><pip-markdown pip-text="content" pip-rebind="true"></pip-markdown></div><div class="pip-footer lm24-flex rm24-flex position-bottom layout-row layout-align-start-center"><a ng-if="link" target="_blank" href="{{ link }}" class="text-body2 flex">{{:: \'MORE_URL\' | translate }}</a><div ng-if="!link" class="flex"></div><md-button ng-click="onNextClick()" class="rm0">{{:: \'NEXT\' | translate }}</md-button></div>');
}]);
})();



},{}]},{},[21,31])(31)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).support = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnalyticsProvider = (function () {
    function AnalyticsProvider() {
        this.enabled = false;
        this.trackingId = null;
    }
    AnalyticsProvider.prototype.enable = function (newTrackingId) {
        if (newTrackingId) {
            this.trackingId = newTrackingId;
            this.enabled = true;
            var wnd_1 = window;
            wnd_1['GoogleAnalyticsObject'] = 'ga';
            wnd_1.ga = wnd_1.ga || function () {
                (wnd_1.ga.q = wnd_1.ga.q || []).push(arguments);
            };
            wnd_1.ga.l = 1 * new Date().getTime();
            wnd_1.ga('create', newTrackingId, 'auto');
            var script = document.createElement('script');
            var prevScript = document.getElementsByTagName('script')[0];
            script.async = true;
            script.src = '//www.google-analytics.com/analytics.js';
            prevScript.parentNode.insertBefore(script, prevScript);
        }
        return this.enabled;
    };
    ;
    AnalyticsProvider.prototype.pageView = function (url, user, language) {
        var wnd = window;
        if (this.enabled && wnd.ga) {
            wnd.ga('send', 'pageview', {
                page: url,
                userId: user,
                language: language
            });
        }
    };
    ;
    AnalyticsProvider.prototype.event = function (category, action, value, user, language) {
        var wnd = window;
        if (this.enabled && wnd.ga) {
            wnd.ga('send', 'event', {
                eventCategory: category,
                eventAction: action,
                eventValue: value,
                userId: user,
                language: language
            });
        }
    };
    ;
    AnalyticsProvider.prototype.$get = function () {
        "ngInject";
        return {
            enabled: this.enabled,
            trackingId: this.trackingId,
            pageView: this.pageView,
            event: this.event
        };
    };
    return AnalyticsProvider;
}());
(function () {
    AnalyticsRun.$inject = ['$rootScope', '$location', 'pipAnalytics'];
    function AnalyticsRun($rootScope, $location, pipAnalytics) {
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var url = $location.url(), user = $rootScope['$session'] && $rootScope['$session'].userId ? $rootScope['$session'].userId : ($rootScope['$identity'] || {}).id, language = ($rootScope['$language'] || 'en');
            var pos = url.indexOf('?');
            if (pos > 0)
                url = url.substring(0, pos);
            pipAnalytics.pageView(url, user, language);
        });
    }
    angular.module('pipAnalytics', [])
        .run(AnalyticsRun)
        .provider('pipAnalytics', AnalyticsProvider);
})();
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attachment = (function () {
    function Attachment(id, uri, name) {
        this.id = id;
        this.uri = uri;
        this.name = name;
    }
    return Attachment;
}());
exports.Attachment = Attachment;
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Feedback = (function () {
    function Feedback(id, category, app, sender, title, content, sent_time) {
        this.id = id;
        this.category = category;
        this.app = app;
        this.sender = sender;
        this.title = title;
        this.content = content;
        this.pics = [];
        this.docs = [];
        this.sent_time = sent_time;
    }
    return Feedback;
}());
exports.Feedback = Feedback;
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FeedbackData = (function () {
    FeedbackData.$inject = ['pipRest', 'pipFormat'];
    function FeedbackData(pipRest, pipFormat) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipFormat = pipFormat;
        this.RESOURCE = 'feedbacks';
        this.PAGE_SIZE = 100;
        this.PAGE_START = 0;
        this.PAGE_TOTAL = true;
    }
    FeedbackData.prototype.readFeedbacks = function (params, successCallback, errorCallback) {
        params = params || {};
        if (params.filter) {
            params.filer = this.pipFormat.filterToString(params.filer);
        }
        return this.pipRest.getResource(this.RESOURCE).page(params, successCallback, errorCallback);
    };
    FeedbackData.prototype.readFeedback = function (id, successCallback, errorCallback) {
        return this.pipRest.getResource(this.RESOURCE).get({ Feedback_id: id }, successCallback, errorCallback);
    };
    FeedbackData.prototype.createFeedback = function (data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).save(data, successCallback, errorCallback);
    };
    FeedbackData.prototype.updateFeedback = function (id, data, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).update({ Feedback_id: id }, data, successCallback, errorCallback);
    };
    FeedbackData.prototype.deleteFeedback = function (id, successCallback, errorCallback) {
        this.pipRest.getResource(this.RESOURCE).remove({ Feedback_id: id }, null, successCallback, errorCallback);
    };
    return FeedbackData;
}());
angular
    .module('pipFeedbackData', ['pipRest', 'pipServices'])
    .service('pipFeedbackData', FeedbackData);
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PageData = (function () {
    function PageData() {
    }
    return PageData;
}());
exports.PageData = PageData;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PartyReference = (function () {
    function PartyReference(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    return PartyReference;
}());
exports.PartyReference = PartyReference;
},{}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./Attachment");
require("./Feedback");
require("./PageData");
require("./PartyReference");
require("./FeedbackDataService");
require("./IFeedbackDataService");
angular
    .module('pipFeedback.Data', [
    'pipFeedbackData'
]);
__export(require("./Attachment"));
__export(require("./Feedback"));
__export(require("./PageData"));
__export(require("./PartyReference"));
},{"./Attachment":3,"./Feedback":4,"./FeedbackDataService":5,"./IFeedbackDataService":6,"./PageData":7,"./PartyReference":8}],10:[function(require,module,exports){
var FeedbackController = (function () {
    function FeedbackController($rootScope, $state, pipAppBar, pipToasts, pipTranslate) {
        var _this = this;
        this.pipToasts = pipToasts;
        this.pipTranslate = pipTranslate;
        this.contentSwitchOption = {
            picture: true,
            document: true,
            location: false,
            event: false
        };
        this.callback = function () { _this.saveCallback(); };
    }
    FeedbackController.prototype.showAppBar = function () {
    };
    FeedbackController.prototype.onSave = function () {
        if (this.$panel)
            this.$panel.onSave();
    };
    FeedbackController.prototype.onTypeChange = function () {
        if (this.$panel)
            this.$panel.onTypeChange(this.data);
    };
    FeedbackController.prototype.saveCallback = function () {
        this.pipToasts.showNotification(this.pipTranslate.translate('FEEDBACK_SUCCESS'), null, null, null, null);
    };
    return FeedbackController;
}());
(function () {
    FeedbackConfig.$inject = ['pipAuthStateProvider'];
    function FeedbackConfig(pipAuthStateProvider) {
        pipAuthStateProvider
            .state('feedback', {
            url: '/feedback',
            controller: FeedbackController,
            controllerAs: '$ctrl',
            templateUrl: 'feedback/Feedback.html',
            auth: true
        });
    }
    angular.module('pipFeedback', [
        'pipAppBar', 'pipServices', 'pipCommonRest', 'pipFeedbackData', 'pipDropdown',
        'ngMaterial', 'pipTranslate', 'pipFeedbackData', 'pipToasts',
        'pipFeedback.Strings', "pipFeedbackPanel", 'pipSupport.Templates'
    ])
        .config(FeedbackConfig);
})();
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    var FeedbackDialogController_1 = (function () {
        function FeedbackDialogController_1($rootScope, $state, party, $mdDialog, pipToasts, pipTranslate) {
            var _this = this;
            this.$mdDialog = $mdDialog;
            this.pipToasts = pipToasts;
            this.pipTranslate = pipTranslate;
            this.contentSwitchOption = {
                picture: true,
                document: true,
                location: false,
                event: false
            };
            this.callback = function () {
                _this.saveCallback();
            };
        }
        FeedbackDialogController_1.prototype.onSave = function () {
            if (this.$panel) {
                this.$panel.onSave();
            }
        };
        FeedbackDialogController_1.prototype.onTypeChange = function () {
            if (this.$panel) {
                this.$panel.onTypeChange(this.data);
            }
        };
        FeedbackDialogController_1.prototype.saveCallback = function () {
            this.$mdDialog.cancel();
            this.pipToasts.showNotification(this.pipTranslate.translate('FEEDBACK_SUCCESS'), null, null, null, null);
        };
        FeedbackDialogController_1.prototype.goBack = function () {
            this.$mdDialog.cancel();
        };
        return FeedbackDialogController_1;
    }());
    var FeedbackDialogService = (function () {
        FeedbackDialogService.$inject = ['$mdDialog'];
        function FeedbackDialogService($mdDialog) {
            this.$mdDialog = $mdDialog;
        }
        ;
        FeedbackDialogService.prototype.show = function (params, successCallback, cancelCallback) {
            this.$mdDialog.show({
                targetEvent: params.event,
                controller: FeedbackDialogController_1,
                templateUrl: 'feedback/FeedbackDialog.html',
                clickOutsideToClose: true,
                controllerAs: '$ctrl',
                locals: {
                    party: params.party
                }
            })
                .then(function (result) {
                if (successCallback) {
                    successCallback(result);
                }
            }, function () {
                if (cancelCallback) {
                    cancelCallback();
                }
            });
        };
        return FeedbackDialogService;
    }());
    angular.module('pipFeedbackDialog', [
        'pipAppBar', 'pipCommonRest', 'pipDropdown',
        'ngMaterial', 'pipTranslate', 'pipFeedbackData', 'pipToasts',
        'pipFeedback.Strings', 'pipFeedbackPanel', 'pipSupport.Templates'
    ])
        .service('pipFeedbackDialog', FeedbackDialogService);
}
},{}],12:[function(require,module,exports){
var FeedbackPanelBindings = {
    data: '=',
    created: '&pipCreated',
    showPictures: '=',
    showDocuments: '=',
    typeCollection: '<typeCollection',
    saveCallback: '='
};
var FeedbackPanelChanges = (function () {
    function FeedbackPanelChanges() {
    }
    return FeedbackPanelChanges;
}());
var FeedbackPanelEntity = (function () {
    function FeedbackPanelEntity() {
        this.pic_ids = [];
        this.docs = [];
    }
    return FeedbackPanelEntity;
}());
var FeedbackPanelTypeCollection = (function () {
    function FeedbackPanelTypeCollection() {
    }
    return FeedbackPanelTypeCollection;
}());
var FeedbackPanelController = (function () {
    FeedbackPanelController.$inject = ['$rootScope', 'pipFeedbackData', 'pipTranslate', 'pipFormErrors'];
    function FeedbackPanelController($rootScope, pipFeedbackData, pipTranslate, pipFormErrors) {
        var _this = this;
        this.pipFeedbackData = pipFeedbackData;
        this.typeCollection = [
            { id: 'support', name: 'SUPPORT' },
            { id: 'feedback', name: 'FEEDBACK' },
            { id: 'copyright', name: 'COPYRIGHT' },
            { id: 'business', name: 'BUSINESS' },
            { id: 'advertising', name: 'ADVERTISING' }
        ];
        this.data = new FeedbackPanelEntity();
        this.$control = {};
        this.pictures = [];
        this.docs = [];
        pipTranslate.translateObjects(this.typeCollection, 'name', 'name');
        this.$party = $rootScope['$party'];
        this.type = pipTranslate.translate('FEEDBACK');
        this.data.sender_id = this.$party.id;
        this.data.sender_name = this.$party.name;
        this.data.sender_email = this.$party.email;
        this.data.pic_ids = [];
        this.data.docs = [];
        this.data.type = this.typeCollection[0].id;
        this.$control.onSave = function () { _this.onSave(); };
        this.$control.onTypeChange = this.onTypeChange;
        this.errorsWithHint = pipFormErrors.errorsWithHint;
        if (this.created) {
            this.created({
                $control: this.$control
            });
        }
    }
    FeedbackPanelController.prototype.onSave = function () {
        var _this = this;
        this.pipFeedbackData.createFeedbackWithFiles({
            transaction: null,
            pictures: this.pictures,
            documents: this.docs,
            item: this.data
        }, function (data) {
            if (_this.saveCallback) {
                _this.saveCallback(data);
            }
        });
    };
    FeedbackPanelController.prototype.onTypeChange = function (type) {
        this.data.type = this.typeCollection[this.typeIndex].id;
        this.type = type.name;
    };
    return FeedbackPanelController;
}());
(function () {
    angular
        .module('pipFeedbackPanel', [
        'pipFocused',
        'pipCommonRest',
        'pipFeedbackData',
        'pipServices',
        'pipSupport.Templates'
    ])
        .component('pipFeedbackPanel', {
        bindings: FeedbackPanelBindings,
        templateUrl: 'feedback/FeedbackPanel.html',
        controller: FeedbackPanelController
    });
})();
},{}],13:[function(require,module,exports){
(function () {
    FeedbackStringsConfig.$inject = ['pipTranslateProvider'];
    function FeedbackStringsConfig(pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'FEEDBACK_TITLE': 'Contact us',
            'FEEDBACK_HINT_FEEDBACK': 'If you need help or you have some ideas or suggestions to improve Pip.Life just use form below',
            'FEEDBACK_HINT_COPYRIGHT': 'If you believe that content available on Pip.Life infringes one or more of your copyrights, you can use the form below to submit a DMCA notice. Upon receipt of a valid notice, we are required by law to respond to it by disabling access to the allegedly infringing content. Your Infringement Notice may be forwarded to the party that made the content available, or to third parties such as ChillingEffects.org.',
            'FEEDBACK_HINT_COPYRIGHT2': 'If you choose to request removal of content by submitting an infringement notification, please remember that you are initiating a legal process. Do not make false claims. Please be advised that under 17 U.S.C. § 512(f), you may be liable for damages (including costs and attorneys’ fees) if you knowingly misrepresent that a product or activity is infringing your copyrights. Thus, if you are not sure content located on or linked-to by Dribbble infringes your copyright, you should consider first contacting an attorney.',
            'FEEDBACK_COMPANY': 'Company name',
            'FEEDBACK_MESSAGE': 'Message',
            'FEEDBACK_ADDRESS': 'Address',
            'FEEDBACK_COPYRIGHT_HOLDER': 'Copyright holder you represent',
            'FEEDBACK_COPYRIGHT_HOLDER_HINT': 'If representing someone other than yourself',
            'FEEDBACK_ORIGINAL_LOCATION': 'Location of original copyrighted work',
            'FEEDBACK_DESCRIBE_COPYRIGHTED': 'Describe the copyrighted work',
            'FEEDBACK_DESCRIBE_COPYRIGHTED_HINT': 'Helps us identify the specific referenced work',
            'FEEDBACK_UNAUTHORIZE_LOCATION': 'Location of unauthorized material',
            'FEEDBACK_UNAUTHORIZE_LOCATION_HINT': 'Please provide specific page URLs, one per line',
            'FEEDBACK_COPYRIGHT_CONC': 'I have a good faith belief that use of the copyrighted materials described above as allegedly infringing is not authorized by the copyright owner, its agent, or the law',
            'FEEDBACK_REGUEST_CONC': 'I swear, under penalty of perjury, that the information in the notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.',
            'FEEDBACK_SIGNATURE': 'You first and last name',
            'FEEDBACK_SIGNATURE_HINT': 'Signature',
            'FEEDBACK_SUBJECT': 'Subject',
            'FEEDBACK_SUCCESS': 'Your message was sent to Pip.Life support team. They will contact you via personal messaging soon. Thanks for your interest in PipLife!'
        });
        pipTranslateProvider.translations('ru', {
            'FEEDBACK_TITLE': 'Обратная связь',
            'FEEDBACK_HINT_FEEDBACK': 'Если Вам нужна помощь или у вас есть идеи или предложения по улучшению Pip.Life используйте рассположенную ниже форму',
            'FEEDBACK_HINT_COPYRIGHT': 'Если вы считаете, что контент, доступный на Pip.Life нарушает одно или более ваших авторских прав, вы можете использовать форму ниже, чтобы представить уведомление DMCA. После получения уведомления, мы по закону обязаны ответить на него, отключив доступ к контенту, который предположительно нарушает авторские права. Уведомление может быть направлено со стороны, представившей контент или третьих сторон, таких как ChillingEffects.org.',
            'FEEDBACK_HINT_COPYRIGHT2': 'Если вы решите запросить удаление содержания, подав уведомление о нарушении, пожалуйста, помните, что вы инициируете судебный процесс. Пожалуйста, обратите внимание, что исодя из статьи 17 U.S.C. § 512 (F), вы можете нести ответственность за убытки (включая расходы и гонорары адвокатам), если вы сознательно искажаете действительность, что продукт или деятельность нарушает ваши авторские права. Таким образом, если вы не уверены, что содержание, расположенное на PipLife нарушает Ваши авторские права посоветуйтесь с адвокатом.',
            'FEEDBACK_COMPANY': 'Название компании',
            'FEEDBACK_MESSAGE': 'Сообщение',
            'FEEDBACK_ADDRESS': 'Адрес',
            'FEEDBACK_COPYRIGHT_HOLDER': 'Владелец авторского права',
            'FEEDBACK_COPYRIGHT_HOLDER_HINT': 'Заполните поле, если Вы  представляете кого-то кроме себя',
            'FEEDBACK_ORIGINAL_LOCATION': 'Расположение оригинальной авторской работы',
            'FEEDBACK_DESCRIBE_COPYRIGHTED': 'Опишите авторские права на произведение',
            'FEEDBACK_DESCRIBE_COPYRIGHTED_HINT': 'Это поможет нам идентифицировать ссылки на работу',
            'FEEDBACK_UNAUTHORIZE_LOCATION': 'Расположение несанкционированного материала',
            'FEEDBACK_UNAUTHORIZE_LOCATION_HINT': 'Пожалуйста, укажите конкретную страницу URL, по одной в строке',
            'FEEDBACK_COPYRIGHT_CONC': 'У меня есть добросовестное предположение, что использование защищенных авторским правом материалов, описанных выше, в качестве якобы нарушает авторские права, не разрешено владельцем авторского права, его агентом или законом',
            'FEEDBACK_REGUEST_CONC': 'Я клянусь под страхом наказания за лжесвидетельство, что содержащаяся в уведомлении информация верна и что я являюсь владельцем авторского права или имею право действовать от имени владельца эксклюзивных прав, которые якобы нарушены.',
            'FEEDBACK_SIGNATURE': 'Ваше имя и фамилия',
            'FEEDBACK_SIGNATURE_HINT': 'Подпись',
            'FEEDBACK_SUBJECT': 'Заголовок',
            'FEEDBACK_SUCCESS': 'Ваш запрос передан команде технической поддержки Pip.Life. C вами свяжутся в ближайшее время по электронной почте. Спасибо за ваш интерес и поддержку PipLife.'
        });
    }
    angular.module('pipFeedback.Strings', ['pipTranslate'])
        .config(FeedbackStringsConfig);
})();
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./IFeedbackDialogService");
require("./Feedback");
require("./FeedbackDialog");
require("./FeedbackPanel");
require("./FeedbackStrings");
},{"./Feedback":10,"./FeedbackDialog":11,"./FeedbackPanel":12,"./FeedbackStrings":13,"./IFeedbackDialogService":14}],16:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./rest");
require("./data");
require("./analytics/Analytics");
require("./analytics/IAnalyticsProvider");
require("./feedback");
angular.module('pipSupport', [
    'pipFeedback.Data',
    'pipFeedback.Rest',
    'pipFeedback',
    'pipAnalytics'
]);
__export(require("./data"));
},{"./analytics/Analytics":1,"./analytics/IAnalyticsProvider":2,"./data":9,"./feedback":15,"./rest":18}],17:[function(require,module,exports){
pipFeedbackDataConfig.$inject = ['pipRestProvider'];
function pipFeedbackDataConfig(pipRestProvider) {
    pipRestProvider.registerPartyCollection('feedbacks', '/api/1.0/feedbacks/:id');
}
angular
    .module('pipFeedbackData')
    .config(pipFeedbackDataConfig);
},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipFeedback.Rest', []);
require("./FeedbackResources");
},{"./FeedbackResources":17}],19:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipSupport.Templates');
} catch (e) {
  module = angular.module('pipSupport.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('feedback/Feedback.html',
    '<md-toolbar class="pip-appbar-ext"></md-toolbar><pip-document width="800"><pip-feedback-panel data="$ctrl.data" pip-created="$ctrl.$panel = $control" show-pictures="$ctrl.showPictures" show-documents="$ctrl.showDocuments" save-callback="$ctrl.callback" type-collection="$ctrl.typeCollection"></pip-feedback-panel><div class="pip-footer"><pip-content-switch class="hide-xs"></pip-content-switch><div class="flex"></div><div class="flex-fixed layout-row"><md-button ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" class="md-raised md-warn">{{::\'CANCEL\' | translate}}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()">{{::\'CANCEL\' | translate}}</md-button><md-button class="md-accent" ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onSave()" ng-disabled="$ctrl.data.content == \'\' && $ctrl.data.title == \'\'">{{::\'SEND\' | translate}}</md-button></div></div></pip-document>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipSupport.Templates');
} catch (e) {
  module = angular.module('pipSupport.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('feedback/FeedbackDialog.html',
    '<md-dialog width="800" class="pip-feedback-dialog"><md-dialog-content class="lp24-flex rp24-flex"><pip-feedback-panel data="$ctrl.data" pip-created="$ctrl.$panel = $control" show-pictures="$ctrl.showPictures" show-documents="$ctrl.showDocuments" save-callback="$ctrl.callback" type-collection="$ctrl.typeCollection"></pip-feedback-panel></md-dialog-content><md-dialog-actions class="layout-row"><pip-content-switch class="show-gt-sm"></pip-content-switch><div class="flex"></div><div class="layout-row flex-fixed"><md-button ng-show="$ctrl.transaction.busy()" ng-click="$ctrl.transaction.abort()" class="md-raised md-warn">{{::\'CANCEL\' | translate}}</md-button><md-button ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.goBack()">{{::\'CANCEL\' | translate}}</md-button><md-button class="md-accent rm8" ng-hide="$ctrl.transaction.busy()" ng-click="$ctrl.onSave()" ng-disabled="$ctrl.data.content == \'\' && $ctrl.data.title == \'\'">{{::\'SEND\' | translate}}</md-button></div></md-dialog-actions></md-dialog>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipSupport.Templates');
} catch (e) {
  module = angular.module('pipSupport.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('feedback/FeedbackPanel.html',
    '<div class="pip-body tp24-flex"><div class="pip-content layout-column"><md-progress-linear ng-show="$ctrl.transaction.busy()" md-mode="indeterminate" class="pip-progress-ontop"></md-progress-linear><form name="form" novalidate=""><md-input-container class="md-block hide-gt-xs"><md-select ng-model="typeIndex" ng-disabled="$ctrl.transaction.busy()" aria-label="DROPDOWN"><md-option ng-repeat="action in $ctrl.typeCollection" value="{{ ::$index }}">{{ (action.title || action.name) | translate }}</md-option></md-select></md-input-container><pip-toggle-buttons ng-model="$ctrl.data.type" pip-buttons="$ctrl.typeCollection" class="bm16 hide-xs"></pip-toggle-buttons><p class="tm0 bm16 text-small text-grey line-height-string" ng-if="$ctrl.data.type == \'feedback\' || $ctrl.data.type == \'support\'">{{::\'FEEDBACK_HINT_FEEDBACK\' | translate}}</p><div ng-if="$ctrl.data.type == \'copyright\'"><p class="tm0 bm16 text-small text-grey line-height-string">{{::\'FEEDBACK_HINT_COPYRIGHT\' | translate}}</p><p class="tm0 bm16 text-small text-grey line-height-string">{{::\'FEEDBACK_HINT_COPYRIGHT2\' | translate }}</p></div><div class="pip-ref-item"><pip-avatar pip-party-id="$ctrl.$party.id" pip-party-name="$ctrl.$party.name" class="pip-pic pip-face"></pip-avatar><div class="pip-content"><p class="pip-title">{{$ctrl.$party.name}}</p><p class="pip-subtitle">{{$ctrl.$party.email}}</p></div></div><div ng-if="$ctrl.data.type!=\'copyright\'"><md-input-container class="md-block" md-no-float=""><input type="text" ng-model="$ctrl.data.title" ng-disabled="$ctrl.transaction.busy()" placeholder="{{:: \'SUBJECT\' | translate}}"></md-input-container><md-input-container class="md-block" md-no-float=""><textarea ng-model="$ctrl.data.content" ng-disabled="$ctrl.transaction.busy()" placeholder="{{::\'FEEDBACK_MESSAGE\'|translate}}">\n' +
    '                        </textarea></md-input-container></div><div ng-if="$ctrl.data.type==\'copyright\'"><md-input-container class="md-block"><label>{{::\'FEEDBACK_COMPANY\'|translate}}</label> <input type="text" ng-model="$ctrl.data.company_name" ng-disabled="$ctrl.transaction.busy()" placeholder="Company Name"></md-input-container><md-input-container class="md-block"><label>{{::\'FEEDBACK_ADDRESS\'|translate}}</label> <input type="text" ng-model="$ctrl.data.company_addr" ng-disabled="$ctrl.transaction.busy()"></md-input-container><md-input-container class="md-block"><label>{{::\'FEEDBACK_COPYRIGHT_HOLDER\' | translate}}</label> <input name="$ctrl.data.copyright_holder" ng-model="$ctrl.data.copyright_holder" ng-disabled="$ctrl.transaction.busy()" step="any" type="text" tabindex="0" required=""><div ng-messages="$ctrl.errorsWithHint($ctrl.form.data.copyright_holder)"><div ng-message="hint">{{::\'FEEDBACK_COPYRIGHT_HOLDER_HINT\' | translate}}</div></div></md-input-container><md-input-container class="md-block flex"><label>{{::\'FEEDBACK_ORIGINAL_LOCATION\'|translate}}</label> <input type="text" ng-model="$ctrl.data.original_loc" ng-disabled="$ctrl.transaction.busy()"></md-input-container><md-input-container class="md-block"><label>{{::\'FEEDBACK_DESCRIBE_COPYRIGHTED\' | translate}}</label> <input name="$ctrl.data.copyrighted_work" ng-model="$ctrl.data.copyrighted_work" ng-disabled="$ctrl.transaction.busy()" step="any" type="text" tabindex="0" required=""><div ng-messages="$ctrl.errorsWithHint($ctrl.form.data.copyrighted_work)"><div ng-message="hint">{{::\'FEEDBACK_DESCRIBE_COPYRIGHTED_HINT\'| translate}}</div></div></md-input-container><md-input-container class="md-block"><label>{{::\'FEEDBACK_UNAUTHORIZE_LOCATION\' | translate}}</label> <textarea name="$ctrl.data.unauth_loc" ng-model="$ctrl.data.unauth_loc" ng-disabled="$ctrl.transaction.busy()" step="any" type="text" tabindex="0" required=""></textarea><div ng-messages="$ctrl.errorsWithHint(form.data.unauth_loc)"><div ng-message="hint">{{::\'FEEDBACK_UNAUTHORIZE_LOCATION_HINT\' | translate}}</div></div></md-input-container><div class="bm16 layout-row"><md-checkbox ng-model="$ctrl.data.copyright_conc" class="lm0 bm0 flex-fixed" aria-label="FEEDBACK_COPYRIGHT_CONC" style="min-width: 24px; margin-top: -2px"></md-checkbox><p class="m0 text-small text-grey line-height-string">{{::\'FEEDBACK_COPYRIGHT_CONC\'|translate}}</p></div><div class="bm16 layout-row"><md-checkbox ng-model="$ctrl.data.request_conc" class="lm0 bm0 flex-fixed" aria-label="FEEDBACK_REGUEST_CONC" style="min-width: 24px; margin-top: -2px"></md-checkbox><p class="m0 text-small text-grey line-height-string">{{::\'FEEDBACK_REGUEST_CONC\'|translate}}</p></div><md-input-container class="md-block"><label>{{::\'FEEDBACK_SIGNATURE\' | translate}}</label> <input name="$ctrl.data.signature" ng-model="$ctrl.data.signature" ng-disabled="$ctrl.transaction.busy()" step="any" type="text" tabindex="0" required=""><div ng-messages="$ctrl.errorsWithHint($ctrl.form.data.signature)"><div ng-message="hint">{{::\'FEEDBACK_SIGNATURE_HINT\' | translate}}</div></div></md-input-container></div><pip-picture-list-edit class="bm8" ng-show="$ctrl.showPictures" pip-picture-ids="$ctrl.data.pic_ids" pip-created="$ctrl.pictures = $event.sender" ng-disabled="$ctrl.transaction.busy()"></pip-picture-list-edit><pip-document-list-edit ng-show="$ctrl.showDocuments" pip-documents="$ctrl.data.docs" pip-created="$ctrl.docs = $event.sender" ng-disabled="$ctrl.transaction.busy()"></pip-document-list-edit></form></div></div>');
}]);
})();



},{}]},{},[19,1,2,3,4,5,6,9,7,8,10,11,12,13,14,15,16,17,18])(19)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).maps = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function () {
    'use strict';
    function GoogleMapsProvider() {
        var mapOptions = {
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            disableDefaultUI: true,
            panControl: false,
            zoomControl: false
        };
        this.mapOptions = function (options) {
            mapOptions = _.defaults({}, options, mapOptions);
            return _.cloneDeep(mapOptions);
        };
        this.$get = ['$rootScope', function ($rootScope) {
            return {
                mapOptions: function () {
                    return _.cloneDeep(mapOptions);
                },
                map: function (options, geoRegion, onMapClickCallback) {
                    options || (options = {});
                    var onTilesLoaded = _.once(function (map) {
                        google.maps.event.trigger(map, 'resize');
                    });
                    var boundary = geoRegion && geoRegion.boundary || {};
                    return {
                        center: {
                            latitude: (boundary.nw_lat + boundary.se_lat) / 2 || 0,
                            longitude: (boundary.nw_lon + boundary.se_lon) / 2 || 0
                        },
                        zoom: 16,
                        control: {},
                        options: _.assign({}, options, mapOptions),
                        bounds: {},
                        events: {
                            click: onMapClickCallback || function () { },
                            tilesloaded: onTilesLoaded,
                            zoom_changed: onZoomChanged
                        }
                    };
                    function onZoomChanged(map) {
                        var directiveSpecificMaxZoomLevel = options.maxZoomLevel, directiveSpecificMinZoomLevel = options.minZoomLevel, maxZoomLevel = directiveSpecificMaxZoomLevel == null ? mapOptions['maxZoom'] : directiveSpecificMaxZoomLevel, minZoomLevel = directiveSpecificMinZoomLevel == null ? mapOptions['minZoom'] : directiveSpecificMinZoomLevel, currentZoomLevel = map.getZoom();
                        if (currentZoomLevel > maxZoomLevel) {
                            map.setZoom(maxZoomLevel);
                        }
                        else if (currentZoomLevel < minZoomLevel) {
                            map.setZoom(minZoomLevel);
                        }
                    }
                },
                infoWindow: function (additionalClass, offset) {
                    return {
                        show: false,
                        control: {},
                        options: {
                            boxClass: 'pip-map-info-window ' + additionalClass,
                            closeBoxURL: '',
                            pixelOffset: offset || new google.maps.Size(-175, -210, 'px', 'px')
                        }
                    };
                },
                setMapBounds: function (map, geoRegion) {
                    var unwatchBoundsChange = $rootScope.$watch(function () {
                        return map.bounds;
                    }, function (newVal) {
                        if (newVal.northeast && newVal.southwest) {
                            map.bounds = {
                                northeast: {
                                    latitude: geoRegion.boundary.nw_lat,
                                    longitude: geoRegion.boundary.se_lon
                                },
                                southwest: {
                                    latitude: geoRegion.boundary.se_lat,
                                    longitude: geoRegion.boundary.nw_lon
                                }
                            };
                            unwatchBoundsChange();
                        }
                    }, true);
                },
                fitMapToBounds: function (map, bounds) {
                    if (!bounds.isEmpty()) {
                        var currentMapBounds = map.getBounds();
                        if (_.isEmpty(currentMapBounds)
                            || (!_.isEmpty(currentMapBounds)
                                && currentMapBounds.contains
                                && (!currentMapBounds.contains(bounds.getNorthEast())
                                    || !currentMapBounds.contains(bounds.getSouthWest())))) {
                            map.fitBounds(bounds);
                        }
                    }
                }
            };
        }];
    }
    angular
        .module('pipMaps')
        .provider('pipGoogleMaps', GoogleMapsProvider);
})();
},{}],2:[function(require,module,exports){
(function () {
    'use strict';
    uiGmapModelKeyDecorator.$inject = ['$delegate'];
    function uiGmapModelKeyDecorator($delegate) {
        var setChildScope = $delegate.prototype.setChildScope;
        $delegate.prototype.setChildScope = function (keys, childScope) {
            var result = setChildScope.apply(this, arguments);
            if (childScope && childScope.hasOwnProperty('model') && !childScope.model) {
                delete childScope.model;
            }
            return result;
        };
        return $delegate;
    }
    function pipMapHelperSrv() {
        var defaultIconParameters = {
            iconBaseSize: 96,
            iconNormalScaleFactor: 0.5,
            iconActiveScaleFactor: 1,
            iconsPerSprite: 1
        };
        var directions = [{
                name: 'North',
                numberInSprite: 0,
                scope: [-22.5, 22.5]
            },
            {
                name: 'Northeast',
                numberInSprite: 1,
                scope: [22.5, 67.5]
            },
            {
                name: 'East',
                numberInSprite: 2,
                scope: [67.5, 112.5]
            },
            {
                name: 'Southeast',
                numberInSprite: 3,
                scope: [112.5, 157.5]
            },
            {
                name: 'South',
                numberInSprite: 4,
                scope: [157.5, -157.5]
            },
            {
                name: 'SouthWest',
                numberInSprite: 5,
                scope: [-157.5, -112.5]
            },
            {
                name: 'West',
                numberInSprite: 6,
                scope: [-112.5, -67.5]
            },
            {
                name: 'Northwest',
                numberInSprite: 7,
                scope: [-67.5, -22.5]
            },
            {
                name: 'Stop',
                numberInSprite: 8,
                scope: []
            }
        ];
        this.setIconSettings = function (sizes) {
            angular.extend(defaultIconParameters, sizes);
        };
        this.$get = ['uiGmapGoogleMapApi', '$timeout', function (uiGmapGoogleMapApi, $timeout) {
            var service = {
                isReady: false,
                whenReady: uiGmapGoogleMapApi,
                maps: {},
                getIconDimensions: null,
                setIcon: null,
                triggerEvent: null,
                createSize: null,
                createPoint: null,
                createKML: null,
                getCenterFromRegion: null,
                fitMapToRegion: null,
                getBoundsFromRegion: null,
                getBoundsFromCoordinates: null,
                fitMapToBounds: null,
                forceMapToFitBounds: null,
                shouldFitBound: null,
                setModelOptions: null,
                getDegreesBetweenTwoPoints: null,
                getDirection: null,
                getDirectionByAngle: null,
                getIconOriginByDirection: null
            };
            uiGmapGoogleMapApi.then(onInit.bind(service));
            service.getIconDimensions = function (icon, isActive) {
                var parameters = angular.extend({}, defaultIconParameters, icon);
                var scaleFactor = isActive ? parameters.iconActiveScaleFactor : parameters.iconNormalScaleFactor;
                var size = parameters.iconBaseSize * scaleFactor;
                return {
                    origin: this.createPoint(0, size * icon.numberInSprite || 1),
                    anchor: this.createPoint(size / 2, size / 2),
                    size: this.createSize(size, size),
                    scaledSize: this.createSize(size, parameters.iconsPerSprite * size),
                    isActive: isActive
                };
            };
            service.setIcon = function (icon, isActive) {
                isActive = typeof isActive === 'boolean' ? isActive : icon.isActive;
                service.whenReady.then(function () {
                    var iconDimensions = this.getIconDimensions(icon, isActive);
                    _.extend(icon, iconDimensions);
                }.bind(this));
            };
            service.triggerEvent = function () {
                var event = this.maps.event;
                if (!event) {
                    return null;
                }
                return event.trigger.apply(event, arguments);
            };
            service.createSize = function (width, height) {
                var Size = this.maps.Size;
                if (!Size) {
                    return {};
                }
                return new Size(width, height, 'px', 'px');
            };
            service.createPoint = function (x, y) {
                var Point = this.maps.Point;
                if (!Point) {
                    return {};
                }
                return new Point(x, y);
            };
            service.createKML = function (options) {
                var Layer = this.maps.KmlLayer;
                if (!Layer) {
                    return {};
                }
                return new Layer(options);
            };
            service.getCenterFromRegion = function (geoRegion) {
                if (!geoRegion || !geoRegion.boundary) {
                    return {
                        latitude: 0,
                        longitude: 0
                    };
                }
                return {
                    latitude: (geoRegion.boundary.nw_lat + geoRegion.boundary.se_lat) / 2,
                    longitude: (geoRegion.boundary.nw_lon + geoRegion.boundary.se_lon) / 2
                };
            };
            service.fitMapToRegion = function (map, geoRegion) {
                var bounds = this.getBoundsFromRegion(geoRegion);
                $timeout(this.forceMapToFitBounds.bind(this, map, bounds));
            };
            service.getBoundsFromRegion = function (geoRegion) {
                if (!geoRegion || !geoRegion.boundary) {
                    return {};
                }
                return this.getBoundsFromCoordinates([{
                        latitude: geoRegion.boundary.se_lat,
                        longitude: geoRegion.boundary.se_lon
                    },
                    {
                        latitude: geoRegion.boundary.nw_lat,
                        longitude: geoRegion.boundary.nw_lon
                    }
                ]);
            };
            service.getBoundsFromCoordinates = function (coordinates) {
                var LatLngBounds = this.maps.LatLngBounds;
                var LatLng = this.maps.LatLng;
                if (!LatLng || !LatLngBounds) {
                    return {};
                }
                var bounds = new LatLngBounds();
                coordinates.forEach(function (coordinate) {
                    if (!coordinate.latitude || !coordinate.longitude) {
                        return;
                    }
                    bounds.extend(new LatLng(coordinate.latitude, coordinate.longitude));
                });
                return bounds;
            };
            service.fitMapToBounds = function (map, bounds, force) {
                if (bounds.isEmpty()) {
                    return;
                }
                if (force || this.shouldFitBound(map, bounds)) {
                    map.fitBounds(bounds);
                }
            };
            service.forceMapToFitBounds = function (map, bounds) {
                this.fitMapToBounds(map, bounds, true);
            };
            service.shouldFitBound = function (map, bounds) {
                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                var currentMapBounds = map.getBounds();
                var mapContainsBounds = currentMapBounds.contains &&
                    (!currentMapBounds.contains(northEast) || !currentMapBounds.contains(southWest));
                return _.isEmpty(currentMapBounds) || mapContainsBounds;
            };
            service.setModelOptions = function (pluralModel, options) {
                var plainObject = pluralModel && pluralModel.gObject;
                if (plainObject && angular.isFunction(plainObject.setOptions)) {
                    plainObject.setOptions(options);
                }
            };
            service.getDegreesBetweenTwoPoints = function (point1, point2) {
                var p1 = {
                    lat: function () {
                        return point1.lat || point1.latitude;
                    },
                    lng: function () {
                        return point1.lng || point1.longitude;
                    }
                };
                var p2 = {
                    lat: function () {
                        return point2.lat || point2.latitude;
                    },
                    lng: function () {
                        return point2.lng || point2.longitude;
                    }
                };
                return google.maps.geometry.spherical.computeHeading(p1, p2);
            };
            service.getDirection = function (point1, point2) {
                var degree = this.getDegreesBetweenTwoPoints(point1, point2);
                if ((point1.lat || point1.latitude) === (point2.lat || point2.latitude) &&
                    (point1.lng || point1.longitude) === (point2.lng || point2.longitude)) {
                    return directions[8];
                }
                for (var i = 0; i < 8; i++) {
                    if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
                        return directions[i];
                    }
                }
                return directions[8];
            };
            service.getDirectionByAngle = function (degree) {
                for (var i = 0; i < 8; i++) {
                    if (degree >= directions[i].scope[0] && degree <= directions[i].scope[1]) {
                        return directions[i];
                    }
                }
                return directions[8];
            };
            service.getIconOriginByDirection = function (point1, point2, iconSize, gutter) {
                if (iconSize === void 0) { iconSize = 82; }
                if (gutter === void 0) { gutter = 15; }
                var direction = this.getDirection(point1, point2);
                return new google.maps.Point(0, direction.numberInSprite * iconSize + direction.numberInSprite * gutter);
            };
            function onInit(maps) {
                var mapTypeId = maps.MapTypeId || {};
                var mapTypes = {
                    roadMap: mapTypeId.ROADMAP,
                    satellite: mapTypeId.SATELLITE,
                    hybrid: mapTypeId.HYBRID,
                    terrain: mapTypeId.TERRAIN
                };
                var symbolPath = maps.SymbolPath || {};
                var symbols = {
                    circle: symbolPath.CIRCLE,
                    backwardClosed: symbolPath.BACKWARD_CLOSED_ARROW,
                    forwardClosed: symbolPath.FORWARD_CLOSED_ARROW,
                    backwardOpened: symbolPath.BACKWARD_OPEN_ARROW,
                    forwardCOpened: symbolPath.FORWARD_OPEN_ARROW
                };
                this.isReady = true;
                angular.extend(this, {
                    mapTypes: mapTypes,
                    symbols: symbols,
                    maps: maps
                });
            }
            return service;
        }];
    }
    angular.module('pipMaps')
        .provider('pipMapHelperSrv', pipMapHelperSrv)
        .decorator('uiGmapModelKey', uiGmapModelKeyDecorator);
})();
},{}],3:[function(require,module,exports){
(function () {
    'use strict';
    MapComponentCtrl.$inject = ['$injector', '$scope', '$element'];
    USGSOverlay.prototype = new google.maps.OverlayView();
    function USGSOverlay(bounds, image, map, opacity) {
        this.bounds_ = bounds;
        this.image_ = image;
        this.map_ = map;
        this.opacity = opacity ? opacity : null;
        this.div_ = null;
        this.setMap(map);
    }
    USGSOverlay.prototype.onAdd = function () {
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        if (this.opacity)
            div.style.opacity = this.opacity;
        var img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.position = 'absolute';
        div.appendChild(img);
        this.div_ = div;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    };
    USGSOverlay.prototype.draw = function (bounds) {
        var overlayProjection = this.getProjection();
        if (!overlayProjection)
            return;
        if (bounds) {
            this.bounds_ = bounds;
        }
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
        var div = this.div_;
        if (!div)
            return;
        div.style.left = sw.x + 'px';
        div.style.top = sw.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (ne.y - sw.y) + 'px';
        if (this.opacity)
            div.style.opacity = this.opacity;
    };
    USGSOverlay.prototype.onRemove = function () {
        if (this.div_ && this.div_.parentNode)
            this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    };
    function MapComponentCtrl($injector, $scope, $element) {
        var _this = this;
        var mapEventHandlerMixinFct = $injector.get('mapEventHandlerMixinFct');
        mapEventHandlerMixinFct.mixTo(this, $scope.$applyAsync.bind($scope));
        this.sidePanel = {};
        this.embededMap = null;
        this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        this.uiGmapIsReady = $injector.get('uiGmapIsReady');
        this.$timeout = $injector.get('$timeout');
        this.$rootScope = $injector.get('$rootScope');
        this.MapPopupFct = $injector.get('MapPopupFct');
        this.pipMapHelperSrv.whenReady.then(this.init.bind(this));
        $element.addClass('pip-map flex layout-row');
        $scope.$watch('ctrl.componentOptions.center', function (newVal) {
            if (_this.justResized == true) {
                return;
            }
            if (_this.gMap && newVal) {
                var newCenter = { lat: newVal.latitude || newVal.lat, lng: newVal.longitude || newVal.lng };
                if (_.isNumber(newCenter.lat) && _.isNumber(newCenter.lng)) {
                    _this.gMap.panTo(newCenter);
                }
            }
        }, true);
        $scope.$watch('ctrl.componentOptions.zoom', function (newVal) {
            if (_this.map)
                _this.map.zoom = newVal;
        });
        $scope.$watch('ctrl.componentOptions.embededMap', function (newVal, oldVal) {
            if (newVal && oldVal && newVal.embededSrc && oldVal.embededSrc && newVal.embededSrc == oldVal.embededSrc) {
                if (_this.embededOverlay) {
                    var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(newVal.map_north, newVal.map_west), new google.maps.LatLng(newVal.map_south, newVal.map_east));
                    _this.embededOverlay.draw(bounds);
                    return;
                }
            }
            _this.setEmbededBounds();
        });
        this.$rootScope.$on('pipMainResized', function () {
            _this.throttleResize();
        });
    }
    MapComponentCtrl.prototype.defaultOptions = {
        map: {
            disableDefaultUI: true,
            panControl: false,
            zoomControl: false,
            disableDoubleClickZoom: true
        },
        setInitBounds: false,
        popup: {}
    };
    MapComponentCtrl.prototype.init = function () {
        this.options = angular.merge({
            map: {
                mapTypeId: this.pipMapHelperSrv.mapTypes.satellite
            }
        }, this.defaultOptions, this.componentOptions);
        if (!this.componentOptions.control)
            this.componentOptions.control = {};
        this.map = this.getMap();
        this.map.zoom = this.componentOptions.zoom;
        this.map.center = this.componentOptions.center;
        if (this.options.sidePanel && this.options.sidePanel.templateUrl) {
            this.showSidePanel(this.options.sidePanel.templateUrl);
        }
        this.uiGmapIsReady.promise()
            .finally(this.onMapReady.bind(this));
    };
    MapComponentCtrl.prototype.onMapReady = function () {
        this.setInitBounds();
        this.setEmbededBounds();
    };
    MapComponentCtrl.prototype.setInitBounds = function () {
        var map = this.getMapInstance();
        if (this.options.setInitBounds && map) {
            this.pipMapHelperSrv.fitMapToRegion(map, this.options.geoRegion);
        }
    };
    MapComponentCtrl.prototype.setEmbededBounds = function () {
        var map = this.getMapInstance();
        if (this.componentOptions.embededMap && this.componentOptions.embededMap.embededSrc) {
            var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(this.componentOptions.embededMap.map_north, this.componentOptions.embededMap.map_west), new google.maps.LatLng(this.componentOptions.embededMap.map_south, this.componentOptions.embededMap.map_east));
            var srcImage = this.componentOptions.embededMap.embededSrc;
            this.embededOverlay = new USGSOverlay(bounds, srcImage, map, this.componentOptions.embededMap.opacity);
        }
        else {
            if (this.embededOverlay)
                this.embededOverlay.onRemove();
            this.embededOverlay = null;
        }
    };
    MapComponentCtrl.prototype.getMapInstance = function () {
        if (!this.gMap && this.componentOptions && this.componentOptions.control && this.componentOptions.control.getGMap) {
            this.gMap = this.componentOptions.control.getGMap();
        }
        return this.gMap;
    };
    MapComponentCtrl.prototype.getMap = function () {
        var _this = this;
        var externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
        var externalZoom = this.options.events && this.options.events.zoom_changed ? this.options.events.zoom_changed : angular.noop;
        var externalCenter = this.options.events && this.options.events.center_changed ? this.options.events.center_changed : angular.noop;
        var debounceCenterChange = _.debounce(function (event) {
            externalCenter(event);
        }, 500);
        return {
            control: {},
            options: this.options.map,
            bounds: this.options.bounds || {},
            events: _.extend(this.options.events, {
                click: function (event) {
                    _this.onClick(event);
                    externalClick();
                },
                zoom_changed: function (event) {
                    if (event && _this.componentOptions && _this.componentOptions.mapId) {
                        event.mapId = _this.componentOptions.mapId;
                        externalZoom(event);
                    }
                },
                center_changed: function (event) {
                    if (event && _this.componentOptions && _this.componentOptions.mapId) {
                        event.mapId = _this.componentOptions.mapId;
                        debounceCenterChange(event);
                    }
                },
                dblclick: this.onEventHandler.bind(this),
                tilesloaded: this.updateMapTiles.bind(this)
            })
        };
    };
    MapComponentCtrl.prototype.updateMapTiles = function (updateCenter) {
        if (updateCenter === void 0) { updateCenter = false; }
        var gMap = this.getMapInstance();
        if (!gMap)
            return;
        this.pipMapHelperSrv.triggerEvent(gMap, 'resize');
    };
    var throttleUpdatingCenter = _.throttle(function (gMap, center) {
        if (!center)
            return;
        gMap.panTo(center);
        gMap.setCenter(center);
    }, 400);
    MapComponentCtrl.prototype.throttleResize = function () {
        var _this = this;
        var gMap = this.getMapInstance();
        if (!gMap)
            return;
        if (this.justResized != true) {
            this.justResized = true;
            var center = gMap.getCenter();
            this.$timeout(function () {
                throttleUpdatingCenter(gMap, center);
            });
            this.$timeout(function () {
                _this.justResized = false;
            }, 400);
        }
        this.pipMapHelperSrv.triggerEvent(gMap, 'resize');
    };
    MapComponentCtrl.prototype.fitMapToBounds = function (bounds) {
        this.pipMapHelperSrv.fitMapToBounds(this.getMapInstance(), bounds);
    };
    MapComponentCtrl.prototype.showSidePanel = function (template) {
        this.sidePanel.template = template;
        this.sidePanel.show = true;
        this.$timeout(this.updateMapTiles.bind(this));
    };
    MapComponentCtrl.prototype.hideSidePanel = function () {
        this.sidePanel.template = null;
        this.sidePanel.show = false;
        this.$timeout(this.updateMapTiles.bind(this));
    };
    MapComponentCtrl.prototype.onClick = function () {
        this.closePopup();
    };
    MapComponentCtrl.prototype.freeze = function () {
        if (this.isFrozen) {
            return;
        }
        this.setMapOptions({
            draggable: false,
            disableDoubleClickZoom: true,
            scrollwheel: false
        });
        this.isFrozen = true;
    };
    MapComponentCtrl.prototype.unfreeze = function () {
        if (!this.isFrozen) {
            return;
        }
        this.setMapOptions({
            draggable: true,
            disableDoubleClickZoom: true,
            scrollwheel: true
        });
        this.isFrozen = false;
    };
    MapComponentCtrl.prototype.setCursor = function (cursor) {
        this.cursor = cursor;
    };
    MapComponentCtrl.prototype.setMapOptions = function (options) {
        var mapInstance = this.getMapInstance();
        mapInstance.setOptions(options);
    };
    MapComponentCtrl.prototype.createElementPopup = function (options) {
        this.createPopupInstance();
        return this.popup.add(options);
    };
    MapComponentCtrl.prototype.createPopupInstance = function () {
        if (this.popup) {
            return;
        }
        this.popup = this.MapPopupFct.create();
    };
    MapComponentCtrl.prototype.closePopup = function () {
        if (!this.popup) {
            return;
        }
        console.log('this.popup', this.popup);
        this.popup.close();
    };
    function pipMapComponent() {
        return {
            strict: 'AE',
            scope: true,
            transclude: true,
            bindToController: {
                componentOptions: '=pipOptions'
            },
            controller: 'MapComponentCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'map.html'
        };
    }
    angular.module('pipMaps')
        .controller('MapComponentCtrl', MapComponentCtrl)
        .directive('pipMap', pipMapComponent);
})();
},{}],4:[function(require,module,exports){
(function () {
    'use strict';
    function mapEventHandlerMixinFct() {
        var createEventObjFromHandlerArguments = function (gModel, eventName, model, args) {
            if (!args || !args.length) {
                args = model;
                model = null;
            }
            var position = args[0] && args[0].latLng && getPositionFromLatLng(args[0].latLng);
            return {
                gModel: gModel,
                eventName: eventName,
                args: args,
                model: model,
                position: position
            };
        };
        var getPositionFromLatLng = function (latLng) {
            return {
                latitude: latLng.lat(),
                longitude: latLng.lng()
            };
        };
        var mixin = function (postHandler) {
            postHandler = postHandler || angular.noop;
            return {
                addEventHandler: function (eventName, callback) {
                    var handlerName = '__onEventOverridden_' + eventName;
                    this[handlerName] = callback;
                    return function () {
                        this[handlerName] = null;
                    }.bind(this);
                },
                onEventHandler: function (gObject, eventName) {
                    var handlerName = '__onEventOverridden_' + eventName;
                    var eventObj = createEventObjFromHandlerArguments.apply(null, arguments);
                    if (angular.isFunction(this[handlerName])) {
                        this[handlerName](eventObj);
                        postHandler();
                        return;
                    }
                    var defaultHandlerName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
                    if (angular.isFunction(this[defaultHandlerName])) {
                        this[defaultHandlerName](eventObj);
                        postHandler();
                    }
                }
            };
        };
        return {
            mixTo: function (obj, $scope) {
                angular.extend(obj, mixin($scope));
            }
        };
    }
    angular.module('pipMaps')
        .factory('mapEventHandlerMixinFct', mapEventHandlerMixinFct);
})();
},{}],5:[function(require,module,exports){
{
    var config_1 = function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyBg6cm-FDBFPWzRcn39AuSHGQSrdtVIjEo',
            v: '3.23',
            libraries: 'geometry'
        });
    };
    config_1.$inject = ['uiGmapGoogleMapApiProvider'];
    angular.module('pipMaps')
        .config(config_1);
}
},{}],6:[function(require,module,exports){
var MapEditBindings = {
    overlay: '<pipOverlay',
    onEdit: '&?pipOnEdit',
    mapOptions: '=?pipMapOptions',
    showActionPanel: '<?pipShowActionPanel',
    actionTypes: '<?pipActionTypes',
    control: '&?pipControl',
    disabled: '<?pipDisabled',
    disabledPolygons: '<?pipDisabledPolygons',
    disabledPolygonsOptions: '<?pipDisabledPolygonsOptions',
    disabledPolylines: '<?pipDisabledPolylines',
    disabledPolylinesOptions: '<?pipDisabledPolylinesOptions',
    disabledCircles: '<?pipDisabledCircles',
    disabledCirclesOptions: '<?pipDisabledCirclesOptions'
};
var actionTypes = (function () {
    function actionTypes() {
    }
    return actionTypes;
}());
actionTypes.clearMap = 'clear';
actionTypes.addCircle = 'circle';
actionTypes.addRectangle = 'rectangle';
actionTypes.addPolygon = 'polygon';
actionTypes.addLine = 'line';
var MapEditChanges = (function () {
    function MapEditChanges() {
    }
    return MapEditChanges;
}());
var MapEditController = (function () {
    MapEditController.$inject = ['$element', '$scope', '$mdConstant', '$document', '$timeout', 'uiGmapGoogleMapApi'];
    function MapEditController($element, $scope, $mdConstant, $document, $timeout, uiGmapGoogleMapApi) {
        var _this = this;
        this.$element = $element;
        this.$scope = $scope;
        this.$mdConstant = $mdConstant;
        this.$document = $document;
        this.$timeout = $timeout;
        this.uiGmapGoogleMapApi = uiGmapGoogleMapApi;
        this.map = {
            control: {},
            options: {
                disableDefaultUI: true,
                mapTypeId: "satellite",
                panControl: false,
                zoomControl: false,
                mapTypeControl: false,
                streetViewControl: false
            }
        };
        this.drawingManagerControl = {};
        this.drawingManagerOptions = {};
        this.currentOverlay = {};
        this._circleOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            zIndex: 1
        };
        this._polygonOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            draggable: !this.disabled,
            zIndex: 1
        };
        this._polylineOptions = {
            strokeWeight: 6,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            zIndex: 1
        };
        this._markerOptions = {
            icon: {
                path: 0,
                scale: 4,
                strokeWeight: 8,
                fillColor: '#F8E81C',
                strokeColor: '#F8E81C',
                strokeOpacity: 0.9,
                draggable: !this.disabled
            }
        };
        this._rectangleOptions = {
            fillColor: '#F8E81C',
            fillOpacity: 0.2,
            strokeWeight: 3,
            strokeColor: '#F8E81C',
            clickable: false,
            editable: !this.disabled,
            draggable: !this.disabled,
            zIndex: 1
        };
        $element.addClass('pip-map-edit');
        uiGmapGoogleMapApi.then(function (maps) {
            _this.drawingManagerOptions = {
                drawingControl: false,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE
                    ]
                },
                circleOptions: _this._circleOptions,
                polygonOptions: _this._polygonOptions,
                polylineOptions: _this._polylineOptions,
                markerOptions: _this._markerOptions,
                rectangleOptions: _this._rectangleOptions
            };
        });
        $scope.$watch('$ctrl.map.control.getGMap', function () {
            if (_this.currentOverlay && _this.currentOverlay.setMap && _.isFunction(_this.map.control['getGMap'])) {
                _this.currentOverlay.setMap(_this.map.control['getGMap']());
                _this.fitBounds();
            }
        });
        $scope.$watch('$ctrl.mapOptions.embededMap', function () {
            _.assign(_this.map, _this.mapOptions);
        }, true);
        $scope.$watch('$ctrl.mapOptions.isEmbeded', function () {
            _.assign(_this.map, _this.mapOptions);
        });
        $scope.$watch('$ctrl.drawingManagerControl.getDrawingManager', function (val) {
            if (!_this.drawingManagerControl.getDrawingManager) {
                return;
            }
            google.maps.event.addListener(_this.drawingManagerControl.getDrawingManager(), 'overlaycomplete', function (e) {
                _this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                _this.setOverlay(e.overlay, e.type, false);
                _this.onEditOverlay();
            });
            google.maps.event.addListener(_this.drawingManagerControl.getDrawingManager(), 'drawingmode_changed', function () {
                if (_this.drawingManagerControl.getDrawingManager().getDrawingMode() !== null) {
                    if (_this.currentOverlay && _this.currentOverlay.map)
                        _this.currentOverlay.setMap(null);
                }
            });
            google.maps.event.addDomListener(document, 'keyup', function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code === 27) {
                    _this.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                }
                if (code === 46) {
                    _this.clearMap();
                }
            });
        });
    }
    MapEditController.prototype.$onDestroy = function () {
    };
    MapEditController.prototype.$onChanges = function (changes) {
        if (changes.overlay && changes.overlay.currentValue) {
            this.setOverlay(this.convertToGoogleMapOverlay(changes.overlay.currentValue), changes.overlay.currentValue.type);
        }
        if (changes.disabled) {
            if (this.currentOverlay) {
                this.currentOverlay.setDraggable(!changes.disabled.currentValue);
                if (this.currentOverlay.setEditable)
                    this.currentOverlay.setEditable(!changes.disabled.currentValue);
            }
        }
    };
    MapEditController.prototype.$onInit = function () {
        angular.extend(this.map, this.mapOptions);
        if (this.control) {
            this.control({ control: this });
        }
    };
    MapEditController.prototype.fitBounds = function () {
        if (!this.map.control['getGMap'] || !this.currentOverlay)
            return;
        switch (this.overlay.type) {
            case 'circle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }
            case 'marker': {
                if (this.currentOverlay.getPosition) {
                    this.map.control['getGMap']().panTo(this.currentOverlay.getPosition());
                }
                break;
            }
            case 'rectangle': {
                this.map.control['getGMap']().fitBounds(this.currentOverlay.getBounds());
                break;
            }
            default: {
                if (this.currentOverlay.getPath().getArray().length > 0) {
                    var bounds = new google.maps.LatLngBounds();
                    _.each(this.currentOverlay.getPath().getArray(), function (coor) {
                        bounds.extend(coor);
                    });
                    this.map.control['getGMap']().fitBounds(bounds);
                }
            }
        }
    };
    MapEditController.prototype.convertToGoogleMapOverlay = function (overlay) {
        if (overlay.type === 'polygon') {
            return this.createPolygon(overlay);
        }
        if (overlay.type === 'line' || overlay.type === 'polyline') {
            return this.createPolyline(overlay);
        }
        if (overlay.type === 'circle') {
            return this.createCircle(overlay);
        }
        if (overlay.type === 'marker') {
            return this.createMarker(overlay);
        }
        if (overlay.type === 'rectangle') {
            return this.createRectangle(overlay);
        }
    };
    MapEditController.prototype.createMarker = function (overlay) {
        if ((overlay.pos && overlay.pos.coordinates) || (overlay.latitude && overlay.longitude)) {
            var centerCoords = {};
            centerCoords = {
                lat: overlay.pos.coordinates ? overlay.pos.coordinates[1] : overlay.latitude,
                lng: overlay.pos.coordinates ? overlay.pos.coordinates[0] : overlay.longitude
            };
            var marker = new google.maps.Marker(angular.extend(this.getOptionsByType('marker'), { position: centerCoords }));
            if (this.map.control['getGMap'])
                marker.setMap(this.map.control['getGMap']());
            return marker;
        }
        return new google.maps.Circle(this.getOptionsByType('circle'));
    };
    MapEditController.prototype.createCircle = function (overlay) {
        if (overlay.center && (overlay.center.coordinates || (overlay.center.latitude && overlay.center.longitude)) && overlay.distance) {
            var centerCoords = {};
            centerCoords = {
                lat: overlay.center.coordinates ? overlay.center.coordinates[1] : overlay.center.latitude,
                lng: overlay.center.coordinates ? overlay.center.coordinates[0] : overlay.center.longitude
            };
            var circle = new google.maps.Circle(angular.extend(this.getOptionsByType('circle'), { center: centerCoords, radius: overlay.distance }));
            if (this.map.control['getGMap'])
                circle.setMap(this.map.control['getGMap']());
            return circle;
        }
        return new google.maps.Circle(this.getOptionsByType('circle'));
    };
    MapEditController.prototype.createPolygon = function (overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            var polygonCoords_1 = [];
            _.each(overlay.geometry.coordinates[0], function (coor) {
                polygonCoords_1.push({ lat: coor[1], lng: coor[0] });
            });
            var polygon = new google.maps.Polygon(angular.extend(this.getOptionsByType('polygon'), { paths: polygonCoords_1 }));
            if (this.map.control['getGMap'])
                polygon.setMap(this.map.control['getGMap']());
            return polygon;
        }
        return new google.maps.Polygon(this.getOptionsByType('polygon'));
        ;
    };
    MapEditController.prototype.createPolyline = function (overlay) {
        if (overlay.geometry && overlay.geometry.coordinates) {
            var polylineCoords_1 = [];
            _.each(overlay.geometry.coordinates, function (coor) {
                polylineCoords_1.push({ lat: coor[1], lng: coor[0] });
            });
            var polyline = new google.maps.Polyline(angular.extend(this.getOptionsByType('line'), { path: polylineCoords_1 }));
            if (this.map.control['getGMap'])
                polyline.setMap(this.map.control['getGMap']());
            return polyline;
        }
        return new google.maps.Polyline(this.getOptionsByType('line'));
    };
    MapEditController.prototype.createRectangle = function (overlay) {
        if (overlay.bounds) {
            var rectangleBounds = overlay.bounds;
            var rectangle = new google.maps.Rectangle(angular.extend(this.getOptionsByType('rectangle'), { bounds: rectangleBounds }));
            if (this.map.control['getGMap'])
                rectangle.setMap(this.map.control['getGMap']());
            return rectangle;
        }
        return new google.maps.Rectangle(this.getOptionsByType('rectangle'));
    };
    ;
    MapEditController.prototype.getOptionsByType = function (type) {
        switch (type) {
            case 'polygon':
                return _.cloneDeep(angular.extend(this._polygonOptions, this.getDisableOptions()));
            case 'circle':
                return _.cloneDeep(angular.extend(this._circleOptions, this.getDisableOptions()));
            case 'line':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'polyline':
                return _.cloneDeep(angular.extend(this._polylineOptions, this.getDisableOptions()));
            case 'marker':
                return _.cloneDeep(angular.extend(this._markerOptions, this.getDisableOptions()));
            case 'rectangle':
                return _.cloneDeep(angular.extend(this._rectangleOptions, this.getDisableOptions()));
        }
    };
    MapEditController.prototype.getDisableOptions = function () {
        return {
            editable: !this.disabled,
            draggable: !this.disabled
        };
    };
    MapEditController.prototype.setOverlay = function (overlay, type, fitBounds) {
        var _this = this;
        if (fitBounds === void 0) { fitBounds = true; }
        if (!overlay)
            return;
        this.clearMap();
        this.currentOverlay = overlay || {};
        this.currentOverlay.type = type;
        switch (type) {
            case 'circle': {
                this.currentOverlay.center_changed = function () {
                    _this.onEditOverlay();
                };
                this.currentOverlay.radius_changed = function () {
                    _this.onEditOverlay();
                };
                break;
            }
            case 'marker': {
                if (!this.currentOverlay.addListener)
                    return;
                this.currentOverlay.addListener('position_changed', function () {
                    _this.onEditOverlay();
                });
                break;
            }
            case 'rectangle': {
                if (!this.currentOverlay.addListener)
                    return;
                this.currentOverlay.addListener('bounds_changed', function () {
                    _this.onEditOverlay();
                });
                break;
            }
            default: {
                if (!this.currentOverlay.getPath)
                    return;
                google.maps.event.addListener(this.currentOverlay.getPath(), 'set_at', function () {
                    _this.onEditOverlay();
                });
                google.maps.event.addListener(this.currentOverlay.getPath(), 'insert_at', function () {
                    _this.onEditOverlay();
                });
            }
        }
        if (fitBounds)
            this.fitBounds();
    };
    MapEditController.prototype.onEditOverlay = function () {
        if (this.onEdit)
            this.onEdit({
                overlay: this.currentOverlay,
                bounds: this.currentOverlay && this.currentOverlay.type === 'rectangle' ? {
                    north: this.currentOverlay.getBounds().getNorthEast().lat(),
                    east: this.currentOverlay.getBounds().getNorthEast().lng(),
                    south: this.currentOverlay.getBounds().getSouthWest().lat(),
                    west: this.currentOverlay.getBounds().getSouthWest().lng(),
                } : {},
                type: this.currentOverlay ? this.currentOverlay.type : null,
                path: this.currentOverlay && (this.currentOverlay.type === 'polygon' || this.currentOverlay.type === 'polyline') ? this.currentOverlay.getPath() : [],
                center: this.currentOverlay && this.currentOverlay.type === 'circle' ?
                    this.currentOverlay.getCenter() : this.currentOverlay && this.currentOverlay.getPosition && this.currentOverlay.type === 'marker' ? this.currentOverlay.getPosition() : {},
                radius: this.currentOverlay && this.currentOverlay.type === 'circle' ? this.currentOverlay.getRadius() : {}
            });
    };
    MapEditController.prototype.showAction = function (action) {
        return !this.actionTypes ? true : this.actionTypes.includes(action);
    };
    Object.defineProperty(MapEditController.prototype, "showPanel", {
        get: function () {
            return this.showActionPanel === false ? false : true;
        },
        enumerable: true,
        configurable: true
    });
    MapEditController.prototype.addCircle = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.CIRCLE;
    };
    MapEditController.prototype.addPolygon = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYGON;
    };
    MapEditController.prototype.addRectangle = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.RECTANGLE;
    };
    MapEditController.prototype.addLine = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.POLYLINE;
    };
    MapEditController.prototype.addMarker = function () {
        this.drawingManagerOptions.drawingMode = google.maps.drawing.OverlayType.MARKER;
    };
    MapEditController.prototype.clearMap = function () {
        this.drawingManagerOptions.drawingMode = null;
        if (this.currentOverlay && this.currentOverlay.map) {
            this.currentOverlay.setMap(null);
            this.currentOverlay = null;
            this.onEditOverlay();
        }
    };
    return MapEditController;
}());
var config = function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        libraries: 'drawing'
    });
};
config.$inject = ['uiGmapGoogleMapApiProvider'];
(function () {
    angular.module('pipMapsEdit')
        .component('pipMapEdit', {
        bindings: MapEditBindings,
        templateUrl: 'edit/MapEdit.html',
        controller: MapEditController,
        controllerAs: '$ctrl'
    })
        .config(config);
})();
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMapsEdit', []);
require("./MapEdit");
},{"./MapEdit":6}],8:[function(require,module,exports){
(function () {
    'use strict';
    function MapElementsCtrlFct() {
        function MapElementsCtrl($injector, $scope) {
            var mapEventHandlerMixinFct = $injector.get('mapEventHandlerMixinFct');
            mapEventHandlerMixinFct.mixTo(this, $scope.$applyAsync.bind($scope));
            this.control = {};
            this.popUpOpened = null;
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.uiGmapIsReady = $injector.get('uiGmapIsReady');
            this.$q = $injector.get('$q');
        }
        MapElementsCtrl.prototype.$onInit = function () {
            var _this = this;
            this.options = angular.merge({}, this.defaultOptions, this.componentOptions);
            this.models = this.models || [];
            this.externalDblclick = this.options.events && this.options.events.dblclick ? this.options.events.dblclick : angular.noop;
            this.externalClick = this.options.events && this.options.events.click ? this.options.events.click : angular.noop;
            this.externalRightclick = this.options.events && this.options.events.rightclick ? this.options.events.rightclick : angular.noop;
            this.events = _.extend(this.options.events, {
                dblclick: this.onEventHandler.bind(this),
                mousedown: this.onEventHandler.bind(this),
                mouseup: this.onEventHandler.bind(this),
                rightclick: this.onEventHandler.bind(this),
                click: this.onEventHandler.bind(this),
                position_changed: function (objEvent) {
                    _this.updatePopupPosition(objEvent);
                }
            });
        };
        MapElementsCtrl.prototype.$onDestroy = function () {
            this.closePopup();
        };
        MapElementsCtrl.prototype.defaultOptions = {
            popup: false,
            fitBounds: false
        };
        MapElementsCtrl.prototype.init = function (mapCtrl) {
            this.mapCtrl = mapCtrl;
            this.initPopup();
        };
        MapElementsCtrl.prototype.setNewOptions = function (popupOptions) {
            if (this.popup)
                this.popup.setNewOptions(popupOptions);
        };
        MapElementsCtrl.prototype.initPopup = function () {
            if (!this.options.popup) {
                return;
            }
            this.options.popup = angular.merge({}, this.options.popup, {
                onShow: this.onShowPopup.bind(this),
                onClose: this.onClosePopup.bind(this)
            });
            this.pipMapHelperSrv.whenReady.then(function () {
                this.popup = this.mapCtrl.createElementPopup(this.options.popup);
            }.bind(this));
        };
        MapElementsCtrl.prototype.onShowPopup = function () {
            this.popUpOpened = true;
        };
        MapElementsCtrl.prototype.onClosePopup = function () {
            this.popUpOpened = false;
        };
        MapElementsCtrl.prototype.getBoundsToFitAsync = function () {
            if (!this.options.fitBounds) {
                return this.$q.reject('Fit is switched off');
            }
            return this.uiGmapIsReady.promise()
                .then(function () {
                return this.getBounds();
            }.bind(this));
        };
        MapElementsCtrl.prototype.getBounds = function () {
            return this.pipMapHelperSrv.getBoundsFromCoordinates(this.getAllPositions());
        };
        MapElementsCtrl.prototype.getAllPositions = function () {
            if (!angular.isArray(this.models)) {
                return [];
            }
            return this.models.map(function (model) {
                return this.getPosition(model);
            }, this);
        };
        MapElementsCtrl.prototype.getPosition = function (model) {
            return {
                latitude: model.latitude,
                longitude: model.longitude
            };
        };
        MapElementsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position.latitude || !position.longitude;
        };
        MapElementsCtrl.prototype.onDblclick = function (eventObj) {
            this.externalDblclick(eventObj);
        };
        MapElementsCtrl.prototype.onClick = function (eventObj) {
            this.externalClick(eventObj);
            if (this.longClick) {
                this.correctCircleModel(eventObj);
                this.togglePopup(eventObj);
                this.longClick = false;
            }
            else {
                this.closePopup();
            }
        };
        MapElementsCtrl.prototype.correctCircleModel = function (eventObj) {
            var _this = this;
            if (eventObj.gModel.radius && eventObj.gModel.center) {
                var model_1 = {};
                _.each(this.models, function (m) {
                    if (m[_this.options.center] && m[_this.options.radius]) {
                        if (m[_this.options.center].latitude.toFixed(5) == eventObj.gModel.center.lat().toFixed(5) &&
                            m[_this.options.center].longitude.toFixed(5) == eventObj.gModel.center.lng().toFixed(5) &&
                            m[_this.options.radius].toFixed(5) === eventObj.gModel.radius.toFixed(5)) {
                            model_1 = m;
                        }
                    }
                });
                eventObj.model = model_1;
            }
        };
        MapElementsCtrl.prototype.onRightclick = function (eventObj) {
            this.externalRightclick(eventObj);
            this.correctCircleModel(eventObj);
            this.togglePopup(eventObj);
        };
        MapElementsCtrl.prototype.onMousedown = function (eventObj) {
            this.start = new Date().getTime();
        };
        MapElementsCtrl.prototype.onMouseup = function (eventObj) {
            this.end = new Date().getTime();
            this.longClick = (this.end - this.start > 300);
        };
        MapElementsCtrl.prototype.togglePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }
            this.popup.toggle(eventObj);
        };
        MapElementsCtrl.prototype.closePopup = function (eventObj) {
            if (!this.popup) {
                return;
            }
            this.popup.close();
        };
        MapElementsCtrl.prototype.getModels = function () {
            return this.models;
        };
        MapElementsCtrl.prototype.checkContainsModel = function (model) {
            return this.models.indexOf(model) > -1;
        };
        MapElementsCtrl.prototype.getPlural = function (id) {
            return this.getPlurals().get(id);
        };
        MapElementsCtrl.prototype.getPlurals = function () {
            return this.control.getPlurals();
        };
        MapElementsCtrl.prototype.updatePopupPosition = function (objEvent) {
            if (this.popUpOpened === objEvent.model.id) {
                this.popup.setPosition({
                    latitude: objEvent.position.lat(),
                    longitude: objEvent.position.lng()
                });
            }
        };
        MapElementsCtrl.prototype.freezeMap = function () {
            return this.mapCtrl.freeze();
        };
        MapElementsCtrl.prototype.unfreezeMap = function () {
            return this.mapCtrl.unfreeze();
        };
        MapElementsCtrl.prototype.setCursor = function (cursor) {
            return this.mapCtrl.setCursor(cursor);
        };
        return MapElementsCtrl;
    }
    angular.module('pipMapsElements')
        .factory('MapElementsCtrlFct', MapElementsCtrlFct);
})();
},{}],9:[function(require,module,exports){
(function () {
    'use strict';
    pipMapElementsFct.$inject = ['$timeout'];
    function pipMapElementsFct($timeout) {
        return {
            strict: 'AE',
            scope: {},
            require: ['^pipMap', 'pipMapElements'],
            link: function ($scope, $element, $attrs, $controllers) {
                var mapCtrl = $controllers[0];
                var elementController = $controllers[1];
                elementController.init(mapCtrl);
                $scope.$watch('ctrl.models', function (models) {
                    if (models) {
                        elementController.getBoundsToFitAsync().then(function (bounds) {
                            $timeout(mapCtrl.fitMapToBounds.bind(mapCtrl, bounds), 200);
                        });
                    }
                });
                $scope.$watch('ctrl.componentOptions.popup', function (popupOptions) {
                    elementController.setNewOptions(popupOptions);
                }, true);
            },
            bindToController: {
                componentOptions: '=pipOptions',
                models: '=pipModels'
            },
            controller: 'MapElementsCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'elements/map-elements.html'
        };
    }
    angular.module('pipMapsElements')
        .factory('pipMapElementsFct', pipMapElementsFct);
})();
},{}],10:[function(require,module,exports){
(function () {
    'use strict';
    function mapElementsRequireFct() {
        return {
            elements: ['?^pipMapMarkers', '?^pipMapPolylines', '?^pipMapPolygons', '?^pipMapKml'],
            getType: function ($controllers, startIndex) {
                try {
                    return $controllers.slice(startIndex)
                        .map(function (ctrl, index) {
                        return ctrl && this.elements[index];
                    }, this)
                        .filter(function (ctrlName) {
                        return ctrlName;
                    })[0]
                        .replace('?^pipMap', '')
                        .toLowerCase();
                }
                catch (e) {
                    throw new Error('pip-map-editable-element can be used only with map elements directives');
                }
            },
            getController: function ($controllers, startIndex) {
                return $controllers.slice(startIndex)
                    .filter(function (ctrl) {
                    return ctrl;
                })[0];
            }
        };
    }
    angular.module('pipMapsElements')
        .factory('mapElementsRequireFct', mapElementsRequireFct);
})();
},{}],11:[function(require,module,exports){
(function () {
    'use strict';
    MapCirclesCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapCirclesCtrlBuilder.$inject = ['$controller', '$scope', 'MapCirclesCtrlFct'];
    pipMapCircles.$inject = ['pipMapElementsFct'];
    function MapCirclesCtrlFct(MapElementsCtrlFct) {
        function MapCirclesCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapCirclesCtrl.prototype = Object.create(_super);
        MapCirclesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            stroke: 'stroke',
            fill: 'fill',
            radius: 'radius',
            center: 'center',
            fitBounds: false
        });
        MapCirclesCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };
        MapCirclesCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;
            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };
        MapCirclesCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);
            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };
        MapCirclesCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths);
        };
        MapCirclesCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.center] = position;
        };
        MapCirclesCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.center];
        };
        MapCirclesCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position;
        };
        return MapCirclesCtrl;
    }
    function MapCirclesCtrlBuilder($controller, $scope, MapCirclesCtrlFct) {
        var instance = $controller(MapCirclesCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapCircles(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapCircles'],
            controller: 'MapCirclesCtrl',
            templateUrl: 'elements/circles/map-circles.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapCirclesCtrlFct', MapCirclesCtrlFct)
        .controller('MapCirclesCtrl', MapCirclesCtrlBuilder)
        .directive('pipMapCircles', pipMapCircles);
})();
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular.module('pipMapsElements', []);
require("./MapElementControllerService");
require("./MapElementDirectiveService");
require("./MapElementRequireService");
require("./kml/MapKml");
require("./markers/MapMarkers");
require("./polygons/MapPolygons");
require("./polylines/MapPolylines");
require("./circles/MapCircles");
},{"./MapElementControllerService":8,"./MapElementDirectiveService":9,"./MapElementRequireService":10,"./circles/MapCircles":11,"./kml/MapKml":13,"./markers/MapMarkers":14,"./polygons/MapPolygons":15,"./polylines/MapPolylines":16}],13:[function(require,module,exports){
(function () {
    'use strict';
    pipMapKml.$inject = ['pipMapElementsFct'];
    MapKmlCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapKmlCtrlBuilder.$inject = ['$controller', '$scope', 'MapKmlCtrlFct'];
    function MapKmlCtrlFct(MapElementsCtrlFct) {
        function MapKmlCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
            this.existingModels = [];
        }
        var _super = MapElementsCtrlFct.prototype;
        MapKmlCtrl.prototype = Object.create(_super);
        MapKmlCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            layer: {
                preserveViewport: true,
                suppressInfoWindows: true
            }
        });
        MapKmlCtrl.prototype.getPopupParameters = function () {
            if (!this.popup.model) {
                return {};
            }
            return {
                model: this.popup.model,
                position: this.popup.position,
                meta: this.popup.model.instance.getMetadata()
            };
        };
        MapKmlCtrl.prototype.update = function () {
            this.pipMapHelperSrv.whenReady.then(function () {
                this.removeOldModels();
                this.addNewModels();
            }.bind(this));
        };
        MapKmlCtrl.prototype.removeOldModels = function () {
            this.getOldModels()
                .forEach(function (model) {
                model.instance.setMap(null);
                this.deRegisterModel(model);
            }, this);
        };
        MapKmlCtrl.prototype.getOldModels = function () {
            var newUrls = this.models.map(function (model) {
                return model.url;
            });
            return this.existingModels
                .filter(function (model) {
                return newUrls.indexOf(model.url) === -1;
            });
        };
        MapKmlCtrl.prototype.addNewModels = function () {
            this.getNewModels()
                .forEach(function (model) {
                var copy = angular.copy(model);
                this.addModel(copy);
                this.registerModel(copy);
                this.addEvents(copy);
            }, this);
        };
        MapKmlCtrl.prototype.getNewModels = function () {
            var existingUrls = this.existingModels.map(function (model) {
                return model.url;
            });
            return this.models
                .filter(function (model) {
                return existingUrls.indexOf(model.url) === -1;
            });
        };
        MapKmlCtrl.prototype.addModel = function (model) {
            var mapInstance = this.mapCtrl.getMapInstance();
            var options = angular.merge({
                map: mapInstance,
                url: model.url
            }, this.options.layer);
            model.instance = this.pipMapHelperSrv.createKML(options);
        };
        MapKmlCtrl.prototype.addEvents = function (model) {
            var clickHandler = this.onEvent.bind(this, model, 'click');
            model.instance.addListener('click', clickHandler);
        };
        MapKmlCtrl.prototype.onEvent = function (model, name) {
            var args = this.copyArguments(arguments, 2);
            this.onEventHandler(model.instance, name, model, args);
        };
        MapKmlCtrl.prototype.copyArguments = function (args, startIndex) {
            var result = [];
            for (var i = 0; i < args.length - startIndex; ++i) {
                result[i] = args[i + startIndex];
            }
            return result;
        };
        MapKmlCtrl.prototype.getPopupMetaData = function () {
            return this.popup.model && this.popup.model.instance.getMetadata();
        };
        MapKmlCtrl.prototype.registerModel = function (model) {
            this.existingModels.push(model);
        };
        MapKmlCtrl.prototype.deRegisterModel = function (model) {
            var index = this.existingModels.indexOf(model);
            this.existingModels.splice(index, 1);
        };
        return MapKmlCtrl;
    }
    function MapKmlCtrlBuilder($controller, $scope, MapKmlCtrlFct) {
        var instance = $controller(MapKmlCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapKml(pipMapElementsFct) {
        var definition = angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapKml'],
            controller: 'MapKmlCtrl',
            templateUrl: 'elements/kml/map-kml.html'
        });
        var link = definition.link;
        definition.link = function ($scope, $element, $attrs, $controllers) {
            link.apply(this, arguments);
            var mapCtrl = $controllers[0];
            var elementController = $controllers[1];
            elementController.mapCtrl = mapCtrl;
            $scope.$watchCollection('ctrl.models', function (models) {
                if (models) {
                    elementController.update();
                }
            });
        };
        return definition;
    }
    angular.module('pipMapsElements')
        .directive('pipMapKml', pipMapKml)
        .factory('MapKmlCtrlFct', MapKmlCtrlFct)
        .controller('MapKmlCtrl', MapKmlCtrlBuilder);
})();
},{}],14:[function(require,module,exports){
(function () {
    'use strict';
    MapMarkersCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapMarkersCtrlBuilder.$inject = ['$controller', '$scope', 'MapMarkersCtrlFct'];
    pipMapMarkers.$inject = ['pipMapElementsFct'];
    function MapMarkersCtrlFct(MapElementsCtrlFct) {
        function MapMarkersCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
            this.pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapMarkersCtrl.prototype = Object.create(_super);
        MapMarkersCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            model: {
                coords: 'self',
                icon: 'icon'
            },
            connect: false
        });
        MapMarkersCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
            this.initConnect();
        };
        MapMarkersCtrl.prototype.initConnect = function () {
            if (!this.options.connect) {
                return;
            }
            var options = this.options.connect;
            this.connect = angular.merge({
                show: true
            }, options);
        };
        MapMarkersCtrl.prototype.setPositionGetterSetter = function () {
            var coordsProp = this.options.model.coords;
            if (coordsProp === 'self') {
                return;
            }
            this.getPosition = this.$parse(coordsProp);
            this.setPosition = this.getPosition.assign;
        };
        MapMarkersCtrl.prototype.setPosition = function (model, position) {
            angular.extend(model, position);
        };
        MapMarkersCtrl.prototype.onShowPopup = function (model) {
            this.popUpOpened = model.id;
            if (!this.options.popup.options.setPosition) {
                return;
            }
        };
        MapMarkersCtrl.prototype.onClosePopup = function () {
            this.popUpOpened = null;
        };
        MapMarkersCtrl.prototype.setIconActive = function (model) {
            if (!model || !model.icon) {
                return;
            }
            this.popupModel = model;
            this.pipMapHelperSrv.setIcon(this.popupModel.icon, true);
        };
        MapMarkersCtrl.prototype.resetIconActive = function () {
            if (!this.popupModel || !this.popupModel.icon) {
                return;
            }
            this.pipMapHelperSrv.setIcon(this.popupModel.icon, false);
            this.popupModel = null;
        };
        return MapMarkersCtrl;
    }
    function MapMarkersCtrlBuilder($controller, $scope, MapMarkersCtrlFct) {
        var instance = $controller(MapMarkersCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapMarkers(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapMarkers'],
            controller: 'MapMarkersCtrl',
            templateUrl: 'elements/markers/map-markers.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapMarkersCtrlFct', MapMarkersCtrlFct)
        .controller('MapMarkersCtrl', MapMarkersCtrlBuilder)
        .directive('pipMapMarkers', pipMapMarkers);
})();
},{}],15:[function(require,module,exports){
(function () {
    'use strict';
    MapPolygonsCtrlFct.$inject = ['MapElementsCtrlFct'];
    MapPolygonsCtrlBuilder.$inject = ['$controller', '$scope', 'MapPolygonsCtrlFct'];
    pipMapPolygons.$inject = ['pipMapElementsFct'];
    function MapPolygonsCtrlFct(MapElementsCtrlFct) {
        function MapPolygonsCtrl($injector, $scope) {
            MapElementsCtrlFct.call(this, $injector, $scope);
            this.$parse = $injector.get('$parse');
        }
        var _super = MapElementsCtrlFct.prototype;
        MapPolygonsCtrl.prototype = Object.create(_super);
        MapPolygonsCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {
            path: 'path',
            stroke: {
                color: '#ff6262',
                weight: 5
            },
            fitBounds: false
        });
        MapPolygonsCtrl.prototype.$onInit = function () {
            _super.$onInit.call(this);
            this.setPositionGetterSetter();
        };
        MapPolygonsCtrl.prototype.setPositionGetterSetter = function () {
            var pathProp = this.options.path;
            this.getPosition = this.$parse(pathProp);
            this.setPosition = this.getPosition.assign;
        };
        MapPolygonsCtrl.prototype.setDefaultPositionsIfNeeded = function (model) {
            var positions = this.getPosition(model);
            if (!angular.isArray(positions)) {
                this.setPosition(model, []);
            }
        };
        MapPolygonsCtrl.prototype.getAllPositions = function () {
            var paths = _super.getAllPositions.call(this);
            return Array.prototype.concat.apply([], paths);
        };
        MapPolygonsCtrl.prototype.setPosition = function (model, position) {
            model[this.defaultOptions.path] = position;
        };
        MapPolygonsCtrl.prototype.getPosition = function (model) {
            return model[this.defaultOptions.path];
        };
        MapPolygonsCtrl.prototype.isModelEmpty = function (model) {
            var position = this.getPosition(model);
            return !position || !position.length || !position[0].latitude || !position[0].longitude;
        };
        return MapPolygonsCtrl;
    }
    function MapPolygonsCtrlBuilder($controller, $scope, MapPolygonsCtrlFct) {
        var instance = $controller(MapPolygonsCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapPolygons(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapPolygons'],
            controller: 'MapPolygonsCtrl',
            templateUrl: 'elements/polygons/map-polygons.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapPolygonsCtrlFct', MapPolygonsCtrlFct)
        .controller('MapPolygonsCtrl', MapPolygonsCtrlBuilder)
        .directive('pipMapPolygons', pipMapPolygons);
})();
},{}],16:[function(require,module,exports){
(function () {
    'use strict';
    MapPolylinesCtrlFct.$inject = ['MapPolygonsCtrlFct'];
    MapPolylinesCtrlBuilder.$inject = ['$controller', '$scope', 'MapPolylinesCtrlFct'];
    pipMapPolylines.$inject = ['pipMapElementsFct'];
    function MapPolylinesCtrlFct(MapPolygonsCtrlFct) {
        function MapPolylinesCtrl($injector, $scope) {
            MapPolygonsCtrlFct.call(this, $injector, $scope);
        }
        var _super = MapPolygonsCtrlFct.prototype;
        MapPolylinesCtrl.prototype = Object.create(_super);
        MapPolylinesCtrl.prototype.defaultOptions = angular.merge({}, _super.defaultOptions, {});
        return MapPolylinesCtrl;
    }
    function MapPolylinesCtrlBuilder($controller, $scope, MapPolylinesCtrlFct) {
        var instance = $controller(MapPolylinesCtrlFct, {
            $scope: $scope
        });
        angular.extend(instance, this);
        instance.$onInit();
        return instance;
    }
    function pipMapPolylines(pipMapElementsFct) {
        return angular.extend({}, pipMapElementsFct, {
            require: ['^pipMap', 'pipMapPolylines'],
            controller: 'MapPolylinesCtrl',
            templateUrl: 'elements/polylines/map-polylines.html'
        });
    }
    angular.module('pipMapsElements')
        .factory('MapPolylinesCtrlFct', MapPolylinesCtrlFct)
        .controller('MapPolylinesCtrl', MapPolylinesCtrlBuilder)
        .directive('pipMapPolylines', pipMapPolylines);
})();
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./popup");
require("./elements");
require("./edit");
{
    angular.module('pipMaps', [
        'uiGmapgoogle-maps',
        'pipMaps.Templates',
        'pipMapsPopup',
        'pipMapsElements',
        'pipMapsEdit'
    ]);
}
require("./config");
require("./GoogleMapsRemoveAfterService");
require("./HelpService");
require("./Map");
require("./MapEventHandlerService");
},{"./GoogleMapsRemoveAfterService":1,"./HelpService":2,"./Map":3,"./MapEventHandlerService":4,"./config":5,"./edit":7,"./elements":12,"./popup":22}],18:[function(require,module,exports){
(function () {
    'use strict';
    MapElementPopupFct.$inject = ['$injector'];
    function MapElementPopupFct($injector) {
        var pipMapHelperSrv = $injector.get('pipMapHelperSrv');
        var $rootScope = $injector.get('$rootScope');
        function MapElementPopupFct(options) {
            var er = new Error();
            var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);
            this.options = angular.merge({
                boxClass: 'pip-map-info-window ' + options.className,
                closeBoxURL: '',
                pixelOffset: offset
            }, options.options);
            this.templateUrl = options.templateUrl;
            this.onShow = options.onShow;
            this.onClose = options.onClose;
            this.initBreakpoints(options.offset.breakpoints);
        }
        MapElementPopupFct.prototype.initBreakpoints = function (breakpoints) {
            breakpoints = breakpoints || [];
            this.breakpoints = breakpoints.map(function (breakpoint) {
                return {
                    name: breakpoint.name,
                    offset: pipMapHelperSrv.createSize(breakpoint.width, breakpoint.height)
                };
            }, this);
            this.defaultOffset = this.options.pixelOffset;
        };
        MapElementPopupFct.prototype.setNewOptions = function (options) {
            var offset = pipMapHelperSrv.createSize(options.offset.width, options.offset.height);
            this.options = angular.merge({
                boxClass: 'pip-map-info-window ' + options.className,
                closeBoxURL: '',
                pixelOffset: offset
            }, options.options);
            this.initBreakpoints(options.offset.breakpoints);
            this.fitOffset();
        };
        MapElementPopupFct.prototype.close = function () {
            this.onClose();
        };
        MapElementPopupFct.prototype.show = function (model) {
            this.onShow(model);
            this.fitOffset();
        };
        MapElementPopupFct.prototype.setPosition = function () {
            this.fitOffset();
        };
        MapElementPopupFct.prototype.fitOffset = function () {
            var hasBreakpoint = this.breakpoints.some(function (breakpoint) {
                var isTargetBreakpoint = $rootScope.utils.hasBreakpoint(breakpoint.name);
                if (isTargetBreakpoint) {
                    this.options.pixelOffset = breakpoint.offset;
                    return true;
                }
            }, this);
            if (!hasBreakpoint) {
                this.options.pixelOffset = this.defaultOffset;
            }
        };
        return {
            create: function (options) {
                return new MapElementPopupFct(options);
            }
        };
    }
    angular.module('pipMapsPopup')
        .factory('MapElementPopupFct', MapElementPopupFct);
})();
},{}],19:[function(require,module,exports){
(function () {
    'use strict';
    function mapPopup() {
        return {
            strict: 'A',
            scope: {
                popup: '=pipMapPopup'
            },
            templateUrl: 'popup/map-popup.html'
        };
    }
    angular.module('pipMapsPopup')
        .directive('pipMapPopup', mapPopup);
})();
},{}],20:[function(require,module,exports){
(function () {
    'use strict';
    function mapPopupContent() {
        return {
            strict: 'AE',
            transclude: true,
            templateUrl: 'popup/map-popup-content.html'
        };
    }
    angular.module('pipMapsPopup')
        .directive('pipMapPopupContent', mapPopupContent);
})();
},{}],21:[function(require,module,exports){
(function () {
    'use strict';
    MapPopupFct.$inject = ['$injector'];
    function MapPopupFct($injector) {
        var MapElementPopup = $injector.get('MapElementPopupFct');
        var $rootScope = $injector.get('$rootScope');
        var $timeout = $injector.get('$timeout');
        function MapPopupFct() {
            this.elements = [];
        }
        MapPopupFct.prototype.add = function (options) {
            var _this = this;
            var element = MapElementPopup.create(options);
            this.elements.push(element);
            return {
                toggle: this.toggle.bind(this, element),
                close: this.close.bind(this, element),
                setPosition: function (position) {
                    if (_this.element.options.updatePosition === false)
                        return;
                    _this.position = position;
                },
                setNewOptions: function (options) {
                    element.setNewOptions(options);
                }
            };
        };
        MapPopupFct.prototype.toggle = function (element, eventObj) {
            if (this.isNewModel(eventObj)) {
                this.close();
                this.element = element;
                $timeout(function () {
                    this.show(element);
                }.bind(this), 10);
                this.setPosition(eventObj);
                return;
            }
            this.close();
        };
        MapPopupFct.prototype.isNewModel = function (eventObj) {
            return this.model !== eventObj.model;
        };
        MapPopupFct.prototype.show = function (element) {
            if (!this.model || !this.position) {
                return;
            }
            this.isEnabled = true;
            this.setBreakpointHandler(element);
        };
        MapPopupFct.prototype.setPosition = function (eventObj) {
            this.position = this.getPosition(eventObj);
            this.model = eventObj.model;
            this.element.show(this.model);
        };
        MapPopupFct.prototype.setBreakpointHandler = function (element) {
            this.removeBreakpointHandler = $rootScope.$on('pipMainLayoutResized', element.setPosition.bind(element));
        };
        MapPopupFct.prototype.resetBreakpointHandler = function () {
            if (this.removeBreakpointHandler)
                this.removeBreakpointHandler();
        };
        MapPopupFct.prototype.close = function () {
            if (!this.element) {
                return;
            }
            this.element.close();
            this.resetBreakpointHandler();
            this.model = null;
            this.isEnabled = false;
            this.position = null;
            this.element = null;
        };
        MapPopupFct.prototype.getPosition = function (eventObj) {
            return eventObj.position;
        };
        return {
            create: function () {
                return new MapPopupFct();
            }
        };
    }
    angular.module('pipMapsPopup')
        .factory('MapPopupFct', MapPopupFct);
})();
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
{
    angular.module('pipMapsPopup', []);
}
require("./MapElementPopupService");
require("./MapPopup");
require("./MapPopupContent");
require("./MapPopupService");
},{"./MapElementPopupService":18,"./MapPopup":19,"./MapPopupContent":20,"./MapPopupService":21}],23:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('map.html',
    '<div class="pip-map-side-panel flex-fixed flex-order-1" ng-if="ctrl.sidePanel.show"><ng-include src="ctrl.sidePanel.template"></ng-include></div><ui-gmap-google-map class="flex pip-map-provider-wrapper" control="ctrl.componentOptions.control" center="ctrl.map.center" zoom="ctrl.map.zoom" options="ctrl.map.options" bounds="ctrl.map.bounds" events="ctrl.map.events"><div pip-map-popup="ctrl.popup" ng-if="ctrl.popup"></div><ng-transclude></ng-transclude></ui-gmap-google-map>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit/MapEdit.html',
    '<pip-map pip-options="$ctrl.map"><ui-gmap-drawing-manager options="$ctrl.drawingManagerOptions" control="$ctrl.drawingManagerControl"></ui-gmap-drawing-manager><pip-map-polygons pip-models="$ctrl.disabledPolygons" pip-options="$ctrl.disabledPolygonsOptions"></pip-map-polygons><pip-map-polylines pip-models="$ctrl.disabledPolylines" pip-options="$ctrl.disabledPolylinesOptions"></pip-map-polylines><pip-map-circles pip-models="$ctrl.disabledCircles" pip-options="$ctrl.disabledCirclesOptions"></pip-map-circles></pip-map><div class="action-panel w-stretch layout-row layout-align-center-center" ng-if="$ctrl.showPanel"><div class="action-buttons color-primary-bg flex-fixed"><md-button ng-click="$ctrl.clearMap()" ng-if="$ctrl.showAction(\'clear\')">{{ \'CLEAR_MAP\' | translate }}</md-button><md-button ng-click="$ctrl.addCircle()" ng-if="$ctrl.showAction(\'circle\')">{{ \'ADD_CIRCLE\' | translate }}</md-button><md-button ng-click="$ctrl.addPolygon()" ng-if="$ctrl.showAction(\'polygon\')">{{ \'ADD_POLYGON\' | translate }}</md-button><md-button ng-click="$ctrl.addLine()" ng-if="$ctrl.showAction(\'line\')">{{ \'ADD_LINE\' | translate }}</md-button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit-tool.html',
    '<div layout="column" class="pip-map-edit-tool theme-text-primary" ng-init="currentElement = editCtrl.currentElement; tool = currentElement.tool; model = tool.currentModel"><header hide-xs="" class="pip-map-edit-header" layout="column" layout-align="space-between"><h2 class="md-title">{{:: currentElement.getEditTitle() }}</h2><div class="pip-map-edit-actions" layout="row"><span class="pip-map-edit-actions-block-main"><md-button ng-click="tool.undo()" ng-disabled="tool.isUndoDisabled()"><md-icon md-svg-icon="map:undo" aria-label="Undo"></md-icon></md-button></span><md-divider></md-divider><span class="pip-map-edit-actions-block-tool"><md-button ng-repeat="action in tool.actions" ng-disabled="tool.isActionDisabled(action)" ng-click="tool.setAction(action)"><md-icon md-svg-icon="{{:: action.definition.icon }}" aria-label="{{:: action.definition.name }}" ng-class="{ active: tool.isActionActive(action) }"></md-icon></md-button></span></div></header><header hide-gt-xs="" class="pip-map-edit-header" layout="column" layout-align="space-between"><form name="editCtrl.modelForm" ng-include="editCtrl.currentElement.tool.template"></form></header><md-divider></md-divider><section flex="auto" class="pip-map-edit-content"><form hide-xs="" name="editCtrl.modelForm" ng-include="editCtrl.currentElement.tool.template"></form></section><md-divider></md-divider><footer hide-xs="" class="pip-map-edit-footer" layout="row" layout-align="end center"><div flex=""><md-button ng-click="editCtrl.remove()">{{:: \'DELETE\' | translate }} {{:: currentElement.name }}</md-button></div><md-button ng-click="editCtrl.cancel()">{{:: \'CANCEL\' | translate }}</md-button><md-button ng-click="editCtrl.save()" ng-disabled="editCtrl.modelForm.$invalid">{{:: tool.titleSave | translate }}</md-button></footer><footer hide-gt-xs="" class="pip-map-edit-footer" layout="row" layout-align="start center"><div layout="row" layout-align="space-around"><md-button ng-click="tool.undo()" ng-disabled="tool.isUndoDisabled()"><md-icon md-svg-icon="map:undo" aria-label="Remove"></md-icon></md-button></div><md-divider></md-divider><md-menu flex="" layout="column"><md-button class="pip-map-edit-actions-trigger" ng-click="$mdOpenMenu($event)"><md-icon class="active" md-svg-icon="{{ tool.currentAction.definition.icon }}" aria-label="Trigger menu" md-menu-origin=""></md-icon><md-icon md-svg-icon="map:tools" aria-label="Triangle down"></md-icon></md-button><md-menu-content width="4"><md-menu-item ng-repeat="action in tool.actions"><md-button ng-click="tool.setAction(action)" ng-disabled="tool.isActionDisabled(action)"><md-icon md-svg-icon="{{:: action.definition.icon }}" aria-label="{{:: action.definition.name }}" ng-class="{ active: tool.isActionActive(action) }" md-menu-align-target=""></md-icon>{{:: action.definition.name }}</md-button></md-menu-item></md-menu-content></md-menu><md-divider></md-divider><div layout="row" layout-align="space-around"><md-button ng-click="editCtrl.cancel()"><md-icon md-svg-icon="map:cross" aria-label="Close"></md-icon></md-button><md-button ng-click="editCtrl.save()" ng-disabled="editCtrl.modelForm.$invalid"><md-icon md-svg-icon="map:check" aria-label="Sumbit"></md-icon></md-button></div></footer></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit-tools-list.html',
    '<md-fab-speed-dial class="pip-floating-button map-add-button md-scale" md-direction="up" md-open="fab.isOpen"><md-fab-trigger><md-button class="md-fab" ng-class="{\'md-accent md-raised\': !fab.isOpen, \'md-warn\': fab.isOpen}"><md-icon md-svg-icon="map:plus" aria-label="Open" class="md-headline centered-add-icon" ng-if="!fab.isOpen"></md-icon><md-icon md-svg-icon="map:cross" aria-label="Close" class="md-headline centered-add-icon" ng-if="fab.isOpen"></md-icon></md-button></md-fab-trigger><md-fab-actions class="pip-map-edit-tools-list"><div ng-repeat="element in ::editCtrl.elements"><span class="pip-map-edit-tooltip">{{:: element.name }}</span><md-button class="md-fab md-raised md-mini" ng-click="editCtrl.createElement(element)"><md-icon md-svg-icon="{{:: element.icon }}" aria-label="{{:: element.icon }}"></md-icon></md-button></div></md-fab-actions></md-fab-speed-dial>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('edit_old/map-edit.html',
    '<script type="text/ng-template" id="map-icons.svg"><svg xmlns="http://www.w3.org/2000/svg"> <defs> <g id="trash" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M128 107c0-24 19-43 43-43l170 0c24 0 43 19 43 43l0 256-256 0z m277 320l-74 0-22 21-106 0-22-21-74 0 0-43 298 0z"/></g> <g id="plus" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M405 235l-128 0 0-128-42 0 0 128-128 0 0 42 128 0 0 128 42 0 0-128 128 0z"/></g> <g id="cross" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M405 375l-30 30-119-119-119 119-30-30 119-119-119-119 30-30 119 119 119-119 30 30-119 119z"/></g> <g id="undo" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M213 320l0 85-149-149 149-149 0 87c107 0 182-34 235-109-21 107-85 214-235 235z"/></g> <g id="check" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M192 167l-89 89-30-30 119-119 256 256-30 30z"/></g> <g id="tools" transform="translate(512,0) scale(-1,1) rotate(180,256,256)"><path d="M149 299l107-107 107 107z"/></g> <g id="add-point" transform="translate(0,0) scale(25)"><path class="cls-1" d="M8.46,9l2.81-.17a0.31,0.31,0,0,0,.2-0.53L3.4,0.09A0.31,0.31,0,0,0,2.87.3V11.81a0.31,0.31,0,0,0,.51.23L5.51,10.2l1.9,4.64a0.31,0.31,0,0,0,.4.17l2.37-1a0.31,0.31,0,0,0,.17-0.4Z"/><polygon class="cls-1" points="14.96 15.62 14.96 12.72 13.49 12.72 13.49 15.62 10.59 15.62 10.59 17.1 13.49 17.1 13.49 20 14.96 20 14.96 17.1 17.87 17.1 17.87 15.62 14.96 15.62"/></g> <g id="remove-point" transform="translate(0,0) scale(25)"><path class="cls-1" d="M8.46,9l2.81-.17a0.31,0.31,0,0,0,.2-0.53L3.4,0.09a0.31,0.31,0,0,0-.53.22V11.82a0.31,0.31,0,0,0,.51.23l2.12-1.84,1.9,4.64a0.31,0.31,0,0,0,.4.17l2.37-1a0.31,0.31,0,0,0,.17-0.4Z"/><rect class="cls-1" x="10.58" y="15.63" width="7.28" height="1.48"/></g> <g id="pan" transform="translate(0,0) scale(25)"><path d="M15.28,6.56V9H11V4.74h2.41a0.31,0.31,0,0,0,.24-0.51L10.24,0.13a0.31,0.31,0,0,0-.47,0L6.31,4.23a0.31,0.31,0,0,0,.24.51H9V9H4.72V6.56a0.31,0.31,0,0,0-.51-0.24L0.11,9.78a0.31,0.31,0,0,0,0,.47l4.11,3.46a0.31,0.31,0,0,0,.51-0.24V11.07H9v4.23H6.54a0.31,0.31,0,0,0-.24.51l3.46,4.11a0.31,0.31,0,0,0,.47,0l3.46-4.11a0.31,0.31,0,0,0-.24-0.51H11V11.07h4.23v2.41a0.31,0.31,0,0,0,.51.24l4.11-3.46a0.31,0.31,0,0,0,0-.47L15.78,6.32A0.31,0.31,0,0,0,15.28,6.56Z"/></g> <g id="pen" transform="translate(0,0) scale(25)"><path d="M18.92,1.08a3.27,3.27,0,0,0-2.33-1,3.9,3.9,0,0,0-2.71,1.25,3.47,3.47,0,0,0-.44.54L5.66,10.66l-0.43-.43A0.36,0.36,0,0,0,5,10.12a0.39,0.39,0,0,0-.27.11L3.62,11.31a0.38,0.38,0,0,0,0,.53l0.45,0.45a8,8,0,0,1-2.46,1.09,0.54,0.54,0,0,0-.35.38v0S1,18.13,0,19.43a0.36,0.36,0,0,0,0,.36h0l0.13,0.14h0A0.57,0.57,0,0,0,.43,20a0.27,0.27,0,0,0,.13,0c1.42-.82,5.62-1.22,5.66-1.22h0a0.55,0.55,0,0,0,.38-0.35,9.52,9.52,0,0,1,1.1-2.45l0.44,0.44a0.36,0.36,0,0,0,.26.11,0.38,0.38,0,0,0,.27-0.11l1.07-1.07A0.39,0.39,0,0,0,9.87,15a0.36,0.36,0,0,0-.11-0.27l-0.43-.43,8.83-7.79a3.46,3.46,0,0,0,.54-0.44,4,4,0,0,0,1.24-2.47A3.22,3.22,0,0,0,18.92,1.08ZM4.66,17a1.15,1.15,0,1,1,0-1.63A1.15,1.15,0,0,1,4.66,17Z"/></g> <g id="select" transform="translate(0,0) scale(25)"><path d="M15.66,11.25L4.71,0.09a0.31,0.31,0,0,0-.53.22V15.94a0.31,0.31,0,0,0,.51.23l3-2.57,2.54,6.21a0.31,0.31,0,0,0,.4.17l3.31-1.35a0.31,0.31,0,0,0,.17-0.4L11.54,12l3.92-.24A0.31,0.31,0,0,0,15.66,11.25Z"/></g> <g id="hand" transform="translate(0,0) scale(25)"><path d="M16.9,3.52a0.92,0.92,0,0,0-.92.92v4a0.44,0.44,0,0,1-.88,0V1.76a1.1,1.1,0,0,0-2.21,0V8.44h0a0.42,0.42,0,0,1-.83,0V1.2a1.2,1.2,0,0,0-2.39,0s0,7.19,0,7.27a0.4,0.4,0,0,1-.8,0V2.24a1.2,1.2,0,1,0-2.39,0c0,8.67,0,7.67,0,8.39a2,2,0,0,1-.13,1c-0.11.08-.25,0-0.43-0.26C5.51,10.79,4.13,9,2.79,9.63a1.33,1.33,0,0,0-.33,1.93s3,4.34,4,5.84c0.59,0.88.75,1.16,1,1.45C8.15,20,8.58,20,9.84,20H15c2.79,0,2.79-3.31,2.79-4.73V4.94C17.82,3.93,17.41,3.52,16.9,3.52Z"/></g> <g id="draw" transform="translate(0,0) scale(25)"><path d="M1.94,4.37L0,2.49A2.08,2.08,0,0,1,.19,2.27L0.41,2l0.27-.26A2.84,2.84,0,0,0,1,1.48l0.39-.34A5.66,5.66,0,0,1,2,.68,6.24,6.24,0,0,1,2.92.27,3,3,0,0,1,4,.09a2.72,2.72,0,0,1,.81.15A2.6,2.6,0,0,1,5.7.79a2.85,2.85,0,0,1,.74,1,3.49,3.49,0,0,1,.3,1.54,4.64,4.64,0,0,1-.1,1,4.76,4.76,0,0,1-.28.88Q6.14,5.59,5.88,6t-0.59.88l-0.46.75q-0.28.46-.59,1L3.68,9.75a9.54,9.54,0,0,0-.43,1,4.27,4.27,0,0,0-.15.85,2,2,0,0,0,.05.67,1,1,0,0,0,.19.45,0.42,0.42,0,0,0,.32.17A0.72,0.72,0,0,0,4,12.79a1.59,1.59,0,0,0,.34-0.26,2.42,2.42,0,0,0,.3-0.3L4.9,12l0.4-.48L6,10.65l0.77-.93q0.39-.46.62-0.77T8.26,8A9.38,9.38,0,0,1,9.5,7a8.58,8.58,0,0,1,1.57-.84,4.66,4.66,0,0,1,1.78-.35,4,4,0,0,1,2,.46,4.25,4.25,0,0,1,1.33,1.16A4.89,4.89,0,0,1,17,9a8.61,8.61,0,0,1,.32,1.48H20V13.2H17.29a9.87,9.87,0,0,1-.74,3.25,7.19,7.19,0,0,1-1.33,2.06,4.55,4.55,0,0,1-1.6,1.08,4.31,4.31,0,0,1-1.5.31,3.5,3.5,0,0,1-1.37-.27,3.43,3.43,0,0,1-1.11-.74,3.47,3.47,0,0,1-.77-1.08,3.12,3.12,0,0,1-.28-1.32,4.63,4.63,0,0,1,.35-1.61A6.43,6.43,0,0,1,10,13.1a7.75,7.75,0,0,1,1.85-1.55,7.63,7.63,0,0,1,2.67-1q-0.05-.31-0.1-0.66a1.6,1.6,0,0,0-.23-0.63,1.25,1.25,0,0,0-.55-0.49,2.45,2.45,0,0,0-1-.18A2.09,2.09,0,0,0,11.5,9a8.11,8.11,0,0,0-1.17.9q-0.57.57-1.15,1.24T8.1,12.4L7.23,13.46a10.26,10.26,0,0,1-.83.88,6.4,6.4,0,0,1-.81.7,2.76,2.76,0,0,1-.86.41,3.09,3.09,0,0,1-.75.12,4.28,4.28,0,0,1-.75,0,4,4,0,0,1-.74-0.22,3,3,0,0,1-.66-0.37A3.32,3.32,0,0,1,.72,13.56a5.4,5.4,0,0,1-.28-0.92,4.69,4.69,0,0,1-.1-1A5.76,5.76,0,0,1,.8,9.5a21.73,21.73,0,0,1,1-2.15q0.57-1,1.07-1.74l0.61-.89,0.27-.46A3,3,0,0,0,4,3.75,0.91,0.91,0,0,0,4.05,3.3,0.38,0.38,0,0,0,3.82,3a0.42,0.42,0,0,0-.34.05A2.67,2.67,0,0,0,3,3.34L2.5,3.81Q2.22,4.06,1.94,4.37ZM12.15,17.23A1.36,1.36,0,0,0,12.81,17a2.31,2.31,0,0,0,.68-0.63,4.77,4.77,0,0,0,.62-1.17,7.65,7.65,0,0,0,.41-1.85A4.78,4.78,0,0,0,13,14a4.59,4.59,0,0,0-1,.85,3.77,3.77,0,0,0-.53.88,1.89,1.89,0,0,0-.17.67,0.74,0.74,0,0,0,.08.34,0.76,0.76,0,0,0,.21.26,0.66,0.66,0,0,0,.25.15A0.79,0.79,0,0,0,12.15,17.23Z"/></g> <g id="point" transform="translate(0,0) scale(25)"><path d="M10,0a6.88,6.88,0,0,1,4.94,2.06A6.88,6.88,0,0,1,17,7q0,3.93-7,13Q3,10.94,3,7A6.88,6.88,0,0,1,5.06,2.06,6.88,6.88,0,0,1,10,0Zm0,9.51a2.41,2.41,0,0,0,1-.2,2.34,2.34,0,0,0,.78-0.55A2.34,2.34,0,0,0,12.31,8a2.47,2.47,0,0,0,0-1.94,2.34,2.34,0,0,0-.55-0.78A2.34,2.34,0,0,0,11,4.7,2.47,2.47,0,0,0,9,4.7a2.34,2.34,0,0,0-.78.55A2.34,2.34,0,0,0,7.69,6,2.47,2.47,0,0,0,7.69,8a2.34,2.34,0,0,0,.55.78A2.34,2.34,0,0,0,9,9.31,2.41,2.41,0,0,0,10,9.51Z"/></g> </defs></svg></script>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('popup/map-popup-content.html',
    '<div class="map-popup-content"><md-content md-theme="{{:: $root.$theme || \'blue\' }}" flex=""><md-button class="md-icon-button pip-map-info-window-close-button" ng-click="closeClick(); $event.stopPropagation()" tabindex="-1" aria-label="close"><md-icon class="theme-icon-active" md-svg-icon="icons:cross"></md-icon></md-button><ng-transclude></ng-transclude></md-content><div class="pip-map-info-window-arrow-wrapper"><div><div></div></div><div><div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('popup/map-popup.html',
    '<ui-gmap-window ng-if="popup.isEnabled" show="popup.isEnabled" coords="popup.position" templateurl=":: popup.element.templateUrl" templateparameter=":: popup" options=":: popup.element.options" closeclick="popup.close()"></ui-gmap-window>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/circles/map-circles.html',
    '<ui-gmap-circle ng-repeat="c in ctrl.models" center="c[ctrl.options.center]" stroke="c[ctrl.options.stroke]" fill="c[ctrl.options.fill]" radius="c[ctrl.options.radius]" geodesic="c.geodesic" events="ctrl.events" visible="true"></ui-gmap-circle>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/kml/map-kml.html',
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/markers/map-markers.html',
    '<ui-gmap-markers models="ctrl.models" coords=":: ctrl.options.model.coords" icon=":: ctrl.options.model.icon" options="\'options\'" control=":: ctrl.control" events=":: ctrl.events" fit=":: ctrl.options.fitBounds"></ui-gmap-markers><ui-gmap-polylines ng-if=":: ctrl.connect" models="ctrl.models" path=":: ctrl.connect.property" stroke=":: ctrl.connect.stroke" icons=":: ctrl.connect.icons"></ui-gmap-polylines>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/polygons/map-polygons.html',
    '<ui-gmap-polygons models="ctrl.models" path="ctrl.options.path" stroke="ctrl.options.stroke" fill="ctrl.options.fill" control="ctrl.control" events="ctrl.events" visible="\'visible\'" geodesic="\'geodesic\'" editable="\'editable\'" draggable="\'draggable\'" fit=":: ctrl.options.fitBounds"></ui-gmap-polygons>');
}]);
})();

(function(module) {
try {
  module = angular.module('pipMaps.Templates');
} catch (e) {
  module = angular.module('pipMaps.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('elements/polylines/map-polylines.html',
    '<ui-gmap-polylines models="ctrl.models" path="ctrl.options.path" stroke="ctrl.options.stroke" icons="ctrl.options.icons" control="ctrl.control" events="ctrl.events" visible="\'visible\'" geodesic="\'geodesic\'" editable="\'editable\'" draggable="\'draggable\'" static="ctrl.options.static" fit="ctrl.options.fitBounds"></ui-gmap-polylines>');
}]);
})();



},{}]},{},[17,23])(23)
});



(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).tags = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TagData = (function () {
    TagData.$inject = ['pipRest', 'pipSession'];
    function TagData(pipRest, pipSession) {
        "ngInject";
        this.pipRest = pipRest;
        this.pipSession = pipSession;
        this.RESOURCE = 'tags';
    }
    TagData.prototype.getUserId = function () {
        var userId;
        userId = this.pipSession.session ? this.pipSession.session.userId : null;
        return userId;
    };
    TagData.prototype.readTags = function (params, successCallback, errorCallback) {
        params = params || {};
        params.party_id = params.party_id ? params.party_id : this.getUserId();
        return this.pipRest.getResource(this.RESOURCE).get(params, successCallback, errorCallback);
    };
    TagData.prototype.createTags = function (params, data, successCallback, errorCallback) {
        params.party_id = params.party_id ? params.party_id : this.getUserId();
        this.pipRest.getResource(this.RESOURCE).save(params, data, successCallback, errorCallback);
    };
    TagData.prototype.updateTags = function (params, data, successCallback, errorCallback) {
        params.party_id = params.party_id ? params.party_id : this.getUserId();
        this.pipRest.getResource(this.RESOURCE).update(params, data, successCallback, errorCallback);
    };
    return TagData;
}());
var TagDataProvider = (function () {
    function TagDataProvider() {
    }
    TagDataProvider.prototype.$get = ['pipRest', 'pipSession', function (pipRest, pipSession) {
        "ngInject";
        if (this._service == null) {
            this._service = new TagData(pipRest, pipSession);
        }
        return this._service;
    }];
    return TagDataProvider;
}());
angular
    .module('pipTagData', ['pipCommonRest'])
    .provider('pipTagData', TagDataProvider);
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./TagDataService");
require("./ITagDataService");
},{"./ITagDataService":1,"./TagDataService":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./tag_list/TagList");
require("./rest/TagResources");
require("./data");
angular.module('pipTags', [
    'pipTag.Rest',
    'pipTagData',
    'pipTagList'
]);
},{"./data":3,"./rest/TagResources":5,"./tag_list/TagList":6}],5:[function(require,module,exports){
configTagResources.$inject = ['pipRestProvider'];
function configTagResources(pipRestProvider) {
    pipRestProvider.registerResource('tags', '/api/1.0/tags/:party_id', { party_id: '@party_id' }, {
        update: { method: 'PUT' }
    });
}
angular
    .module('pipTag.Rest', [])
    .config(configTagResources);
},{}],6:[function(require,module,exports){
{
    var TagListController = (function () {
        function TagListController($scope, $element) {
            $element.css('display', 'block');
            $element.addClass('pip-tag-list');
        }
        TagListController.prototype.toBoolean = function (value) {
            if (_.isNull(value) || _.isUndefined(value))
                return false;
            if (!value)
                return false;
            value = value.toString().toLowerCase();
            return value == '1' || value == 'true';
        };
        TagListController.prototype.$onChanges = function (changes) {
            if (this.rebind && changes.tags) {
                this.tags = changes.tags.currentValue;
            }
        };
        return TagListController;
    }());
    var TagListBindings = {
        tags: '<pipTags',
        type: '<pipType',
        typeLocal: '<pipTypeLocal',
        rebuid: '<pipRebind'
    };
    var TagListChanges = (function () {
        function TagListChanges() {
        }
        return TagListChanges;
    }());
    var TagList = {
        bindings: TagListBindings,
        templateUrl: 'tag_list/TagList.html',
        controller: TagListController
    };
    angular
        .module('pipTagList', ['pipTranslate'])
        .component('pipTagList', TagList);
}
},{}],7:[function(require,module,exports){
(function(module) {
try {
  module = angular.module('pipTags.Templates');
} catch (e) {
  module = angular.module('pipTags.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('tag_list/TagList.html',
    '<div class="pip-chip rm4 pip-type-chip pip-type-chip-left {{\'bg-\' + $ctrl.type + \'-chips\'}}" ng-if="$ctrl.type && !$ctrl.typeLocal"><span>{{$ctrl.type.toUpperCase() | translate | uppercase}}</span></div><div class="pip-chip rm4 pip-type-chip pip-type-chip-left {{\'bg-\' + $ctrl.type + \'-chips\'}}" ng-if="$ctrl.type && $ctrl.typeLocal"><span>{{$ctrl.typeLocal.toUpperCase() | translate | uppercase}}</span></div><div class="pip-chip rm4" ng-repeat="tag in $ctrl.tags"><span>{{::tag}}</span></div>');
}]);
})();



},{}]},{},[7,4])(7)
});



//# sourceMappingURL=pip-suite.js.map
