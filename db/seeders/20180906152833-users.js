module.exports = {
  up: queryInterface => (
    queryInterface.bulkInsert('users', [{
      id: 1,
      name: 'Test User',
      email: 'test@email.com',
      phone: '+6514651695',
      sub: '2f2a46e4-2aacf-4d1d-8er1-8211a7b7dc8d',
    }], {})
  ),

  down: queryInterface => (
    queryInterface.bulkDelete('users', null, {})
  ),
};
