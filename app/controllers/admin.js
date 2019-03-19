const _ = require('lodash');
const { Router } = require('express');
const db = require('../models');
const { ApiError, E } = require('../helpers/server-error');
const middlewares = require('../middlewares');

const router = Router();

/* Create supplier */
router.post(
  '/admin/supplier',
  ...middlewares('createAny', 'supplier'),
  async (req, res, next) => {
    try {
      const { code, title } = req.body;

      if (!code) {
        return next(new ApiError(E.NO_SUPPLIER_CODE));
      }

      const supplier = db.Supplier.create({ code, title });

      return res.json({ supplier });
    } catch (err) {
      return next(err);
    }
  },
);

/* Update Supplier */
router.post(
  '/admin/supplier/:supplierId',
  ...middlewares('updateAny', 'supplier'),
  async (req, res, next) => {
    try {
      const { supplierId } = req.params;
      let supplier = await db.Supplier.findById(supplierId);
      if (!supplier) {
        return next(new ApiError(E.SUPPLIER_NOT_FOUND));
      }

      const { title, code } = req.body;
      supplier = await supplier.update({ title, code });

      return res.json({ supplier });
    } catch (err) {
      return next(err);
    }
  },
);

/* Delete supplier */
router.delete(
  '/admin/supplier',
  ...middlewares('deleteAny', 'supplier'),
  async (req, res, next) => {
    try {
      const { code } = req.body;

      const supplier = await db.Supplier.findOne({ where: { code } });

      if (!supplier) {
        return next(new ApiError(E.SUPPLIER_NOT_FOUND));
      }

      await supplier.destroy();

      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

/* List suppliers */
router.get(
  '/admin/supplier',
  ...middlewares('readAny', 'supplier'),
  async (req, res, next) => {
    try {
      const suppliers = await db.Supplier.list(req.query, db);
      return res.json({ suppliers });
    } catch (err) {
      return next(err);
    }
  },
);

/* Create user */
router.post(
  '/admin/user',
  ...middlewares('createAny', 'user'),
  async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;

      const response = await cognito.createUser(email, phone, name);
      const user = await db.User.create({
        sub: response.User.Username,
        name,
        email,
        phone,
      });
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  },
);

/* Update users */
router.put(
  '/admin/user',
  ...middlewares('updateAny', 'user'),
  async (req, res, next) => {
    try {
      const {
        sub, email, phone, name, supplierCodes,
      } = req.body;

      const user = await db.User.findOne({
        include: [{
          model: db.Supplier,
          as: 'suppliers',
          attributes: ['id', 'code', 'title'],
        }],
        where: { sub },
      });
      if (!user) return next(new ApiError(E.USER_NOT_FOUND));
      await user.update({ email, phone, name });
      await cognito.updateUser(sub, email, phone, name);

      const associateSuppliers = supplierCodes
        .filter(code => !user.suppliers
          .find(supplier => supplier.code === code));

      const disassociateSuppliers = user.suppliers
        .filter(supplier => !supplierCodes.includes(supplier.code));

      await Promise.all(associateSuppliers.map(async (code) => {
        const supplier = await db.Supplier.findOne({ where: { code } });
        await db.SupplierUser.create({
          userId: user.id,
          supplierId: supplier.id,
        });
      }));

      await Promise.all(disassociateSuppliers.map(async (supplier) => {
        await db.SupplierUser.destroy({
          where: {
            userId: user.id,
            supplierId: supplier.id,
          },
        });
      }));

      const updatedUser = await db.User.findOne({
        include: [{
          model: db.Supplier,
          as: 'suppliers',
          attributes: ['id', 'code', 'title'],
        }],
        where: { sub },
      });

      return res.json({ user: updatedUser });
    } catch (err) {
      return next(err);
    }
  },
);

/* Delete user */
router.delete(
  '/admin/user',
  ...middlewares('deleteAny', 'user'),
  async (req, res, next) => {
    try {
      const { sub } = req.body;

      const user = await db.User.findOne({ where: { sub } });
      if (!user) return next(new ApiError(E.USER_NOT_FOUND));

      await cognito.deleteUser(sub);
      await user.destroy();

      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

/* List users */
router.get(
  '/admin/user',
  ...middlewares('readAny', 'user'),
  async (req, res, next) => {
    try {
      const users = await db.User.list(req.query, db);
      return res.json({ users });
    } catch (err) {
      return next(err);
    }
  },
);


/* Create supplierUser */
router.post(
  '/admin/supplier-user',
  ...middlewares('createAny', 'supplier-user'),
  async (req, res, next) => {
    try {
      const { userSub, supplierCode } = req.body;

      const supplier = await db.Supplier.findOne({
        where: { code: supplierCode },
      });
      if (!supplier) return next(new ApiError(E.SUPPLIER_NOT_FOUND));

      const user = await db.User.findOne({
        where: { sub: userSub },
      });
      if (!user) return next(new ApiError(E.USER_NOT_FOUND));

      const supplierUser = await db.SupplierUser.create({
        userId: user.id,
        supplierId: supplier.id,
      });

      return res.json({ supplierUser });
    } catch (err) {
      return next(err);
    }
  },
);

/* Delete supplierUser */
router.delete(
  '/admin/supplier-user',
  ...middlewares('deleteAny', 'supplier-user'),
  async (req, res, next) => {
    try {
      const { userSub, supplierCode } = req.body;

      const supplierUser = await db.SupplierUser.findOne({
        include: [{
          model: db.User,
          as: 'users',
          where: {
            sub: userSub,
          },
        }, {
          model: db.Supplier,
          as: 'suppliers',
          where: {
            code: supplierCode,
          },
        }],
      });

      if (!supplierUser) return next(new ApiError(E.USER_NOT_FOUND));
      await supplierUser.destroy();
      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

/* List supplierUsers */
router.get(
  '/admin/supplier-users',
  ...middlewares('readAny', 'supplier-user'),
  async (req, res, next) => {
    try {
      const supplierUsers = await db.SupplierUser.list(req.query, db);
      return res.json({ supplierUsers });
    } catch (err) {
      return next(err);
    }
  },
);

/* Update Customer */
router.put(
  '/admin/customer/:customerId',
  ...middlewares('updateAny', 'customer'),
  async (req, res, next) => {
    try {
      const { customerId } = req.params;
      const customer = await db.Customer.findById(customerId);
      if (!customer) {
        return next(new ApiError(E.CUSTOMER_NOT_FOUND));
      }

      const {
        code,
        title,
        currency,
        month_value: monthValue,
        threatened_value: threatenedValue,
        growth,
        address,
        last_delivered: lastDelivered,
      } = req.body;
      let { supplier_id: supplierId } = req.body;

      if (_.isUndefined(supplierId)) {
        ({ supplierId } = customer);
      }

      await customer.update({
        code,
        title,
        currency,
        monthValue,
        threatenedValue,
        growth,
        address,
        lastDelivered,
      });

      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

/* Update Product */
router.put(
  '/admin/product/:productId',
  ...middlewares('updateAny', 'product'),
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const product = await db.Product.findById(productId);
      if (!product) {
        return next(new ApiError(E.PRODUCT_NOT_FOUND));
      }

      const {
        code,
        title,
        list_price: listPrice,
      } = req.body;
      let { supplier_id: supplierId } = req.body;
      if (_.isUndefined(supplierId)) {
        ({ supplierId } = product);
      }

      await product.update({
        code,
        title,
        listPrice,
        supplierId,
      });

      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

/* Update Customer Product */
router.put(
  '/admin/customer-product/:customerProductId',
  ...middlewares('updateAny', 'customer-product'),
  async (req, res, next) => {
    try {
      const { customerProductId } = req.params;
      const customerProduct = await db.CustomerProduct
        .findById(customerProductId);
      if (!customerProduct) {
        return next(new ApiError(E.CUSTOMER_PRODUCT_NOT_FOUND));
      }

      const {
        last_delivered: lastDelivered,
        period,
        overdue,
        month_value: monthValue,
        growth,
        margin,
        price,
        active,
      } = req.body;
      let { supplier_id: supplierId } = req.body;

      if (_.isUndefined(supplierId)) {
        ({ supplierId } = customerProduct);
      }

      await customerProduct.update({
        lastDelivered,
        period,
        overdue,
        monthValue,
        growth,
        margin,
        price,
        active,
      });

      return res.sendStatus(200);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
