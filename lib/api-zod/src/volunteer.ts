import * as zod from "zod";

export const VolunteerApplicationType = zod.enum(["member", "volunteer_activity"]);
export const VolunteerApplicationStatus = zod.enum(["pending", "accepted", "rejected"]);

const PHONE_REGEX = /^\+?[\d\s\-()\u200d]{7,20}$/;

export const CreateVolunteerApplicationBody = zod.object({
  applicationType: VolunteerApplicationType,
  name: zod.string().min(1, "Name is required"),
  phone: zod
    .string()
    .min(1, "Phone is required")
    .regex(PHONE_REGEX, "Invalid phone format (7–20 digits, spaces, +, -, () allowed)"),
  email: zod.string().email("Valid email is required"),
  city: zod.string().min(1, "City is required"),
  address: zod.string().min(1, "Address is required"),
  skills: zod.string().min(1, "Skills is required"),
  motivation: zod.string().min(1, "Motivation is required"),
});

export const UpdateAdminVolunteerStatusBody = zod.object({
  status: zod.enum(["accepted", "rejected"]),
});

export type CreateVolunteerApplication = zod.infer<typeof CreateVolunteerApplicationBody>;
