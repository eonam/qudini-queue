(function () {

    angular.module('qudini.QueueApp', [])
        .controller('QueueCtrl', QueueCtrl)
        .directive('customer', Customer)
        .directive('addCustomer', AddCustomer)
        .directive('servedCustomer', ServedCustomer);

    /**
     * Bonus points - manipulating the without waiting for the
     * server request
     */
    function QueueCtrl($scope, $http) {

        $scope.customers = [];
        $scope.customersServed = [];
        _getCustomers();
        _getServedCustomers();

        $scope.onCustomerAdded = function(){
            _getCustomers();
        }

        $scope.onCustomerRemoved = function(){
            _getCustomers();
        }

        $scope.onCustomerServed = function(){
            _getCustomers();
            _getServedCustomers()
        }

        function _getServedCustomers(){
            return $http.get('/api/customers/served').then(function(res){
                $scope.customersServed = res.data;
            })
        }

        function _getCustomers(){
            return $http.get('/api/customers').then(function(res){
                $scope.customers = res.data;
            })
        }
    }

    /**
     * The <customer> directive is responsible for:
     * - serving customer
     * - calculating queued time
     * - removing customer from the queue
     */
    function Customer($http) {

        return {
            restrict: 'E',
            scope:{
                customer: '=',

                onRemoved: '&',
                onServed: '&'
            },
            templateUrl: '/customer/customer.html',
            link: function(scope) {

                // calculate how long the customer has queued for
                scope.queuedTime = new Date() - new Date(scope.customer.joinedTime);

                scope.remove = function() {
                    $http({
                        method: 'DELETE',
                        url: '/api/customer/remove',
                        params: {id: scope.customer.id}
                    }).then(function(res) {
                        scope.onRemoved()()
                    })
                };

                scope.serve = function() {
                    $http({
                        method: 'POST',
                        url: '/api/customer/serve',
                        data: {id: scope.customer.id}
                    }).then(function(res){
                        scope.onServed()()
                    })
                }
            }
        }
    }

    function AddCustomer($http) {
        return {
            restrict: 'E',
            scope:{
                onAdded: '&'
            },
            templateUrl:'/add-customer/add-customer.html',
            link: function(scope) {
                scope.products = [
                    {name: 'Grammatical advice'},
                    {name: 'Magnifying glass repair'},
                    {name: 'Cryptography advice'}
                ];

                scope.add = function() {
                    scope.customer.joinedTime = new Date();

                    $http({
                        method: 'POST',
                        url: '/api/customer/add',
                        data: scope.customer
                    }).then(function(res) {
                        scope.onAdded()()
                    })
                }
            }
        }
    }

    function ServedCustomer($http) {
        return {
            restrict: 'E',
            scope:{
                customer: '='
            },
            templateUrl: '/served-customer/served-customer.html',
            link: function(scope) {

            }
        }
    }


})()