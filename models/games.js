'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class games extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  games.init({
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    direction: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'games',
  });
  return games;
};