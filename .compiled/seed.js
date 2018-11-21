// Generated by LiveScript 1.5.0
(function(){
  var localStorage, encrypt, aes, wordsToUtf8, name, set, saved, get, out$ = typeof exports != 'undefined' && exports || this;
  localStorage = require('localStorage');
  encrypt = require('./pin.ls').encrypt;
  aes = require('crypto-js/aes');
  wordsToUtf8 = require('./words-to-utf8.ls');
  name = 'sseed';
  out$.set = set = function(value){
    var key, res;
    key = encrypt(name);
    res = aes.encrypt(value, key);
    return localStorage.setItem(name, res);
  };
  out$.saved = saved = function(){
    var ref$;
    return ((ref$ = localStorage.getItem(name)) != null ? ref$ : "") !== "";
  };
  out$.get = get = function(){
    var key, res, ref$;
    key = encrypt(name);
    res = (ref$ = localStorage.getItem(name)) != null ? ref$ : "";
    if (res === "") {
      return res;
    }
    return aes.decrypt(res, key).toString(wordsToUtf8);
  };
}).call(this);
