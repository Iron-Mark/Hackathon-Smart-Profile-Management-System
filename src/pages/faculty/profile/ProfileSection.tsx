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
      className="border-0"
    >
      <AccordionTrigger className="flex justify-between items-center w-full py-3 hover:no-underline">
        <span className="font-semibold text-md sm:text-lg text-success">
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-1 pb-4 text-foreground leading-relaxed text-sm sm:text-base">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProfileSection;
