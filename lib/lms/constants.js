var unities = {
  KG: 'kg',
  CM: 'cm',
  MM: 'mm',
  KGM: 'kg/m^2',
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year'
};

var measures = {
  AGE: 'age',
  LENGTH: 'length',
  HEIGHT: 'height',
  WEIGHT: 'weight',
  BMI: 'bmi',
  CIRCUNFERENCE: 'circunference',
  SKINFOLD: 'skinfold'
};

var constants = {
  WEIGHT: {
    measure: measures.WEIGHT,
    unity: unities.KG
  },
  LENGTH: {
    measure: measures.LENGTH,
    unity: unities.CM
  },
  HEIGHT: {
    measure: measures.HEIGHT,
    unity: unities.CM
  },
  BMI: {
    measure: measures.BMI,
    unity: unities.KGM
  },
  CIRCUNFERENCE: {
    measure: measures.CIRCUNFERENCE,
    unity: unities.CM
  },
  SKINFOLD: {
    measure: measures.SKINFOLD,
    unity: unities.MM
  },
  AGEDAY: {
    measure: measures.AGE,
    unity: unities.DAY
  },
  AGEMONTH: {
    measure: measures.AGE,
    unity: unities.MONTH
  }
}

module.exports = constants;
