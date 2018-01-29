"use strict";

define([
    'angularAMD',
    'moment',
    'jquery',
    'pdfmake',
    'vfs_fonts',
    'underscore',
    'angular',
    'angular-material',
    'jquery-validation',
    'angular-ui-router',
    'angular-resource',
    'angular-ui-router-styles',
    'satellizer',
    'angular-environments',
    'angular-validation',
    'angular-permission',
    'bootstrap',
    'angular-datatables',
    'angular-bootstrap',
    'angular-datatables-bootstrap',
    'angular-moment',
], function(angularAMD, moment, $) {

    var cie = angular.module('cieApp', ['ui.router', 'ngResource', 'uiRouterStyles', 'satellizer', 'environment', 'ngValidate', 'permission', 'datatables', 'ui.bootstrap', 'datatables.bootstrap', 'ngMaterial']);

    cie.constant('appName', 'CIE');

    cie.provider('apiResource', function() {
        return {
            $get: ['$resource', "$q", '$cacheFactory', '$http', function($resource, $q, $cacheFactory, $http) {
                var names = {};
                var caching = $cacheFactory('cieCache');
                var getFromCache = function(idCache) {
                    var existCache = caching.get(idCache);
                    if (existCache) return existCache;
                    return null;
                }
                var formDataObject = function(data) {
                    var formData = new FormData();
                    for (i in data) {
                        if (i.indexOf('$') == -1) {
                            formData.append(i, data[i]);
                            // if (angular.isArray(data[i])) {
                            //     formDataObject(data[i])
                            // }
                        }
                    }
                    return formData;
                }

                return {

                    formDataObject: formDataObject,

                    clearAllCache: function() {
                        return caching.removeAll();
                    },
                    resource: function(nameResource, url, paramDefaults, customActions) {
                        var resource = {
                            register: function() {
                                if (!$.isEmptyObject(names)) {
                                    for (name in names) {
                                        if (name == nameResource) {
                                            throw "Ya existe el recurso " + nameResource;
                                        } else {
                                            names[nameResource] = {};
                                        }
                                    }
                                } else {
                                    names[nameResource] = {};
                                }

                                var defaultActions = {
                                    query: {
                                        method: "GET",
                                    },
                                    update: {
                                        method: "PUT",
                                    },
                                    save: {
                                        method: "POST",
                                    },
                                    get: {
                                        method: "GET",
                                    },
                                    delete: {
                                        method: "DELETE",
                                    }
                                };

                                if (!customActions) customActions = {};
                                angular.extend(defaultActions, customActions);
                                names[nameResource] = $resource(url, paramDefaults, defaultActions);
                            },
                            create: function(data) {
                                if (names[nameResource]) {
                                    return new names[nameResource](data);
                                }
                                throw "Recurso " + nameResource + " no existe";
                            },
                            query: function(params) {
                                var _this = this;
                                var deferred = $q.defer();
                                var r = _this.create();
                                var keyCache = nameResource;
                                //if nested resource
                                if (params && params.parentId) {
                                    keyCache += '/' + params.parentId;
                                }

                                var existOnCache = getFromCache(keyCache);
                                if (existOnCache) {
                                    deferred.resolve(existOnCache);
                                    return deferred.promise;
                                }

                                r.$query(params).then(function(result) {
                                    // create resource item
                                    var resources = [];
                                    angular.forEach(result.data, function(item) {
                                        var newResource = _this.create(item);
                                        resources.push(newResource);
                                    });
                                    //set on cache list array
                                    _this.setOnCache(resources, params && params.parentId ? params.parentId : null);
                                    result.data = resources;
                                    deferred.resolve(result.data)
                                }, function(error) {
                                    deferred.reject(error)
                                });
                                return deferred.promise;
                            },
                            queryCopy: function(params) {
                                var deferred = $q.defer();
                                var copy = [];
                                this.query(params).then(function(result) {
                                    angular.copy(result, copy);
                                    copy.$original = result;
                                    deferred.resolve(copy);
                                })
                                return deferred.promise;
                            },
                            get: function(params) {
                                var param = angular.isObject(params) ? params : {
                                    id: params
                                };
                                var deferred = $q.defer();
                                var r = this.create();
                                var _this = this;

                                //exist in cache ?
                                var keyCache = params.id + '_' + nameResource;
                                if (params && params.parentId) {
                                    keyCache += '/' + params.parentId;
                                }

                                var resource = getFromCache(keyCache);
                                if (resource) {
                                    deferred.resolve(resource);
                                    return deferred.promise;
                                }

                                var keyCache = nameResource;
                                var arrayCache = getFromCache(keyCache);

                                if (arrayCache && arrayCache.length > 0) {
                                    var idxArray = _.findIndex(arrayCache, function(item) {
                                        return item.id == param.id;
                                    });
                                    if (idxArray > -1) {
                                        deferred.resolve(arrayCache[idxArray]);
                                        return deferred.promise;
                                    }
                                }

                                r.$get(param).then(function(result) {
                                    _this.setOnCache(result, params && params.parentId ? params.parentId : null)
                                    deferred.resolve(result);
                                }, function(error) {
                                    deferred.reject(error)
                                })
                                return deferred.promise;
                            },
                            getCopy: function(params) {
                                var param = angular.isObject(params) ? param : {
                                    id: params
                                };
                                var deferred = $q.defer();
                                var copy = {};
                                var _this = this;
                                this.get(param).then(function(result) {
                                    angular.copy(result, copy);
                                    copy = _this.create(copy);
                                    copy.$original = result;
                                    deferred.resolve(copy);
                                })
                                return deferred.promise;
                            },
                            setOnCache: function(resource, isNested) {
                                if (!names[nameResource]) {
                                    throw "Recurso " + nameResource + " no existe";
                                }
                                var idCookie = nameResource;
                                if (isNested) idCookie += '/' + isNested;

                                if (!angular.isArray(resource)) {
                                    idCookie = resource.id + '_' + idCookie;
                                    caching.put(idCookie, resource);
                                    //find on main Collection
                                    var arrayCache = getFromCache(nameResource);
                                    if (arrayCache) {
                                        var idxArray = _.findIndex(arrayCache, function(item) {
                                            return item.id == resource.id;
                                        });
                                        if (idxArray > -1) {
                                            arrayCache[idxArray] = resource;
                                        } else {
                                            arrayCache.push(resource);
                                        }
                                    }
                                } else {
                                    caching.put(nameResource, resource);
                                }
                            },
                            removeFromCache: function(itemId, isNested) {
                                var idCookie = itemId + '_' + nameResource;
                                if (isNested) idCookie += '/' + isNested;
                                if (!names[nameResource]) {
                                    throw "Recurso " + nameResource + " no existe";
                                }

                                var cached = getFromCache(idCookie);
                                if (cached) {
                                    caching.remove(idCookie);
                                }

                                var idCookie = nameResource;
                                var cached = getFromCache(idCookie);

                                if (cached) {
                                    if (angular.isArray(cached)) {
                                        var idxArray = _.findIndex(cached, function(item) {
                                            return item.id == itemId;
                                        });
                                        if (idxArray > -1) cached.splice(idxArray, 1);
                                    }
                                }
                            },
                            persistCollections: function(parent, collections) {
                                var parent = angular.isObject(parent) ? parent : {
                                    parentId: parent
                                };
                                if (!angular.isArray(collections)) throw "Se espera un arreglo de recursos";
                                if (!names[nameResource]) {
                                    throw "Recurso " + nameResource + " no existe";
                                }
                                var deferred = $q.defer();
                                var _this = this;
                                var keyCache = nameResource + '/' + parent.parentId;
                                var arrayCache = angular.copy(getFromCache(keyCache), []);
                                var rPersist = {
                                    insert: [],
                                    update: [],
                                    delete: [],
                                };
                                angular.forEach(collections, function(itemCollection) { // to insert
                                    //to insert
                                    if (!itemCollection.id) {
                                        rPersist.insert.push(itemCollection);
                                    } else {
                                        //to update
                                        var found = _.findWhere(arrayCache, {
                                            id: itemCollection.id
                                        });
                                        if (found && !angular.equals(found, itemCollection)) {
                                            rPersist.update.push(itemCollection);
                                        }
                                    }
                                })
                                if (arrayCache.length) {
                                    angular.forEach(arrayCache, function(itemCache, index) {
                                        var found = _.findWhere(collections, {
                                            id: itemCache.id
                                        })
                                        if (!found) {
                                            rPersist.delete.push(itemCache);
                                        }
                                    })
                                }
                                var resultActions = [];
                                angular.forEach(rPersist.insert, function(itemInsert) {
                                    resultActions.push(itemInsert.$save(parent, function(result) {
                                        _this.setOnCache(result, parent.parentId);
                                    }, function(error) {
                                        deferred.reject(error);
                                    }));
                                })
                                angular.forEach(rPersist.update, function(itemUpdate) {
                                    resultActions.push(itemUpdate.$update(function(result) {
                                        _this.setOnCache(result, parent.parentId);
                                    }, function(error) {
                                        deferred.reject(error);
                                    }));
                                });
                                angular.forEach(rPersist.delete, function(itemDelete) {
                                    resultActions.push(itemDelete.$delete(function(result) {
                                        _this.removeFromCache(result.item, parent.parentId);
                                    }, function(error) {
                                        deferred.reject(error);
                                    }));
                                });
                                //wait resolve all actions
                                $q.all(resultActions).then(function() {
                                    var resolved = {
                                        inserted: rPersist.insert.length,
                                        updated: rPersist.update.length,
                                        deleted: rPersist.delete.length
                                    }
                                    deferred.resolve(resolved);
                                }, function() {
                                    deferred.reject();
                                })
                                return deferred.promise;
                            },
                        };
                        return resource;

                    },
                    loadFromApi: function(req) {
                        var _this = this;
                        var deferred = $q.defer();
                        $http(req).then(function(result) {
                            deferred.resolve(result.data);
                        }, function(error) {
                            deferred.reject(error)
                        })
                        return deferred.promise;
                    }
                }


            }]
        }
    });

    cie.factory('authFactory', ['$auth', '$http', 'envService', '$q', '$rootScope', 'apiResource', function($auth, $http, envService, $q, $rootScope, apiResource) {
        return {
            login: function(credentials) {
                var deferred = $q.defer();
                $auth.login(credentials).then(function(success) {
                    $http.get(envService.read('api') + 'authenticate/verify').then(function(response) {
                        var user = JSON.stringify(response.data);
                        localStorage.setItem('user', user);
                        $rootScope.currentUser = response.data;
                        deferred.resolve();
                    });
                }, function(reason) {
                    deferred.reject(reason);
                });
                return deferred.promise;
            },
            logout: function() {
                var deferred = $q.defer();
                $auth.logout().then(function() {
                    localStorage.removeItem('user');
                    $rootScope.currentUser = null;
                    deferred.resolve();
                });
                return deferred.promise;
            },
            authenticated: function() {
                if ($auth.isAuthenticated()) {
                    return true;
                } else {
                    localStorage.removeItem('user');
                    $rootScope.currentUser = null;
                    return false;
                }
            },
            refreshToken: function() {
                var deferred = $q.defer();
                $http.get(envService.read('api') + 'authenticate/refresh').then(function(response) {
                    $auth.setToken(response.data.token)
                    deferred.resolve();
                }, function(reason) {
                    deferred.reject(reason);
                });
                return deferred.promise;
            },
            verify: function() {
                var deferred = $q.defer();
                $http.get(envService.read('api') + 'authenticate/verify')
                    .then(function(success) {
                        deferred.resolve(success)
                    }, function(error) {
                        deferred.reject(error)
                    });
                return deferred.promise;
            },
            hasPermission: function(key) {

                var deferred = $q.defer();
                if (this.authenticated()) {
                    var roles = $rootScope.currentUser.roles;
                    var permUsers = $rootScope.currentUser.permissions;

                    var permissions = [];

                    angular.forEach(roles, function(role) {
                        angular.forEach(role.permissions, function(perm) {
                            permissions.push(perm.code);
                        })
                    });

                    angular.forEach(permUsers, function(perm) {
                        permissions.push(perm.code);
                    })

                    var found = _.findIndex(permissions, function(el) {
                        if (el == key) return true;
                    });

                    if (found > -1)
                        deferred.resolve()
                    else
                        deferred.reject();

                    return deferred.promise;
                }
            },
            hasRole: function(keyRol) {
                var deferred = $q.defer();
                if (this.authenticated()) {
                    var rolesUser = $rootScope.currentUser.roles;
                    var found = _.findIndex(rolesUser, function(el) {
                        if (el.code == keyRol) return true;
                    });
                    found > -1 ? deferred.resolve() : deferred.reject();
                    return deferred.promise;

                }
            }
        };
    }]);

    cie.factory('layoutReportFactory', ['envService', function(envService) {

        return {
            getHeader: function() {
                return {
                    header : 'data:image/png;base64,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'
                }
            }
        };

    }])

    cie.directive('title', ['$rootScope', '$timeout',
        function($rootScope, $timeout) {
            return {
                link: function() {
                    $rootScope.title = "Ingreso";
                    var listener = function(event, toState) {
                        $timeout(function() {
                            $rootScope.title = (toState.data && toState.data.pageTitle) ? toState.data.pageTitle : 'Default title';
                        });
                    };

                    $rootScope.$on('$stateChangeSuccess', listener);
                }
            };
        }
    ]);

    cie.directive('backendMenu', ['$state', 'apiResource', '$cacheFactory', 'envService', function($state, apiResource, $cacheFactory, envService) {
        return {
            restrict: 'E',
            templateUrl: "frontend/partials/nav.html",
            link: function(scope, iElement, iAttrs) {

                var caching = $cacheFactory.get('cieCache');
                scope.navElements = [];

                var reqPermissions = {
                    method: 'GET',
                    url: envService.read('api') + 'menu'
                };

                apiResource.loadFromApi(reqPermissions).then(function(data) {
                    scope.navElements = []
                    angular.forEach(data, function(module, idx) {
                        var elemMenu = {
                            section: module.name,
                            navEls: []
                        }
                        angular.forEach(module.permissions, function(permission) {
                            elemMenu.navEls.push(formatPermission(permission));
                        })
                        scope.navElements.push(elemMenu);
                    })
                });

                var formatPermission = function(permission) {
                    var menuOpt = {
                        label: permission.name,
                        icon: permission.fav_icon,
                        desc: permission.description
                    };
                    if (permission.children && permission.children.length) {
                        menuOpt.children = [];
                        angular.forEach(permission.children, function(children) {
                            menuOpt.children.push(formatPermission(children));
                        })
                    } else {
                        menuOpt.sref = permission.resource
                    }
                    return menuOpt;
                };

                var elem = $(iElement);
                elem.on('click', 'a', function(event) {

                    $('ul.side-menu li').each(function(index, el) {
                        var $el = $(el);
                        if ($el.hasClass('active') && $el.hasClass('has-childs')) {
                            $('ul:first', $el).slideUp();
                            $el.removeClass('active')
                        } else {
                            $el.removeClass('active')
                        }
                    });

                    var $liparent = $(this).parent();
                    if ($liparent.hasClass('has-childs')) {
                        if ($liparent.hasClass('active') && $el.hasClass('has-childs')) {
                            $liparent.removeClass('active');
                            $('ul:first', $liparent).slideUp();
                        } else {
                            $liparent.addClass('active');
                            $('ul:first', $liparent).slideDown();
                        }
                    } else {
                        $liparent.parents('li').addClass('active')
                    }
                });


                scope.shouldBeActive = function(state) {
                    return $state.includes(state);
                }


            }
        };
    }]);

    cie.directive('resizeRightColumn', function() {
        return function(scope, element) {
            var element = $(element);
            element.css("min-height", $(window).height());
            $(window).resize(function() {
                element.css("min-height", $(window).height());
            });
        }
    });

    cie.directive('maxDateToday', [function() {
        return {
            restrict: 'C',
            require: 'ngModel',
            scope: {
                ngModel: '='
            },
            link: function(scope, iElement, iAttrs, ngModelCtrl) {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }

                if (mm < 10) {
                    mm = '0' + mm
                }

                today = yyyy + '-' + mm + '-' + dd;
                iElement.attr('max', today);
            }
        };
    }])


    cie.filter('capitalize', function() {
        return function(input, param) {
            if (!input) return false;
            if (param) {

                if (param == 'oneLetter') {
                    var newImput = "";
                    angular.forEach(input.split(" "), function(val, idx) {
                        if (val.length <= 1) {
                            newImput += val.toLowerCase() + ' '
                        } else {
                            newImput += val.charAt(0).toUpperCase() + val.substr(1).toLowerCase() + ' '
                        }
                    })
                    return newImput;
                }

            } else {
                return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
            }
        }
    });

    cie.filter('filterTimestamp', function() {
        return function(value) {
            if (!value) return '-';
            return moment(value).format("l");
        }
    });

    cie.directive('numbersOnly', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    });

    cie.run(['apiResource', 'envService', function(apiResource, envService) {

        //users
        apiResource.resource("users", envService.read('api') + 'users/:id', {
            id: '@id'
        }).register();

        //modules
        apiResource.resource("modules", envService.read('api') + 'modules/:id', {
            id: '@id'
        }).register();

        //permissions
        apiResource.resource("permissions", envService.read('api') + 'permissions/:id', {
            id: '@id'
        }).register();

        //tpermissions
        apiResource.resource("tpermissions", envService.read('api') + 'typepermissions/:id', {
            id: '@id'
        }).register();

        //roles
        apiResource.resource("roles", envService.read('api') + 'roles/:id', {
            id: '@id'
        }).register();

        //inscriptions
        apiResource.resource("puserinscriptions", envService.read('api') + 'pUsers/:id', {
            id: '@id'
        }).register();

        //provinces
        apiResource.resource("provinces", envService.read('api') + 'provinces/:id', {
            id: '@id'
        }).register();

        //cities
        apiResource.resource("cities", envService.read('api') + 'cities/:id', {
            id: '@id'
        }).register();

        //parish
        apiResource.resource("parishies", envService.read('api') + 'parishies/:id', {
            id: '@id'
        }).register();

        //pathologies
        apiResource.resource("pathologies", envService.read('api') + 'pathologies/:id', {
            id: '@id'
        }).register();

    }]);

    /** 
    ===========PERMISSIONS & ROLES ====================
    **/
    cie.run(['$rootScope', 'PermissionStore', 'authFactory', 'RoleStore', 'apiResource', '$urlRouter', '$q', function($rootScope, PermissionStore, authFactory, RoleStore, apiResource, $urlRouter, $q) {


        PermissionStore.definePermission('isloggedin', function(permissionName, transitionProperties) {
            if (authFactory.authenticated()) {
                return true; // Is loggedin
            }
            return false;
        });


        PermissionStore.definePermission('anonymous', function(permissionName, transitionProperties) {
            if (!authFactory.authenticated()) {
                return true; // Is loggedin
            }
            return false;
        });


        apiResource.resource('permissions').query().then(function(permissions) {

            angular.forEach(permissions, function(permi) {
                PermissionStore.definePermission(permi.code, function(permissionName) {
                    return authFactory.hasPermission(permissionName)
                })
            });

            //roles
            apiResource.resource('roles').query().then(function(roles) {
                angular.forEach(roles, function(role) {
                    var permRoles = [];
                    angular.forEach(role.permissions, function(permRole) {
                        permRoles.push(permRole.code);
                    })
                    RoleStore.defineRole(role.code, permRoles);
                })
            }).then(function() {
                // Once permissions are set-up 
                // kick-off router and start the application rendering
                $urlRouter.sync();
                // Also enable router to listen to url changes
                $urlRouter.listen();
            })
        });


        /**
            ===========PERMISSIONS & ROLES ====================
        **/

    }]);

    cie.run(['appName', '$rootScope', '$uibModal', '$q', 'DTDefaultOptions', 'authFactory', 'apiResource', '$state', 'RoleStore', 'PermissionStore', function(appName, $rootScope, $uibModal, $q, DTDefaultOptions, authFactory, apiResource, $state, RoleStore, PermissionStore) {

        $rootScope.isMenuCollapsed = false; //menu collapsed

        $rootScope.auth = {};

        DTDefaultOptions.setLanguageSource('frontend/assets/js/datatables/es.json');
        DTDefaultOptions.setOption("processing", true);

        var userInStorage = localStorage.getItem('user');
        if (userInStorage != "undefined") {
            $rootScope.currentUser = JSON.parse(localStorage.getItem('user'));
        }

        $rootScope.appname = appName;

        $rootScope.logout = function() {
            authFactory.logout().then(function() {
                $state.go('adminAuth');
            });
        }


        $rootScope.openSuccessModal = function(params) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: false,
                templateUrl: 'frontend/partials/modal-success.html',
                resolve: {
                    modalContent: function() {
                        return params
                    }
                },
                controller: function($scope, modalContent, $uibModalInstance) {
                    $scope.modalContent = modalContent;
                    $scope.ok = function() {
                        $uibModalInstance.close();
                        deferred.resolve();
                    }
                }

            });

            modalInstance.result.then(function() {
                deferred.resolve();
            }).catch(function() {
                deferred.reject();
            })

            return deferred.promise;
        }

        $rootScope.openErrorModal = function(params) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: false,
                templateUrl: 'frontend/partials/modal-error.html',
                resolve: {
                    modalContent: function() {
                        return params
                    }
                },
                controller: function($scope, modalContent, $uibModalInstance) {
                    $scope.modalContent = modalContent;
                    $scope.ok = function() {
                        $uibModalInstance.close();
                        deferred.resolve();
                    }
                }
            });

            modalInstance.result.then(function() {
                deferred.resolve();
            }).catch(function() {
                deferred.reject();
            })

            return deferred.promise;
        }

        $rootScope.openDelteModal = function(params) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: false,
                templateUrl: 'frontend/partials/modal-delete.html',
                resolve: {
                    modalContent: function() {
                        return params
                    }
                },
                controller: function($scope, modalContent, $uibModalInstance) {
                    $scope.modalContent = modalContent;

                    $scope.delete = function(model) {
                        $uibModalInstance.close();
                    }
                }
            });

            modalInstance.result.then(function() {
                deferred.resolve();
            }).catch(function() {
                deferred.reject();
            })

            return deferred.promise;
        }

        $rootScope.openPreviewModal = function(params) {
            var deferred = $q.defer();
            var modalInstance = $uibModal.open({
                animation: true,
                backdrop: false,
                size: 'lg',
                templateUrl: 'frontend/partials/modal-preview.html',
                resolve: {
                    modalContent: function() {
                        return params
                    }
                },
                controller: function($scope, modalContent, $uibModalInstance) {
                    $scope.modalContent = modalContent;
                    $scope.ok = function() {
                        $uibModalInstance.close();
                        deferred.resolve();
                    }
                }
            })
        }

    }])

    cie.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'envServiceProvider', '$authProvider', '$validatorProvider', function($stateProvider, $locationProvider, $urlRouterProvider, envServiceProvider, $authProvider, $validatorProvider) {

        $locationProvider.html5Mode(true);


        envServiceProvider.config({
            domains: {
                development: ['cie2.local'],
                home: ['cie.local']
            },
            vars: {
                development: {
                    authorization: 'http://cie2.local/backend/api/authenticate/login',
                    api: 'http://cie2.local/backend/api/',
                },
                home: {
                    assets: 'http://cie.local/',
                    authorization: 'http://cie.local/backend/api/authenticate/login',
                    api: 'http://cie.local/backend/api/',
                }
            }
        });


        //check Environments
        envServiceProvider.check();

        $authProvider.loginUrl = envServiceProvider.read('authorization');

        //validators to
        $validatorProvider.setDefaults({
            errorElement: 'span',
            errorClass: 'help-block',
            highlight: function(element) {
                $(element).parents('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).parents('.form-group').removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                var element = element.parents('.form-group');
                element.append(error);
            }
        });

        $validatorProvider.addMethod("valueNotEquals", function(value, element, arg) {
            return value !== arg;
        }, "Value must not equal arg.");


        $validatorProvider.addMethod("unique", function(value, element, arg) {
            var success = false;
            var params = arg.split(',');
            var table = params[0];
            var column = params[1];
            var id = null;
            if (typeof params[2] != 'undefined') {
                id = params[2];
            }
            $.ajax({
                url: envServiceProvider.read('api') + 'validator/unique?table=' + table + '&columnname=' + column + '&value=' + value + '&id=' + id,
                type: 'GET',
                async: false,
                success: function(result) {
                    success = result === "ok" ? true : false;
                }

            });
            return success;

        }, "Not Unique.");

        $validatorProvider.addMethod("exists", function(value, element, arg) {
            var success = false;
            var table = arg;
            var value = value.split(':');
            value = value[1];
            $.ajax({
                url: envServiceProvider.read('api') + 'validator/exists?table=' + table + '&value=' + value,
                type: 'GET',
                async: false,
                success: function(result) {
                    success = result === "ok" ? true : false;
                }
            });
            return success;
        }, "Already exist.");

        $validatorProvider.addMethod("isValidId", function(value, element, arg) {
            //Preguntamos si la value consta de 10 digitos
            if (value.length == 10) {
                //Obtenemos el digito de la region que sonlos dos primeros digitos
                var regionId = value.substring(0, 2);
                //Pregunto si la region existe ecuador se divide en 24 regiones
                if (regionId >= 1 && regionId <= 24) {
                    // Extraigo el ultimo digito
                    var lastDigit = value.substring(9, 10);
                    //Agrupo todos los pair y los sumo
                    var pair = parseInt(value.substring(1, 2)) + parseInt(value.substring(3, 4)) + parseInt(value.substring(5, 6)) + parseInt(value.substring(7, 8));
                    //Agrupo los odd, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
                    var numOne = value.substring(0, 1);
                    var numOne = (numOne * 2);
                    if (numOne > 9) { var numOne = (numOne - 9); }
                    var numThree = value.substring(2, 3);
                    var numThree = (numThree * 2);
                    if (numThree > 9) { var numThree = (numThree - 9); }
                    var numFive = value.substring(4, 5);
                    var numFive = (numFive * 2);
                    if (numFive > 9) { var numFive = (numFive - 9); }
                    var numSeven = value.substring(6, 7);
                    var numSeven = (numSeven * 2);
                    if (numSeven > 9) { var numSeven = (numSeven - 9); }
                    var numNine = value.substring(8, 9);
                    var numNine = (numNine * 2);
                    if (numNine > 9) { var numNine = (numNine - 9); }
                    var odd = numOne + numThree + numFive + numSeven + numNine;
                    //Suma total
                    var sumTotal = (pair + odd);
                    //extraemos el primero digito
                    var firstDigitSum = String(sumTotal).substring(0, 1);
                    //Obtenemos la ten inmediata
                    var ten = (parseInt(firstDigitSum) + 1) * 10;
                    //Obtenemos la resta de la ten inmediata - la sumTotal esto nos da el digito validador
                    var validatorDigit = ten - sumTotal;
                    //Si el digito validador es = a 10 toma el valor de 0
                    if (validatorDigit == 10)
                        var validatorDigit = 0;
                    //Validamos que el digito validador sea igual al de la value
                    if (validatorDigit == lastDigit) {
                        return true
                    } else {
                        return false
                    }

                } else {
                    // imprimimos en consola si la region no pertenece
                    return false;
                }
            } else {
                //imprimimos en consola si la value tiene mas o menos de 10 digitos
                return false;
            }
        }, "Invalid ID.");


        $validatorProvider.addMethod('notEqualtTo', function(value, element, arg) {
            function validateElem(elem) {
                if ($(elem).val() == value) return false;
                return true;
            }

            if (angular.isArray(arg)) {
                var results = [];
                angular.forEach(arg, function(el) {
                    if (validateElem(el)) {
                        results.push(true)
                    } else {
                        results.push(false);
                    }
                })

                if (_.contains(results, false)) return false;
                return true;
            } else {
                return validateElem(arg);
            }
        }, 'exist equal');

        $validatorProvider.addMethod('uniquePatient', function(value, element, arg) {
            var success = false;
            var params = arg.split(',');
            var id = null;

            if (typeof params[1] != 'undefined') {
                id = params[1];
            }

            $.ajax({
                url: envServiceProvider.read('api') + 'validator/uniquePatient?columnname=' + params[0] + '&value=' + value + '&id=' + id,
                type: 'GET',
                async: false,
                success: function(result) {
                    success = result === "ok" ? true : false;
                }

            });
            return success;

        }, 'patien exist')

        //if not found
        $urlRouterProvider.otherwise('/errors/404');
        // Prevent router from automatic state resolving
        $urlRouterProvider.deferIntercept();

        $stateProvider.state('index', angularAMD.route({
            url: '/',
            data: {
                permissions: {
                    except: ['isloggedin', 'anonymous'],
                    redirectTo: {
                        isloggedin: {
                            state: "root.dashboard"
                        },
                        anonymous: {
                            state: 'adminAuth'
                        },
                        default: 'adminAuth'
                    }
                },
                pageTitle: "Ingreso"
            }
        }));

        $stateProvider.state('adminAuth', angularAMD.route({
            url: '/login',
            controllerUrl: 'frontend/components/auth/auth',
            views: {
                "@": {
                    templateUrl: "frontend/components/auth/login.html",
                    controller: 'LoginCtrl'
                }
            },
            data: {
                css: ['frontend/assets/css/login.css'],
                permissions: {
                    except: ['isloggedin'],
                    redirectTo: "root.dashboard"
                },
                pageTitle: "Ingreso"
            }
        }));

        $stateProvider.state('errors.404', angularAMD.route({
            url: '/errors/404',
            templateUrl: "frontend/components/errors/404.html",
            data: {
                pageTitle: "No encontrado"
            }
        }));


        $stateProvider.state('root', angularAMD.route({
            url: '/',
            abstract: true,
            views: {
                "root": {
                    templateUrl: 'frontend/layouts/master.html'
                },
                "leftNav@root": {
                    templateUrl: 'frontend/partials/left.html'
                },
                "topNav@root": {
                    templateUrl: 'frontend/partials/top.html'
                }
            },
            data: {
                permissions: {
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/custom.css', 'frontend/assets/css/animate.css', 'frontend/bower_components/angular-bootstrap/ui-bootstrap-csp.css', 'frontend/bower_components/angular-material/angular-material.css'],
            }
        }));


        $stateProvider.state('root.dashboard', angularAMD.route({
            url: 'dashboard',
            controllerUrl: 'frontend/components/dashboard/dashboard',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/dashboard/dashboard.html',
                    controller: 'DashboardCtrl'
                }

            },
            data: {
                permissions: {
                    // only: ['UsNormal', 'admin', 'isloggedin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Escritorio"
            }
        }));

        /**
            USER
        **/
        $stateProvider.state('root.user', angularAMD.route({
            url: 'users',
            controllerUrl: 'frontend/components/user/user',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/user/index.html',
                    controller: 'UserIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin', 'personalizado'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Usuarios"
            }
        }));

        $stateProvider.state('root.user.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/user/user',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/user/create.html',
                    controller: 'UserCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Usuarios"
            }
        }));

        $stateProvider.state('root.user.edit', angularAMD.route({
            url: '/{userId:int}/edit',
            controllerUrl: 'frontend/components/user/user',
            views: {
                "content@root": {

                    templateUrl: 'frontend/components/user/edit.html',
                    controller: 'UserEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Usuarios"
            }
        }));

        /**
            MODULE
        **/
        $stateProvider.state('root.module', angularAMD.route({
            url: 'modules',
            controllerUrl: 'frontend/components/module/module',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/module/index.html',
                    controller: 'ModuleIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Módulos"
            }
        }));

        $stateProvider.state('root.module.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/module/module',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/module/create.html',
                    controller: 'ModuleCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Módulos"
            }
        }));

        $stateProvider.state('root.module.edit', angularAMD.route({
            url: '/{moduleId:int}/edit',
            controllerUrl: 'frontend/components/module/module',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/module/edit.html',
                    controller: 'ModuleEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Módulos"
            }
        }));

        /**
            PERMISSION
        **/
        $stateProvider.state('root.permission', angularAMD.route({
            url: 'permissions',
            controllerUrl: 'frontend/components/permission/permission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/permission/index.html',
                    controller: 'PermissionIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Permisos"
            }
        }));

        $stateProvider.state('root.permission.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/permission/permission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/permission/create.html',
                    controller: 'PermissionCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Permisos"
            }
        }));

        $stateProvider.state('root.permission.edit', angularAMD.route({
            url: '/{permissionId:int}/edit',
            controllerUrl: 'frontend/components/permission/permission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/permission/edit.html',
                    controller: 'PermissionEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Permisos"
            }
        }));

        /**
            TYPE PERMISSION
        **/
        $stateProvider.state('root.tpermission', angularAMD.route({
            url: 'type-permissions',
            controllerUrl: 'frontend/components/tpermission/tpermission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/tpermission/index.html',
                    controller: 'TPermissionIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Tipos de Permisos"
            }
        }));

        $stateProvider.state('root.tpermission.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/tpermission/tpermission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/tpermission/create.html',
                    controller: 'TPermissionCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Tipos de Permisos"
            }
        }));

        $stateProvider.state('root.tpermission.edit', angularAMD.route({
            url: '/{tPermissionId:int}/edit',
            controllerUrl: 'frontend/components/tpermission/tpermission',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/tpermission/edit.html',
                    controller: 'TPermissionEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Tipos de Permisos"
            }
        }));

        /**
            ROLES
        **/
        $stateProvider.state('root.role', angularAMD.route({
            url: 'roles',
            controllerUrl: 'frontend/components/role/role',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/role/index.html',
                    controller: 'RoleIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Roles"
            }
        }));

        $stateProvider.state('root.role.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/role/role',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/role/create.html',
                    controller: 'RoleCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Roles"
            }
        }));

        $stateProvider.state('root.role.edit', angularAMD.route({
            url: '/{roleId:int}/edit',
            controllerUrl: 'frontend/components/role/role',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/role/edit.html',
                    controller: 'RoleEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Roles"
            }
        }));

        /**
            PROVINCES
        **/
        $stateProvider.state('root.province', angularAMD.route({
            url: 'provinces',
            controllerUrl: 'frontend/components/province/province',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/province/index.html',
                    controller: 'ProvinceIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Provincias"
            }
        }));

        $stateProvider.state('root.province.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/province/province',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/province/create-edit.html',
                    controller: 'ProvinceCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Provincias"
            }
        }));

        $stateProvider.state('root.province.edit', angularAMD.route({
            url: '/{provinceId:int}/edit',
            controllerUrl: 'frontend/components/province/province',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/province/create-edit.html',
                    controller: 'ProvinceEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/assets/css/checkbox-bootstrap.css'],
                pageTitle: "Provincias"
            }
        }));

        /**
            CITY
        **/
        $stateProvider.state('root.city', angularAMD.route({
            url: 'cities',
            controllerUrl: 'frontend/components/city/city',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/city/index.html',
                    controller: 'CityIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Ciudades"
            }
        }));

        $stateProvider.state('root.city.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/city/city',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/city/create-edit.html',
                    controller: 'CityCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Ciudades"
            }
        }));


        $stateProvider.state('root.city.edit', angularAMD.route({
            url: '/{cityId:int}/edit',
            controllerUrl: 'frontend/components/city/city',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/city/create-edit.html',
                    controller: 'CityEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Ciudades"
            }
        }));

        /**
            PARISH
        **/
        $stateProvider.state('root.parish', angularAMD.route({
            url: 'parishies',
            controllerUrl: 'frontend/components/parish/parish',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/parish/index.html',
                    controller: 'ParishIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Parroquias"
            }
        }));

        $stateProvider.state('root.parish.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/parish/parish',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/parish/create-edit.html',
                    controller: 'ParishCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Parroquias"
            }
        }));


        $stateProvider.state('root.parish.edit', angularAMD.route({
            url: '/{parishId:int}/edit',
            controllerUrl: 'frontend/components/parish/parish',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/parish/create-edit.html',
                    controller: 'ParishEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Parroquias"
            }
        }));

        /**
            PATHOLOGY
        **/
        $stateProvider.state('root.pathology', angularAMD.route({
            url: 'pathologies',
            controllerUrl: 'frontend/components/pathology/pathology',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pathology/index.html',
                    controller: 'PathologyIdxCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Patologías"
            }
        }));

        $stateProvider.state('root.pathology.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/pathology/pathology',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pathology/create-edit.html',
                    controller: 'PathologyCreateCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Patologías"
            }
        }));

        $stateProvider.state('root.pathology.edit', angularAMD.route({
            url: '/{pathologyId:int}/edit',
            controllerUrl: 'frontend/components/pathology/pathology',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pathology/create-edit.html',
                    controller: 'PathologyEditCtrl'
                }

            },
            data: {
                permissions: {
                    only: ['admin'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Patologías"
            }
        }));




        /**
            INSCRIPCTIONS
        **/
        $stateProvider.state('root.inscription', angularAMD.route({
            url: 'inscriptions',
            controllerUrl: 'frontend/components/pUserInscription/pUserInscription',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pUserInscription/index.html',
                    controller: 'pUserInscriptionIdxCtrl'
                }
            },
            data: {
                permissions: {
                    only: ['UsNormal'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                css: ['frontend/bower_components/angular-datatables/dist/css/angular-datatables.min.css', 'frontend/bower_components/angular-datatables/dist/plugins/bootstrap/datatables.bootstrap.min.css'],
                pageTitle: "Fichas de Inscripción"
            }
        }));

        $stateProvider.state('root.inscription.create', angularAMD.route({
            url: '/create',
            controllerUrl: 'frontend/components/pUserInscription/pUserInscription',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pUserInscription/create-edit.html',
                    controller: 'pUserInscriptionCreateCtrl'
                }
            },
            data: {
                permissions: {
                    only: ['admin', 'UsNormal'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Creación de Fichas de Inscripción"
            }

        }));

        $stateProvider.state('root.inscription.edit', angularAMD.route({
            url: '/{pInsId:int}/edit',
            controllerUrl: 'frontend/components/pUserInscription/pUserInscription',
            views: {
                "content@root": {
                    templateUrl: 'frontend/components/pUserInscription/create-edit.html',
                    controller: 'pUserInscriptionEditCtrl'
                }
            },
            data: {
                permissions: {
                    only: ['admin', 'UsNormal'],
                    except: ['anonymous'],
                    redirectTo: "adminAuth"
                },
                pageTitle: "Edición de Fichas de Inscripción"
            }

        }));

    }]);



    angularAMD.bootstrap(cie);

    return cie;

});