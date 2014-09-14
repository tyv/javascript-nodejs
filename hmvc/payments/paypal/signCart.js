/*
  # Signing the cart for paypal WPS

  ## Why OpenSSL Cli ?
  Node crypto can't sign pkcs7
  node-forge (not sure) couldn't find the way
  so I'm using openssl CLI

  ## OpenSSL params origins
  Thanks to from http://www.stellarwebsolutions.com/en/articles/paypal_button_encryption_php.php

  ## Preparation
  First, make certs:
   openssl genrsa -out app_key.pem 1024
   openssl req -new -key app_key.pem -x509 -days 365 -out app_cert.pem

   (for java optional) openssl pkcs12 -export -inkey app_key.pem -in app_cert.pem -out app_cert.p12
   (for java optional) p12 is a format which groups key and cert and signs, so password is required

  ## Alternative way to sign:
   EWP Soft:
   https://www.paypal.com/us/cgi-bin/webscr?cmd=p/xcl/rec/ewp-code
  to compile java, get http://www.bouncycastle.org/archive/124/crypto-124.tar.gz
   put to parent dir and run the compiler like this (modified build_app.sh):
 ===
 export CRYPTO_HOME="/js/javascript-nodejs/tmp/crypto"

 CLASSPATH="."
 CLASSPATH="$CLASSPATH:$CRYPTO_HOME/jars/bcmail-jdk15-124.jar"
 CLASSPATH="$CLASSPATH:$CRYPTO_HOME/jars/bcpg-jdk15-124.jar"
 CLASSPATH="$CLASSPATH:$CRYPTO_HOME/jars/bcprov-jdk15-124.jar"
 CLASSPATH="$CLASSPATH:$CRYPTO_HOME/jars/bctest-jdk15-124.jar"
 CLASSPATH="$CLASSPATH:$CRYPTO_HOME/jars/jce-jdk13-124.jar"
 export CLASSPATH

 javac -g -classpath "$CLASSPATH" 	ButtonEncryption.java	com/paypal/crypto/sample/*.java

 Then:
 (where Kah1voo8 is p12 password, 7BXVJJ3YFS3HQ is cert id from paypal (upload app_cert.pem to paypal to see it)
 java ButtonEncryption app_cert.pem app_cert.p12 paypal_cert.pem Kah1voo8 "cert_id=7BXVJJ3YFS3HQ,business=iliakan@gmail.com,notify_url=http://stage.javascript.ru/payments/paypal/callback?transactionNumber=123,cancel_return=http://stage.javascript.ru/payments/paypal/cancel?transactionNumber=123,notify_url=http://stage.javascript.ru/payments/paypal/callback?transactionNumber=123,return=http://stage.javascript.ru/payments/paypal/success?transactionNumber=123,invoice=123,amount=2,item_name=Оплата по счету 123,cmd=_xclick,charset=utf-8,no_note=1,no_shipping=1,rm=2,currency_code=RUB,lc=RU,secret=blabla" out.html
 =====
*/

/* jshint -W021 */

var exec = require('child_process').exec;
var fs = require('fs');
var assert = require('assert');
var thunkify = require('thunkify');

function signCart(myCertPath, myKeyPath, paypalCertPath, message, callback) {

  var cmd = 'openssl smime -sign -signer ' + myCertPath + ' -inkey ' + myKeyPath + ' -outform der -nodetach -binary | openssl smime -encrypt -des3 -binary -outform pem ' + paypalCertPath;

  var child = exec(
    cmd,
    function(err, stdout, stderr) {
      if (err) return callback(err);
      return callback(null, stdout);
    }
  );

  child.stdin.end(message);
}

module.exports = function(myCertPath, myKeyPath, paypalCertPath) {
  assert(fs.existsSync(myCertPath));
  assert(fs.existsSync(myKeyPath));
  assert(fs.existsSync(paypalCertPath));

  return thunkify(signCart.bind(null, myCertPath, myKeyPath, paypalCertPath));
};


//openssl smime -sign -signer $MY_CERT_FILE -inkey $MY_KEY_FILE -in content -outform der -nodetach -binary
// | openssl smime -encrypt -des3 -binary -outform pem $PAYPAL_CERT_FILE
