const Sequelize = require('sequelize');
const instance = require('../model');

let User = instance.define('users', {
    ZJUid: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    course: {
        type: Sequelize.STRING(10000)
    }
}, {freezeTableName: true});

// User.sync({force: true});

//Functions or Methods
const register = (ZJUid) => {
    return User.create({ZJUid: ZJUid});
};

const finduserByZJUid = (ZJUid) => {
    return User.findAll({
        where: {
            ZJUid: ZJUid
        }
    });
}

const saveCourse = (ZJUid, course) => {
    return User.update({
        course: course
    }, {
        where: {
            ZJUid: ZJUid
        }
    });
};

const getCourse = (ZJUid) => {
    return User.findAll({
        where: {
            ZJUid: ZJUid
        }
    });
};

module.exports = {
    register,
    finduserByZJUid,
    getCourse,
    saveCourse
}