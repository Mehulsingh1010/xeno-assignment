import type { ObjectId } from "mongodb"

export interface Campaign {
  _id?: ObjectId
  name: string
  audienceRules: AudienceRule[]
  message: string
  audienceSize: number
  status: "draft" | "active" | "completed" | "paused"
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AudienceRule {
  field: string
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "contains" | "not_contains"
  value: string | number | Date
  logicalOperator?: "AND" | "OR"
}

export interface CommunicationLog {
  _id?: ObjectId
  campaignId: ObjectId
  customerId: ObjectId
  customerName: string
  customerEmail: string
  message: string
  status: "SENT" | "FAILED" | "PENDING"
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export const campaignValidationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "audienceRules", "message", "audienceSize", "status", "createdBy", "createdAt", "updatedAt"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      name: {
        bsonType: "string",
        minLength: 1,
        maxLength: 200,
        description: "Campaign name is required",
      },
      audienceRules: {
        bsonType: "array",
        minItems: 1,
        description: "At least one audience rule is required",
      },
      message: {
        bsonType: "string",
        minLength: 1,
        maxLength: 1000,
        description: "Message is required",
      },
      audienceSize: {
        bsonType: "int",
        minimum: 0,
        description: "Audience size must be non-negative",
      },
      status: {
        bsonType: "string",
        enum: ["draft", "active", "completed", "paused"],
        description: "Status must be valid",
      },
      createdBy: {
        bsonType: "string",
        minLength: 1,
        description: "Created by is required",
      },
      createdAt: {
        bsonType: "date",
      },
      updatedAt: {
        bsonType: "date",
      },
    },
  },
}

export const communicationLogValidationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "campaignId",
      "customerId",
      "customerName",
      "customerEmail",
      "message",
      "status",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      campaignId: {
        bsonType: "objectId",
      },
      customerId: {
        bsonType: "objectId",
      },
      customerName: {
        bsonType: "string",
        minLength: 1,
      },
      customerEmail: {
        bsonType: "string",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      },
      message: {
        bsonType: "string",
        minLength: 1,
      },
      status: {
        bsonType: "string",
        enum: ["SENT", "FAILED", "PENDING"],
      },
      sentAt: {
        bsonType: ["date", "null"],
      },
      createdAt: {
        bsonType: "date",
      },
      updatedAt: {
        bsonType: "date",
      },
    },
  },
}
