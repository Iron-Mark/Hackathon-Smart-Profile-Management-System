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
      className="bg-white rounded-md shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="flex justify-between items-center w-full p-4 hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-md sm:text-lg text-green-600">
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="p-4 border-t text-gray-700 leading-relaxed text-sm sm:text-base">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ProfileSection;
