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
  "Curriculum Vitae": createIconItem(GraduationCap, "text-teal-600"),
  "PRC License": createIconItem(User, "text-orange-600"),
  Resume: createIconItem(Briefcase, "text-indigo-600"),
  "Valid ID": createIconItem(User, "text-pink-600"),
  Diplomas: createIconItem(GraduationCap, "text-purple-600"),
  "Transcript of records": createIconItem(GraduationCap, "text-yellow-600"),
  Certificates: createIconItem(CheckCircle, "text-green-600"),
  "Research Publications": createIconItem(GraduationCap, "text-red-600"),
  Others: createIconItem(AlertTriangle, "text-gray-600"),

};

export const statusVariants: Record<Status, IconItem> = {
  Verified: createIconItem(CheckCircle, "text-green-600"),
  "Not Approved": createIconItem(XCircle, "text-red-600"),
  "Not Accurate": createIconItem(AlertTriangle, "text-yellow-600"),
  Pending: createIconItem(Clock, "text-blue-600"),
  Expired: createIconItem(XCircle, "text-gray-600"),
};
