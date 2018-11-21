// Generated by LiveScript 1.5.0
(function(){
  var ref$, each, pairsToObj, objToPairs, take, drop, promise, Parallel, max, makeParallel, go, run, context, task, toString$ = {}.toString, out$ = typeof exports != 'undefined' && exports || this;
  ref$ = require('prelude-ls'), each = ref$.each, pairsToObj = ref$.pairsToObj, objToPairs = ref$.objToPairs, take = ref$.take, drop = ref$.drop;
  promise = function(){
    var secret;
    secret = {
      done: false,
      callbacks: [],
      result: null,
      notify: function(){
        if (secret.done) {
          return each(function(it){
            return it(secret.result);
          })(
          secret.callbacks);
        }
      }
    };
    return {
      success: function(result){
        secret.done = true;
        secret.result = result;
        return secret.notify();
      },
      then: function(it){
        secret.callbacks.push(it);
        return secret.notify();
      }
    };
  };
  Parallel = (function(){
    Parallel.displayName = 'Parallel';
    var prototype = Parallel.prototype, constructor = Parallel;
    function Parallel(tasks){
      var me;
      this.tasks = tasks;
      this.results = [];
      this.callbacks = [];
      this.done = false;
      this.notify = function(){
        var res;
        if (this.done) {
          res = pairsToObj(
          this.results);
          return each(function(c){
            return c(res);
          })(
          this.callbacks);
        }
      };
      me = this;
      this.success = curry$(function(name, res){
        me.results.push([name, res]);
        if (me.tasks.length === me.results.length) {
          me.done = true;
          return me.notify();
        }
      });
    }
    Parallel.prototype.then = function(func){
      this.callbacks.push(func);
      return this.notify();
    };
    Parallel.prototype.run = function(val){
      var i$, ref$, len$, pair, composition, array, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.tasks).length; i$ < len$; ++i$) {
        pair = ref$[i$];
        composition = (fn$());
        array = composition.concat([this.success(pair[0])]);
        results$.push(go(array, val));
      }
      return results$;
      function fn$(){
        switch (toString$.call(pair[1]).slice(8, -1)) {
        case 'Function':
          return [pair[1]];
        case 'Array':
          return pair[1];
        }
      }
    };
    return Parallel;
  }());
  max = 50;
  makeParallel = function(o, val, success){
    var tasks, parallel, head, tail;
    tasks = objToPairs(
    o);
    if (tasks.length === 0) {
      return success({});
    }
    if (tasks.length <= max) {
      parallel = new Parallel(tasks);
      parallel.then(success);
      return parallel.run(val);
    } else {
      head = pairsToObj(
      take(max)(
      tasks));
      tail = pairsToObj(
      drop(max)(
      tasks));
      return makeParallel(head, val, function(collector){
        return makeParallel(tail, val, function(injecter){
          var prop;
          for (prop in injecter) {
            collector[prop] = injecter[prop];
          }
          return success(collector);
        });
      });
    }
  };
  go = curry$(function(fns, val){
    var o, processVal;
    o = fns.shift();
    if (o == null) {
      return;
    }
    processVal = function(nval){
      var next;
      next = go(fns);
      if (toString$.call(nval).slice(8, -1) === 'Object' && toString$.call(nval.then).slice(8, -1) === 'Function') {
        return nval.then(next);
      } else {
        return next(nval);
      }
    };
    switch (toString$.call(o).slice(8, -1)) {
    case 'Function':
      return processVal(
      o(
      val));
    case 'Array':
      return go(o.concat(fns), val);
    case 'Object':
      return makeParallel(o, val, processVal);
    }
  });
  out$.run = run = function(){
    var p, arr;
    p = promise();
    arr = Array.prototype.slice.call(arguments);
    if (toString$.call(arr[0]).slice(8, -1) === 'Array') {
      go.call(go, arr[0].concat([p.success]), arr[1]);
    } else {
      go.call(go, arr.concat([bind$(p, 'success')]), []);
    }
    return p;
  };
  out$.context = context = function(func){
    var p;
    p = promise();
    func(p.success);
    return p;
  };
  out$.task = task = function(func){
    return function(){
      var p;
      p = promise();
      func(p.success);
      return p;
    };
  };
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
