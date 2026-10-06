import { utils } from "./Utils.js";

export function calculate(a: number, b: number) {
  
  return {
    sum: utils.add(a, b),
    product: utils.multiply(a, b),
    quotient: utils.divide(a, b),
  };
}
