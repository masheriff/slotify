// types/form.types.ts - Form-related interfaces and types

import { ReactNode } from 'react';

// Form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'textarea' | 'checkbox' | 'number';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  disabled?: boolean;
  hidden?: boolean;
}

// Form submission handlers
export interface FormHandlers<T = any> {
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (result?: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

// Form state management
export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Form configuration
export interface FormConfig<T = any> {
  fields: FormFieldConfig[];
  handlers: FormHandlers<T>;
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSuccess?: boolean;
  showResetButton?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  className?: string;
}

// Dynamic form props
export interface DynamicFormProps<T = any> {
  config: FormConfig<T>;
  children?: ReactNode;
  className?: string;
}

// Form section for complex forms
export interface FormSection {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Multi-step form
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  validation?: (data: any) => Record<string, string> | undefined;
}

export interface MultiStepFormProps<T = any> {
  steps: FormStep[];
  handlers: FormHandlers<T>;
  initialValues?: Partial<T>;
  currentStep?: string;
  onStepChange?: (stepId: string) => void;
  showProgress?: boolean;
  allowStepSkipping?: boolean;
  className?: string;
}