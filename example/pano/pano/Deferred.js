define(function(require){

    var RESOLVED = 1;
    var REJECTED = 2;

    var Deferred = function(){
        var self = this;
        var st = 0;
        this.resolve = function(){};
        this.reject = function(){};
        this.promise = new Promise(function(resolve, reject){
            self.resolve = function(){
                if(st === 0){
                    st = RESOLVED;
                    resolve.apply(null, arguments);
                }
            };
            self.reject = function(){
                if(st === 0){
                    st = REJECTED;
                    reject.apply(null, arguments);
                }
            };
            self.resolveWith = function(context, args){
                if(st === 0){
                    st = RESOLVED;
                    resolve.apply(context, args);
                }
            };
            self.rejectWith = function(context, args){
                if(st === 0){
                    st = REJECTED;
                    reject.apply(context, args);
                }
            };
        });
        this.then = function(r, j){
            return this.promise.then(r, j);
        };
        this.isResolved = function(){
            return st === RESOLVED;
        }
        this.isRejected = function(){
            return st === REJECTED;
        }

    };

    return Deferred;
});
