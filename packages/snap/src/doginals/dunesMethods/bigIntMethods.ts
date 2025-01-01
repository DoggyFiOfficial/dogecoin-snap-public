/**
 * Converts a decimal number to a BigInt representation.
 *
 * @param decimalStr - String representation of a decimal number.
 * @param decimalPlaces - Number of decimal places in the number.
 * @returns BigInt representation of the decimal number.
 */
export function decimalToBigInt(
  decimalStr: string,
  decimalPlaces: number,
): bigint {
  // Check if the string contains a decimal point
  const parts = decimalStr.split('.');
  const integerPart = parts[0]; // part before the decimal
  let fractionalPart = parts[1] || ''; // part after the decimal (if exists)

  // If there are no decimals and only integer part
  if (fractionalPart === '') {
    fractionalPart = '0'.repeat(decimalPlaces); // Handle the integer case
  }

  // If the fractional part is shorter than the required decimal places, pad it with zeros
  if (fractionalPart.length < decimalPlaces) {
    fractionalPart = fractionalPart.padEnd(decimalPlaces, '0');
  } else if (fractionalPart.length > decimalPlaces) {
    // If it's longer, truncate it to fit the desired decimal places
    fractionalPart = fractionalPart.slice(0, decimalPlaces);
  }

  // Combine the integer and fractional parts into one large integer string
  const combinedStr = integerPart + fractionalPart;

  // Convert the combined string to a BigInt, removing any leading zeros
  return BigInt(combinedStr);
}

/**
 * Converts a BigInt representation of a decimal number to a string.
 *
 * @param bigIntAsStr - The BigInt representation as a string.
 * @param decimals - The number of decimals it should have.
 * @returns The decimal number as a string.
 */
export function bigIntToDecimalString(
  bigIntAsStr: string,
  decimals: number,
): string {
  // If the number of digits in bigInt is less than the decimal places, pad with leading zeros
  if (bigIntAsStr.length <= decimals) {
    // Add leading zeros to fractional part and prefix with "0."
    const paddedFractional = bigIntAsStr.padStart(decimals, '0');
    return `0.${paddedFractional}`;
  }

  // Otherwise, insert the decimal point at the correct position
  const integerPart = bigIntAsStr.slice(0, -decimals);
  const fractionalPart = bigIntAsStr.slice(-decimals);

  // If integer part is empty (in cases like 112n for 8 decimals), set it to 0
  return `${integerPart || '0'}.${fractionalPart}`;
}
