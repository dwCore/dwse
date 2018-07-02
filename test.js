var tape = require('tape')
var DWS2 = require('@dwcore/dws2')
var DWSE = require('./')

tape('DWSE', function (t) {
  var s = DWS2.obj()
  s.write('a')
  s.write('b')
  s.write('c')
  s.end()

  s.on('end', function () {
    t.end()
  })

  var expected = ['a', 'b', 'c']
  DWSE(s, function (data, next) {
    t.same(data, expected.shift())
    next()
  })
})

tape('DWSE and callback', function (t) {
  var s = DWS2.obj()
  s.write('a')
  s.write('b')
  s.write('c')
  s.end()

  var expected = ['a', 'b', 'c']
  DWSE(s, function (data, next) {
    t.same(data, expected.shift())
    next()
  }, function () {
    t.end()
  })
})

tape('DWSE (write after)', function (t) {
  var s = DWS2.obj()
  s.on('end', function () {
    t.end()
  })

  var expected = ['a', 'b', 'c']
  DWSE(s, function (data, next) {
    t.same(data, expected.shift())
    next()
  })

  setTimeout(function () {
    s.write('a')
    s.write('b')
    s.write('c')
    s.end()
  }, 100)
})

tape('DWSE error', function (t) {
  var s = DWS2.obj()
  s.write('hello')
  s.on('error', function (err) {
    t.same(err.message, 'stop')
    t.end()
  })

  DWSE(s, function (data, next) {
    next(new Error('stop'))
  })
})

tape('DWSE error and callback', function (t) {
  var s = DWS2.obj()
  s.write('hello')

  DWSE(s, function (data, next) {
    next(new Error('stop'))
  }, function (err) {
    t.same(err.message, 'stop')
    t.end()
  })
})

tape('DWSE with falsey values', function (t) {
  var s = DWS2.obj()
  s.write(0)
  s.write(false)
  s.write(undefined)
  s.end()

  s.on('end', function () {
    t.end()
  })

  var expected = [0, false]
  var count = 0
  DWSE(s, function (data, next) {
    count++
    t.same(data, expected.shift())
    next()
  }, function () {
    t.same(count, 2)
  })
})

tape('huge stack', function (t) {
  var s = DWS2.obj()

  for (var i = 0; i < 5000; i++) {
    s.write('foo')
  }

  s.end()

  DWSE(s, function (data, cb) {
    if (data !== 'foo') t.fail('bad data')
    cb()
  }, function (err) {
    t.error(err, 'no error')
    t.end()
  })
})
