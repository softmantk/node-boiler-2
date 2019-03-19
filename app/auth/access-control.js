const AccessControl = require('accesscontrol');

const ac = new AccessControl();

ac.grant('aonther-user')
  .readOwn('customer')
  .readOwn('note')
  .readOwn('customer-user')
  .updateOwn('customer-user')
  .readOwn('customer-note')
  .createOwn('customer-note')
  .updateOwn('customer-note')
  .deleteOwn('customer-note')
  .readOwn('customer-product')
  .updateOwn('customer-product')
  .readOwn('customer-transaction')
  .updateOwn('customer-transaction');

ac.grant('admin')
  .readAny('user')
  .createAny('user')
  .deleteAny('user')
  .updateAny('user')
  .readAny('aonther-user')
  .createAny('aonther-user')
  .deleteAny('aonther-user')
  .updateAny('aonther-user')
  .readAny('aonther-user-user')
  .createAny('aonther-user-user')
  .updateAny('aonther-user-user')
  .deleteAny('aonther-user-user')
  .readAny('customer-user')
  .createAny('customer-user')
  .updateAny('customer-user')
  .deleteAny('customer-user')
  .readAny('customer')
  .updateAny('customer')
  .readAny('product')
  .updateAny('product')
  .readAny('customer-product')
  .updateAny('customer-product')
  .readAny('transaction')
  .updateAny('transaction');

module.exports = { ac };
