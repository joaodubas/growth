function to_fixed(value, decimal) {
decimal = !isNaN(decimal) ? decimal : 4;
return Number(Number.prototype.toFixed.call(value, decimal));
}

module.exports = {
  'to_fixed': to_fixed
};
