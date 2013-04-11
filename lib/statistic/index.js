function erfc(x) {
  /**
   * Return the complementary error function (erfc(x)), based on code show in
   * Numerical recipes in C <http://apps.nrbook.com/c/index.html> and
   * Numerical recipes <http://apps.nrbook.com/openaccess/index.html>.
   * @param x {Number}: any given z score.
   * @return {Number} the complentary error value.
   */
  var z = Math.abs(x),
      t = 1 / (1 + z / 2),
      r = t * Math.exp(-z * z - 1.26551223 +
          t * (1.00002368 +
          t * (0.37409196 +
          t * (0.09678418 +
          t * (-0.18628806 +
          t * (0.27886807 +
          t * (-1.13520398 +
          t * (1.48851587 +
          t * (-0.82215223 +
          t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

function ierfc(x) {
  /**
   * Return the inverse of complementary error function (erfc(x)), based on
   * code show in:
   * Numerical recipes <http://apps.nrbook.com/openaccess/index.html>.
   * @param x {Number}: any given value.
   * @return {Number} the inverse complentary error value.
   */
  if (x <= 0 || x >= 2) {
    return (x >= 2 ? -1 : 1) * 100;
  }

  var xx = x < 1 ? x : 2 - x,
      t = Math.sqrt(-2 * Math.log(xx / 2)),
      r = -0.70711 * ((2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t),
      j = 0, err = 0;

  for (j = 0; j < 2; j += 1) {
    err = erfc(r) - xx;
    r += err / (1.12837916709551257 * Math.exp(-Math.pow(r, 2)) - r * err);
  }

  return x < 1 ? r : -r;
}

function pdf(z) {
  /**
   * Return the probability distribution function for the standard normal
   * distribution.
   * @param z {Number}: any given z score.
   * @return {Number} the centile represented by the z score.
   */
  var d = 1 / Math.sqrt(2 * Math.PI),
      t = Math.exp(-0.5 * Math.pow(z, 2));
  return d * t;
}

function cdf(z) {
  /**
   * Return the cumulative distribution function for the standard normal
   * distribution.
   * @param z {Number}: any given z score.
   * @return {Number}: the cumulative centile represented by the z score.
   */
  return 0.5 * erfc(-z / Math.sqrt(2));
}

function icdf(c) {
  /**
   * Return the inverse cumulative distribution function for the standard
   * normal distribution.
   * @param c {Number}: any given centile value.
   * @return {Number}: the cumulative z score represented by the centile.
   */
  return -1 * Math.sqrt(2) * ierfc(2 * c);
}

module.exports = {
  pdf: pdf,
  cdf: cdf,
  icdf: icdf
};
