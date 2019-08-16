import Sequelize, { Model } from 'sequelize',

class Feed extends Model {
  static init(sequelize) {
    super.init(
      {
        place: Sequelize.STRING,
        description: Sequelize.STRING,
        hashtags: Sequelize.STRING,
        image: Sequelize.STRING,
        likes: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user'});
  }
}

export default Feed;
