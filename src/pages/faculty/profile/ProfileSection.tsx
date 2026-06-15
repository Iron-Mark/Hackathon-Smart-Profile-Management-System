// src/pages/faculty/profile/ProfileSection.tsx
import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface ProfileSectionProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  value,
  title,
  children,
}) => {
  return (
    <AccordionItem
      value={value}
      className="bg-card text-card-foreground rounded-md shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="flex justify-between items-center w-full p-4 hover:bg-muted/60 transition-colors">
        <span className="font-semibold text-md sm:text-lg text-green-700 dark:text-green-300">
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="p-4 border-t text-card-foreground leading-relaxed text-sm sm:text-base">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProfileSection;
