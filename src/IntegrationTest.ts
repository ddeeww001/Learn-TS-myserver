import { calculate } from "./Calculator.js";

const result = calculate(6, 3);

if (result.sum === 9) {
  console.log("Integration Case 1 passed: sum");
} else {
  console.error("Integration Case 1 failed: expected 9, got ", result.sum);
  process.exit(1);
}

if (result.product === 18) {
  console.log("Integration Case 2 passed: product");
} else {
  console.error("Integration Case 2 failed: expected 18, got ", result.product);
  process.exit(1);
}

if (result.quotient === 2) {
  console.log("Integration Case 3 passed: quotient");
} else {
  console.error("Integration Case 3 failed: expected 2, got ", result.quotient);
  process.exit(1);
}
