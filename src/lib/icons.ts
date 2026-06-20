// src/lib/icons.tsx
import type { ReactElement } from "react";
import {
  GraduationCap,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import React from "react";

export type Category =
  | "Certificates"
  | "PRC License"
  | "Valid ID"
  | "Resume"
  | "Transcript of records"
  | "Research Publications"
  | "Curriculum Vitae"
  | "Diplomas"
  | "Others";

export type Status =
  | "Approved"
  | "Returned"
  | "Verified"
  | "Not Approved"
  | "Not Accurate"
  | "Pending"
  | "Expired";

interface IconItem {
  icon: ReactElement;
  color: string;
}

const createIconItem = (
  IconComponent: React.ElementType,
  color: string
): IconItem => ({
  icon: React.createElement(IconComponent, {
    className: `w-4 h-4 mr-2 ${color}`,
  }),
  color,
});

export const categoryIcons: Record<Category, IconItem> = {
  "Curriculum Vitae": createIconItem(GraduationCap, "text-teal-700 dark:text-teal-300"),
  "PRC License": createIconItem(User, "text-orange-700 dark:text-orange-300"),
  Resume: createIconItem(Briefcase, "text-indigo-700 dark:text-indigo-300"),
  "Valid ID": createIconItem(User, "text-pink-700 dark:text-pink-300"),
  Diplomas: createIconItem(GraduationCap, "text-purple-700 dark:text-purple-300"),
  "Transcript of records": createIconItem(GraduationCap, "text-amber-700 dark:text-amber-300"),
  Certificates: createIconItem(CheckCircle, "text-green-700 dark:text-green-300"),
  "Research Publications": createIconItem(GraduationCap, "text-red-700 dark:text-red-300"),
  Others: createIconItem(AlertTriangle, "text-slate-700 dark:text-slate-300"),

};

export const statusVariants: Record<Status, IconItem> = {
  Approved: createIconItem(CheckCircle, "text-green-700 dark:text-green-300"),
  Returned: createIconItem(XCircle, "text-red-700 dark:text-red-300"),
  Verified: createIconItem(CheckCircle, "text-green-700 dark:text-green-300"),
  "Not Approved": createIconItem(XCircle, "text-red-700 dark:text-red-300"),
  "Not Accurate": createIconItem(AlertTriangle, "text-amber-700 dark:text-amber-300"),
  Pending: createIconItem(Clock, "text-blue-700 dark:text-blue-300"),
  Expired: createIconItem(XCircle, "text-slate-700 dark:text-slate-300"),
};
