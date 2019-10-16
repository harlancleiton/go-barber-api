import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcrypt';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
      }
    });

    return this;
  }
}

export default User;
