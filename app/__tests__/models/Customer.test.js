const db = require('../../models/index');

describe('Customer.userHasAccess function', () => {
  const userId = 1;
  const accessableCustomerId = 1;
  const unaccessableCustomerId = 0;

  it('should return 1 for accessableCustomerId', async () => {
    const allowed = await db.Customer
      .userHasAccess(userId, accessableCustomerId);
    expect(allowed).toEqual({ '?column?': 1 });
  });

  it('should return no matching customerUser', async () => {
    const allowed = await db.Customer
      .userHasAccess(userId, unaccessableCustomerId);
    expect(allowed).toEqual(undefined);
  });
});

describe('CustomerUser.countForSupplier function', async () => {
  const existingCustomerId = 1;
  const notExistingCustomerId = 3;

  it('it should return customer details for existingCustomerId', async () => {
    const result = await db.Customer
      .findOne({ where: { id: existingCustomerId } });
    expect(result)
      .toBeTruthy();
  });

  it('it should return null for notExistingCustomerId', async () => {
    const result = await db.Customer
      .findOne({ where: { id: notExistingCustomerId } });
    expect(result)
      .toBeFalsy();
  });
});

describe('Customer.listForSupplier function', async () => {
  const accessibleUserId = 1;
  const unaccessableUserId = 2;
  const params = {
    searchTitle: '',
    searchCode: '',
    descending: true,
    sortBy: '',
  };

  it(`result array of object contains expected key: value pairs for
    accessableCustomerId`, async () => {
    const result = await db.Customer
      .listForSupplier(accessibleUserId, params);

    expect(result[0])
      .toEqual(
        expect.objectContaining({
          address: expect.any(String),
          code: expect.any(String),
          currency: expect.any(String),
          growth: expect.any(Number),
          id: expect.any(Number),
          last_delivered: expect.any(Date),
          modified: expect.any(Date),
          month_value: expect.any(String),
          supplier_id: expect.any(Number),
          threatened_value: expect.any(String),
          title: expect.any(String),
          u_id: expect.any(Number),
        }),
      );
  });

  it('return empty array for unaccessableCustomerId', async () => {
    const result = await db.Customer
      .listForSupplier(unaccessableUserId, params);
    expect(result)
      .toEqual([]);
  });
});

describe('Customer.countForSupplier function', async () => {
  const accessibleUserId = 1;
  const unaccessableUserId = 2;
  const params = {
    searchTitle: '',
    searchCode: '',
  };

  it('it should return a positive number for accessibleCustomerId',
    async () => {
      const result = await db.Customer
        .countForSupplier(accessibleUserId, params);
      expect(result)
        .toBeTruthy();
    });

  it('it should return 0 for unaccessableCustomerId', async () => {
    const result = await db.Customer
      .countForSupplier(unaccessableUserId, params);
    expect(result)
      .toBeFalsy();
  });
});
