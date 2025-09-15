"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Users } from "lucide-react"
import type { AudienceRule } from "@/lib/models/campaign"

interface RuleBuilderProps {
  rules: AudienceRule[]
  onRulesChange: (rules: AudienceRule[]) => void
  onPreview: () => void
  audienceSize: number
  isPreviewLoading: boolean
}

const fieldOptions = [
  { value: "totalSpends", label: "Total Spends", type: "number" },
  { value: "visits", label: "Number of Visits", type: "number" },
  { value: "lastVisit", label: "Last Visit", type: "date" },
  { value: "name", label: "Customer Name", type: "string" },
  { value: "email", label: "Email", type: "string" },
]

const operatorOptions = {
  number: [
    { value: "gt", label: "Greater than" },
    { value: "gte", label: "Greater than or equal" },
    { value: "lt", label: "Less than" },
    { value: "lte", label: "Less than or equal" },
    { value: "eq", label: "Equal to" },
  ],
  string: [
    { value: "eq", label: "Equal to" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
  ],
  date: [
    { value: "gt", label: "After" },
    { value: "lt", label: "Before" },
    { value: "eq", label: "On" },
  ],
}

export function RuleBuilder({ rules, onRulesChange, onPreview, audienceSize, isPreviewLoading }: RuleBuilderProps) {
  const addRule = () => {
    const newRule: AudienceRule = {
      field: "totalSpends",
      operator: "gt",
      value: 0,
      logicalOperator: rules.length > 0 ? "AND" : undefined,
    }
    onRulesChange([...rules, newRule])
  }

  const updateRule = (index: number, updates: Partial<AudienceRule>) => {
    const updatedRules = rules.map((rule, i) => (i === index ? { ...rule, ...updates } : rule))
    onRulesChange(updatedRules)
  }

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index)
    // Remove logical operator from first rule if it exists
    if (updatedRules.length > 0 && updatedRules[0].logicalOperator) {
      updatedRules[0] = { ...updatedRules[0], logicalOperator: undefined }
    }
    onRulesChange(updatedRules)
  }

  const getFieldType = (fieldValue: string) => {
    return fieldOptions.find((field) => field.value === fieldValue)?.type || "string"
  }

  const formatValue = (rule: AudienceRule) => {
    if (rule.field === "lastVisit" && typeof rule.value === "string") {
      return new Date(rule.value).toLocaleDateString()
    }
    if (rule.field === "totalSpends" && typeof rule.value === "number") {
      return `₹${rule.value.toLocaleString()}`
    }
    return rule.value.toString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Audience Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rules */}
        <div className="space-y-4">
          {rules.map((rule, index) => {
            const fieldType = getFieldType(rule.field)
            const availableOperators = operatorOptions[fieldType as keyof typeof operatorOptions] || []

            return (
              <div key={index} className="space-y-3">
                {/* Logical Operator */}
                {index > 0 && (
                  <div className="flex justify-center">
                    <Select
                      value={rule.logicalOperator || "AND"}
                      onValueChange={(value) => updateRule(index, { logicalOperator: value as "AND" | "OR" })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rule */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Field */}
                    <div>
                      <Label className="text-xs text-gray-500">Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => {
                          const newFieldType = getFieldType(value)
                          const defaultOperator = operatorOptions[newFieldType as keyof typeof operatorOptions][0].value
                          const defaultValue =
                            newFieldType === "number"
                              ? 0
                              : newFieldType === "date"
                                ? new Date().toISOString().split("T")[0]
                                : ""
                          updateRule(index, {
                            field: value,
                            operator: defaultOperator as any,
                            value: defaultValue,
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator */}
                    <div>
                      <Label className="text-xs text-gray-500">Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(index, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value */}
                    <div>
                      <Label className="text-xs text-gray-500">Value</Label>
                      {fieldType === "number" ? (
                        <Input
                          type="number"
                          value={rule.value as number}
                          onChange={(e) => updateRule(index, { value: Number.parseFloat(e.target.value) || 0 })}
                        />
                      ) : fieldType === "date" ? (
                        <Input
                          type="date"
                          value={typeof rule.value === "string" ? rule.value.split("T")[0] : ""}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                        />
                      ) : (
                        <Input
                          type="text"
                          value={rule.value as string}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                        />
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Rule Button */}
        <Button type="button" variant="outline" onClick={addRule} className="w-full bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>

        {/* Rule Summary */}
        {rules.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Rule Summary:</h4>
            <div className="text-sm text-blue-800">
              {rules.map((rule, index) => (
                <span key={index}>
                  {index > 0 && (
                    <Badge variant="secondary" className="mx-2">
                      {rule.logicalOperator}
                    </Badge>
                  )}
                  <span className="font-medium">{fieldOptions.find((f) => f.value === rule.field)?.label}</span>{" "}
                  <span>
                    {
                      operatorOptions[getFieldType(rule.field) as keyof typeof operatorOptions]?.find(
                        (op) => op.value === rule.operator,
                      )?.label
                    }
                  </span>{" "}
                  <span className="font-medium">{formatValue(rule)}</span>
                  {index < rules.length - 1 && " "}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview Button and Results */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={onPreview}
            disabled={rules.length === 0 || isPreviewLoading}
            className="w-full"
          >
            {isPreviewLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating...
              </div>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Preview Audience Size
              </>
            )}
          </Button>

          {audienceSize >= 0 && !isPreviewLoading && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800">
                <span className="font-bold text-2xl">{audienceSize}</span> customers match your criteria
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
