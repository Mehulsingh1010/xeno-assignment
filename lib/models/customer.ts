import type { ObjectId } from "mongodb"

export interface Customer {
  _id?: ObjectId
  name: string
  email: string
  phone?: string
  totalSpends: number
  visits: number
  lastVisit: Date
  createdAt: Date
  updatedAt: Date
}

export interface CustomerInput {
  name: string
  email: string
  phone?: string
  totalSpends: number
  visits: number
  lastVisit: Date
}

// MongoDB validation schema for customers collection
export const customerValidationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "totalSpends", "visits", "lastVisit", "createdAt", "updatedAt"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      name: {
        bsonType: "string",
        minLength: 1,
        maxLength: 100,
        description: "Customer name is required and must be between 1-100 characters",
      },
      email: {
        bsonType: "string",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description: "Valid email address is required",
      },
      phone: {
        bsonType: ["string", "null"],
        maxLength: 20,
        description: "Phone number must be less than 20 characters",
      },
      totalSpends: {
        bsonType: "number",
        minimum: 0,
        description: "Total spends must be a non-negative number",
      },
      visits: {
        bsonType: "int",
        minimum: 0,
        description: "Visits must be a non-negative integer",
      },
      lastVisit: {
        bsonType: "date",
        description: "Last visit date is required",
      },
      createdAt: {
        bsonType: "date",
        description: "Created date is required",
      },
      updatedAt: {
        bsonType: "date",
        description: "Updated date is required",
      },
    },
  },
}
