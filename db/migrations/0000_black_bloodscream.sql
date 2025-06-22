CREATE TYPE "public"."appointment_priority" AS ENUM('routine', 'urgent', 'stat', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('created', 'confirmed', 'rescheduled', 'cancelled', 'converted_to_booking', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive', 'pending');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('admin', 'client');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled', 'ready_for_billing', 'billing_complete');--> statement-breakpoint
CREATE TYPE "public"."procedure_status" AS ENUM('not_started', 'in_progress', 'completed', 'incomplete', 'cancelled', 'needs_repeat');--> statement-breakpoint
CREATE TYPE "public"."charge_entry_status" AS ENUM('pending_entry', 'in_progress', 'completed', 'submitted_to_billing', 'billed', 'partially_paid', 'paid_in_full', 'denied', 'appeal_required', 'write_off', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."charge_type" AS ENUM('professional', 'technical', 'global', 'modifier', 'material', 'consultation', 'emergency', 'repeat');--> statement-breakpoint
CREATE TYPE "public"."insurance_type" AS ENUM('primary', 'secondary', 'tertiary', 'self_pay', 'workers_comp', 'medicare', 'medicaid', 'private');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('insurance', 'credit_card', 'debit_card', 'cash', 'check', 'bank_transfer', 'payment_plan', 'voucher');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('phone_call', 'text_message', 'email', 'patient_portal', 'mail');--> statement-breakpoint
CREATE TYPE "public"."holter_assignment_status" AS ENUM('device_prepared', 'device_given', 'with_patient', 'overdue', 'return_reminder_sent', 'device_returned', 'data_downloaded', 'device_cleaned', 'assignment_completed');--> statement-breakpoint
CREATE TYPE "public"."device_status" AS ENUM('available', 'assigned', 'in_use', 'returned', 'maintenance', 'cleaning', 'out_of_service');--> statement-breakpoint
CREATE TYPE "public"."holter_type" AS ENUM('24_hour', '48_hour', '72_hour', '7_day', '14_day', '30_day', 'event_monitor', 'patch_monitor');--> statement-breakpoint
CREATE TYPE "public"."interpretation_priority" AS ENUM('routine', 'urgent', 'stat', 'critical');--> statement-breakpoint
CREATE TYPE "public"."interpretation_status" AS ENUM('pending_assignment', 'assigned', 'in_progress', 'preliminary_complete', 'under_review', 'final_complete', 'addendum_required', 'critical_findings', 'delivered', 'ready_for_billing', 'billing_complete');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'preliminary', 'final', 'amended', 'addendum');--> statement-breakpoint
CREATE TYPE "public"."interpreting_specialty" AS ENUM('radiology', 'cardiology', 'pathology', 'nuclear_medicine', 'mammography', 'ultrasound', 'ct_scan', 'mri', 'pet_scan', 'bone_density', 'interventional_radiology', 'neuroradiology', 'pediatric_radiology', 'musculoskeletal_radiology', 'abdominal_radiology', 'thoracic_radiology', 'emergency_radiology', 'echocardiography', 'stress_testing', 'holter_monitoring', 'ekg_interpretation');--> statement-breakpoint
CREATE TYPE "public"."reading_status" AS ENUM('active', 'inactive', 'on_leave', 'restricted', 'emergency_only');--> statement-breakpoint
CREATE TYPE "public"."facility_specialty" AS ENUM('mri', 'ct_scan', 'ultrasound', 'x_ray', 'mammography', 'nuclear_medicine', 'pet_scan', 'bone_density', 'echocardiogram', 'stress_testing', 'blood_work', 'urine_analysis', 'biopsy', 'endoscopy', 'colonoscopy', 'ekg', 'holter_monitoring', 'sleep_study', 'physical_therapy', 'occupational_therapy', 'dialysis', 'chemotherapy', 'radiation_therapy');--> statement-breakpoint
CREATE TYPE "public"."procedure_category" AS ENUM('imaging', 'laboratory', 'surgical', 'diagnostic', 'therapeutic', 'screening', 'interventional', 'rehabilitation', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."procedure_location_type" AS ENUM('imaging_center', 'laboratory', 'surgery_center', 'hospital', 'clinic', 'outpatient_facility', 'radiology_center', 'cardiac_center', 'endoscopy_center', 'dialysis_center', 'rehabilitation_center', 'sleep_center', 'pain_management_center');--> statement-breakpoint
CREATE TYPE "public"."department_type" AS ENUM('emergency', 'radiology', 'cardiology', 'orthopedics', 'neurology', 'oncology', 'pediatrics', 'surgery', 'laboratory', 'pharmacy', 'administration', 'outpatient', 'inpatient', 'icu', 'maternity');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('hospital', 'clinic', 'medical_center', 'private_practice', 'urgent_care', 'laboratory', 'imaging_center', 'rehabilitation_center', 'surgical_center', 'emergency_department');--> statement-breakpoint
CREATE TYPE "public"."certification_level" AS ENUM('entry_level', 'certified', 'advanced', 'specialist', 'lead', 'supervisor');--> statement-breakpoint
CREATE TYPE "public"."employment_status" AS ENUM('full_time', 'part_time', 'contract', 'per_diem', 'temp');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"referring_doctor_id" text,
	"referring_entity_id" text,
	"procedure_location_id" text NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" text NOT NULL,
	"estimated_duration" text,
	"procedure_type" text,
	"priority" "appointment_priority" DEFAULT 'routine' NOT NULL,
	"comments" text,
	"special_instructions" text,
	"insurance_authorization" text,
	"pre_auth_required" boolean DEFAULT false NOT NULL,
	"status" "appointment_status" DEFAULT 'created' NOT NULL,
	"confirmed_at" timestamp,
	"confirmed_by" text,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_cleanup_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"deleted_records" integer NOT NULL,
	"retention_years" integer NOT NULL,
	"cleanup_date" timestamp NOT NULL,
	"job_start_time" timestamp NOT NULL,
	"job_end_time" timestamp NOT NULL,
	"status" text NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"organization_id" text,
	"action" "action_type" NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_extensions" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"agent_assigned_orgs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_location_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "member_extensions_member_id_unique" UNIQUE("member_id")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "user_org_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"default_organization_id" text,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"appointment_id" text NOT NULL,
	"procedure_date" date NOT NULL,
	"procedure_time" text NOT NULL,
	"scheduled_duration" text,
	"primary_technician_id" text,
	"assisting_technician_id" text,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"actual_duration" text,
	"checked_in_at" timestamp,
	"checked_in_by" text,
	"patient_weight" text,
	"vital_signs" text,
	"procedure_notes" text,
	"complications" text,
	"equipment_used" text,
	"contrast_used" boolean DEFAULT false NOT NULL,
	"contrast_type" text,
	"contrast_amount" text,
	"image_quality" text,
	"technical_notes" text,
	"repeat_required" boolean DEFAULT false NOT NULL,
	"repeat_reason" text,
	"status" "booking_status" DEFAULT 'scheduled' NOT NULL,
	"procedure_status" "procedure_status" DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp,
	"completed_by" text,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" text,
	"images_paths" text,
	"report_path" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "bookings_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "charge_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"interpretation_id" text,
	"booking_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"service_date" date NOT NULL,
	"procedure_description" text NOT NULL,
	"primary_cpt_code" text NOT NULL,
	"secondary_cpt_codes" text,
	"icd_codes" text,
	"modifiers" text,
	"charge_type" charge_type NOT NULL,
	"units_of_service" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"charge_amount" numeric(10, 2) NOT NULL,
	"allowed_amount" numeric(10, 2),
	"contractual_adjustment" numeric(10, 2) DEFAULT '0.00',
	"primary_insurance" text,
	"primary_insurance_id" text,
	"secondary_insurance" text,
	"secondary_insurance_id" text,
	"insurance_type" "insurance_type" DEFAULT 'primary' NOT NULL,
	"prior_auth_number" text,
	"referral_number" text,
	"authorization_required" boolean DEFAULT false NOT NULL,
	"authorization_obtained" boolean DEFAULT false NOT NULL,
	"charge_entered_date" date,
	"charge_entered_by" text,
	"submitted_to_billing_date" date,
	"submitted_to_billing_by" text,
	"claim_number" text,
	"batch_number" text,
	"clearinghouse_id" text,
	"submission_date" date,
	"total_paid" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"patient_responsibility" numeric(10, 2) DEFAULT '0.00',
	"last_payment_date" date,
	"last_payment_amount" numeric(10, 2),
	"last_payment_method" "payment_method",
	"denial_date" date,
	"denial_reason" text,
	"denial_code" text,
	"appeal_date" date,
	"appeal_outcome" text,
	"write_off_date" date,
	"write_off_amount" numeric(10, 2),
	"write_off_reason" text,
	"write_off_by" text,
	"status" charge_entry_status DEFAULT 'pending_entry' NOT NULL,
	"charge_reviewed" boolean DEFAULT false NOT NULL,
	"charge_reviewed_by" text,
	"charge_reviewed_date" date,
	"compliance_notes" text,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_date" date,
	"follow_up_notes" text,
	"days_in_ar" text,
	"collection_efforts" text,
	"billing_notes" text,
	"internal_notes" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holter_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"device_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"device_prepared_date" timestamp,
	"device_given_date" timestamp,
	"expected_return_date" date NOT NULL,
	"actual_return_date" timestamp,
	"patient_instructions" text,
	"emergency_contact" text,
	"special_precautions" text,
	"device_condition_at_given" text,
	"device_condition_at_return" text,
	"battery_level_at_given" text,
	"battery_level_at_return" text,
	"reminders_sent" integer DEFAULT 0 NOT NULL,
	"last_reminder_date" timestamp,
	"next_follow_up_date" date,
	"preferred_contact_method" "contact_method" DEFAULT 'phone_call',
	"contact_attempts" integer DEFAULT 0 NOT NULL,
	"last_contact_attempt" timestamp,
	"contact_notes" text,
	"patient_responsive" boolean DEFAULT true NOT NULL,
	"data_downloaded_at" timestamp,
	"data_downloaded_by" text,
	"recording_quality" text,
	"recording_hours" text,
	"device_cleaned_at" timestamp,
	"device_cleaned_by" text,
	"maintenance_required" boolean DEFAULT false NOT NULL,
	"maintenance_notes" text,
	"status" "holter_assignment_status" DEFAULT 'device_prepared' NOT NULL,
	"assignment_completed_at" timestamp,
	"assignment_completed_by" text,
	"issues_reported" text,
	"escalation_required" boolean DEFAULT false NOT NULL,
	"escalation_notes" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holter_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"serial_number" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model" text NOT NULL,
	"holter_type" "holter_type" NOT NULL,
	"status" "device_status" DEFAULT 'available' NOT NULL,
	"current_patient_id" text,
	"assigned_date" date,
	"expected_return_date" date,
	"battery_level" text,
	"last_calibration" date,
	"next_maintenance_date" date,
	"purchase_date" date,
	"warranty_expiration" date,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "holter_devices_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "interpretations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"interpreting_doctor_id" text,
	"reviewing_doctor_id" text,
	"assigned_at" timestamp,
	"started_at" timestamp,
	"preliminary_completed_at" timestamp,
	"final_completed_at" timestamp,
	"delivered_at" timestamp,
	"priority" "interpretation_priority" DEFAULT 'routine' NOT NULL,
	"is_emergency_read" boolean DEFAULT false NOT NULL,
	"critical_findings" boolean DEFAULT false NOT NULL,
	"critical_findings_notified_at" timestamp,
	"report_text" text,
	"impression" text,
	"recommendations" text,
	"technical_notes" text,
	"report_status" "report_status" DEFAULT 'draft' NOT NULL,
	"report_version" text DEFAULT '1.0' NOT NULL,
	"previous_report_id" text,
	"interpretation_time" text,
	"complexity_score" text,
	"confidence_level" text,
	"review_required" boolean DEFAULT false NOT NULL,
	"reviewed_at" timestamp,
	"review_comments" text,
	"review_approved" boolean,
	"critical_results_communicated" boolean DEFAULT false NOT NULL,
	"communicated_to" text,
	"communication_method" text,
	"communication_time" timestamp,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_recommendations" text,
	"follow_up_timeframe" text,
	"consultation_required" boolean DEFAULT false NOT NULL,
	"consulting_specialist" text,
	"consultation_notes" text,
	"status" "interpretation_status" DEFAULT 'pending_assignment' NOT NULL,
	"diagnostic_codes" text,
	"procedure_codes" text,
	"report_file_path" text,
	"attachment_paths" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interpreting_doctors" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"phone" text,
	"email" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"code" text,
	"license_number" text NOT NULL,
	"primary_specialty" "interpreting_specialty" NOT NULL,
	"secondary_specialty" "interpreting_specialty",
	"reading_status" "reading_status" DEFAULT 'active' NOT NULL,
	"emergency_reads" boolean DEFAULT false NOT NULL,
	"weekend_reads" boolean DEFAULT false NOT NULL,
	"night_reads" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"date_of_birth" date NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"code" text NOT NULL,
	"insurance_number" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procedure_test_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "procedure_location_type" NOT NULL,
	"category" "procedure_category",
	"phone" text,
	"fax" text,
	"email" text,
	"website" text,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"code" text NOT NULL,
	"country" text NOT NULL,
	"license_number" text,
	"operating_hours" text,
	"contact_person_name" text,
	"contact_person_phone" text,
	"contact_person_email" text,
	"scheduling_phone" text,
	"scheduling_email" text,
	"special_equipment" text,
	"specialties" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referring_doctors" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"phone" text,
	"email" text,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"code" text NOT NULL,
	"license_number" text,
	"specialty_id" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialties" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "specialties_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "referring_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "entity_type" NOT NULL,
	"phone" text,
	"email" text,
	"website" text,
	"contact_person_name" text,
	"contact_person_phone" text,
	"contact_person_email" text,
	"license_number" text,
	"tax_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referring_locations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"referring_entity_id" text NOT NULL,
	"name" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"code" text NOT NULL,
	"country" text NOT NULL,
	"phone" text,
	"fax" text,
	"email" text,
	"department_type" "department_type",
	"operating_hours" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"phone" text,
	"email" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"code" text,
	"license_number" text,
	"specialty" "facility_specialty" NOT NULL,
	"certification_level" "certification_level" DEFAULT 'entry_level' NOT NULL,
	"employment_status" "employment_status" DEFAULT 'full_time' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_referring_doctor_id_referring_doctors_id_fk" FOREIGN KEY ("referring_doctor_id") REFERENCES "public"."referring_doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_referring_entity_id_referring_entities_id_fk" FOREIGN KEY ("referring_entity_id") REFERENCES "public"."referring_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_procedure_location_id_procedure_test_locations_id_fk" FOREIGN KEY ("procedure_location_id") REFERENCES "public"."procedure_test_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_confirmed_by_users_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_cleanup_logs" ADD CONSTRAINT "audit_cleanup_logs_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_extensions" ADD CONSTRAINT "member_extensions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_default_organization_id_organization_id_fk" FOREIGN KEY ("default_organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_primary_technician_id_technicians_id_fk" FOREIGN KEY ("primary_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assisting_technician_id_technicians_id_fk" FOREIGN KEY ("assisting_technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_interpretation_id_interpretations_id_fk" FOREIGN KEY ("interpretation_id") REFERENCES "public"."interpretations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_charge_entered_by_users_id_fk" FOREIGN KEY ("charge_entered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_submitted_to_billing_by_users_id_fk" FOREIGN KEY ("submitted_to_billing_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_write_off_by_users_id_fk" FOREIGN KEY ("write_off_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_charge_reviewed_by_users_id_fk" FOREIGN KEY ("charge_reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_entries" ADD CONSTRAINT "charge_entries_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_device_id_holter_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."holter_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_data_downloaded_by_users_id_fk" FOREIGN KEY ("data_downloaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_device_cleaned_by_users_id_fk" FOREIGN KEY ("device_cleaned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_assignment_completed_by_users_id_fk" FOREIGN KEY ("assignment_completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_assignments" ADD CONSTRAINT "holter_assignments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_devices" ADD CONSTRAINT "holter_devices_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_devices" ADD CONSTRAINT "holter_devices_current_patient_id_patients_id_fk" FOREIGN KEY ("current_patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_devices" ADD CONSTRAINT "holter_devices_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_devices" ADD CONSTRAINT "holter_devices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holter_devices" ADD CONSTRAINT "holter_devices_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_interpreting_doctor_id_interpreting_doctors_id_fk" FOREIGN KEY ("interpreting_doctor_id") REFERENCES "public"."interpreting_doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_reviewing_doctor_id_interpreting_doctors_id_fk" FOREIGN KEY ("reviewing_doctor_id") REFERENCES "public"."interpreting_doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretations" ADD CONSTRAINT "interpretations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreting_doctors" ADD CONSTRAINT "interpreting_doctors_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreting_doctors" ADD CONSTRAINT "interpreting_doctors_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreting_doctors" ADD CONSTRAINT "interpreting_doctors_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpreting_doctors" ADD CONSTRAINT "interpreting_doctors_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_test_locations" ADD CONSTRAINT "procedure_test_locations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_test_locations" ADD CONSTRAINT "procedure_test_locations_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_test_locations" ADD CONSTRAINT "procedure_test_locations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_test_locations" ADD CONSTRAINT "procedure_test_locations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_doctors" ADD CONSTRAINT "referring_doctors_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_entities" ADD CONSTRAINT "referring_entities_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_entities" ADD CONSTRAINT "referring_entities_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_entities" ADD CONSTRAINT "referring_entities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_entities" ADD CONSTRAINT "referring_entities_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_locations" ADD CONSTRAINT "referring_locations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_locations" ADD CONSTRAINT "referring_locations_referring_entity_id_referring_entities_id_fk" FOREIGN KEY ("referring_entity_id") REFERENCES "public"."referring_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_locations" ADD CONSTRAINT "referring_locations_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_locations" ADD CONSTRAINT "referring_locations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referring_locations" ADD CONSTRAINT "referring_locations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_patient_id_idx" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_organization_id_idx" ON "appointments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "appointments_referring_doctor_id_idx" ON "appointments" USING btree ("referring_doctor_id");--> statement-breakpoint
CREATE INDEX "appointments_referring_entity_id_idx" ON "appointments" USING btree ("referring_entity_id");--> statement-breakpoint
CREATE INDEX "appointments_procedure_location_id_idx" ON "appointments" USING btree ("procedure_location_id");--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointments_priority_idx" ON "appointments" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "appointments_deleted_at_idx" ON "appointments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "appointments_created_by_idx" ON "appointments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "appointments_updated_by_idx" ON "appointments" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "appointments_confirmed_at_idx" ON "appointments" USING btree ("confirmed_at");--> statement-breakpoint
CREATE INDEX "appointments_cancelled_at_idx" ON "appointments" USING btree ("cancelled_at");--> statement-breakpoint
CREATE INDEX "appointments_cancellation_reason_idx" ON "appointments" USING btree ("cancellation_reason");--> statement-breakpoint
CREATE INDEX "appointments_procedure_type_idx" ON "appointments" USING btree ("procedure_type");--> statement-breakpoint
CREATE INDEX "appointments_comments_idx" ON "appointments" USING btree ("comments");--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "cleanup_logs_org_idx" ON "audit_cleanup_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cleanup_logs_date_idx" ON "audit_cleanup_logs" USING btree ("cleanup_date");--> statement-breakpoint
CREATE INDEX "audit_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_org_id_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_org_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitations_expires_at_idx" ON "invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "member_ext_member_id_idx" ON "member_extensions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "member_ext_agent_orgs_idx" ON "member_extensions" USING gin ("agent_assigned_orgs");--> statement-breakpoint
CREATE INDEX "member_ext_assigned_locations_idx" ON "member_extensions" USING gin ("assigned_location_ids");--> statement-breakpoint
CREATE INDEX "member_ext_status_idx" ON "member_extensions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_org_id_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "members_role_idx" ON "members" USING btree ("role");--> statement-breakpoint
CREATE INDEX "org_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "org_metadata_type_idx" ON "organization" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_active_org_idx" ON "sessions" USING btree ("active_organization_id");--> statement-breakpoint
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_banned_idx" ON "users" USING btree ("banned");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "bookings_organization_id_idx" ON "bookings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bookings_appointment_id_idx" ON "bookings" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "bookings_primary_technician_id_idx" ON "bookings" USING btree ("primary_technician_id");--> statement-breakpoint
CREATE INDEX "bookings_assisting_technician_id_idx" ON "bookings" USING btree ("assisting_technician_id");--> statement-breakpoint
CREATE INDEX "bookings_procedure_date_idx" ON "bookings" USING btree ("procedure_date");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_procedure_status_idx" ON "bookings" USING btree ("procedure_status");--> statement-breakpoint
CREATE INDEX "bookings_checked_in_at_idx" ON "bookings" USING btree ("checked_in_at");--> statement-breakpoint
CREATE INDEX "bookings_completed_at_idx" ON "bookings" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "bookings_deleted_at_idx" ON "bookings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "bookings_created_by_idx" ON "bookings" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "bookings_updated_by_idx" ON "bookings" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "charge_entries_organization_id_idx" ON "charge_entries" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "charge_entries_interpretation_id_idx" ON "charge_entries" USING btree ("interpretation_id");--> statement-breakpoint
CREATE INDEX "charge_entries_booking_id_idx" ON "charge_entries" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "charge_entries_patient_id_idx" ON "charge_entries" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "charge_entries_status_idx" ON "charge_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "charge_entries_service_date_idx" ON "charge_entries" USING btree ("service_date");--> statement-breakpoint
CREATE INDEX "charge_entries_primary_cpt_code_idx" ON "charge_entries" USING btree ("primary_cpt_code");--> statement-breakpoint
CREATE INDEX "charge_entries_charge_type_idx" ON "charge_entries" USING btree ("charge_type");--> statement-breakpoint
CREATE INDEX "charge_entries_insurance_type_idx" ON "charge_entries" USING btree ("insurance_type");--> statement-breakpoint
CREATE INDEX "charge_entries_claim_number_idx" ON "charge_entries" USING btree ("claim_number");--> statement-breakpoint
CREATE INDEX "charge_entries_submission_date_idx" ON "charge_entries" USING btree ("submission_date");--> statement-breakpoint
CREATE INDEX "charge_entries_follow_up_required_idx" ON "charge_entries" USING btree ("follow_up_required");--> statement-breakpoint
CREATE INDEX "charge_entries_follow_up_date_idx" ON "charge_entries" USING btree ("follow_up_date");--> statement-breakpoint
CREATE INDEX "charge_entries_deleted_at_idx" ON "charge_entries" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "charge_entries_created_by_idx" ON "charge_entries" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "charge_entries_updated_by_idx" ON "charge_entries" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "holter_assignments_organization_id_idx" ON "holter_assignments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "holter_assignments_booking_id_idx" ON "holter_assignments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "holter_assignments_device_id_idx" ON "holter_assignments" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "holter_assignments_patient_id_idx" ON "holter_assignments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "holter_assignments_status_idx" ON "holter_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "holter_assignments_expected_return_idx" ON "holter_assignments" USING btree ("expected_return_date");--> statement-breakpoint
CREATE INDEX "holter_assignments_next_follow_up_idx" ON "holter_assignments" USING btree ("next_follow_up_date");--> statement-breakpoint
CREATE INDEX "holter_assignments_device_given_date_idx" ON "holter_assignments" USING btree ("device_given_date");--> statement-breakpoint
CREATE INDEX "holter_assignments_actual_return_date_idx" ON "holter_assignments" USING btree ("actual_return_date");--> statement-breakpoint
CREATE INDEX "holter_assignments_escalation_required_idx" ON "holter_assignments" USING btree ("escalation_required");--> statement-breakpoint
CREATE INDEX "holter_assignments_deleted_at_idx" ON "holter_assignments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "holter_assignments_created_by_idx" ON "holter_assignments" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "holter_assignments_updated_by_idx" ON "holter_assignments" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "holter_devices_organization_id_idx" ON "holter_devices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "holter_devices_serial_idx" ON "holter_devices" USING btree ("serial_number");--> statement-breakpoint
CREATE INDEX "holter_devices_status_idx" ON "holter_devices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "holter_devices_current_patient_idx" ON "holter_devices" USING btree ("current_patient_id");--> statement-breakpoint
CREATE INDEX "holter_devices_type_idx" ON "holter_devices" USING btree ("holter_type");--> statement-breakpoint
CREATE INDEX "holter_devices_manufacturer_idx" ON "holter_devices" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX "holter_devices_assigned_date_idx" ON "holter_devices" USING btree ("assigned_date");--> statement-breakpoint
CREATE INDEX "holter_devices_expected_return_idx" ON "holter_devices" USING btree ("expected_return_date");--> statement-breakpoint
CREATE INDEX "holter_devices_is_active_idx" ON "holter_devices" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "holter_devices_deleted_at_idx" ON "holter_devices" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "holter_devices_created_by_idx" ON "holter_devices" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "holter_devices_updated_by_idx" ON "holter_devices" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "interpretations_organization_id_idx" ON "interpretations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "interpretations_booking_id_idx" ON "interpretations" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "interpretations_interpreting_doctor_id_idx" ON "interpretations" USING btree ("interpreting_doctor_id");--> statement-breakpoint
CREATE INDEX "interpretations_reviewing_doctor_id_idx" ON "interpretations" USING btree ("reviewing_doctor_id");--> statement-breakpoint
CREATE INDEX "interpretations_status_idx" ON "interpretations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interpretations_priority_idx" ON "interpretations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "interpretations_report_status_idx" ON "interpretations" USING btree ("report_status");--> statement-breakpoint
CREATE INDEX "interpretations_assigned_at_idx" ON "interpretations" USING btree ("assigned_at");--> statement-breakpoint
CREATE INDEX "interpretations_final_completed_at_idx" ON "interpretations" USING btree ("final_completed_at");--> statement-breakpoint
CREATE INDEX "interpretations_critical_findings_idx" ON "interpretations" USING btree ("critical_findings");--> statement-breakpoint
CREATE INDEX "interpretations_is_emergency_read_idx" ON "interpretations" USING btree ("is_emergency_read");--> statement-breakpoint
CREATE INDEX "interpretations_review_required_idx" ON "interpretations" USING btree ("review_required");--> statement-breakpoint
CREATE INDEX "interpretations_follow_up_required_idx" ON "interpretations" USING btree ("follow_up_required");--> statement-breakpoint
CREATE INDEX "interpretations_deleted_at_idx" ON "interpretations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "interpretations_created_by_idx" ON "interpretations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "interpretations_updated_by_idx" ON "interpretations" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_organization_id_idx" ON "interpreting_doctors" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_email_idx" ON "interpreting_doctors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_phone_idx" ON "interpreting_doctors" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_name_idx" ON "interpreting_doctors" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_license_idx" ON "interpreting_doctors" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_primary_specialty_idx" ON "interpreting_doctors" USING btree ("primary_specialty");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_secondary_specialty_idx" ON "interpreting_doctors" USING btree ("secondary_specialty");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_reading_status_idx" ON "interpreting_doctors" USING btree ("reading_status");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_emergency_reads_idx" ON "interpreting_doctors" USING btree ("emergency_reads");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_is_active_idx" ON "interpreting_doctors" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_deleted_at_idx" ON "interpreting_doctors" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_created_by_idx" ON "interpreting_doctors" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "interpreting_doctors_updated_by_idx" ON "interpreting_doctors" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "patients_organization_id_idx" ON "patients" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "patients_email_idx" ON "patients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "patients_phone_idx" ON "patients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "patients_insurance_idx" ON "patients" USING btree ("insurance_number");--> statement-breakpoint
CREATE INDEX "patients_deleted_at_idx" ON "patients" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "patients_created_by_idx" ON "patients" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "patients_updated_by_idx" ON "patients" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "patients_date_of_birth_idx" ON "patients" USING btree ("date_of_birth");--> statement-breakpoint
CREATE INDEX "patients_address_idx" ON "patients" USING btree ("address_line1","address_line2","state","city","code");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_organization_id_idx" ON "procedure_test_locations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_name_idx" ON "procedure_test_locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_type_idx" ON "procedure_test_locations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_category_idx" ON "procedure_test_locations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_city_state_idx" ON "procedure_test_locations" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_is_active_idx" ON "procedure_test_locations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_deleted_at_idx" ON "procedure_test_locations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_license_idx" ON "procedure_test_locations" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_created_by_idx" ON "procedure_test_locations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "procedure_test_locations_updated_by_idx" ON "procedure_test_locations" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "referring_doctors_organization_id_idx" ON "referring_doctors" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "referring_doctors_email_idx" ON "referring_doctors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "referring_doctors_phone_idx" ON "referring_doctors" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "referring_doctors_name_idx" ON "referring_doctors" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "referring_doctors_license_idx" ON "referring_doctors" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "referring_doctors_specialty_id_idx" ON "referring_doctors" USING btree ("specialty_id");--> statement-breakpoint
CREATE INDEX "referring_doctors_deleted_at_idx" ON "referring_doctors" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "referring_doctors_created_by_idx" ON "referring_doctors" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "referring_doctors_updated_by_idx" ON "referring_doctors" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "specialties_organization_id_idx" ON "specialties" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "specialties_name_idx" ON "specialties" USING btree ("name");--> statement-breakpoint
CREATE INDEX "specialties_is_active_idx" ON "specialties" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "specialties_deleted_at_idx" ON "specialties" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "specialties_created_by_idx" ON "specialties" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "specialties_updated_by_idx" ON "specialties" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "referring_entities_name_idx" ON "referring_entities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "referring_entities_type_idx" ON "referring_entities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "referring_entities_is_active_idx" ON "referring_entities" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "referring_entities_deleted_at_idx" ON "referring_entities" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "referring_entities_license_idx" ON "referring_entities" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "referring_entities_tax_id_idx" ON "referring_entities" USING btree ("tax_id");--> statement-breakpoint
CREATE INDEX "referring_entities_created_by_idx" ON "referring_entities" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "referring_entities_updated_by_idx" ON "referring_entities" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "referring_locations_organization_id_idx" ON "referring_locations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "referring_locations_entity_id_idx" ON "referring_locations" USING btree ("referring_entity_id");--> statement-breakpoint
CREATE INDEX "referring_locations_name_idx" ON "referring_locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "referring_locations_city_state_idx" ON "referring_locations" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "referring_locations_is_primary_idx" ON "referring_locations" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "referring_locations_is_active_idx" ON "referring_locations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "referring_locations_deleted_at_idx" ON "referring_locations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "referring_locations_department_idx" ON "referring_locations" USING btree ("department_type");--> statement-breakpoint
CREATE INDEX "referring_locations_created_by_idx" ON "referring_locations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "referring_locations_updated_by_idx" ON "referring_locations" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "technicians_organization_id_idx" ON "technicians" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "technicians_email_idx" ON "technicians" USING btree ("email");--> statement-breakpoint
CREATE INDEX "technicians_phone_idx" ON "technicians" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "technicians_name_idx" ON "technicians" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "technicians_specialty_idx" ON "technicians" USING btree ("specialty");--> statement-breakpoint
CREATE INDEX "technicians_certification_idx" ON "technicians" USING btree ("certification_level");--> statement-breakpoint
CREATE INDEX "technicians_employment_status_idx" ON "technicians" USING btree ("employment_status");--> statement-breakpoint
CREATE INDEX "technicians_license_idx" ON "technicians" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "technicians_is_active_idx" ON "technicians" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "technicians_deleted_at_idx" ON "technicians" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "technicians_created_by_idx" ON "technicians" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "technicians_updated_by_idx" ON "technicians" USING btree ("updated_by");