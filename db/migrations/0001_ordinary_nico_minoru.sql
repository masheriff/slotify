ALTER TABLE "interpreting_doctors" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "technicians" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "interpreting_doctors" ADD CONSTRAINT "interpreting_doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interpreting_doctors_user_id_idx" ON "interpreting_doctors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "technicians_user_id_idx" ON "technicians" USING btree ("user_id");