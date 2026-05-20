import React from "react";
import classNames from "classnames";

interface Props {
  title: string;
  variant?: "primary" | "outline";
  fitWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const CustomButton = ({
  title,
  variant = "primary",
  fitWidth = false,
  type = "button",
  onClick,
  icon,
  iconPosition = "right",
  isLoading,
  className,
}: Props) => {
  const buttonClasses = classNames(
    "flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors rounded-md",
    className,
    {
      "bg-event-navy text-event-white hover:bg-event-charcoal":
        variant === "primary",
      "border border-event-navy text-event-navy hover:bg-event-navy hover:text-white":
        variant === "outline",
      "w-fit": fitWidth,
      "w-full": !fitWidth,
      "opacity-50 cursor-not-allowed": isLoading,
    }
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={buttonClasses}
    >
      {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {!isLoading ? title : "Loading..."}
      {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default CustomButton;
