import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionButton,
  children
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-thunder-dark">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      
      {actionButton && (
        actionButton.href ? (
          <Link
            href={actionButton.href}
            className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
          >
            {actionButton.icon && <span className="mr-2">{actionButton.icon}</span>}
            {actionButton.label}
          </Link>
        ) : (
          <button
            onClick={actionButton.onClick}
            className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
          >
            {actionButton.icon && <span className="mr-2">{actionButton.icon}</span>}
            {actionButton.label}
          </button>
        )
      )}
      
      {children}
    </div>
  );
};

export default PageHeader;