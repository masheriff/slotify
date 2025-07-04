import { memo } from 'react';
import Image from "next/image";

export const OrganizationLogo = memo(({ 
  logo, 
  name 
}: { 
  logo?: string; 
  name?: string; 
}) => {
  if (!logo) {
    return (
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">
          {name?.substring(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={logo}
      alt={`${name} logo`}
      width={100}
      height={100}
      quality={100}
      priority
      className="h-14 w-auto object-contain"
    />
  );
},(prev, next) => prev.logo === next.logo && prev.name === next.name);