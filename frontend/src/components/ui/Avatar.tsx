import { HTMLAttributes, forwardRef } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Initials to display when no image */
  initials?: string;
  /** Size of the avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape of the avatar */
  shape?: "circle" | "rounded" | "square";
  /** Show online status indicator */
  status?: "online" | "offline" | "away" | "busy" | null;
}

/**
 * Avatar component for displaying user profile images or initials
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className = "",
      src,
      alt = "Avatar",
      initials,
      size = "md",
      shape = "circle",
      status = null,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-14 h-14 text-lg",
      xl: "w-20 h-20 text-xl",
    };

    const shapes = {
      circle: "rounded-full",
      rounded: "rounded-lg",
      square: "rounded-none",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5 border",
      sm: "w-2 h-2 border",
      md: "w-2.5 h-2.5 border-2",
      lg: "w-3 h-3 border-2",
      xl: "w-4 h-4 border-2",
    };

    const statusColors = {
      online: "bg-green-500",
      offline: "bg-gray-400",
      away: "bg-yellow-500",
      busy: "bg-red-500",
    };

    const statusPositions = {
      xs: "-right-0.5 -bottom-0.5",
      sm: "-right-0.5 -bottom-0.5",
      md: "right-0 bottom-0",
      lg: "right-0.5 bottom-0.5",
      xl: "right-1 bottom-1",
    };

    // Generate initials from alt if not provided
    const displayInitials = initials || alt
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div ref={ref} className={`relative inline-block ${className}`} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className={`${sizes[size]} ${shapes[shape]} object-cover`}
          />
        ) : (
          <div
            className={`${sizes[size]} ${shapes[shape]} bg-edubites-card-stroke text-gray-600 font-medium flex items-center justify-center`}
          >
            {displayInitials}
          </div>
        )}
        {status && (
          <span
            className={`absolute ${statusPositions[size]} ${statusSizes[size]} ${statusColors[status]} ${shapes[shape] === "circle" ? "rounded-full" : "rounded-sm"} border-white`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

// Avatar Group Component
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to display */
  max?: number;
  /** Size of avatars */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Avatar data */
  avatars: Array<{ src?: string; alt?: string; initials?: string }>;
}

/**
 * Group of overlapping avatars with overflow indicator
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className = "", max = 4, size = "md", avatars, ...props }, ref) => {
    const visibleAvatars = avatars.slice(0, max);
    const overflowCount = avatars.length - max;

    const overlapSizes = {
      xs: "-ml-2",
      sm: "-ml-2",
      md: "-ml-3",
      lg: "-ml-4",
      xl: "-ml-5",
    };

    const counterSizes = {
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-14 h-14 text-base",
      xl: "w-20 h-20 text-lg",
    };

    return (
      <div ref={ref} className={`flex items-center ${className}`} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className={`${index > 0 ? overlapSizes[size] : ""} ring-2 ring-white rounded-full`}
          >
            <Avatar
              src={avatar.src}
              alt={avatar.alt}
              initials={avatar.initials}
              size={size}
              shape="circle"
            />
          </div>
        ))}
        {overflowCount > 0 && (
          <div
            className={`${overlapSizes[size]} ${counterSizes[size]} bg-dark-700 text-white font-semibold rounded-full flex items-center justify-center ring-2 ring-white`}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

// User Card Component
export interface UserCardProps extends HTMLAttributes<HTMLDivElement> {
  /** User's name */
  name: string;
  /** Secondary text (e.g., role, date) */
  subtitle?: string;
  /** Avatar image source */
  src?: string;
  /** Avatar size */
  size?: "sm" | "md" | "lg";
  /** Online status */
  status?: "online" | "offline" | "away" | "busy" | null;
}

/**
 * User card with avatar, name, and optional subtitle
 */
export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  (
    { className = "", name, subtitle, src, size = "md", status = null, ...props },
    ref
  ) => {
    const textSizes = {
      sm: { name: "text-sm", subtitle: "text-xs" },
      md: { name: "text-base", subtitle: "text-sm" },
      lg: { name: "text-lg", subtitle: "text-base" },
    };

    const gaps = {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    };

    return (
      <div
        ref={ref}
        className={`flex items-center ${gaps[size]} ${className}`}
        {...props}
      >
        <Avatar src={src} alt={name} size={size} status={status} />
        <div>
          <p className={`${textSizes[size].name} font-medium text-gray-900`}>
            {name}
          </p>
          {subtitle && (
            <p className={`${textSizes[size].subtitle} text-gray-500`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }
);

UserCard.displayName = "UserCard";
