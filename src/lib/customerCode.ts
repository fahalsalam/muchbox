/**
 * Customer Code Generator Utility
 * Generates unique customer codes based on customer type and existing customers
 */

export type CustomerType = 'individual' | 'company' | 'agent'

export interface CustomerCodePrefix {
  individual: 'IND'
  company: 'COM'
  agent: 'AGT'
}

const CUSTOMER_PREFIXES: CustomerCodePrefix = {
  individual: 'IND',
  company: 'COM',
  agent: 'AGT',
}

/**
 * Generates the next customer code for a given customer type
 * @param customerType - The type of customer (individual, company, agent)
 * @param existingCodes - Array of existing customer codes to avoid duplicates
 * @returns The next available customer code (e.g., "IND-001", "COM-002")
 */
export function generateCustomerCode(
  customerType: CustomerType,
  existingCodes: string[] = []
): string {
  const prefix = CUSTOMER_PREFIXES[customerType]
  
  // Filter existing codes for this customer type
  const typeSpecificCodes = existingCodes.filter(code => 
    code.startsWith(`${prefix}-`)
  )
  
  // Extract numbers from existing codes and find the highest
  const numbers = typeSpecificCodes.map(code => {
    const numberPart = code.split('-')[1]
    return parseInt(numberPart, 10) || 0
  })
  
  // Find the next available number
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  
  // Format with leading zeros (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0')
  
  return `${prefix}-${formattedNumber}`
}

/**
 * Validates if a customer code follows the correct format
 * @param code - The customer code to validate
 * @returns True if the code is valid, false otherwise
 */
export function validateCustomerCode(code: string): boolean {
  const pattern = /^(IND|COM|AGT)-\d{3}$/
  return pattern.test(code)
}

/**
 * Extracts customer type from customer code
 * @param code - The customer code
 * @returns The customer type or null if invalid
 */
export function getCustomerTypeFromCode(code: string): CustomerType | null {
  const prefix = code.split('-')[0]
  
  switch (prefix) {
    case 'IND':
      return 'individual'
    case 'COM':
      return 'company'
    case 'AGT':
      return 'agent'
    default:
      return null
  }
}
