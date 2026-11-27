"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "~@/components/ui/field";
import { Input } from "~@/components/ui/input";
import { Textarea } from "~@/components/ui/textarea";

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: ReactNode;
  max?: number;
  isLabelHidden?: boolean;
  fieldClassName?: string;
};

function Count({ length, max }: { length: number; max: number }) {
  if (length < max * 0.7) return null;
  return <span className={length >= max ? "text-destructive" : undefined}>{` ${length}/${max}`}</span>;
}

type InputFieldProps<T extends FieldValues> = FormFieldProps<T> & Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onValueChange" | "maxLength">;

export function InputField<T extends FieldValues>({ control, name, label, description, max, isLabelHidden, fieldClassName, ...props }: InputFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field name={name} invalid={fieldState.invalid || undefined} className={fieldClassName}>
          <FieldLabel className={isLabelHidden ? "sr-only" : undefined}>
            {label}
            {max ? <Count length={String(field.value ?? "").length} max={max} /> : null}
          </FieldLabel>
          <Input ref={field.ref} value={field.value ?? ""} onValueChange={field.onChange} onBlur={field.onBlur} maxLength={max} {...props} />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError match>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
}

type TextareaFieldProps<T extends FieldValues> = FormFieldProps<T> & Omit<ComponentProps<typeof Textarea>, "name" | "value" | "defaultValue" | "onValueChange" | "maxLength">;

export function TextareaField<T extends FieldValues>({ control, name, label, description, max, isLabelHidden, fieldClassName, ...props }: TextareaFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field name={name} invalid={fieldState.invalid || undefined} className={fieldClassName}>
          <FieldLabel className={isLabelHidden ? "sr-only" : undefined}>
            {label}
            {max ? <Count length={String(field.value ?? "").length} max={max} /> : null}
          </FieldLabel>
          <Textarea ref={field.ref} value={field.value ?? ""} onValueChange={field.onChange} onBlur={field.onBlur} maxLength={max} {...props} />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError match>{fieldState.error?.message}</FieldError>
        </Field>
      )}
    />
  );
}
