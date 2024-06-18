import { isNumber } from "./isNumber"


describe('is Number utils', () => {
  it('Its a number', () => {
    [0, 1, 2, -1, 1.345e17].map((n) => {
      expect(isNumber(n)).toEqual(true);
    })
  })

  it('Its not a number', () => {
    [false, true, NaN, [], {}, '1a'].map((n) => {
      // @ts-expect-error -> error
      expect(isNumber(n)).toEqual(false);
    })
  })

})