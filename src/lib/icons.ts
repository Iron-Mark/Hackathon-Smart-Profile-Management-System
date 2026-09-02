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
  "Curriculum Vitae": createIconItem(GraduationCap, "text-success"),
  "PRC License": createIconItem(User, "text-warning"),
  Resume: createIconItem(Briefcase, "text-info"),
  "Valid ID": createIconItem(User, "text-info"),
  Diplomas: createIconItem(GraduationCap, "text-success"),
  "Transcript of records": createIconItem(GraduationCap, "text-warning"),
  Certificates: createIconItem(CheckCircle, "text-success"),
  "Research Publications": createIconItem(GraduationCap, "text-destructive"),
  Others: createIconItem(AlertTriangle, "text-muted-foreground"),

};

export const statusVariants: Record<Status, IconItem> = {
  Approved: createIconItem(CheckCircle, "text-success"),
  Returned: createIconItem(XCircle, "text-destructive"),
  Verified: createIconItem(CheckCircle, "text-success"),
  "Not Approved": createIconItem(XCircle, "text-destructive"),
  "Not Accurate": createIconItem(AlertTriangle, "text-warning"),
  Pending: createIconItem(Clock, "text-info"),
  Expired: createIconItem(XCircle, "text-muted-foreground"),
};
