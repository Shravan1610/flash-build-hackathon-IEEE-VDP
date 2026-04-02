"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormFieldType } from "@/types/supabase";

interface EventOption {
  id: string;
  label: string;
}

interface BuilderField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: FormFieldType;
  placeholder: string;
  helpText: string;
  isRequired: boolean;
  optionsText: string;
}

interface AdminFormBuilderProps {
  events: EventOption[];
  action: (formData: FormData) => void | Promise<void>;
}

const fieldTypeOptions: Array<{ value: FormFieldType; label: string }> = [
  { value: "text", label: "Short text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "textarea", label: "Paragraph" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
];

function createField(): BuilderField {
  return {
    id: crypto.randomUUID(),
    fieldKey: "",
    label: "",
    fieldType: "text",
    placeholder: "",
    helpText: "",
    isRequired: false,
    optionsText: "",
  };
}

export function AdminFormBuilder({ events, action }: AdminFormBuilderProps) {
  const [fields, setFields] = React.useState<BuilderField[]>([
    {
      ...createField(),
      fieldKey: "full_name",
      label: "Full name",
      isRequired: true,
    },
    {
      ...createField(),
      fieldKey: "email",
      label: "Email address",
      fieldType: "email",
      isRequired: true,
    },
  ]);

  function updateField(id: string, patch: Partial<BuilderField>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  }

  function removeField(id: string) {
    setFields((current) => current.filter((field) => field.id !== id));
  }

  function moveField(id: string, direction: -1 | 1) {
    setFields((current) => {
      const index = current.findIndex((field) => field.id === id);

      if (index < 0) {
        return current;
      }

      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [field] = next.splice(index, 1);
      next.splice(targetIndex, 0, field);
      return next;
    });
  }

  const serializedFields = JSON.stringify(
    fields.map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label,
      fieldType: field.fieldType,
      placeholder: field.placeholder,
      helpText: field.helpText,
      isRequired: field.isRequired,
      options: field.optionsText
        .split("\n")
        .map((option) => option.trim())
        .filter(Boolean)
        .map((option) => ({ label: option, value: option })),
      sortOrder: fields.findIndex((item) => item.id === field.id),
    })),
  );

  return (
    <form action={action} className="space-y-6">
      <input name="fieldState" type="hidden" value={serializedFields} />

      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="form-title">Form title</Label>
            <Input id="form-title" name="title" placeholder="Workshop registration" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-slug">Form slug</Label>
            <Input id="form-slug" name="slug" placeholder="workshop-registration" required />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              name="description"
              placeholder="Tell attendees what this form is for."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-id">Linked event</Label>
            <select
              className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
              id="event-id"
              name="eventId"
            >
              <option value="">Standalone form</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-status">Publish state</Label>
            <select
              className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="draft"
              id="form-status"
              name="status"
            >
              <option value="draft">Draft</option>
              <option value="published">Publish immediately</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="success-message">Success message</Label>
            <Input
              defaultValue="Your response has been recorded."
              id="success-message"
              name="successMessage"
            />
          </div>
          <div className="flex items-center justify-between rounded-[24px] border border-border/70 bg-muted/35 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Require login before submitting</p>
              <p className="text-xs text-muted-foreground">
                Leave off to accept anonymous registrations.
              </p>
            </div>
            <input className="h-4 w-4 accent-[var(--primary)]" name="requiresAuthentication" type="checkbox" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Fields</h3>
            <p className="text-sm text-muted-foreground">
              Build the public form structure and publish it as a reusable in-app route.
            </p>
          </div>
          <Button
            onClick={() => setFields((current) => [...current, createField()])}
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add field
          </Button>
        </div>

        <div className="grid gap-4">
          {fields.map((field, index) => {
            const supportsOptions =
              field.fieldType === "select" ||
              field.fieldType === "radio" ||
              field.fieldType === "checkbox";

            return (
              <Card key={field.id}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                      Field {index + 1}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => moveField(field.id, -1)} size="sm" type="button" variant="outline">
                        Up
                      </Button>
                      <Button onClick={() => moveField(field.id, 1)} size="sm" type="button" variant="outline">
                        Down
                      </Button>
                      <Button
                        disabled={fields.length === 1}
                        onClick={() => removeField(field.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        onChange={(event) => updateField(field.id, { label: event.target.value })}
                        value={field.label}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field key</Label>
                      <Input
                        onChange={(event) => updateField(field.id, { fieldKey: event.target.value })}
                        value={field.fieldKey}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field type</Label>
                      <select
                        className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                        onChange={(event) =>
                          updateField(field.id, {
                            fieldType: event.target.value as FormFieldType,
                          })
                        }
                        value={field.fieldType}
                      >
                        {fieldTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                        value={field.placeholder}
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label>Help text</Label>
                      <Textarea
                        className="min-h-20"
                        onChange={(event) => updateField(field.id, { helpText: event.target.value })}
                        value={field.helpText}
                      />
                    </div>
                    {supportsOptions ? (
                      <div className="space-y-2 lg:col-span-2">
                        <Label>Options</Label>
                        <Textarea
                          className="min-h-24"
                          onChange={(event) => updateField(field.id, { optionsText: event.target.value })}
                          placeholder={"One option per line"}
                          value={field.optionsText}
                        />
                      </div>
                    ) : null}
                  </div>

                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      checked={field.isRequired}
                      className="h-4 w-4 accent-[var(--primary)]"
                      onChange={(event) => updateField(field.id, { isRequired: event.target.checked })}
                      type="checkbox"
                    />
                    Required field
                  </label>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save form</Button>
      </div>
    </form>
  );
}
