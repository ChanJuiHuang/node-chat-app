const moment = require('moment');

const generateMessage = (from, text) => {
    return {
        from,
        text,
        createAt: moment().valueOf()
    };
};

const generateLocationMessage = (from, lantitude, longtitude) => {
    return {
        from,
        url: `https://www.google.com.tw/maps?q=${lantitude},${longtitude}`,
        createAt: moment().valueOf()
    };
};

const isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
};

module.exports = {
    generateMessage,
    generateLocationMessage,
    isRealString
};