module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    sub: DataTypes.STRING,
  }, {
    tableName: 'users',
  });

  User.associate = ({
    Customer, CustomerUser, Supplier,
    SupplierUser, Note,
  }) => {
    User.belongsToMany(Customer, {
      through: CustomerUser,
      foreignKey: 'userId',
      as: 'customers',
    });
    User.belongsToMany(Supplier, {
      through: SupplierUser,
      as: 'suppliers',
      foreignKey: 'userId',
    });
    User.hasMany(Note, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'notes',
    });
  };

  const ORDER_FIELDS = ['id', 'name', 'email'];

  User.list = async (params, db) => {
    const { searchSub, searchName, searchEmail } = params;
    let { sortBy, descending } = params;
    const whereClause = {};
    const orderClause = [];

    if (searchSub) {
      whereClause.code = searchSub;
    }
    if (searchName) {
      whereClause.name = { [db.sequelize.Op.iLike]: `%${searchName}%` };
    }
    if (searchEmail) {
      whereClause.email = { [db.sequelize.Op.iLike]: `%${searchEmail}%` };
    }
    if (sortBy && descending) {
      sortBy = ORDER_FIELDS.indexOf(sortBy) !== -1 ? sortBy : null;
      descending = String(descending).toLowerCase() === 'true' ? 'DESC' : 'ASC';
      orderClause.push([sortBy, descending]);
    }

    const users = User.findAll({
      include: [{
        model: db.Supplier,
        as: 'suppliers',
        attributes: ['id', 'code', 'title'],
      }],
      where: whereClause,
      order: orderClause,
      // offset: 0,
      // limit: 20,
    });

    return users;
  };

  return User;
};
